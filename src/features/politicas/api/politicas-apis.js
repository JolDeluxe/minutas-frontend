import axios from '@/lib/axios';

/**
 * Obtener listado de políticas.
 */
export const getPoliticas = async (params = {}) => {
  const response = await axios.get('/api/tareas', {
    params: {
      sort: JSON.stringify([{ createdAt: 'desc' }]),
      ...params,
      tipo: 'POLITICA',
      todo: true,
    },
  });
  
  // Dependiendo de cómo esté configurado el interceptor global en axios.js:
  // Si interceptor devuelve response.data -> `response` es { status: "success", data: { tareas: [] } }
  // Extraemos la propiedad data interna:
  return response?.data || response;
};

/**
 * Crear una nueva política.
 */
export const createPolitica = async (formData) => {
  if (formData instanceof FormData) {
    formData.append('tareas[0][tipo]', 'POLITICA');
    formData.append('tareas[0][clasificacion]', 'POLITICAS');
    if (!formData.has('tareas[0][area]')) {
      formData.append('tareas[0][area]', 'DISENO');
    }
    const resp = await axios.post('/api/tareas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  } else {
    const payload = {
      tareas: [{
        ...formData,
        tipo: 'POLITICA',
        clasificacion: 'POLITICAS',
        area: formData.area || 'DISENO',
      }]
    };
    const resp = await axios.post('/api/tareas', payload);
    return resp.data;
  }
};

/**
 * Actualizar una política.
 */
export const updatePolitica = async (id, data) => {
  const resp = await axios.put(`/api/tareas/${id}`, data);
  return resp.data;
};

/**
 * Eliminar una política.
 */
export const deletePolitica = async (id) => {
  const resp = await axios.delete(`/api/tareas/${id}`);
  return resp.data;
};
