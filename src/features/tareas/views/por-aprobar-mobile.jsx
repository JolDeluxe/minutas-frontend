import { useState } from 'react';
import { Skeleton, Button, RefreshFab, Icon } from '@/components/ui/z_index';
import { HoyTareaCard } from '../components/hoy/hoy-tarea-card';
import { TareaEditModal } from '../components/common/tarea-edit-modal';

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

export const PorAprobarMobile = ({
    tareas,
    loading,
    currentUser,
    meta,
    onViewDetail,
    onReview,
    setPage,
    page,
    handleApprove,
    handleDeleteTarea,
    onRefresh
}) => {
    const [editTarget, setEditTarget] = useState(null);

    return (
        <div className="flex flex-col gap-4 pb-28 px-4 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="fuente-titulos text-xl text-marca-primario uppercase tracking-tight">Tareas Por Aprobar</h2>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {loading ? 'Cargando…' : `${meta?.totalParaPaginador || 0} tareas pendientes`}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {loading && tareas.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                    : tareas.length === 0
                        ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Icon name="fact_check" size="48px" className="mb-3 opacity-20" />
                                <p className="text-sm font-medium italic">Sin tareas por revisar</p>
                            </div>
                        )
                        : tareas.map((tarea) => (
                            <HoyTareaCard 
                                key={tarea.id} 
                                tarea={tarea} 
                                currentUser={currentUser} 
                                onViewDetail={onViewDetail} 
                                onEdit={setEditTarget}
                                onChangeStatus={handleApprove}
                                onReview={onReview}
                                onDelete={handleDeleteTarea}
                            />
                        ))
                }
            </div>

            {page < (meta.totalPages || 1) && (
                <Button 
                    variant="outline" 
                    className="w-full py-4 rounded-3xl font-black uppercase text-[11px] tracking-widest border-2"
                    onClick={() => setPage(page + 1)}
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
