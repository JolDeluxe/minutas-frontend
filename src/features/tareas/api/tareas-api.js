import api from '@/lib/axios';
import { compressImage } from '@/utils/image-compression';

// ── Listado y detalle ──────────────────────────────────────────────────────

export const getTareas = async (params = {}) => {
    return await api.get('/api/tareas', { params });
};

export const getTareaById = async (id) => {
    return await api.get(`/api/tareas/${id}`);
};

// ── Mutaciones ─────────────────────────────────────────────────────────────

export const createTarea = async (data) => {
    const hasImages = data.tareas?.some(t => (t._localImages?.length > 0));

    // Sin imágenes → JSON normal
    if (!hasImages) {
        const clean = {
            tareas: data.tareas.map(({ _localImages, ...rest }) => rest)
        };
        return await api.post('/api/tareas', clean);
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

    let totalArchivos = 0;

    // Procesar imágenes con compresión asíncrona
    await Promise.all(data.tareas.map(async (tarea, tIdx) => {
        if (!tarea._localImages || tarea._localImages.length === 0) return;

        await Promise.all(tarea._localImages.map(async (img, iIdx) => {
            const file = img.file;

            if (file instanceof File || file instanceof Blob) {
                try {
                    const compressedBlob = await compressImage(file);
                    // Nomenclatura simplificada y robusta
                    const fieldName = `files_${tIdx}_${iIdx}`;
                    const fileName = file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : `image_${tIdx}_${iIdx}.jpg`;
                    
                    formData.append(fieldName, compressedBlob, fileName);
                    totalArchivos++;
                } catch (err) {
                    console.error(`[createTarea] Error comprimiendo imagen ${tIdx}_${iIdx}:`, err);
                    // Fallback: si la compresión falla, enviar el original
                    const fieldName = `files_${tIdx}_${iIdx}`;
                    formData.append(fieldName, file, file.name);
                    totalArchivos++;
                }
            } else {
                console.warn(`[createTarea] Tarea ${tIdx}, img ${iIdx}: No es un objeto File/Blob válido`, img);
            }
        }));
    }));

    console.log(`[createTarea] Enviando batch de ${data.tareas.length} tareas con ${totalArchivos} imágenes.`);

    // IMPORTANTE: Al enviar FormData, NO debemos poner Content-Type manualmente
    // o Axios pondrá uno sin el boundary necesario. 
    // Usar 'multipart/form-data' o simplemente dejar que Axios lo detecte.
    return await api.post('/api/tareas', formData, {
        headers: {
            'Content-Type': undefined,
        },
        timeout: 180000 // 3 min para subidas pesadas
    });
};

export const updateTarea = async (id, data) => {
    return await api.put(`/api/tareas/${id}`, data);
};

export const changeTareaStatus = async (id, data) => {
    return await api.patch(`/api/tareas/${id}/estado`, data);
};

export const deleteTarea = async (id) => {
    return await api.delete(`/api/tareas/${id}`);
};

export const createNotaGeneral = async (data) => {
    return await api.post('/api/tareas/notas/general', data);
};

export const createTareaNota = async (data) => {
    return await api.post('/api/tareas/notas/tarea', data);
};

export const updateTareaNota = async (id, data) => {
    return await api.put(`/api/tareas/notas/tarea/${id}`, data);
};

export const deleteTareaNota = async (id) => {
    return await api.delete(`/api/tareas/notas/tarea/${id}`);
};

export const generarPdfTarea = async (id) => {
    return await api.get(`/api/tareas/${id}/pdf`);
};

// ── Imágenes ─────────────────────────────────────────────────────────────

export const addTareaImagen = async (tareaId, file, tipo = 'CAPTURA') => {
    const formData = new FormData();
    try {
        const compressed = await compressImage(file);
        formData.append('imagen', compressed, file.name ? file.name.replace(/\.[^/.]+$/, "") + ".jpg" : "image.jpg");
    } catch (e) {
        formData.append('imagen', file);
    }
    formData.append('tipo', tipo);
    return await api.post(`/api/tareas/${tareaId}/imagenes`, formData, {
        headers: { 'Content-Type': undefined }
    });
};

export const deleteTareaImagen = async (tareaId, imagenId) => {
    return await api.delete(`/api/tareas/${tareaId}/imagenes/${imagenId}`);
};
