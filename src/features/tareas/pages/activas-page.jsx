// src/features/tareas/pages/activas-page.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useAuthStore } from '@/stores/auth-store';
import { useTareas } from '../hooks/use-tareas';
import { ActivasDesktop } from '../views/activas-desktop';
import { ActivasMobile } from '../views/activas-mobile';
import { PanelDetalleTarea } from '../components/comun/panel-detalle-tarea';
import { ModalRevisionTarea } from '../components/comun/modal-revision-tarea';
import { useTareasStore } from '../store/tareas-store';

const LIMIT = 20;

// Ordenar: atrasadas primero, luego por prioridad (CRITICA→ALTA→MEDIA→BAJA)
const PRIORIDAD_PESO = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };

export default function ActivasPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    // Consumir el departamento y viewMode global
    const { departamento, viewMode, setViewMode } = useTareasStore();
    const activeDept = currentUser?.rol === 'ADMIN' ? departamento : (currentUser?.departamento || 'DISENO');
    
    const {
        tareas,
        meta,
        loading,
        submitting,
        fetchTareas,
        changeStatus,
        deleteTarea,
    } = useTareas();

    const [filters, setFilters] = useState(() => ({
        search: '',
        status: 'TODOS',
        prioridad: '',
        linea: '',
        clasificacion: '',
        mostrarAtrasadas: false,
    }));
    
    const [page, setPage] = useState(1);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [revisionTarget, setRevisionTarget] = useState(null);

    const loadTareas = useCallback(() => {
        const params = { 
            page, 
            limit: LIMIT,
            sort: JSON.stringify([{ createdAt: 'desc' }]),
            tipo: 'TAREA',
        };

        if (filters.search) params.q = filters.search;
        if (filters.status !== 'TODOS') params.estado = filters.status;
        else params.estado = 'PENDIENTE,EN_REVISION';
        
        if (filters.prioridad) params.prioridad = filters.prioridad;
        if (filters.linea) params.linea = filters.linea;
        if (filters.clasificacion) params.clasificacion = filters.clasificacion;
        if (activeDept) params.departamento = activeDept;
        if (filters.mostrarAtrasadas) params.atrasadas = true;

        fetchTareas(params).catch(() => notify.error('Error al cargar tus tareas.'));
    }, [page, filters, fetchTareas, activeDept]);

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

    // Fix API Call: Extraer ID y pasar payload correcto
    const handleDirectStatusChange = async (tareaId, nuevoEstado) => {
        if (!tareaId) return;
        try {
            await changeStatus(tareaId, { estado: nuevoEstado });
            notify.success('Estado actualizado.');
            if (isDrawerOpen && selectedTarea?.id === tareaId) {
                setIsDrawerOpen(false);
            }
            loadTareas();
        } catch {
            notify.error('Error al actualizar estado.');
        }
    };

    const handleDeleteTarea = async (tareaId) => {
        if (!tareaId) return;
        try {
            await deleteTarea(tareaId);
            notify.success('Tarea eliminada correctamente.');
            if (isDrawerOpen && selectedTarea?.id === tareaId) {
                setIsDrawerOpen(false);
            }
            loadTareas();
        } catch {
            notify.error('Error al eliminar la tarea.');
        }
    };

    // Para actualizaciones genéricas desde el Drawer (ej. prioridad)
    const handleUpdateGeneric = async (id, payload, shouldClose = false) => {
        try {
            await changeStatus(id, payload);
            notify.success('Actualización exitosa.');
            if (shouldClose && isDrawerOpen && selectedTarea?.id === id) {
                setIsDrawerOpen(false);
            }
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
            const estadoA = a.estado === 'PENDIENTE' ? 0 : a.estado === 'EN_REVISION' ? 1 : 2;
            const estadoB = b.estado === 'PENDIENTE' ? 0 : b.estado === 'EN_REVISION' ? 1 : 2;
            if (estadoA !== estadoB) return estadoA - estadoB;

            // 2. Atrasadas siempre primero (dentro del mismo estado)
            const aOverdue = a.isOverdue ? 0 : 1;
            const bOverdue = b.isOverdue ? 0 : 1;
            if (aOverdue !== bOverdue) return aOverdue - bOverdue;

            // 3. Por prioridad (CRITICA > ALTA > MEDIA > BAJA > sin prioridad)
            const aPrio = PRIORIDAD_PESO[a.prioridad] ?? 4;
            const bPrio = PRIORIDAD_PESO[b.prioridad] ?? 4;
            if (aPrio !== bPrio) return aPrio - bPrio;

            // 4. Por fecha de creación (más reciente primero)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [tareas]);

    const sharedProps = {
        tareas: tareasSorted,
        loading,
        currentUser: currentUser,
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
        onRefresh: handleRefresh,
        onChangeStatus: handleDirectStatusChange,
        onUpdateGeneric: handleUpdateGeneric,
        onViewDetail: handleViewDetail,
        page,
        totalPages: meta.totalPages,
        filtroLinea: filters.linea,
        onLineaChange: (l) => handleFilterChange({ linea: l }),
        filtroClasificacion: filters.clasificacion,
        onClasificacionChange: (c) => handleFilterChange({ clasificacion: c }),
        statusActual: filters.status,
        filtroDepartamento: activeDept,
        onDepartamentoChange: () => {},
        onReview: setRevisionTarget,
        onDelete: handleDeleteTarea,
        viewMode,
        onViewChange: setViewMode,
    };

    return (
        <div className="w-full">
            {isDesktop
                ? <ActivasDesktop {...sharedProps} />
                : <ActivasMobile  {...sharedProps} />
            }

            <PanelDetalleTarea 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                tarea={selectedTarea}
                onChangeStatus={handleDirectStatusChange}
                onUpdate={handleUpdateGeneric}
                onDelete={handleDeleteTarea}
                submitting={submitting}
                currentUser={currentUser}
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

