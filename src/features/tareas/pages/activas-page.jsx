// src/features/tareas/pages/activas-page.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useAuthStore } from '@/stores/auth-store';
import { useTareas } from '../hooks/use-tareas';
import { ActivasDesktop } from '../views/activas-desktop';
import { ActivasMobile } from '../views/activas-mobile';
import { TareaDetailDrawer } from '../components/common/tarea-detail-drawer';

const LIMIT = 20;

// Ordenar: atrasadas primero, luego por prioridad (URGENTE→ALTA→MEDIA→BAJA)
const PRIORIDAD_PESO = { URGENTE: 0, CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };

export default function ActivasPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    
    const {
        tareas,
        meta,
        loading,
        submitting,
        fetchTareas,
        changeStatus,
    } = useTareas();

    const [filters, setFilters] = useState(() => ({
        search: '',
        status: 'TODOS',
        prioridad: '',
        linea: '',
        clasificacion: '',
        departamento: currentUser?.departamento || 'DISENO',
        mostrarAtrasadas: false,
    }));
    
    const [page, setPage] = useState(1);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        if (filters.departamento) params.departamento = filters.departamento;
        if (filters.mostrarAtrasadas) params.atrasadas = true;

        fetchTareas(params).catch(() => notify.error('Error al cargar tus tareas.'));
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
            // 1. Atrasadas siempre primero
            const aOverdue = a.isOverdue ? 0 : 1;
            const bOverdue = b.isOverdue ? 0 : 1;
            if (aOverdue !== bOverdue) return aOverdue - bOverdue;

            // 2. Por prioridad (URGENTE > ALTA > MEDIA > BAJA > sin prioridad)
            const aPrio = PRIORIDAD_PESO[a.prioridad] ?? 4;
            const bPrio = PRIORIDAD_PESO[b.prioridad] ?? 4;
            if (aPrio !== bPrio) return aPrio - bPrio;

            // 3. Por fecha de creación (más reciente primero)
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
        filtroDepartamento: filters.departamento,
        onDepartamentoChange: (d) => handleFilterChange({ departamento: d }),
    };

    return (
        <div className="w-full">
            {isDesktop
                ? <ActivasDesktop {...sharedProps} />
                : <ActivasMobile  {...sharedProps} />
            }

            <TareaDetailDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                tarea={selectedTarea}
                onChangeStatus={handleDirectStatusChange}
                onUpdate={handleUpdateGeneric}
                submitting={submitting}
                currentUser={currentUser}
            />
        </div>
    );
}

