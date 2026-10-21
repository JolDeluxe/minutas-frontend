import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { idbGetAll, idbDelete } from '@/lib/idb';
import { createTarea, createNotaGeneral } from '@/features/tareas/api/tareas-api';
import { getMinutaById } from '@/features/minutas/api/minutas-api';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutaDraftStore } from '@/features/minutas/stores/minuta-draft-store';
import socket from '@/lib/socket';

/**
 * Normaliza las tareas de borrador de IndexedDB para enviarlas a createTareaApi
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

  if (entry.notas && Array.isArray(entry.notas)) {
    entry.notas = entry.notas
      .map(n => {
        if (typeof n === 'string') return { contenido: n.trim() };
        if (typeof n === 'object' && n !== null && n.contenido) return { contenido: String(n.contenido).trim() };
        return null;
      })
      .filter(n => n && n.contenido.length > 0);
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

  // Total de tareas y notas pendientes de todas las minutas encontradas
  const totalItems = useMemo(() => {
    return pendingDrafts.reduce((acc, curr) => acc + curr.total, 0);
  }, [pendingDrafts]);

  // Guardar borradores de una minuta específica o de todas
  const handleSaveDrafts = async (targetMinutaId = null) => {
    if (isSaving) return;
    setIsSaving(true);
    setMinutaIdInSaving(targetMinutaId);

    const itemsToProcess = targetMinutaId 
      ? pendingDrafts.filter(p => p.minutaId === targetMinutaId)
      : pendingDrafts;

    let successCount = 0;
    let errorsCount = 0;

    for (const item of itemsToProcess) {
      try {
        const numericMinutaId = Number(item.minutaId);

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

  if (pendingDrafts.length === 0) {
    return null;
  }

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
                Borradores pendientes ({totalItems})
              </span>
              <span className="text-amber-200 text-xs font-semibold">
                en {pendingDrafts.length} {pendingDrafts.length === 1 ? 'minuta' : 'minutas'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug break-words">
              {pendingDrafts.length === 1 
                ? (minutaTitles[pendingDrafts[0].minutaId] || `Minuta #${pendingDrafts[0].minutaId}`)
                : `${pendingDrafts.length} minutas tienen tareas sin subir a la base de datos`}
            </p>
            <p className="text-[11px] text-amber-200/90 font-medium">
              Estas tareas están en tu navegador pero no se habían guardado. Haz clic para subirlas permanentemente.
            </p>
          </div>
        </div>

        {/* Lado derecho: Botones de Acción */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {pendingDrafts.length === 1 && !location.pathname.includes(`/minutas/${pendingDrafts[0].minutaId}`) && (
            <button
              type="button"
              onClick={() => navigate(`/minutas/${pendingDrafts[0].minutaId}`)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95 border border-white/20 cursor-pointer"
            >
              Ver Minuta
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveDrafts()}
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
                <span>Guardar Tareas Ahora</span>
              </>
            )}
          </button>
        </div>

      </div>
    </aside>
  );
};
