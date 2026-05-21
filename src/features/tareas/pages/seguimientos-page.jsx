// src/features/tareas/pages/seguimientos-page.jsx
import { useState, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useTareas } from '../hooks/use-tareas';
import { SeguimientosDesktop } from '../views/seguimientos-desktop';
import { SeguimientosMobile } from '../views/seguimientos-mobile';
import { TareaDetailDrawer } from '../components/common/tarea-detail-drawer';

const LIMIT = 20;

export default function SeguimientosPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuth();
    
    const {
        tareas,
        meta,
        loading,
        submitting,
        fetchTareas,
        updateTarea,
    } = useTareas();

    const [filters, setFilters] = useState({
        search: '',
        status: 'TODOS',
        prioridad: '',
        area: '',
        linea: '',
    });
    
    const [page, setPage] = useState(1);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const loadTareas = useCallback(() => {
        const params = { 
            page, 
            limit: LIMIT,
            sort: JSON.stringify([{ createdAt: 'desc' }]),
            tipo: 'RECORDATORIO'
        };

        if (filters.search) params.q = filters.search;
        if (filters.status !== 'TODOS') params.estado = filters.status;
        if (filters.prioridad) params.prioridad = filters.prioridad;
        if (filters.area) params.area = filters.area;
        if (filters.linea) params.linea = filters.linea;

        fetchTareas(params).catch(() => notify.error('Error al cargar seguimientos.'));
    }, [page, filters, fetchTareas]);

    useEffect(() => { loadTareas(); }, [loadTareas]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        if (newFilters.page === undefined) setPage(1);
        else setPage(newFilters.page);
    };

    const handleViewDetail = (tarea) => {
        setSelectedTarea(tarea);
        setIsDrawerOpen(true);
    };

    const handleUpdateTarea = async (id, payload) => {
        try {
            await updateTarea(id, payload);
            notify.success('Entrada actualizada correctamente.');
            setIsDrawerOpen(false);
            loadTareas();
        } catch {
            notify.error('Error al actualizar.');
        }
    };

    const handleRefresh = useCallback(() => {
        loadTareas();
    }, [loadTareas]);

    const sharedProps = {
        tareas,
        loading,
        currentUser: user,
        totalParaPaginador: meta.totalParaPaginador,
        totalParaSummary: meta.totalFiltrado,
        conteos: meta.counts,
        totalAtrasadasGlobal: meta.totalAtrasadas,
        query: filters.search,
        onSearchChange: (q) => handleFilterChange({ search: q }),
        filtroPrioridad: filters.prioridad,
        onPrioridadChange: (p) => handleFilterChange({ prioridad: p }),
        filtroResponsable: filters.responsable,
        onResponsableChange: (r) => handleFilterChange({ responsable: r }),
        mostrarAtrasadas: filters.mostrarAtrasadas,
        onToggleAtrasadas: () => handleFilterChange({ mostrarAtrasadas: !filters.mostrarAtrasadas }),
        onFilterChange: handleFilterChange,
        onPageChange: (p) => setPage(p),
        onRefresh: handleRefresh,
        onChangeStatus: handleViewDetail,
        page,
        totalPages: meta.totalPages,
    };

    return (
        <div className="w-full">
            {isDesktop
                ? <SeguimientosDesktop {...sharedProps} />
                : <SeguimientosMobile  {...sharedProps} />
            }

            <TareaDetailDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                tarea={selectedTarea}
                onUpdate={handleUpdateTarea}
                submitting={submitting}
            />
        </div>
    );
}
