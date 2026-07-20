import { useState } from 'react';
import { Skeleton } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { GlassViewToggle, GlassPaginationPill } from '@/components/ui/liquid-glass-mobile';
import { TareaCard } from '../components/comun/tarjeta-tarea';
import { ModalEditarTarea } from '../components/comun/modal-editar-tarea';
import { TablaTareas } from '../components/comun/tabla-tareas';

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
    onRefresh,
    viewMode,
    onViewChange,
    filtroDepartamento
}) => {
    const [editTarget, setEditTarget] = useState(null);

    const activeDept = currentUser?.rol === 'ADMIN' ? (filtroDepartamento || 'DISENO') : (currentUser?.departamento || 'DISENO');
    const isMarketing = activeDept === 'MARKETING';
    const deptColorClass = isMarketing ? 'text-purple-700' : 'text-blue-700';

    return (
        <div className="flex flex-col gap-4 pb-28 px-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h2 className={`fuente-titulos text-xl uppercase tracking-tight ${deptColorClass}`}>Tareas Por Aprobar</h2>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {loading ? 'Cargando…' : `${meta?.totalParaPaginador || 0} tareas pendientes`}
                    </div>
                </div>
                <GlassViewToggle 
                    value={viewMode} 
                    onChange={onViewChange} 
                    options={[
                        { id: 'cards', label: 'Tarjetas', icon: 'grid_view' },
                        { id: 'table', label: 'Tabla', icon: 'table_rows' }
                    ]}
                />
            </div>

            <div className="">
                {loading && tareas.length === 0
                    ? (
                        <div className="grid gap-3">
                            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    )
                    : tareas.length === 0
                        ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <Icon name="fact_check" size="48px" className="mb-3 opacity-20" />
                                <p className="text-sm font-medium italic">Sin tareas por revisar</p>
                            </div>
                        )
                        : viewMode === 'cards' ? (
                            <div className="flex flex-col gap-3">
                                {tareas.map((tarea) => (
                                    <TareaCard 
                                        key={tarea.id} 
                                        tarea={tarea} 
                                        currentUser={currentUser} 
                                        onViewDetail={onViewDetail} 
                                        onChangeStatus={handleApprove}
                                        onReview={onReview}
                                        isPorAprobar={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <TablaTareas 
                                    tareas={tareas}
                                    loading={loading}
                                    currentUser={currentUser}
                                    onViewDetail={onViewDetail}
                                    hidePagination={true}
                                    onChangeStatus={handleApprove}
                                    onReview={onReview}
                                    isPorAprobar={true}
                                />
                            </div>
                        )
                }
            </div>

            {meta?.totalPages > 1 && (
                <GlassPaginationPill
                    page={page}
                    totalPages={meta.totalPages}
                    totalItems={meta?.totalParaPaginador || 0}
                    onPageChange={setPage}
                    loading={loading}
                    bottom="88px"
                />
            )}

            <ModalEditarTarea 
                isOpen={Boolean(editTarget)} 
                onClose={() => setEditTarget(null)} 
                tarea={editTarget}
                onSuccess={() => { onRefresh(); setEditTarget(null); }}
                currentUser={currentUser}
            />


        </div>
    );
};
