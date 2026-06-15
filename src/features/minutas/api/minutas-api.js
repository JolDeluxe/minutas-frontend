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

// ── Resumen de Minuta ──────────────────────────────────────────────────
export const guardarResumenMinuta = async (id, data) => {
  return await api.put(`/api/minutas/${id}/resumen`, data);
};

// ── Minutas Externas ───────────────────────────────────────────────────
export const getMinutasExternas = async (params = {}) => {
  return await api.get('/api/minutas-externas', { params });
};

export const createMinutaExterna = async (data) => {
  return await api.post('/api/minutas-externas', data);
};

export const updateMinutaExterna = async (id, data) => {
  return await api.put(`/api/minutas-externas/${id}`, data);
};

export const deleteMinutaExterna = async (id) => {
  return await api.delete(`/api/minutas-externas/${id}`);
};

export const cerrarMinutaExterna = async (id) => {
  return await api.patch(`/api/minutas-externas/${id}/cerrar`);
};

export const getMinutaExternaById = async (id) => {
  return await api.get(`/api/minutas-externas/${id}`);
};

import { compressImage } from '@/utils/image-compression';

// ── Tareas Externas ───────────────────────────────────────────────────
export const createTareasExternas = async (minutaId, data) => {
  const hasImages = data.tareas?.some(t => (t._localImages?.length > 0));

  // Sin imágenes → JSON normal
  if (!hasImages) {
    const clean = {
      tareas: data.tareas.map(({ _localImages, ...rest }) => rest)
    };
    return await api.post(`/api/minutas-externas/${minutaId}/tareas`, clean);
  }

  // Con imágenes → FormData
  const formData = new FormData();
  const tareasClean = [];

  data.tareas.forEach((t) => {
    // eslint-disable-next-line no-unused-vars
    const { _localImages, ...rest } = t;
    tareasClean.push(rest);
  });

  formData.append('tareas', JSON.stringify(tareasClean));

  // Procesar imágenes con compresión asíncrona
  await Promise.all(data.tareas.map(async (tarea, tIdx) => {
    if (!tarea._localImages || tarea._localImages.length === 0) return;

    await Promise.all(tarea._localImages.map(async (img, iIdx) => {
      const file = img.file;

      if (file instanceof File || file instanceof Blob) {
        try {
          const compressedBlob = await compressImage(file);
          const fieldName = `files_${tIdx}_${iIdx}`;
          const isCompressed = compressedBlob !== file && compressedBlob.type === 'image/jpeg';
          const fileName = isCompressed
            ? (file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : `image_${tIdx}_${iIdx}.jpg`)
            : (file.name || `image_${tIdx}_${iIdx}`);
          
          formData.append(fieldName, compressedBlob, fileName);
        } catch (err) {
          console.error(`[createTareasExternas] Error comprimiendo:`, err);
          const fieldName = `files_${tIdx}_${iIdx}`;
          formData.append(fieldName, file, file.name);
        }
      }
    }));
  }));

  return await api.post(`/api/minutas-externas/${minutaId}/tareas`, formData, {
    headers: {
      'Content-Type': undefined,
    },
    timeout: 180000
  });
};

export const updateTareaExterna = async (id, data) => {
  return await api.put(`/api/minutas-externas/tareas/${id}`, data);
};

export const deleteTareaExterna = async (id) => {
  return await api.delete(`/api/minutas-externas/tareas/${id}`);
};

export const toggleNotificadoExterna = async (id) => {
  return await api.patch(`/api/minutas-externas/tareas/${id}/notificado`);
};

// ── Notas de Tareas Externas ───────────────────────────────────────────
export const createTareaExternaNota = async (data) => {
  return await api.post('/api/minutas-externas/notas/tarea', data);
};

export const updateTareaExternaNota = async (id, data) => {
  return await api.put(`/api/minutas-externas/notas/tarea/${id}`, data);
};

export const deleteTareaExternaNota = async (id) => {
  return await api.delete(`/api/minutas-externas/notas/tarea/${id}`);
};

export const generarPdfMinutaExterna = async (id) => {
  return await api.get(`/api/minutas-externas/${id}/pdf`);
};

