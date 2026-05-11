import { useState, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';

import { useTareas } from '../hooks/use-tareas';
import { TareasDesktop } from '../views/tareas-desktop';
import { TareasMobile } from '../views/tareas-mobile';

import { TareaOrganizeModal } from '../components/tarea-organize-modal';
// En un caso real también habría un TareaDetailModal o redirección

const LIMIT = 20;

export default function TareasPages() {
    const isDesktop = useIsDesktop();

    const {
        tareas,
        meta,
        loading,
        submitting,
        fetchTareas,
        updateTarea,
        changeStatus,
    } = useTareas();

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    
    const [showOrganize, setShowOrganize] = useState(false);
    const [tareaToOrganize, setTareaToOrganize] = useState(null);

    const loadTareas = useCallback(() => {
        const params = { page, limit: LIMIT };
        if (query) params.q = query;
        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        return fetchTareas(params).catch(() => notify.error('Error al cargar tareas.'));
    }, [page, query, sortConfig, fetchTareas]);

    useEffect(() => { loadTareas(); }, [loadTareas]);

    const handleSearchChange = useCallback((q) => { setQuery(q); setPage(1); }, []);
    const handleSortChange = useCallback((key, direction) => { setSortConfig({ key, direction }); setPage(1); }, []);

    const handleSaveOrganize = async (tareaId, payload, newStatus) => {
        await updateTarea(tareaId, payload);
        if (newStatus) {
            await changeStatus(tareaId, { estado: newStatus });
        }
        notify.success('Entrada organizada correctamente.');
        setShowOrganize(false);
        setTareaToOrganize(null);
        await loadTareas();
    };

    const handleViewDetail = (tarea) => {
        // Redirigir o abrir un modal de detalle de tarea
        notify.info("Detalle de la entrada: " + tarea.descripcion);
    };

    const handleEdit = (tarea) => {
        // Redirigir o abrir modal de edición
        notify.info("Editando entrada: " + tarea.descripcion);
    };

    const sharedProps = {
        tareas,
        loading,
        page,
        limit: LIMIT,
        totalPages: meta.totalPages,
        totalItems: meta.totalFiltrado,
        sortConfig,
        query,
        onPageChange: setPage,
        onSortChange: handleSortChange,
        onSearchChange: handleSearchChange,
        onViewDetail: handleViewDetail,
        onEdit: handleEdit,
        onOrganize: (t) => { setTareaToOrganize(t); setShowOrganize(true); },
    };

    return (
        <div className="max-w-full mx-auto w-full">
            <div className="p-2 lg:p-4">
                {isDesktop
                    ? <TareasDesktop {...sharedProps} />
                    : <TareasMobile  {...sharedProps} />
                }
            </div>

            <TareaOrganizeModal
                isOpen={showOrganize}
                onClose={() => { setShowOrganize(false); setTareaToOrganize(null); }}
                tareaAOrganizar={tareaToOrganize}
                submitting={submitting}
                onSuccess={handleSaveOrganize}
            />
        </div>
    );
}