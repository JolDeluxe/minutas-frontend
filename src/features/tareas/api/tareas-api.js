import api from '@/lib/axios';

// ── Listado y detalle ──────────────────────────────────────────────────────

export const getTareas = async (params = {}) => {
    return await api.get('/api/tareas', { params });
};

export const getTareaById = async (id) => {
    return await api.get(`/api/tareas/${id}`);
};

// ── Mutaciones ─────────────────────────────────────────────────────────────

export const createTarea = async (data) => {
    // data debe tener { tareas: [...] } según el backend
    return await api.post('/api/tareas', data);
};

export const updateTarea = async (id, data) => {
    return await api.put(`/api/tareas/${id}`, data);
};

export const changeTareaStatus = async (id, data) => {
    // data debe ser { estado: 'NUEVO_ESTADO' }
    return await api.patch(`/api/tareas/${id}/estado`, data);
};

export const deleteTarea = async (id) => {
    return await api.delete(`/api/tareas/${id}`);
};

// ── Notas ─────────────────────────────────────────────────────────────

export const createNotaGeneral = async (data) => {
    // data: { contenido, minutaId }
    return await api.post('/api/tareas/notas/general', data);
};

export const createTareaNota = async (data) => {
    // data: { contenido, tareaId }
    return await api.post('/api/tareas/notas/tarea', data);
};