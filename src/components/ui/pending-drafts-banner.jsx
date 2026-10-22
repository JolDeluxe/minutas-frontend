import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { idbGetAll, idbDelete } from '@/lib/idb';
import { createTarea, createNotaGeneral } from '@/features/tareas/api/tareas-api';
import { getMinutaById, reabrirMinuta } from '@/features/minutas/api/minutas-api';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutaDraftStore } from '@/features/minutas/stores/minuta-draft-store';
import socket from '@/lib/socket';

const VALID_ESTADOS_TAREA = ['PENDIENTE', 'EN_REVISION', 'CERRADA', 'CANCELADA', 'DESCARTADA'];
const VALID_TIPOS_ENTRADA = ['SIN_ORGANIZAR', 'TAREA', 'RECORDATORIO', 'POLITICA', 'DESCARTADA'];

/**
 * Normaliza las tareas de borrador de IndexedDB para enviarlas limpias a createTareaApi
 */
const sanitizeDraftEntry = (raw) => {
  const entry = { ...raw };

  delete entry.tempId;
  delete entry.estadoConceptual;
  delete entry.formalizada;
  delete entry._isRemoteDraft;
  delete entry.readOnly;
  delete entry.createdAt;
  delete entry.updatedAt;
  delete entry.fecha;
  delete entry.asignaciones;

  // Filtrar o eliminar _localImages huérfanas sin File/Blob real de memoria
  if (Array.isArray(entry._localImages)) {
    const validLocalImages = entry._localImages.filter(img => img?.file instanceof File || img?.file instanceof Blob);
    if (validLocalImages.length > 0) {
      entry._localImages = validLocalImages;
    } else {
      delete entry._localImages;
    }
  } else {
    delete entry._localImages;
  }

  // Validar enum de estado: si no es un estado válido de Tarea, se descarta
  if (entry.estado && !VALID_ESTADOS_TAREA.includes(entry.estado)) {
    delete entry.estado;
  }

  // Validar enum de tipo: si no es válido, asignar SIN_ORGANIZAR
  if (!entry.tipo || !VALID_TIPOS_ENTRADA.includes(entry.tipo)) {
    entry.tipo = 'SIN_ORGANIZAR';
  }

  // Normalizar responsables a IDs numéricos
  if (entry.responsables) {
    if (Array.isArray(entry.responsables)) {
      entry.responsables = entry.responsables
        .map(r => (typeof r === 'object' && r !== null) ? (r.usuarioId || r.id) : r)
        .map(Number)
        .filter(id => !isNaN(id) && id > 0);
    } else {
      delete entry.responsables;
    }
  }

  // Normalizar notas para que cumplan { contenido: string }
  if (entry.notas && Array.isArray(entry.notas)) {
    entry.notas = entry.notas
      .map(n => {
        if (typeof n === 'string') return { contenido: n.trim() };
        if (typeof n === 'object' && n !== null && n.contenido) return { contenido: String(n.contenido).trim() };
        return null;
      })
      .filter(n => n && n.contenido.length > 0);
    if (entry.notas.length === 0) {
      delete entry.notas;
    }
  } else {
    delete entry.notas;
  }

  return entry;
};

/**
 * Componente silencioso de auto-sincronización de borradores huérfanos.
 * En lugar de mostrar un banner visual estorboso, detecta si el navegador tiene borradores
 * pendientes en IndexedDB y los guarda automáticamente en segundo plano.
 */
export const PendingDraftsBanner = () => {
  const location = useLocation();
  const isSyncingRef = useRef(false);
  const clearDraftsInStore = useMinutaDraftStore((s) => s.clearDrafts);
  const currentStoreMinutaId = useMinutaDraftStore((s) => s.minutaId);

  useEffect(() => {
    const autoSyncDrafts = async () => {
      if (isSyncingRef.current) return;

      try {
        const records = await idbGetAll('minuta_drafts');
        if (!Array.isArray(records) || records.length === 0) return;

        const found = [];
        for (const rec of records) {
          const minutaId = rec.key;
          const draftEntries = rec.data?.draftEntries || [];
          const draftNotes = rec.data?.draftNotes || [];

          const validEntries = draftEntries.filter(e => e?.descripcion && String(e.descripcion).trim().length >= 3);
          const validNotes = draftNotes.filter(n => n?.contenido && String(n.contenido).trim().length > 0);

          if (validEntries.length > 0 || validNotes.length > 0) {
            found.push({
              minutaId: String(minutaId),
              entries: validEntries,
              notes: validNotes,
              total: validEntries.length + validNotes.length,
            });
          }
        }

        if (found.length === 0) return;

        isSyncingRef.current = true;
        let totalRescued = 0;
        let anyMinutaAffected = false;

        for (const item of found) {
          try {
            const numericMinutaId = Number(item.minutaId);

            // Reabrir minuta si estaba CERRADA para que admita inserción
            try {
              const minRes = await getMinutaById(item.minutaId);
              const minData = minRes.data?.data || minRes.data;
              if (minData?.estado === 'CERRADA') {
                await reabrirMinuta(item.minutaId);
              }
            } catch (minErr) {
              console.warn(`[AutoSyncDrafts] No se pudo comprobar estado de minuta ${item.minutaId}:`, minErr);
            }

            // 1. Guardar tareas
            if (item.entries.length > 0) {
              const toSend = item.entries.map(e => ({
                ...sanitizeDraftEntry(e),
                minutaId: numericMinutaId,
              }));

              const idempKey = (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : `idemp_draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

              await createTarea({ tareas: toSend }, idempKey);
            }

            // 2. Guardar notas
            if (item.notes.length > 0) {
              for (const note of item.notes) {
                try {
                  await createNotaGeneral({
                    contenido: note.contenido,
                    minutaId: numericMinutaId,
                  });
                } catch (noteErr) {
                  console.warn('[AutoSyncDrafts] Error guardando nota:', noteErr);
                }
              }
            }

            // 3. Eliminar de IndexedDB
            await idbDelete('minuta_drafts', item.minutaId);

            // 4. Limpiar store en vivo si estamos en esa minuta
            if (String(currentStoreMinutaId) === String(item.minutaId)) {
              await clearDraftsInStore();
              try {
                if (socket?.connected) {
                  const tempIds = item.entries.map(e => e.tempId).filter(Boolean);
                  if (tempIds.length > 0) {
                    socket.emit('minuta:draft_entries_remove', { minutaId: numericMinutaId, tempIds });
                  }
                }
              } catch {
                // Silencioso
              }
            }

            totalRescued += item.total;
            if (location.pathname.includes(`/minutas/${item.minutaId}`)) {
              anyMinutaAffected = true;
            }
          } catch (err) {
            console.error(`[AutoSyncDrafts] Error guardando minuta ${item.minutaId}:`, err);
          }
        }

        if (totalRescued > 0) {
          notify.success(`Se sincronizaron y guardaron automáticamente ${totalRescued} tareas pendientes en la base de datos.`);
          if (anyMinutaAffected) {
            // Recargar silenciosamente la vista si el usuario está parado en la minuta afectada
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          }
        }
      } catch (scanErr) {
        console.warn('[AutoSyncDrafts] Error durante la sincronización:', scanErr);
      } finally {
        isSyncingRef.current = false;
      }
    };

    autoSyncDrafts();
  }, [location.pathname, clearDraftsInStore, currentStoreMinutaId]);

  // Totalmente silencioso: sin UI ni banners estorbosos
  return null;
};

