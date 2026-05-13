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
    const hasImages = data.tareas?.some(t => t._localImagenes?.length > 0);

    if (!hasImages) {
        return await api.post('/api/tareas', data);
    }

    const formData = new FormData();
    const tareasClean = [];

    // Primero preparamos el JSON limpio
    data.tareas.forEach((t, index) => {
        const { _localImagenes, ...rest } = t;
        tareasClean.push(rest);
    });

    // Añadimos el JSON al principio (algunos backends lo prefieren así)
    formData.append('tareas', JSON.stringify(tareasClean));

    // Luego añadimos los archivos
    data.tareas.forEach((t, index) => {
        if (t._localImagenes?.length > 0) {
            console.log(`[API] Procesando ${t._localImagenes.length} imágenes para tarea #${index}`);
            t._localImagenes.forEach((img, i) => {
                // Verificación más flexible (File o Blob)
                const fileToUpload = img.file;
                if (fileToUpload && (fileToUpload.size > 0)) {
                    formData.append(`imagen_tarea_${index}_${i}`, fileToUpload, fileToUpload.name || `imagen_${index}_${i}.jpg`);
                    console.log(`  - Ready: imagen_tarea_${index}_${i}`);
                } else {
                    console.warn(`  - [!] Archivo inválido o vacío en índice ${i}.`);
                }
            });
        }
    });

    return await api.post('/api/tareas', formData);
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