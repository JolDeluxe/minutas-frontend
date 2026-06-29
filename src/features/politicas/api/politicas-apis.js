import axios from '@/lib/axios';

/**
 * Obtener listado de políticas.
 * Los filtros `area` y `linea` (si están en `params`) se pasan como query
 * params. Axios omite automáticamente los valores `undefined`, por lo que
 * los filtros no activos no contaminan la query string.
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

  // Si el interceptor global devuelve response.data, `response` ya es
  // { status: "success", data: { tareas: [] } }. Normalizamos aquí.
  return response?.data || response;
};

/**
 * Crear una nueva política.
 *
 * CONTRATO DEL CALLER (politica-form-modal.jsx):
 *   - FormData: debe haber appendado tareas[0][area] y tareas[0][linea]
 *     antes de llamar. Si el usuario no seleccionó área, NO se appende —
 *     el backend usa el default del schema (DISENO).
 *   - JSON: pasar { descripcion, area, linea } donde area/linea pueden
 *     ser null (= sin área específica / General).
 *
 * CAMBIO vs versión anterior:
 *   ❌ ELIMINADO: fallback `area: formData.area || 'DISENO'`
 *   ❌ ELIMINADO: inyección automática `append('tareas[0][area]', 'DISENO')`
 */
export const createPolitica = async (formData) => {
  if (formData instanceof FormData) {
    // Stamps obligatorios: tipo y clasificacion.
    // area y linea los appenda el caller (politica-form-modal) si el usuario los seleccionó.
    formData.append('tareas[0][tipo]',          'POLITICA');
    formData.append('tareas[0][clasificacion]',  'POLITICAS');

    const resp = await axios.post('/api/tareas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  }

  // Rama JSON — area y linea llegan desde el form state del modal.
  // null es válido ("sin área específica / General").
  const payload = {
    tareas: [{
      ...formData,
      tipo:          'POLITICA',
      clasificacion: 'POLITICAS',
      area:          formData.area  ?? null,
      linea:         formData.linea ?? null,
    }],
  };

  const resp = await axios.post('/api/tareas', payload);
  return resp.data;
};

/**
 * Actualizar una política existente.
 * El caller (politicas-page.jsx > handleSave) construye el payload con
 * descripcion, area y linea. Esta función solo hace el PUT.
 */
export const updatePolitica = async (id, data) => {
  const resp = await axios.put(`/api/tareas/${id}`, data);
  return resp.data;
};

/**
 * Eliminar (descartar) una política.
 */
export const deletePolitica = async (id) => {
  const resp = await axios.delete(`/api/tareas/${id}`);
  return resp.data;
};
