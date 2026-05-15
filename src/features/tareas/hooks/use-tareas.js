import { useState, useCallback, useEffect, useRef } from 'react';
import {
    getTareas,
    createTarea,
    updateTarea,
    changeTareaStatus,
    deleteTarea,
    createNotaGeneral,
    createTareaNota,
    updateTareaNota,
    deleteTareaNota,
    addTareaImagen,
    deleteTareaImagen
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
    
    const handleDelete = useCallback(async (id) => {
        setSubmitting(true);
        try { 
            const res = await deleteTarea(id);
            return res.data;
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

    const handleAddTareaImagen = useCallback(async (tareaId, file) => {
        setSubmitting(true);
        try {
            const res = await addTareaImagen(tareaId, file);
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
        changeStatus: handleChangeStatus,
        deleteTarea: handleDelete,
        createNotaGeneral: handleCreateNotaGeneral,
        createTareaNota: handleCreateTareaNota,
        updateTareaNota: handleUpdateTareaNota,
        deleteTareaNota: handleDeleteTareaNota,
        addTareaImagen: handleAddTareaImagen,
        deleteTareaImagen: handleDeleteTareaImagen
    };
};