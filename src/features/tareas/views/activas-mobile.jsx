// src/features/tareas/views/mis-tareas-mobile.jsx
import { useState } from 'react';
import { Skeleton, Button, RefreshFab, Icon } from '@/components/ui/z_index';
import { HoyTareaCard } from '../components/hoy/hoy-tarea-card';
import { HoySummaryBar } from '../components/hoy/hoy-summary-bar';
import { HoyFilterBar } from '../components/hoy/hoy-filter-bar';
import { TareaEditModal } from '../components/common/tarea-edit-modal';
import { BossApprovalBanner } from '../components/common/boss-approval-banner';


const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <Skeleton className="h-4 w-1/4 rounded-md" />
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-5/6 rounded-md" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    </div>
);

export const ActivasMobile = ({
    tareas,
    loading,
    currentUser,
    users = [],
    totalParaSummary,
    conteos,
    totalAtrasadasGlobal,
    query,
    onSearchChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroResponsable,
    onResponsableChange,
    mostrarAtrasadas,
    onToggleAtrasadas,
    onFilterChange,
    onRefresh,
    onChangeStatus,
    onViewDetail,
    page,
    totalPages,
    filtroLinea,
    onLineaChange,
    filtroClasificacion,
    onClasificacionChange,
    statusActual,
    filtroDepartamento,
    onReview,
}) => {
    const [editTarget, setEditTarget] = useState(null);

    return (
        <div className="flex flex-col gap-4 pb-28 px-4 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="fuente-titulos text-xl text-marca-primario uppercase tracking-tight">Tareas Activas</h2>
                {totalAtrasadasGlobal > 0 && (
                    <div className="flex items-center gap-1.5 text-estado-rechazado font-bold text-xs animate-pulse">
                        <Icon name="warning" size="xs" />
                        <span>{totalAtrasadasGlobal} tareas atrasadas</span>
                    </div>
                )}
            </div>

            <HoySummaryBar 
                totalParaSummary={totalParaSummary} 
                conteos={conteos} 
                filtroActual={statusActual} 
                onFilterChange={(status) => onFilterChange({ status })} 
                loading={loading} 
            />

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <HoyFilterBar 
                    query={query}
                    onSearchChange={onSearchChange}
                    filtroPrioridad={filtroPrioridad}
                    onPrioridadChange={onPrioridadChange}
                    filtroResponsable={filtroResponsable}
                    onResponsableChange={onResponsableChange}
                    opcionesResponsables={users}
                    mostrarAtrasadas={mostrarAtrasadas}
                    onToggleAtrasadas={onToggleAtrasadas}
                    totalAtrasadasGlobal={totalAtrasadasGlobal}
                    currentUser={currentUser}
                    filtroLinea={filtroLinea}
                    onLineaChange={onLineaChange}
                    filtroClasificacion={filtroClasificacion}
                    onClasificacionChange={onClasificacionChange}
                />
            </div>

            {['ADMIN', 'JEFE', 'GERENCIA'].includes(currentUser?.rol) && (
                <BossApprovalBanner 
                    count={conteos?.EN_REVISION || 0}
                    isActive={statusActual === 'EN_REVISION'}
                    onClick={() => onFilterChange({ status: statusActual === 'EN_REVISION' ? 'TODOS' : 'EN_REVISION' })}
                />
            )}


            <div className="flex flex-col gap-3">
                {loading && tareas.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                    : tareas.length === 0
                        ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Icon name="task_alt" size="48px" className="mb-3 opacity-20" />
                                <p className="text-sm font-medium italic">Sin tareas pendientes</p>
                            </div>
                        )
                        : tareas.map((tarea) => (
                            <HoyTareaCard 
                                key={tarea.id} 
                                tarea={tarea} 
                                currentUser={currentUser} 
                                onViewDetail={onViewDetail} 
                                onEdit={setEditTarget}
                                onChangeStatus={onChangeStatus}
                                onReview={onReview}
                            />
                        ))
                }
            </div>

            {page < totalPages && (
                <Button 
                    variant="outline" 
                    className="w-full py-4 rounded-3xl font-black uppercase text-[11px] tracking-widest border-2"
                    onClick={() => onFilterChange({ page: page + 1 })}
                    isLoading={loading}
                >
                    Ver más tareas
                </Button>
            )}

            <TareaEditModal 
                isOpen={Boolean(editTarget)} 
                onClose={() => setEditTarget(null)} 
                tarea={editTarget}
                onSuccess={() => { onRefresh(); setEditTarget(null); }}
                currentUser={currentUser}
            />

            <RefreshFab onClick={onRefresh} loading={loading} />
        </div>
    );
};
