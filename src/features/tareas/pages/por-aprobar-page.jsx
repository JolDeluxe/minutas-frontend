// src/features/tareas/pages/por-aprobar-page.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTareas } from '../hooks/use-tareas';
import { TareasTable } from '../components/historico/tareas-table';
import { TareaDetailDrawer } from '../components/common/tarea-detail-drawer';
import { TareaRevisionModal } from '../components/common/tarea-revision-modal';
import { Icon, Button, Skeleton, GlassViewToggle } from '@/components/ui/z_index';
import { notify } from '@/components/notification/adaptive-notify';
import { HoyTareaCard } from '../components/hoy/hoy-tarea-card';
import { useTareasStore } from '../store/tareas-store';

export default function PorAprobarPage() {
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
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('por-aprobar-view') || 'table');
    
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

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
            {/* Header de la sección */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/40 backdrop-blur-md px-6 py-5 rounded-3xl border border-white/60 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight fuente-titulos">
                        Validación de Entregas
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        Revisa y cierra las tareas completadas por los coordinadores.
                    </p>
                </div>

                <div className="flex items-center justify-center lg:justify-end gap-4 shrink-0">
                    <div className="bg-black text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                        <Icon name="fact_check" size="sm" />
                        <span className="text-xs font-black uppercase tracking-widest">
                            {meta.totalParaPaginador || 0} Pendientes
                        </span>
                    </div>
                    <GlassViewToggle 
                        value={viewMode} 
                        onChange={handleViewChange} 
                        options={[
                            { id: 'cards', label: 'Tarjetas', icon: 'grid_view' },
                            { id: 'table', label: 'Tabla', icon: 'table_rows' }
                        ]}
                    />
                </div>
            </div>

            {/* Contenido Principal */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-2xl bg-white border border-slate-100 shadow-sm" />
                    ))}
                </div>
            ) : tareas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Icon name="task_alt" size="64px" className="mb-4 opacity-20" />
                    <p className="text-lg font-medium italic">No hay tareas pendientes de aprobación</p>
                </div>
            ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tareas.map((tarea) => (
                        <HoyTareaCard 
                            key={tarea.id} 
                            tarea={tarea} 
                            currentUser={currentUser} 
                            onViewDetail={handleViewDetail} 
                            onReview={setRevisionTarget}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <TareasTable 
                        tareas={tareas}
                        loading={loading}
                        currentUser={currentUser}
                        onViewDetail={handleViewDetail}
                        onPageChange={setPage}
                        page={page}
                        totalPages={meta.totalPages}
                        totalItems={meta.totalFiltrado}
                        hideResponsables={false}
                        onChangeStatus={handleApprove}
                        onReview={setRevisionTarget}
                        onDelete={handleDeleteTarea}
                    />
                </div>
            )}

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
