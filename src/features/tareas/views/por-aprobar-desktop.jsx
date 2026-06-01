import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Icon, GlassViewToggle } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TareaCard } from '../components/comun/tarjeta-tarea';
import { TablaTareas } from '../components/comun/tabla-tareas';
import { ModalEditarTarea } from '../components/comun/modal-editar-tarea';

const CardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-12 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
            </div>
        </div>
        <div className="space-y-1.5">
            <Skeleton className="h-3 w-32 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    </div>
);

export const PorAprobarDesktop = ({
    tareas,
    loading,
    currentUser,
    meta,
    viewMode,
    onViewChange,
    onViewDetail,
    onReview,
    setPage,
    page,
    handleApprove,
    handleDeleteTarea,
    onRefresh,
    filtroDepartamento
}) => {
    const [editTarget, setEditTarget] = useState(null);

    const activeDept = currentUser?.rol === 'ADMIN' ? (filtroDepartamento || 'DISENO') : (currentUser?.departamento || 'DISENO');
    const isMarketing = activeDept === 'MARKETING';
    const deptColorClass = isMarketing ? 'text-purple-700' : 'text-blue-700';

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
            {/* Header de la sección armonizado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-sm">
                <div>
                    <h2 className={cn("fuente-titulos text-2xl uppercase tracking-tighter", deptColorClass)}>Tareas Por Aprobar</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {loading ? 'Sincronizando…' : (
                            <>
                                <span className={cn("font-bold", deptColorClass)}>{meta?.totalParaPaginador || 0}</span> tarea{(meta?.totalParaPaginador || 0) !== 1 ? 's' : ''} pendiente{(meta?.totalParaPaginador || 0) !== 1 ? 's' : ''} de revisión
                            </>
                        )}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Vista:</div>
                    <GlassViewToggle 
                        value={viewMode} 
                        onChange={onViewChange} 
                        options={[
                            { id: 'cards', label: 'Tarjetas', icon: 'grid_view' },
                            { id: 'table', label: 'Tabla', icon: 'table_rows' }
                        ]}
                    />
                </div>
            </div>

            {/* Contenido Principal */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : tareas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Icon name="task_alt" size="64px" className="mb-4 opacity-20" />
                    <p className="text-lg font-medium italic">No hay tareas pendientes de aprobación</p>
                    <button onClick={onRefresh} className="mt-4 text-marca-primario hover:underline font-bold">Refrescar</button>
                </div>
            ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tareas.map((tarea) => (
                        <TareaCard 
                            key={tarea.id} 
                            tarea={tarea} 
                            currentUser={currentUser} 
                            onViewDetail={onViewDetail} 
                            onReview={onReview}
                            isPorAprobar={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <TablaTareas 
                        tareas={tareas}
                        loading={loading}
                        currentUser={currentUser}
                        onViewDetail={onViewDetail}
                        onPageChange={setPage}
                        page={page}
                        totalPages={meta.totalPages}
                        totalItems={meta.totalFiltrado}
                        hideResponsables={false}
                        onChangeStatus={handleApprove}
                        onReview={onReview}
                        isPorAprobar={true}
                    />
                </div>
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
