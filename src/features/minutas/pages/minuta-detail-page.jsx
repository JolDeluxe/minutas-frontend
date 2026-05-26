import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMinutaById, iniciarMinuta, cancelarMinuta, cerrarMinuta, reabrirMinuta, finalizarMinuta } from '../api/minutas-api';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutaDraftStore } from '../stores/minuta-draft-store';

import { Icon } from '@/components/ui/z_index';
import { MinutaDetailDesktopView } from '../views/minuta-detail-desktop-view';
import { MinutaDetailMobileView } from '../views/minuta-detail-mobile-view';

export default function MinutaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const {
    draftEntries, draftNotes, initStore,
    addDraftEntry, updateDraftEntry, removeDraftEntry,
    addDraftNote, updateDraftNote, removeDraftNote,
    clearDrafts
  } = useMinutaDraftStore();

  const [minuta, setMinuta] = useState(null);
  const [loadingMinuta, setLoadingMinuta] = useState(true);

  const { 
    tareas, fetchTareas, loadingTareas, deleteTarea,
    createTarea: createTareaApi, updateTarea, changeStatus: changeTareaStatus, createNotaGeneral, 
    createTareaNota, updateTareaNota, deleteTareaNota,
    addTareaImagen, deleteTareaImagen
  } = useTareas();

  const { users, fetchUsers } = useUsers();

  const [showNotes, setShowNotes] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [organizeEntry, setOrganizeEntry] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [reabriendo, setReabriendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const [activeFilter, setActiveFilter] = useState({
    tipo: 'TODAS',
    estado: null,
    clasificacion: null,
    area: null,
    linea: null,
    search: '',
  });

  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('minutas_view_mode');
    if (saved) return saved;
    return window.innerWidth >= 768 ? 'table' : 'cards';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('minutas_view_mode', mode);
  };

  const refreshEntries = useCallback(() => fetchTareas({
    minutaId: id,
    todo: true,
    page: 1,
    limit: 100,
    sort: JSON.stringify([{ createdAt: 'asc' }]),
  }), [id, fetchTareas]);

  useEffect(() => {
    if (id) {
      initStore(id);
      const load = async () => {
        setLoadingMinuta(true);
        try {
          const res = await getMinutaById(id);
          setMinuta(res.data?.data || res.data);
          await refreshEntries();
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
  }, [id, initStore, navigate, refreshEntries, fetchUsers]);

  const allEntries = useMemo(() => [...draftEntries, ...tareas], [draftEntries, tareas]);
  const departamento = minuta?.departamento || 'DISENO';

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      if (entry.estado === 'CANCELADA') return false;
      if (activeFilter.tipo && activeFilter.tipo !== 'TODAS' && entry.tipo !== activeFilter.tipo) {
        if (entry.tempId && (activeFilter.tipo === 'TAREA' || activeFilter.tipo === 'SIN_ORGANIZAR')) {} 
        else { return false; }
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

  const handleFilterByStatus = (estado) =>
    setActiveFilter(prev => ({ ...prev, estado: prev.estado === estado ? null : estado, tipo: 'TAREA' }));

  const handleFilterByTipo = (tipo) =>
    setActiveFilter(prev => ({ ...prev, tipo: prev.tipo === tipo ? 'TAREA' : tipo, estado: null }));

  const handleResetFilter = () =>
    setActiveFilter({ tipo: 'TODAS', estado: null, clasificacion: null, area: null, linea: null, search: '' });

  const resumen = useMemo(() => {
    const now = new Date();
    let totalTareas = 0, pendientes = 0, enRevision = 0, cerradas = 0, atrasadas = 0;
    let totalPoliticas = 0, totalRecordatorios = 0;

    for (const t of allEntries) {
      const isExterna = (departamento === 'DISENO' && t.area !== 'DISENO') || (departamento === 'MARKETING' && t.area !== 'MARKETING');
      if (t.tipo === 'POLITICA') totalPoliticas++;
      else if (t.tipo === 'RECORDATORIO') totalRecordatorios++;
      else if (t.tipo === 'TAREA' && !isExterna) {
        totalTareas++;
        if (t.estado === 'PENDIENTE') pendientes++;
        else if (t.estado === 'EN_REVISION') enRevision++;
        else if (t.estado === 'CERRADA') cerradas++;
        if (t.fechaVencimiento && new Date(t.fechaVencimiento) < now && t.estado !== 'CERRADA' && t.estado !== 'EN_REVISION') atrasadas++;
      }
    }
    const porcentaje = totalTareas > 0 ? Math.round(((cerradas + enRevision) / totalTareas) * 100) : 0;
    return { totalTareas, pendientes, enRevision, cerradas, atrasadas, porcentaje, totalPoliticas, totalRecordatorios, totalEntradas: allEntries.length };
  }, [allEntries, departamento]);

  const handleCapture = (payload) => {
    payload.tareas.forEach(t => addDraftEntry(t));
    notify.success('Borrador añadido', { duration: 1500 });
  };

  const handleEditEntrySave = async (entryId, payload, imageActions = {}) => {
    setIsSavingEntry(true);
    try {
      if (typeof entryId === 'string' || entryId.toString().startsWith('temp_')) {
        updateDraftEntry(entryId, payload);
        notify.success('Borrador actualizado');
        setEditEntry(null);
        return;
      }

      await updateTarea(entryId, payload);

      if (imageActions.deleteImageIds?.length > 0) {
        for (const imgId of imageActions.deleteImageIds) {
          await deleteTareaImagen(entryId, imgId);
        }
      }

      if (imageActions.newImages?.length > 0) {
        for (const file of imageActions.newImages) {
          await addTareaImagen(entryId, file);
        }
      }

      await refreshEntries();
      notify.success('Entrada actualizada correctamente');
      setEditEntry(null);
    } catch (err) {
      notify.error('Error al guardar cambios');
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleFinalSubmit = async (closeAfterSave = false) => {
    setIsSubmittingFinal(true);
    try {
      if (draftEntries.length > 0) {
        const validEntries = draftEntries.filter(e => e.descripcion && e.descripcion.trim().length >= 3);
        if (validEntries.length > 0) {
          const toSend = validEntries.map((e) => {
            const entry = { ...e };
            delete entry.tempId;
            delete entry.estadoConceptual;
            delete entry.formalizada;
            return entry;
          });
          await createTareaApi({ tareas: toSend });
        }
      }
      for (const note of draftNotes) {
        await createNotaGeneral({ contenido: note.contenido, minutaId: Number(id) });
      }
      await clearDrafts();
      setShowReviewModal(false);
      if (closeAfterSave) {
        if (minuta?.estado === 'EN_CURSO') await finalizarMinuta(id);
        else await cerrarMinuta(id);
        notify.success('Guardado y finalizado');
      } else notify.success('Guardado con éxito');
      const res = await getMinutaById(id);
      setMinuta(res.data?.data || res.data);
      refreshEntries();
    } catch {
      notify.error('Error al sincronizar');
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (typeof id === 'string' || id.toString().startsWith('temp_')) {
      removeDraftEntry(id);
      notify.success('Borrador eliminado');
      return;
    }
    try {
      await deleteTarea(id);
      await refreshEntries();
      notify.success('Entrada descartada');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'No se pudo descartar la entrada';
      notify.error(errorMsg);
    }
  };

  const handleOrganizeSave = async (entryId, payload) => {
    try {
      if (typeof entryId === 'string' || entryId.toString().startsWith('temp_')) {
        updateDraftEntry(entryId, payload);
        notify.success('Organizado (Borrador)');
      } else {
        await updateTarea(entryId, payload);
        await refreshEntries();
        notify.success('Entrada organizada');
      }
      setOrganizeEntry(null);
    } catch {
      notify.error('Error al organizar');
    }
  };

  const handleStatusChange = async (entryId, payload) => {
    try {
      await changeTareaStatus(entryId, payload);
      await refreshEntries();
      notify.success('Estado actualizado');
      return true;
    } catch {
      notify.error('Error al cambiar estado');
      return false;
    }
  };

  const handleCreateEntryNote = async (entryIdOrTempId, contenido) => {
    try {
      if (typeof entryIdOrTempId === 'string' || isNaN(Number(entryIdOrTempId))) {
        const entry = draftEntries.find(e => e.tempId === entryIdOrTempId);
        if (entry) {
          const newNotes = [...(entry.notas || []), { contenido, createdAt: new Date().toISOString() }];
          updateDraftEntry(entryIdOrTempId, { notas: newNotes });
          return true;
        }
        return false;
      }
      await createTareaNota({ tareaId: entryIdOrTempId, contenido });
      await refreshEntries();
      notify.success('Nota agregada');
      return true;
    } catch {
      notify.error('Error al agregar nota');
      return false;
    }
  };

  const handleUpdateEntryNote = async (entryIdOrTempId, noteIdOrIdx, contenido) => {
    try {
      if (typeof entryIdOrTempId === 'string' || isNaN(Number(entryIdOrTempId))) {
        const entry = draftEntries.find(e => e.tempId === entryIdOrTempId);
        if (entry && entry.notas) {
          const newNotes = [...entry.notas];
          newNotes[noteIdOrIdx] = { ...newNotes[noteIdOrIdx], contenido };
          updateDraftEntry(entryIdOrTempId, { notas: newNotes });
          return true;
        }
        return false;
      }
      await updateTareaNota(noteIdOrIdx, { contenido });
      await refreshEntries();
      return true;
    } catch {
      notify.error('Error al actualizar nota');
      return false;
    }
  };

  const handleDeleteEntryNote = async (entryIdOrTempId, noteIdOrIdx) => {
    try {
      if (typeof entryIdOrTempId === 'string' || isNaN(Number(entryIdOrTempId))) {
        const entry = draftEntries.find(e => e.tempId === entryIdOrTempId);
        if (entry && entry.notas) {
          const newNotes = entry.notas.filter((_, i) => i !== noteIdOrIdx);
          updateDraftEntry(entryIdOrTempId, { notas: newNotes });
          notify.success('Nota de borrador eliminada');
          return true;
        }
        return false;
      }
      await deleteTareaNota(noteIdOrIdx);
      await refreshEntries();
      notify.success('Nota eliminada');
      return true;
    } catch {
      notify.error('Error al eliminar nota');
      return false;
    }
  };

  const handleAddEntryImage = async (entryId, file) => {
    try {
      if (typeof entryId === 'string' || isNaN(Number(entryId))) {
        const entry = draftEntries.find(e => e.tempId === entryId);
        if (entry) {
          const newImgs = [...(entry._localImages || []), { file, preview: URL.createObjectURL(file), id: Math.random().toString(36).substr(2, 9) }];
          updateDraftEntry(entryId, { _localImages: newImgs });
          return;
        }
      }
      await addTareaImagen(entryId, file);
      await refreshEntries();
      notify.success('Imagen agregada');
    } catch {
      notify.error('Error al subir imagen');
    }
  };

  const handleDeleteEntryImage = async (entryId, imagenId) => {
    try {
      if (typeof entryId === 'string' || isNaN(Number(entryId))) {
        const entry = draftEntries.find(e => e.tempId === entryId);
        if (entry && entry._localImages) {
          const newImgs = entry._localImages.filter(img => img.id !== imagenId);
          updateDraftEntry(entryId, { _localImages: newImgs });
          return;
        }
      }
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
      const res = await getMinutaById(id);
      setMinuta(res.data?.data || res.data);
      notify.success("Iniciada");
    } finally { setIniciando(false); }
  };

  const handleCancelar = async () => {
    if (!confirm("¿Cancelar?")) return;
    setCancelando(true);
    try {
      await cancelarMinuta(id);
      notify.success("Cancelada");
      navigate('/minutas');
    } finally { setCancelando(false); }
  };

  const handleCerrar = async () => {
    if (draftEntries.length > 0 || draftNotes.length > 0) { setShowReviewModal(true); return; }
    if (!confirm("¿Cerrar?")) return;
    setCerrando(true);
    try {
      const res = await cerrarMinuta(id);
      if (res.data?.advertencia) notify.warning(res.data.advertencia);
      const resMinuta = await getMinutaById(id);
      setMinuta(resMinuta.data?.data || resMinuta.data);
    } finally { setCerrando(false); }
  };

  const handleReabrir = async () => {
    setReabriendo(true);
    try {
      await reabrirMinuta(id);
      const resMinuta = await getMinutaById(id);
      setMinuta(resMinuta.data?.data || resMinuta.data);
    } finally { setReabriendo(false); }
  };

  const handleFinalizar = async () => {
    if (draftEntries.length > 0 || draftNotes.length > 0) { setShowReviewModal(true); return; }
    setFinalizando(true);
    try {
      const res = await finalizarMinuta(id);
      setMinuta(res.data?.data || res.data);
    } finally { setFinalizando(false); }
  };

  if (loadingMinuta) return <div className="flex h-screen items-center justify-center bg-slate-50"><Icon name="progress_activity" className="animate-spin text-marca-primario" size="40px" /></div>;

  const politicasAcordadas = allEntries.filter(e => e.tipo === 'POLITICA');
  const recordatoriosGenerales = allEntries.filter(e => e.tipo === 'RECORDATORIO');

  const commonProps = {
    minuta, users, resumen, allEntries, filteredEntries, loadingTareas, departamento, politicasAcordadas, recordatoriosGenerales,
    activeFilter, setActiveFilter, handleFilterByStatus, handleFilterByTipo, handleResetFilter, viewMode, setViewMode: handleSetViewMode,
    handleCapture, draftEntries, draftNotes, addDraftNote, updateDraftNote, removeDraftNote,
    handleDeleteEntry, removeDraftEntry, updateDraftEntry, 
    organizeEntry, setOrganizeEntry, handleOrganizeSave,
    editEntry, setEditEntry, handleEditEntrySave, isSavingEntry,
    updateTarea, changeTareaStatus: handleStatusChange, fetchTareas, refreshEntries, setShowReviewModal, showReviewModal,
    handleFinalSubmit, isSubmittingFinal, showNotes, setShowNotes, handleCreateEntryNote, handleUpdateEntryNote,
    handleDeleteEntryNote, handleAddEntryImage, handleDeleteEntryImage, handleIniciar, handleCancelar, handleCerrar, handleReabrir, handleFinalizar,
    iniciando, cancelando, cerrando, reabriendo, finalizando, minutaEstado: minuta?.estado,
    clearDrafts
  };

  return isDesktop ? <MinutaDetailDesktopView {...commonProps} /> : <MinutaDetailMobileView {...commonProps} />;
}
