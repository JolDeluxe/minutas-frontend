// src/features/tareas/pages/historico-page.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useTareas } from '../hooks/use-tareas';
import { HistoricoDesktop } from '../views/historico-desktop';
import { HistoricoMobile } from '../views/historico-mobile';
import { TareaDetailDrawer } from '../components/common/tarea-detail-drawer';
import { useTareasStore } from '../store/tareas-store';

const LIMIT = 20;

export default function HistoricoPage() {
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

    const currentUser = user?.data || user;
    const { departamento } = useTareasStore();
    const activeDept = currentUser?.rol === 'ADMIN' ? departamento : (currentUser?.departamento || 'DISENO');

    const [filters, setFilters] = useState({
        search: '',
        status: 'TODOS',
        prioridad: '',
        area: '',
        linea: '',
        startDate: '',
        endDate: '',
    });
    
    const [page, setPage] = useState(1);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(0); // 0 = Todos

    const loadTareas = useCallback(() => {
        const params = { 
            page, 
            limit: LIMIT,
            sort: JSON.stringify([{ createdAt: 'desc' }]),
            todo: true
        };

        if (filters.search) params.q = filters.search;
        if (filters.status !== 'TODOS') params.estado = filters.status;
        else params.estado = 'PENDIENTE,EN_REVISION,CERRADA,CANCELADA';
        if (filters.prioridad) params.prioridad = filters.prioridad;
        if (filters.area) params.area = filters.area;
        if (filters.linea) params.linea = filters.linea;
        if (activeDept) params.departamento = activeDept;
        
        if (year) params.year = year;
        if (month > 0) params.month = month;

        fetchTareas(params).catch(() => notify.error('Error al cargar el histórico.'));
    }, [page, filters, year, month, fetchTareas, activeDept]);

    useEffect(() => { loadTareas(); }, [loadTareas]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        if (newFilters.page === undefined) setPage(1);
        else setPage(newFilters.page);
    };

    const handleUpdateTarea = async (id, payload) => {
        try {
            await updateTarea(id, payload);
            notify.success('Actualizado correctamente.');
            setIsDrawerOpen(false);
            loadTareas();
        } catch {
            notify.error('Error al actualizar.');
        }
    };

    const handleRefresh = useCallback(() => {
        loadTareas();
    }, [loadTareas]);

    const tareasSorted = useMemo(() => {
        return [...tareas].sort((a, b) => {
            // 1. PENDIENTE va antes que EN_REVISION (o cualquier otro estado)
            const estadoA = a.estado === 'PENDIENTE' ? 0 : a.estado === 'EN_REVISION' ? 1 : a.estado === 'CERRADA' ? 2 : 3;
            const estadoB = b.estado === 'PENDIENTE' ? 0 : b.estado === 'EN_REVISION' ? 1 : b.estado === 'CERRADA' ? 2 : 3;
            if (estadoA !== estadoB) return estadoA - estadoB;

            // 2. Atrasadas siempre primero (dentro del mismo estado)
            const aOverdue = a.isOverdue ? 0 : 1;
            const bOverdue = b.isOverdue ? 0 : 1;
            if (aOverdue !== bOverdue) return aOverdue - bOverdue;

            // 3. Por fecha de creación (más reciente primero)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [tareas]);

    const sharedProps = {
        tareas: tareasSorted,
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
        onChangeStatus: (tarea) => {
            setSelectedTarea(tarea);
            setIsDrawerOpen(true);
        },
        page,
        totalPages: meta.totalPages,
        // Fechas
        showDates: true,
        year,
        month,
        onYearChange: setYear,
        onMonthChange: setMonth,
        existenciaGlobal: meta.existenciaGlobal || {},
    };

    return (
        <div className="w-full">
            {isDesktop
                ? <HistoricoDesktop {...sharedProps} />
                : <HistoricoMobile  {...sharedProps} />
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
