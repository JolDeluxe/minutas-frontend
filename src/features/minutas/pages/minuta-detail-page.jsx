import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMinutaById } from '../api/minutas-api';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutaDraftStore } from '../stores/minuta-draft-store';

import { Icon, Button } from '@/components/ui/z_index';
import { MinutaDetailDesktopView } from '../views/minuta-detail-desktop-view';
import { MinutaDetailMobileView } from '../views/minuta-detail-mobile-view';

/**
 * MinutaDetailPage — Controlador Principal.
 * Orquesta la carga de datos y decide qué vista renderizar (Desktop vs Mobile).
 */
export default function MinutaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const {
    draftEntries, draftNotes, initStore, initialized,
    addDraftEntry, updateDraftEntry, removeDraftEntry,
    addDraftNote, updateDraftNote, removeDraftNote,
    clearDrafts
  } = useMinutaDraftStore();

  const [minuta, setMinuta] = useState(null);
  const [loadingMinuta, setLoadingMinuta] = useState(true);
  const {
    tareas, loading: loadingTareas, fetchTareas, 
    createTarea: createTareaApi, updateTarea, createNotaGeneral 
  } = useTareas();

  const [capturing, setCapturing] = useState(false);
  const [filterClasif, setFilterClasif] = useState('TODAS');
  const [showNotes, setShowNotes] = useState(isDesktop);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [organizeEntry, setOrganizeEntry] = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  useEffect(() => {
    if (id) {
      initStore(id);
      const load = async () => {
        setLoadingMinuta(true);
        try {
          const res = await getMinutaById(id);
          setMinuta(res.data);
          await fetchTareas({ 
            minutaId: id, 
            page: 1, 
            limit: 100, 
            sort: JSON.stringify([{ createdAt: 'asc' }]) 
          });
        } catch {
          notify.error('Minuta no disponible');
          navigate('/minutas');
        } finally {
          setLoadingMinuta(false);
        }
      };
      load();
    }
  }, [id, initStore, navigate, fetchTareas]);

  const allEntries = useMemo(() => [...draftEntries, ...tareas], [draftEntries, tareas]);
  
  const filteredEntries = useMemo(() => {
    if (filterClasif === 'TODAS') return allEntries;
    if (filterClasif === 'SIN_CLASIFICAR') return allEntries.filter(t => !t.clasificacion);
    if (filterClasif === 'SIN_ORGANIZAR') return allEntries.filter(t => !t.formalizada);
    return allEntries.filter(t => t.clasificacion === filterClasif);
  }, [allEntries, filterClasif]);

  const resumen = useMemo(() => {
    const conceptual = {};
    allEntries.forEach(t => {
      const e = t.estadoConceptual || 'CAPTURADO';
      conceptual[e] = (conceptual[e] || 0) + 1;
    });
    return { totalEntradas: allEntries.length, conceptual };
  }, [allEntries]);

  const showZeroState = useMemo(() => {
    return !loadingMinuta && initialized && allEntries.length === 0 && !capturing;
  }, [loadingMinuta, initialized, allEntries.length, capturing]);

  const handleCapture = (payload) => {
    payload.tareas.forEach(t => addDraftEntry(t));
    setCapturing(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmittingFinal(true);
    try {
      if (draftEntries.length > 0) {
        const toSend = draftEntries.map((e) => {
          const entry = { ...e };
          delete entry.tempId;
          // _localImagenes se mantiene para que createTareaApi las envíe via FormData
          return entry;
        });
        await createTareaApi({ tareas: toSend });
      }

      for (const note of draftNotes) {
        await createNotaGeneral({ contenido: note.contenido, minutaId: Number(id) });
      }

      await clearDrafts();
      setShowReviewModal(false);
      setCapturing(false);
      notify.success('Minuta guardada con éxito');
      
      const res = await getMinutaById(id);
      setMinuta(res.data);
      fetchTareas({ minutaId: id, page: 1, limit: 100, sort: JSON.stringify([{ createdAt: 'asc' }]) });
      
      // Pequeño delay de cortesía para asegurar que el listado refrescado traiga las relaciones nuevas
      setTimeout(() => {
        fetchTareas({ minutaId: id, page: 1, limit: 100, sort: JSON.stringify([{ createdAt: 'asc' }]) });
      }, 800);
    } catch {
      notify.error('Error al sincronizar');
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  if (loadingMinuta) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Icon name="progress_activity" className="animate-spin text-marca-primario" size="40px" />
      </div>
    );
  }

  // Si estamos en Zero State, mostramos el iniciador centrado (común para ambos)
  if (showZeroState) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700 bg-slate-50/50">
        <div className="mb-12 flex h-48 w-48 items-center justify-center rounded-[3.5rem] bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100/50 group hover:scale-105 transition-transform cursor-pointer" onClick={() => setCapturing(true)}>
          <Icon name="add" size="96px" className="text-marca-primario group-hover:rotate-90 transition-transform duration-500" />
        </div>
        <h2 className="fuente-titulos text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Iniciar Minuta</h2>
        <p className="max-w-xs text-slate-400 mb-12 text-lg font-medium italic">Presiona el botón para comenzar el registro de acuerdos y tareas.</p>
        <Button 
          variant="marca" 
          size="lg" 
          icon="play_arrow"
          className="h-20 px-16 rounded-4xl shadow-2xl shadow-marca-primario/30 active:scale-95 transition-all text-xl font-black uppercase tracking-[0.2em]"
          onClick={() => setCapturing(true)}
        >
          Comenzar Sesión
        </Button>
      </div>
    );
  }

  const commonProps = {
    minuta, resumen, filteredEntries, loadingTareas, filterClasif, setFilterClasif,
    handleCapture, draftEntries, draftNotes, addDraftNote, updateDraftNote,
    removeDraftNote, updateDraftEntry, removeDraftEntry, setOrganizeEntry,
    organizeEntry, updateTarea, fetchTareas, setShowReviewModal, showReviewModal,
    handleFinalSubmit, isSubmittingFinal, showNotes, setShowNotes
  };

  // Renderizado Condicional por Breakpoint
  return isDesktop 
    ? <MinutaDetailDesktopView {...commonProps} />
    : <MinutaDetailMobileView {...commonProps} />;
}
