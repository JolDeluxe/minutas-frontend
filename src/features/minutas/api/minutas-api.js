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
