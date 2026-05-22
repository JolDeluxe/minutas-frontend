import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMinutaById, iniciarMinuta, cancelarMinuta, cerrarMinuta, reabrirMinuta, finalizarMinuta } from '../api/minutas-api';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { useIsDesktop, useMediaQuery } from '@/hooks/useMediaQuery';
import { useUsers } from '@/features/usuarios/hooks/use-users';
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
  // Forzamos que a partir de 768px (Tablets/Laptops como 1024) se use la lógica de Desktop
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const {
    draftEntries, draftNotes, initStore, initialized,
    addDraftEntry, updateDraftEntry, removeDraftEntry,
    addDraftNote, updateDraftNote, removeDraftNote,
    clearDrafts
  } = useMinutaDraftStore();

  const [minuta, setMinuta] = useState(null);
  const [loadingMinuta, setLoadingMinuta] = useState(true);

  // ESTA ES LA PARTE CORREGIDA (Faltaba "const { tareas, fetchTareas, loadingTareas,")
  const { 
    tareas, fetchTareas, loadingTareas,
    createTarea: createTareaApi, updateTarea, changeStatus: changeTareaStatus, createNotaGeneral, 
    createTareaNota, updateTareaNota, deleteTareaNota,
    addTareaImagen, deleteTareaImagen
  } = useTareas();

  const { users, fetchUsers } = useUsers();

  const [showNotes, setShowNotes] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [organizeEntry, setOrganizeEntry] = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [reabriendo, setReabriendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  // ── Filtro unificado (multi-dimensión) ─────────────────────
  const [activeFilter, setActiveFilter] = useState({
    tipo: 'TODAS',        // por defecto mostrar todo (incluyendo lo sin organizar)
    estado: null,         // null = todos los estados
    clasificacion: null,
    area: null,
    linea: null,
    search: '',
  });

  // ── Persistencia y Lógica de Vista (Table vs Cards) ─────────────────────
  const [viewMode, setViewMode] = useState(() => {
    // 1. Intentar cargar preferencia guardada
    const saved = localStorage.getItem('minutas_view_mode');
    if (saved) return saved;

    // 2. Fallback automático basado en resolución (md = 768px)
    return window.innerWidth >= 768 ? 'table' : 'cards';
  });

  // Guardar preferencia cuando cambie manualmente
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('minutas_view_mode', mode);
  };

  useEffect(() => {
    if (id) {
      initStore(id);
      const load = async () => {
        setLoadingMinuta(true);
        try {
          const res = await getMinutaById(id);
          // CORRECCIÓN: Extraer datos correctamente
          setMinuta(res.data?.data || res.data);
          
          await fetchTareas({ 
            minutaId: id, 
            todo: true,
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
      fetchUsers();
    }
  }, [id, initStore, navigate, fetchTareas, fetchUsers]);

  const allEntries = useMemo(() => [...draftEntries, ...tareas], [draftEntries, tareas]);
  const departamento = minuta?.departamento || 'DISENO';

  // ── Entradas filtradas por el filtro activo ─────────────────
  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      if (entry.tipo === 'DESCARTADA') return false;
      // Filtros de tipo organizacional
      if (activeFilter.tipo && activeFilter.tipo !== 'TODAS' && entry.tipo !== activeFilter.tipo) {
        // Los borradores (tempId) aún no tienen tipo, mostrarlos si filtro es TAREA o SIN_ORGANIZAR
        if (entry.tempId && (activeFilter.tipo === 'TAREA' || activeFilter.tipo === 'SIN_ORGANIZAR')) {
          // Los borradores se muestran siempre en modo TAREA y SIN_ORGANIZAR
        } else {
          return false;
        }
      }
      if (activeFilter.estado) {
        if (activeFilter.estado === 'ATRASADA') {
          const ahora = new Date();
          const vence = entry.fechaVencimiento ? new Date(entry.fechaVencimiento) : null;
          if (!vence || vence >= ahora || entry.estado === 'CERRADA' || entry.estado === 'EN_REVISION') return false;
        } else if (entry.estado !== activeFilter.estado) {
          return false;
        }
      }
      if (activeFilter.clasificacion && entry.clasificacion !== activeFilter.clasificacion) return false;
      if (activeFilter.area && entry.area !== activeFilter.area) return false;
      if (activeFilter.linea && entry.linea !== activeFilter.linea) return false;
      if (activeFilter.search) {
        const s = activeFilter.search.toLowerCase();
        if (!entry.descripcion?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [allEntries, activeFilter]);

  // ── Handlers de filtro para KPIs y barra ───────────────────
  const handleFilterByStatus = (estado) =>
    setActiveFilter(prev => ({ ...prev, estado: prev.estado === estado ? null : estado, tipo: 'TAREA' }));

  const handleFilterByTipo = (tipo) =>
    setActiveFilter(prev => ({ ...prev, tipo: prev.tipo === tipo ? 'TAREA' : tipo, estado: null }));

  const handleResetFilter = () =>
    setActiveFilter({ tipo: 'TODAS', estado: null, clasificacion: null, area: null, linea: null, search: '' });

  // ── Resumen centrado en Tareas tipo TAREA ──────────────────
  const resumen = useMemo(() => {
    const now = new Date();
    let totalTareas = 0;
    let pendientes = 0;
    let enRevision = 0;
    let cerradas = 0;
    let atrasadas = 0;
    let totalPoliticas = 0;
    let totalRecordatorios = 0;

    for (const t of allEntries) {
      // Regla Crítica: Tareas Externas no cuentan para los KPIs operativos ni afectan el cierre
      // Asumimos que si el departamento de la minuta es DISENO, y el área es MARKETING (o viceversa), es externa.
      const isExterna = (departamento === 'DISENO' && t.area === 'MARKETING') || 
                        (departamento === 'MARKETING' && t.area === 'DISENO');

      if (t.tipo === 'POLITICA') {
        totalPoliticas++;
      } else if (t.tipo === 'RECORDATORIO') {
        totalRecordatorios++;
      } else if (t.tipo === 'TAREA' && !isExterna) {
        // Solo las TAREAS INTERNAS afectan los KPIs operativos
        totalTareas++;
        if (t.estado === 'PENDIENTE') pendientes++;
        else if (t.estado === 'EN_REVISION') enRevision++;
        else if (t.estado === 'CERRADA') cerradas++;

        if (
          t.fechaVencimiento &&
          new Date(t.fechaVencimiento) < now &&
          t.estado !== 'CERRADA' &&
          t.estado !== 'EN_REVISION'
        ) {
          atrasadas++;
        }
      }
    }

    const porcentaje = totalTareas > 0 ? Math.round(((cerradas + enRevision) / totalTareas) * 100) : 0;

    return {
      totalTareas,
      pendientes,
      enRevision,
      cerradas,
      atrasadas,
      porcentaje,
      totalPoliticas,
      totalRecordatorios,
      totalEntradas: allEntries.length,
    };
  }, [allEntries, departamento]);

  const handleCapture = (payload) => {
    payload.tareas.forEach(t => addDraftEntry(t));
  };

  const handleFinalSubmit = async (closeAfterSave = false) => {
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
      
      if (closeAfterSave) {
        try {
          if (minuta?.estado === 'EN_CURSO') {
            await finalizarMinuta(id);
            notify.success('Minuta guardada y junta finalizada con éxito');
          } else {
            await cerrarMinuta(id);
            notify.success('Minuta guardada y cerrada con éxito');
          }
        } catch {
          notify.error('Minuta guardada pero ocurrió un error al actualizar estado');
        }
      } else {
        notify.success('Minuta guardada con éxito');
      }
      
      const res = await getMinutaById(id);
      setMinuta(res.data?.data || res.data);
      refreshEntries();
      
      // Pequeño delay de cortesía para asegurar que el listado refrescado traiga las relaciones nuevas
      setTimeout(() => {
        refreshEntries();
      }, 800);
    } catch {
      notify.error('Error al sincronizar');
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const refreshEntries = () => fetchTareas({
    minutaId: id,
    todo: true,
    page: 1,
    limit: 100,
    sort: JSON.stringify([{ createdAt: 'asc' }]),
  });

  const handleUpdateSavedEntry = async (entryId, payload) => {
    try {
      await updateTarea(entryId, payload);
      await refreshEntries();
      notify.success('Entrada actualizada');
      return true;
    } catch {
      notify.error('No se pudo actualizar la entrada');
      return false;
    }
  };

  const handleOrganizeSave = async (entryId, payload) => {
    try {
      if (organizeEntry?.tempId) {
        updateDraftEntry(organizeEntry.tempId, payload);
        notify.success('Entrada organizada (Borrador)');
      } else {
        await handleUpdateSavedEntry(entryId, payload);
      }
      setOrganizeEntry(null);
    } catch (error) {
      console.error('Error al organizar:', error);
      notify.error('No se pudo organizar la entrada');
    }
  };

  const handleStatusChange = async (entryId, payload) => {
    try {
      await changeTareaStatus(entryId, payload);
      await refreshEntries();
      notify.success('Estado de la tarea actualizado');
      return true;
    } catch {
      notify.error('No se pudo actualizar el estado de la tarea');
      return false;
    }
  };

  const handleCreateEntryNote = async (entryId, contenido) => {
    try {
      await createTareaNota({ tareaId: entryId, contenido });
      await refreshEntries();
      notify.success('Nota agregada');
      return true;
    } catch {
      notify.error('No se pudo agregar la nota');
      return false;
    }
  };

  const handleUpdateEntryNote = async (noteId, contenido) => {
    try {
      await updateTareaNota(noteId, { contenido });
      await refreshEntries();
      return true;
    } catch {
      notify.error('No se pudo actualizar la nota');
      return false;
    }
  };

  const handleDeleteEntryNote = async (noteId) => {
    try {
      await deleteTareaNota(noteId);
      await refreshEntries();
      notify.success('Nota eliminada');
      return true;
    } catch {
      notify.error('No se pudo eliminar la nota');
      return false;
    }
  };

  const handleAddEntryImage = async (entryId, file) => {
    try {
      await addTareaImagen(entryId, file);
      await refreshEntries();
      notify.success('Imagen agregada');
    } catch {
      notify.error('Error al subir imagen');
    }
  };

  const handleDeleteEntryImage = async (entryId, imagenId) => {
    try {
      await deleteTareaImagen(entryId, imagenId);
      await refreshEntries();
      notify.success('Imagen eliminada');
    } catch {
      notify.error('Error al eliminar imagen');
    }
  };

  const handleIniciar = async () => {
    setIniciando(true);
    try {
      await iniciarMinuta(id);
      notify.success("Junta iniciada con éxito");
      const res = await getMinutaById(id);
      setMinuta(res.data?.data || res.data);
    } catch {
      notify.error("No se pudo iniciar la junta");
    } finally {
      setIniciando(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta minuta? Esta acción no se puede deshacer.")) return;
    setCancelando(true);
    try {
      await cancelarMinuta(id);
      notify.success("Minuta cancelada");
      navigate('/minutas');
    } catch {
      notify.error("No se pudo cancelar la minuta. Verifica que no tenga tareas activas.");
    } finally {
      setCancelando(false);
    }
  };

  const handleCerrar = async () => {
    if (draftEntries.length > 0 || draftNotes.length > 0) {
      setShowReviewModal(true);
      notify.info("Tienes borradores pendientes. Por favor, revísalos y guárdalos para cerrar la junta.");
      return;
    }
    if (!confirm("¿Estás seguro de que deseas cerrar esta junta? No podrás agregar más acuerdos o tareas.")) return;
    setCerrando(true);
    try {
      const res = await cerrarMinuta(id);
      const data = res.data;
      if (data?.advertencia) {
        notify.warning(data.advertencia);
      } else {
        notify.success("Junta cerrada con éxito");
      }
      const resMinuta = await getMinutaById(id);
      setMinuta(resMinuta.data?.data || resMinuta.data);
    } catch {
      notify.error("No se pudo cerrar la junta");
    } finally {
      setCerrando(false);
    }
  };

  const handleReabrir = async () => {
    if (!confirm("¿Estás seguro de que deseas reabrir esta junta? Podrás agregar más acuerdos o tareas nuevamente.")) return;
    setReabriendo(true);
    try {
      await reabrirMinuta(id);
      notify.success("Junta reabierta con éxito");
      const resMinuta = await getMinutaById(id);
      setMinuta(resMinuta.data?.data || resMinuta.data);
    } catch {
      notify.error("No se pudo reabrir la junta");
    } finally {
      setReabriendo(false);
    }
  };

  const handleFinalizar = async () => {
    if (draftEntries.length > 0 || draftNotes.length > 0) {
      setShowReviewModal(true);
      notify.info("Tienes borradores pendientes. Por favor, revísalos y guárdalos para finalizar la junta.");
      return;
    }
    if (!confirm("¿Deseas finalizar la junta? Pasará a organización post-junta.")) return;
    setFinalizando(true);
    try {
      const res = await finalizarMinuta(id);
      notify.success("Junta finalizada con éxito");
      // res.data trae { status: 'success', data: {...minuta} } según 09_finish.ts
      setMinuta(res.data?.data || res.data);
    } catch {
      notify.error("No se pudo finalizar la junta");
    } finally {
      setFinalizando(false);
    }
  };

  if (loadingMinuta) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Icon name="progress_activity" className="animate-spin text-marca-primario" size="40px" />
      </div>
    );
  }

  // Separar para visualización
  const politicasAcordadas = allEntries.filter(e => e.tipo === 'POLITICA');
  const recordatoriosGenerales = allEntries.filter(e => e.tipo === 'RECORDATORIO');


  const commonProps = {
    minuta, users, resumen, allEntries, filteredEntries, loadingTareas, departamento,
    politicasAcordadas, recordatoriosGenerales,
    activeFilter, setActiveFilter, handleFilterByStatus, handleFilterByTipo, handleResetFilter,
    viewMode, setViewMode: handleSetViewMode,
    handleCapture, draftEntries, draftNotes, addDraftNote, updateDraftNote,
    removeDraftNote, updateDraftEntry, removeDraftEntry, setOrganizeEntry,
    organizeEntry, handleOrganizeSave, updateTarea, changeTareaStatus: handleStatusChange, fetchTareas, refreshEntries, setShowReviewModal, showReviewModal,
    handleFinalSubmit, isSubmittingFinal, showNotes, setShowNotes,
    handleUpdateSavedEntry, handleCreateEntryNote, handleUpdateEntryNote,
    handleDeleteEntryNote, handleAddEntryImage, handleDeleteEntryImage,
    handleIniciar, handleCancelar, handleCerrar, handleReabrir, handleFinalizar,
    iniciando, cancelando, cerrando, reabriendo, finalizando,
    minutaEstado: minuta?.estado
  };

  // Renderizado Condicional por Breakpoint
  return isDesktop 
    ? <MinutaDetailDesktopView {...commonProps} />
    : <MinutaDetailMobileView {...commonProps} />;
}
