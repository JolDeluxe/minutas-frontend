import { useState, useCallback, useEffect, useRef } from 'react';
import {
    getTareas,
    createTarea,
    updateTarea,
    organizarTarea,
    changeTareaStatus,
    deleteTarea,
    createNotaGeneral,
    updateNotaGeneral,
    deleteNotaGeneral,
    createTareaNota,
    updateTareaNota,
    deleteTareaNota,
    addTareaImagen,
    deleteTareaImagen,
    generarPdfTarea,
    toggleNotificadoTarea
} from '../api/tareas-api';

export const useTareas = () => {
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [meta, setMeta] = useState({
        totalFiltrado: 0,
        totalPages: 1,
        counts: {},
        totalAtrasadas: 0,
    });

    const lastFetchParams = useRef({});

    const fetchTareas = useCallback(async (params = {}) => {
        setLoading(true);
        lastFetchParams.current = params;

        try {
            const response = await getTareas(params);
            
            const payloadData = response?.data || {};
            const listTareas = payloadData.tareas || [];

            setTareas(Array.isArray(listTareas) ? listTareas : []);
            setMeta({
                totalFiltrado: payloadData.totalFiltrado ?? payloadData.total ?? 0,
                totalPages: payloadData.totalPages ?? 1,
                counts: payloadData.counts || {},
                totalAtrasadas: payloadData.totalAtrasadas ?? 0,
                totalParaPaginador: payloadData.total ?? 0,
            });
        } catch (error) {
            console.error("Error fetching tareas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreate = useCallback(async (data) => {
        setSubmitting(true);
        try { 
            const res = await createTarea(data);
            return res.data;
        } catch (err) {
            const errorData = err.response?.data;
            console.error("💥 Fallo en handleCreate Tarea:", errorData || err.message);
            if (errorData?.errors) {
                console.error("📋 Detalles de validación fallida:", JSON.stringify(errorData.errors, null, 2));
            }
            throw err; // Re-lanzar para que el componente que llama sepa del error
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleUpdate = useCallback(async (id, data) => {
        setSubmitting(true);
        try { 
            const res = await updateTarea(id, data);
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleOrganizar = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            const res = await organizarTarea(id, data);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleChangeStatus = useCallback(async (id, data) => {
        setSubmitting(true);
        try { 
            const res = await changeTareaStatus(id, data);
            // Disparamos evento global para que otros componentes se enteren (ej. Layouts con badges)
            window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);
    
    const handleDelete = useCallback(async (id, all = false) => {
        setSubmitting(true);
        try { 
            const res = await deleteTarea(id, all);
            return res.data;
        } catch (err) {
            console.error("💥 Fallo en handleDelete Tarea:", err.response?.data || err.message);
            throw err;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleCreateNotaGeneral = useCallback(async (data) => {
        setSubmitting(true);
        try { 
            const res = await createNotaGeneral(data);
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleUpdateNotaGeneral = useCallback(async (id, data) => {
        setSubmitting(true);
        try { 
            const res = await updateNotaGeneral(id, data);
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleDeleteNotaGeneral = useCallback(async (id) => {
        setSubmitting(true);
        try { 
            const res = await deleteNotaGeneral(id);
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleCreateTareaNota = useCallback(async (data) => {
        setSubmitting(true);
        try { 
            const res = await createTareaNota(data);
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleUpdateTareaNota = useCallback(async (id, data) => {
        setSubmitting(true);
        try { 
            const res = await updateTareaNota(id, data);
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleDeleteTareaNota = useCallback(async (id) => {
        setSubmitting(true);
        try { 
            const res = await deleteTareaNota(id);
            return res.data;
        } finally { 
            setSubmitting(false); 
        }
    }, []);

    const handleAddTareaImagen = useCallback(async (tareaId, file, tipo = 'CAPTURA') => {
        setSubmitting(true);
        try {
            const res = await addTareaImagen(tareaId, file, tipo);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleDeleteTareaImagen = useCallback(async (tareaId, imagenId) => {
        setSubmitting(true);
        try {
            const res = await deleteTareaImagen(tareaId, imagenId);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleGenerarPdfTarea = useCallback(async (id) => {
        try {
            const res = await generarPdfTarea(id);
            return res.data;
        } catch (err) {
            console.error("Error al generar PDF:", err);
            throw err;
        }
    }, []);

    const handleToggleNotificado = useCallback(async (id) => {
        try {
            const res = await toggleNotificadoTarea(id);
            return res.data;
        } catch (err) {
            console.error("Error al actualizar notificado:", err);
            throw err;
        }
    }, []);

    useEffect(() => {
        const handleSyncComplete = () => {
            if (Object.keys(lastFetchParams.current).length > 0 || tareas.length > 0) {
                fetchTareas(lastFetchParams.current);
            }
        };
        window.addEventListener('cuadra-sync-complete', handleSyncComplete);
        return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
    }, [fetchTareas, tareas.length]);

    return {
        tareas,
        meta,
        loading,
        submitting,
        fetchTareas,
        createTarea: handleCreate,
        updateTarea: handleUpdate,
        organizarTarea: handleOrganizar,
        changeStatus: handleChangeStatus,
        deleteTarea: handleDelete,
        createNotaGeneral: handleCreateNotaGeneral,
        updateNotaGeneral: handleUpdateNotaGeneral,
        deleteNotaGeneral: handleDeleteNotaGeneral,
        createTareaNota: handleCreateTareaNota,
        updateTareaNota: handleUpdateTareaNota,
        deleteTareaNota: handleDeleteTareaNota,
        addTareaImagen: handleAddTareaImagen,
        deleteTareaImagen: handleDeleteTareaImagen,
        generarPdfTarea: handleGenerarPdfTarea,
        toggleNotificado: handleToggleNotificado
    };
};
