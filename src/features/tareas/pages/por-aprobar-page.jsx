// src/features/tareas/pages/por-aprobar-page.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTareas } from '../hooks/use-tareas';
import { TareasTable } from '../components/historico/tareas-table';
import { TareaDetailDrawer } from '../components/common/tarea-detail-drawer';
import { Icon, Button, Skeleton, GlassViewToggle } from '@/components/ui/z_index';
import { notify } from '@/components/notification/adaptive-notify';
import { HoyTareaCard } from '../components/hoy/hoy-tarea-card';

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
    } = useTareas();

    const [page, setPage] = useState(1);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('por-aprobar-view') || 'table');
    const [departamento, setDepartamento] = useState(() => currentUser?.departamento || 'DISENO');

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
        if (departamento) params.departamento = departamento;

        fetchTareas(params).catch(() => notify.error('Error al cargar tareas por aprobar.'));
    }, [page, departamento, fetchTareas]);

    useEffect(() => {
        loadTareas();
    }, [loadTareas]);

    const handleViewDetail = (tarea) => {
        setSelectedTarea(tarea);
        setIsDrawerOpen(true);
    };

    const handleApprove = async (id, status = 'CERRADA') => {
        try {
            await changeStatus(id, { estado: status });
            notify.success(status === 'CERRADA' ? 'Tarea aprobada y cerrada.' : 'Estado actualizado.');
            if (status === 'CERRADA') setIsDrawerOpen(false);
            loadTareas();
        } catch (err) {
            console.error(err);
            notify.error('Error al actualizar la tarea.');
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

                {/* Selector de Departamento */}
                {['ADMIN', 'GERENCIA', 'JEFE'].includes(currentUser?.rol) && (
                    <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 shadow-inner shrink-0 self-center lg:self-auto">
                        {['DISEÑO', 'MARKETING'].map(opt => {
                            const val = opt === 'DISEÑO' ? 'DISENO' : 'MARKETING';
                            const isActive = departamento === val;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        setDepartamento(val);
                                        setPage(1);
                                    }}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                        isActive 
                                            ? 'bg-white text-marca-primario shadow-sm ring-1 ring-slate-200/50 font-black' 
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                                    }`}
                                >
                                    {opt === 'DISEÑO' && <Icon name="draw" size="14px" />}
                                    {opt === 'MARKETING' && <Icon name="campaign" size="14px" />}
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                )}

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
                submitting={submitting}
                currentUser={currentUser}
            />
        </div>
    );
}
