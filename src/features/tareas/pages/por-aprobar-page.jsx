// src/features/tareas/pages/por-aprobar-page.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTareas } from '../hooks/use-tareas';
import { TareasTable } from '../components/historico/tareas-table';
import { TareaDetailDrawer } from '../components/common/tarea-detail-drawer';
import { Icon, Button, Skeleton } from '@/components/ui/z_index';
import { notify } from '@/components/notification/adaptive-notify';

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

    const loadTareas = useCallback(() => {
        fetchTareas({
            estado: 'COMPLETADO',
            page,
            limit: 20,
            sort: JSON.stringify([{ createdAt: 'desc' }])
        }).catch(() => notify.error('Error al cargar tareas por aprobar.'));
    }, [page, fetchTareas]);

    useEffect(() => {
        loadTareas();
    }, [loadTareas]);

    const handleViewDetail = (tarea) => {
        setSelectedTarea(tarea);
        setIsDrawerOpen(true);
    };

    const handleApprove = async (id, status = 'CERRADO') => {
        try {
            await changeStatus(id, { estado: status });
            notify.success(status === 'CERRADO' ? 'Tarea aprobada y cerrada.' : 'Estado actualizado.');
            if (status === 'CERRADO') setIsDrawerOpen(false);
            loadTareas();
        } catch (err) {
            console.error(err);
            notify.error('Error al actualizar la tarea.');
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
            {/* Header de la sección */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight fuente-titulos">
                        Validación de Entregas
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Revisa y cierra las tareas completadas por los coordinadores.
                    </p>
                </div>
                <div className="bg-black text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl shadow-black/20">
                    <Icon name="fact_check" size="sm" />
                    <span className="text-xs font-black uppercase tracking-widest">
                        {meta.totalParaPaginador} Pendientes
                    </span>
                </div>
            </div>

            {/* Contenido Principal */}
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
                />
            </div>

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
