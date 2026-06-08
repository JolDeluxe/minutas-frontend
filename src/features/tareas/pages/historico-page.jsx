// src/features/tareas/pages/historico-page.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useAuthStore } from '@/stores/auth-store';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { useTareas } from '../hooks/use-tareas';
import { HistoricoDesktop } from '../views/historico-desktop';
import { HistoricoMobile } from '../views/historico-mobile';
import { PanelDetalleTarea } from '../components/comun/panel-detalle-tarea';
import { ModalRevisionTarea } from '../components/comun/modal-revision-tarea';
import { useTareasStore } from '../store/tareas-store';

const LIMIT = 20;

export default function HistoricoPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    
    const {
        tareas,
        meta,
        loading,
        submitting,
        fetchTareas,
        updateTarea,
        changeStatus,
        deleteTarea,
    } = useTareas();
    const { users, fetchUsers } = useUsers();

    const currentUser = user?.data || user;
    const { departamento, viewMode, setViewMode } = useTareasStore();
    const activeDept = currentUser?.rol === 'ADMIN' ? departamento : (currentUser?.departamento || 'DISENO');

    const [filters, setFilters] = useState({
        search: '',
        status: 'TODOS',
        prioridad: '',
        responsable: '',
        area: '',
        linea: '',
        startDate: '',
        endDate: '',
    });
    
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [revisionTarget, setRevisionTarget] = useState(null);

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(0); // 0 = Todos

    const loadTareas = useCallback(() => {
        const params = { 
            page, 
            limit: LIMIT,
            sort: JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]),
            tipo: 'TAREA',
            todo: true
        };

        if (filters.search) params.q = filters.search;
        if (filters.status !== 'TODOS') params.estado = filters.status;
        else params.estado = 'PENDIENTE,EN_REVISION,CERRADA';
        if (filters.prioridad) params.prioridad = filters.prioridad;
        if (filters.responsable) params.responsableId = filters.responsable;
        if (filters.area) params.area = filters.area;
        if (filters.linea) params.linea = filters.linea;
        if (activeDept) params.departamento = activeDept;
        
        if (year) params.year = year;
        if (month > 0) params.month = month;

        fetchTareas(params).catch(() => notify.error('Error al cargar el histórico.'));
    }, [page, filters, sortConfig, year, month, fetchTareas, activeDept]);

    useEffect(() => { loadTareas(); }, [loadTareas]);

    useEffect(() => {
        const params = {
            estado: 'ACTIVO',
            limit: 100,
            sort: JSON.stringify([{ nombre: 'asc' }]),
        };

        if (activeDept) params.departamento = activeDept;

        fetchUsers(params).catch(() => notify.error('Error al cargar responsables.'));
    }, [activeDept, fetchUsers]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        if (newFilters.page === undefined) setPage(1);
        else setPage(newFilters.page);
    };

    const handleSortChange = useCallback((key, direction) => {
        setSortConfig({ key, direction });
        setPage(1);
    }, []);

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

    const handleViewDetail = (tarea) => {
        setSelectedTarea(tarea);
        setIsDrawerOpen(true);
    };

    const handleDirectStatusChange = async (tareaId, nuevoEstado, silent = false) => {
        if (!tareaId) return;
        try {
            await changeStatus(tareaId, { estado: nuevoEstado });
            if (!silent) {
                notify.success('Estado actualizado.');
            }
            if (isDrawerOpen && selectedTarea?.id === tareaId) {
                setIsDrawerOpen(false);
            }
            loadTareas();
        } catch {
            notify.error('Error al actualizar estado.');
        }
    };

    const handleDeleteTarea = async (tareaId, all = false) => {
        if (!tareaId) return;
        try {
            const res = await deleteTarea(tareaId, all);
            if (res && res.hermanasAfectadas > 0) {
                notify.success(`¡(${res.hermanasAfectadas + 1}) tareas descartadas del grupo!`);
            } else {
                notify.success('Tarea eliminada correctamente.');
            }
            if (isDrawerOpen && selectedTarea?.id === tareaId) {
                setIsDrawerOpen(false);
            }
            loadTareas();
        } catch {
            notify.error('Error al eliminar la tarea.');
        }
    };

    const handleRefresh = useCallback(() => {
        loadTareas();
    }, [loadTareas]);

    const tareasSorted = useMemo(() => {
        if (sortConfig && (sortConfig.key !== 'createdAt' || sortConfig.direction !== 'desc')) {
            return tareas;
        }
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
    }, [tareas, sortConfig]);

    const totalResumenHistorico = useMemo(() => {
        return ['PENDIENTE', 'EN_REVISION', 'CERRADA']
            .reduce((total, estado) => total + (meta.counts?.[estado] ?? 0), 0);
    }, [meta.counts]);

    const sharedProps = {
        tareas: tareasSorted,
        loading,
        currentUser: currentUser,
        totalParaPaginador: meta.totalParaPaginador,
        totalParaSummary: totalResumenHistorico,
        conteos: meta.counts,
        totalAtrasadasGlobal: meta.totalAtrasadas,
        users,
        query: filters.search,
        onSearchChange: (q) => handleFilterChange({ search: q }),
        filtroPrioridad: filters.prioridad,
        onPrioridadChange: (p) => handleFilterChange({ prioridad: p }),
        filtroResponsable: filters.responsable,
        onResponsableChange: (r) => handleFilterChange({ responsable: r }),
        filtroLinea: filters.linea,
        onLineaChange: (l) => handleFilterChange({ linea: l }),
        onFilterChange: handleFilterChange,
        onPageChange: (p) => setPage(p),
        onRefresh: handleRefresh,
        onChangeStatus: handleDirectStatusChange,
        onViewDetail: handleViewDetail,
        page,
        totalPages: meta.totalPages,
        // Fechas
        showDates: true,
        year,
        month,
        onYearChange: setYear,
        onMonthChange: setMonth,
        existenciaGlobal: meta.existenciaGlobal || {},
        onDelete: handleDeleteTarea,
        onReview: setRevisionTarget,
        viewMode,
        onViewChange: setViewMode,
        statusActual: filters.status,
        filtroDepartamento: activeDept,
        sortConfig,
        onSortChange: handleSortChange,
    };

    return (
        <div className="w-full">
            {isDesktop
                ? <HistoricoDesktop {...sharedProps} />
                : <HistoricoMobile  {...sharedProps} />
            }

            <PanelDetalleTarea 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                tarea={selectedTarea}
                onChangeStatus={handleDirectStatusChange}
                onUpdate={handleUpdateTarea}
                onDelete={handleDeleteTarea}
                submitting={submitting}
                currentUser={currentUser}
                users={users}
            />

            <ModalRevisionTarea
                isOpen={Boolean(revisionTarget)}
                onClose={() => setRevisionTarget(null)}
                tarea={revisionTarget}
                onConfirm={async () => {
                    if (revisionTarget) {
                        await handleDirectStatusChange(revisionTarget.id, 'CERRADA');
                        setRevisionTarget(null);
                    }
                }}
                submitting={submitting}
            />
        </div>
    );
}
