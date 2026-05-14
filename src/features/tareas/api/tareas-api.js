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

    // Sin imágenes → JSON normal
    if (!hasImages) {
        // Limpiamos _localImagenes antes de enviar (aunque estén vacías)
        const clean = {
            tareas: data.tareas.map(({ _localImagenes, ...rest }) => rest)
        };
        return await api.post('/api/tareas', clean);
    }

    // Con imágenes → FormData
    const formData = new FormData();
    const tareasClean = [];

    data.tareas.forEach((t) => {
        const { _localImagenes, ...rest } = t;
        tareasClean.push(rest);
    });

    formData.append('tareas', JSON.stringify(tareasClean));

    let archivosAgregados = 0;

    data.tareas.forEach((t, index) => {
        if (!t._localImagenes?.length) return;

        t._localImagenes.forEach((img, i) => {
            const fileToUpload = img.file;

            if (!fileToUpload) {
                console.warn(`[createTarea] img ${index}_${i}: sin File object`);
                return;
            }
            if (fileToUpload.size === 0) {
                console.warn(`[createTarea] img ${index}_${i}: archivo vacío`);
                return;
            }

            const fieldName = `imagen_tarea_${index}_${i}`;
            const fileName = fileToUpload.name || `imagen_${index}_${i}.jpg`;
            formData.append(fieldName, fileToUpload, fileName);
            archivosAgregados++;
            console.log(`[createTarea] adjuntado: ${fieldName} (${fileToUpload.size}b, ${fileToUpload.type})`);
        });
    });

    console.log(`[createTarea] total archivos en FormData: ${archivosAgregados}`);

    // FIX: Content-Type = undefined para que el browser/axios
    // asigne multipart/form-data con el boundary correcto.
    // Si dejamos el default 'application/json', multer no parsea los archivos.
    return await api.post('/api/tareas', formData, {
        headers: {
            'Content-Type': undefined,
        },
        timeout: 120_000, // 2 min — uploads pueden tardar con imágenes grandes
    });
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