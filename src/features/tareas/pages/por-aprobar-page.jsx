// src/features/tareas/pages/por-aprobar-page.jsx
import { useState, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { useTareas } from '../hooks/use-tareas';
import { PorAprobarDesktop } from '../views/por-aprobar-desktop';
import { PorAprobarMobile } from '../views/por-aprobar-mobile';
import { TareaDetailDrawer } from '../components/common/tarea-detail-drawer';
import { TareaRevisionModal } from '../components/common/tarea-revision-modal';
import { notify } from '@/components/notification/adaptive-notify';
import { useTareasStore } from '../store/tareas-store';

export default function PorAprobarPage() {
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
        deleteTarea,
    } = useTareas();

    const [page, setPage] = useState(1);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [revisionTarget, setRevisionTarget] = useState(null);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('por-aprobar-view') || 'cards');
    
    // Consumir el departamento global
    const { departamento } = useTareasStore();
    const activeDept = currentUser?.rol === 'ADMIN' ? departamento : (currentUser?.departamento || 'DISENO');

    const handleViewChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('por-aprobar-view', mode);
    };

    const loadTareas = useCallback(() => {
        const params = {
            estado: 'EN_REVISION',
            page,
            limit: 20,
            sort: JSON.stringify([{ createdAt: 'desc' }])
        };
        if (activeDept) params.departamento = activeDept;

        fetchTareas(params).catch(() => notify.error('Error al cargar tareas por aprobar.'));
    }, [page, activeDept, fetchTareas]);

    useEffect(() => {
        loadTareas();
    }, [loadTareas]);

    const handleViewDetail = (tarea) => {
        setSelectedTarea(tarea);
        setIsDrawerOpen(true);
    };

    const handleApprove = async (id, status) => {
        try {
            await changeStatus(id, { estado: status });
            notify.success(`Tarea ${status === 'CERRADA' ? 'aprobada' : 'rechazada'} con éxito.`);
            setIsDrawerOpen(false);
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

    const sharedProps = {
        tareas,
        loading,
        currentUser,
        meta,
        viewMode,
        onViewChange: handleViewChange,
        onViewDetail: handleViewDetail,
        onReview: setRevisionTarget,
        setPage,
        page,
        handleApprove,
        handleDeleteTarea,
        onRefresh: loadTareas
    };

    return (
        <div className="w-full">
            {isDesktop
                ? <PorAprobarDesktop {...sharedProps} />
                : <PorAprobarMobile  {...sharedProps} />
            }

            <TareaDetailDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                tarea={selectedTarea}
                onUpdate={async (id, payload) => {
                    await changeStatus(id, payload);
                    loadTareas();
                }}
                onChangeStatus={handleApprove}
                onDelete={handleDeleteTarea}
                submitting={submitting}
                currentUser={currentUser}
            />

            <TareaRevisionModal
                isOpen={Boolean(revisionTarget)}
                onClose={() => setRevisionTarget(null)}
                tarea={revisionTarget}
                onConfirm={async () => {
                    if (revisionTarget) {
                        await handleApprove(revisionTarget.id, 'CERRADA');
                        setRevisionTarget(null);
                    }
                }}
                submitting={submitting}
            />
        </div>
    );
}
