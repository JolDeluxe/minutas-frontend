import api from '@/lib/axios';
import { compressImage } from '@/utils/image-compression';

// ── Listado y detalle ──────────────────────────────────────────────────────

export const getTareasGenerales = async (params = {}) => {
    return await api.get('/api/tareas-generales', { params: { ...params, onlyGeneral: true } });
};

export const getTareaGeneralById = async (id) => {
    return await api.get(`/api/tareas-generales/${id}`);
};

// ── Mutaciones ─────────────────────────────────────────────────────────────

export const createTareaGeneral = async (data) => {
    const hasImages = data.tareas?.some(t => (t._localImages?.length > 0));

    // Sin imágenes → JSON normal
    if (!hasImages) {
        const clean = {
            tareas: data.tareas.map(({ _localImages, ...rest }) => rest)
        };
        return await api.post('/api/tareas-generales', clean);
    }

    // Con imágenes → FormData
    const formData = new FormData();
    const tareasClean = [];

    data.tareas.forEach((t) => {
        const { _localImages, ...rest } = t;
        tareasClean.push(rest);
    });

    formData.append('tareas', JSON.stringify(tareasClean));

    let totalArchivos = 0;

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
                    totalArchivos++;
                } catch (err) {
                    const fieldName = `files_${tIdx}_${iIdx}`;
                    formData.append(fieldName, file, file.name);
                    totalArchivos++;
                }
            }
        }));
    }));

    console.log(`[createTareaGeneral] Enviando ${data.tareas.length} tareas con ${totalArchivos} imágenes.`);

    return await api.post('/api/tareas-generales', formData, {
        headers: { 'Content-Type': undefined },
        timeout: 180000
    });
};

export const updateTareaGeneral = async (id, data) => {
    return await api.put(`/api/tareas-generales/${id}`, data);
};

export const changeTareaGeneralStatus = async (id, data) => {
    return await api.patch(`/api/tareas-generales/${id}/estado`, data);
};

export const deleteTareaGeneral = async (id) => {
    return await api.delete(`/api/tareas-generales/${id}`);
};

export const createTareaGeneralNota = async (data) => {
    return await api.post('/api/tareas-generales/notas/tarea', data);
};

export const updateTareaGeneralNota = async (id, data) => {
    return await api.put(`/api/tareas-generales/notas/tarea/${id}`, data);
};

export const deleteTareaGeneralNota = async (id) => {
    return await api.delete(`/api/tareas-generales/notas/tarea/${id}`);
};

export const addTareaGeneralImagen = async (tareaId, file) => {
    const formData = new FormData();
    try {
        const compressed = await compressImage(file);
        const isCompressed = compressed !== file && compressed.type === 'image/jpeg';
        const fileName = isCompressed
            ? (file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : "image.jpg")
            : (file.name || "image");
        formData.append('imagen', compressed, fileName);
    } catch {
        formData.append('imagen', file, file.name);
    }
    return await api.post(`/api/tareas-generales/${tareaId}/imagenes`, formData, {
        headers: { 'Content-Type': undefined }
    });
};

export const deleteTareaGeneralImagen = async (tareaId, imagenId) => {
    return await api.delete(`/api/tareas-generales/${tareaId}/imagenes/${imagenId}`);
};
