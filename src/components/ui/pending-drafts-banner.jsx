import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { idbGetAll, idbDelete } from '@/lib/idb';
import { createTarea, createNotaGeneral } from '@/features/tareas/api/tareas-api';
import { getMinutaById, reabrirMinuta, cerrarMinuta } from '@/features/minutas/api/minutas-api';
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

  // Eliminar propiedades internas o efímeras de cliente
  delete entry.tempId;
  delete entry.estadoConceptual;
  delete entry.formalizada;
  delete entry._isRemoteDraft;
  delete entry.readOnly;
  delete entry.createdAt;
  delete entry.updatedAt;
  delete entry.fecha;
  delete entry.asignaciones;

  // Filtrar o eliminar _localImages huérfanas (sin File/Blob real de memoria)
  // para evitar que createTarea arme un FormData con archivos corruptos
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

  // Validar enum de estado: si no es un estado válido de Tarea (o viene como CAPTURADO), dejarlo null
  if (entry.estado && !VALID_ESTADOS_TAREA.includes(entry.estado)) {
    delete entry.estado;
  }

  // Validar enum de tipo: si no es válido, asignarle SIN_ORGANIZAR
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

export const PendingDraftsBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [minutaTitles, setMinutaTitles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [minutaIdInSaving, setMinutaIdInSaving] = useState(null);
  const clearDraftsInStore = useMinutaDraftStore((s) => s.clearDrafts);
  const currentStoreMinutaId = useMinutaDraftStore((s) => s.minutaId);

  // Escanear IndexedDB buscando minutas con borradores
  const scanDrafts = useCallback(async () => {
    try {
      const records = await idbGetAll('minuta_drafts');
      if (!Array.isArray(records)) {
        setPendingDrafts([]);
        return;
      }

      const found = [];
      for (const rec of records) {
        const minutaId = rec.key;
        const draftEntries = rec.data?.draftEntries || [];
        const draftNotes = rec.data?.draftNotes || [];
        
        // Filtramos sólo borradores válidos
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

      setPendingDrafts(found);

      // Obtener títulos de minutas de forma asíncrona
      for (const item of found) {
        if (!minutaTitles[item.minutaId]) {
          getMinutaById(item.minutaId)
            .then(res => {
              const titulo = res.data?.data?.titulo || res.data?.titulo;
              if (titulo) {
                setMinutaTitles(prev => ({ ...prev, [item.minutaId]: titulo }));
              }
            })
            .catch(() => {
              // Silencioso si falla la obtención del título
            });
        }
      }
    } catch (err) {
      console.warn('[PendingDraftsBanner] Error escaneando IndexedDB:', err);
    }
  }, [minutaTitles]);

  useEffect(() => {
    scanDrafts();
  }, [location.pathname, scanDrafts]);

  // Detectar si el usuario está dentro de una minuta específica (ej: /minutas/58)
  const currentUrlMinutaId = useMemo(() => {
    const match = location.pathname.match(/\/minutas\/(\d+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // Si estamos dentro de una minuta (/minutas/:id), filtramos los borradores sólo a esa minuta
  // Si estamos en /minutas o cualquier otra vista, mostramos todas las minutas que tengan borradores
  const displayedDrafts = useMemo(() => {
    if (currentUrlMinutaId) {
      return pendingDrafts.filter(p => p.minutaId === currentUrlMinutaId);
    }
    return pendingDrafts;
  }, [pendingDrafts, currentUrlMinutaId]);

  // Total de tareas y notas pendientes mostradas actualmente en el banner
  const displayedTotalItems = useMemo(() => {
    return displayedDrafts.reduce((acc, curr) => acc + curr.total, 0);
  }, [displayedDrafts]);

  // Guardar borradores de una minuta específica o de las que apliquen según la vista
  const handleSaveDrafts = async (targetMinutaId = null) => {
    if (isSaving) return;
    setIsSaving(true);

    const effectiveTargetId = targetMinutaId || currentUrlMinutaId;
    setMinutaIdInSaving(effectiveTargetId);

    const itemsToProcess = effectiveTargetId 
      ? pendingDrafts.filter(p => p.minutaId === effectiveTargetId)
      : pendingDrafts;

    let successCount = 0;
    let errorsCount = 0;

    for (const item of itemsToProcess) {
      try {
        const numericMinutaId = Number(item.minutaId);

        // 0. Comprobar si la minuta está en un estado que impida crear tareas (CERRADA)
        // Si está cerrada, la reabrimos momentáneamente para poder insertar los borradores rescatados.
        let wasOriginallyClosed = false;
        try {
          const minRes = await getMinutaById(item.minutaId);
          const minData = minRes.data?.data || minRes.data;
          if (minData?.estado === 'CERRADA') {
            wasOriginallyClosed = true;
            await reabrirMinuta(item.minutaId);
          }
        } catch (minErr) {
          console.warn(`[PendingDraftsBanner] No se pudo verificar o reabrir estado previo de minuta ${item.minutaId}:`, minErr);
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
              console.warn('[PendingDraftsBanner] Error guardando nota borrador:', noteErr);
            }
          }
        }

        // 3. Limpiar de IndexedDB
        await idbDelete('minuta_drafts', item.minutaId);

        // 4. Si la minuta actualmente abierta en pantalla es esta, limpiar su store y sockets
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

        successCount += item.total;
      } catch (err) {
        console.error(`[PendingDraftsBanner] Error al consolidar minuta ${item.minutaId}:`, err);
        errorsCount++;
      }
    }

    setIsSaving(false);
    setMinutaIdInSaving(null);

    if (successCount > 0) {
      notify.success(`¡Se guardaron exitosamente ${successCount} tareas/notas en la base de datos!`);
      await scanDrafts();

      // Si estamos en la minuta afectada, recargar para ver las tareas en vivo
      if (itemsToProcess.some(item => location.pathname.includes(`/minutas/${item.minutaId}`))) {
        window.location.reload();
      }
    }

    if (errorsCount > 0) {
      notify.error('Hubo un error al guardar algunos borradores. Intenta de nuevo.');
    }
  };

  if (displayedDrafts.length === 0) {
    return null;
  }

  const isSingleMinutaContext = displayedDrafts.length === 1;
  const singleDraft = displayedDrafts[0];
  const singleTitle = isSingleMinutaContext 
    ? (minutaTitles[singleDraft.minutaId] || `Minuta #${singleDraft.minutaId}`)
    : '';

  return (
    <aside 
      aria-label="Borradores pendientes de guardar"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9990] w-[95%] max-w-2xl animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white rounded-2xl p-4 sm:p-5 shadow-2xl shadow-amber-950/40 border-2 border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        
        {/* Lado izquierdo: Ícono y texto */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Icon name="pending_actions" size="24px" className="text-amber-200 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                Borradores pendientes ({displayedTotalItems})
              </span>
              <span className="text-amber-200 text-xs font-semibold">
                {isSingleMinutaContext 
                  ? 'en esta minuta' 
                  : `en ${displayedDrafts.length} minutas`}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug break-words">
              {isSingleMinutaContext 
                ? singleTitle 
                : `${displayedDrafts.length} minutas tienen tareas sin subir a la base de datos`}
            </p>
            <p className="text-[11px] text-amber-200/90 font-medium">
              {currentUrlMinutaId 
                ? 'Tareas capturadas en esta minuta que aún no se han guardado permanentemente.'
                : 'Tareas capturadas en tu navegador que no se habían subido. Haz clic para guardarlas.'}
            </p>
          </div>
        </div>

        {/* Lado derecho: Botones de Acción */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isSingleMinutaContext && !currentUrlMinutaId && (
            <button
              type="button"
              onClick={() => navigate(`/minutas/${singleDraft.minutaId}`)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95 border border-white/20 cursor-pointer"
            >
              Ver Minuta
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveDrafts(currentUrlMinutaId || null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 active:scale-95 text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Icon name="progress_activity" size="16px" className="animate-spin text-amber-900" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Icon name="cloud_upload" size="18px" className="text-amber-700" />
                <span>{currentUrlMinutaId ? 'Guardar Estas Tareas' : 'Guardar Todo Ahora'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </aside>
  );
};
