import { useState, useCallback } from 'react';
import {
    getTareasGenerales,
    createTareaGeneral,
    updateTareaGeneral,
    changeTareaGeneralStatus,
    deleteTareaGeneral,
    createTareaGeneralNota,
    updateTareaGeneralNota,
    deleteTareaGeneralNota,
    addTareaGeneralImagen,
    deleteTareaGeneralImagen,
} from '../api/tareas-generales-api';

export const useTareasGenerales = () => {
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [meta, setMeta] = useState({
        totalFiltrado: 0,
        total: 0,
        totalPages: 1,
        counts: {},
        totalAtrasadas: 0,
        totalNotificados: 0,
        totalSinNotificar: 0,
    });

    const fetchTareas = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await getTareasGenerales(params);
            const payloadData = response?.data || {};
            const list = payloadData.tareas || [];
            setTareas(Array.isArray(list) ? list : []);
            setMeta({
                totalFiltrado: payloadData.totalFiltrado ?? payloadData.total ?? 0,
                total: payloadData.total ?? 0,
                totalPages: payloadData.totalPages ?? 1,
                counts: payloadData.counts || {},
                totalAtrasadas: payloadData.totalAtrasadas ?? 0,
                totalNotificados: payloadData.totalNotificados ?? 0,
                totalSinNotificar: payloadData.totalSinNotificar ?? 0,
            });
        } catch (error) {
            console.error('Error fetching tareas generales:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreate = useCallback(async (data) => {
        setSubmitting(true);
        try {
            const res = await createTareaGeneral(data);
            return res.data;
        } catch (err) {
            console.error('Error al crear tarea general:', err.response?.data || err.message);
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleUpdate = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            const res = await updateTareaGeneral(id, data);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleChangeStatus = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            const res = await changeTareaGeneralStatus(id, data);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        setSubmitting(true);
        try {
            const res = await deleteTareaGeneral(id);
            return res.data;
        } catch (err) {
            console.error('Error al eliminar tarea general:', err.response?.data || err.message);
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleCreateNota = useCallback(async (data) => {
        setSubmitting(true);
        try {
            const res = await createTareaGeneralNota(data);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleUpdateNota = useCallback(async (id, data) => {
        setSubmitting(true);
        try {
            const res = await updateTareaGeneralNota(id, data);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleDeleteNota = useCallback(async (id) => {
        setSubmitting(true);
        try {
            const res = await deleteTareaGeneralNota(id);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleAddImagen = useCallback(async (tareaId, file) => {
        setSubmitting(true);
        try {
            const res = await addTareaGeneralImagen(tareaId, file);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const handleDeleteImagen = useCallback(async (tareaId, imagenId) => {
        setSubmitting(true);
        try {
            const res = await deleteTareaGeneralImagen(tareaId, imagenId);
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, []);

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
        createNota: handleCreateNota,
        updateNota: handleUpdateNota,
        deleteNota: handleDeleteNota,
        addImagen: handleAddImagen,
        deleteImagen: handleDeleteImagen,
    };
};
