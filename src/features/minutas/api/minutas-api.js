import api from '@/lib/axios';

export const getMinutas = async (params = {}) => {
  return await api.get('/api/minutas', { params });
};

export const getMinutaById = async (id) => {
  return await api.get(`/api/minutas/${id}`);
};

export const createMinuta = async (data) => {
  return await api.post('/api/minutas', data);
};

export const updateMinuta = async (id, data) => {
  return await api.put(`/api/minutas/${id}`, data);
};

export const changeMinutaStatus = async (id, estado) => {
  return await api.patch(`/api/minutas/${id}/status`, { estado });
};

export const iniciarMinuta = async (id) => {
  return await api.post(`/api/minutas/${id}/iniciar`);
};

export const cancelarMinuta = async (id) => {
  return await api.post(`/api/minutas/${id}/cancelar`);
};

export const cerrarMinuta = async (id) => {
  return await api.patch(`/api/minutas/${id}/cerrar`);
};

export const reabrirMinuta = async (id) => {
  return await api.patch(`/api/minutas/${id}/reabrir`);
};

export const finalizarMinuta = async (id) => {
  return await api.post(`/api/minutas/${id}/finalizar`);
};

export const deleteMinuta = async (id) => {
  return await api.delete(`/api/minutas/${id}`);
};

export const generarPdfPorArea = async (id, area) => {
  return await api.get(`/api/minutas/${id}/pdf-area/${area}`);
};

