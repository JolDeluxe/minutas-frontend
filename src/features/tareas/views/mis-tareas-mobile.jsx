import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Button, RefreshFab, Icon, GlassViewToggle } from '@/components/ui/z_index';
import { TareaCard } from '../components/comun/tarjeta-tarea';
import { ResumenTareasActivas } from '../components/comun/resumen-tareas-activas';
import { BarraFiltrosTareas } from '../components/comun/barra-filtros-tareas';
import { ModalEditarTarea } from '../components/comun/modal-editar-tarea';
import { BannerAprobacionJefe } from '../components/comun/banner-aprobacion-jefe';
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

export const MisTareasMobile = ({
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
    viewMode,
    onViewChange,
}) => {
    const navigate = useNavigate();
    const [editTarget, setEditTarget] = useState(null);

    return (
        <div className="flex flex-col gap-4 pb-28 px-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h2 className="fuente-titulos text-xl text-marca-primario uppercase tracking-tight">Mis Tareas</h2>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
                        <span>{loading ? 'Cargando…' : `${tareas.length} TAREAS`}</span>
                        {totalAtrasadasGlobal > 0 && (
                            <span className="flex items-center gap-1 text-estado-rechazado animate-pulse">
                                <Icon name="warning" size="xs" />
                                {totalAtrasadasGlobal} atrasadas
                            </span>
                        )}
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

            <ResumenTareasActivas 
                totalParaSummary={totalParaSummary} 
                conteos={conteos} 
                filtroActual={statusActual} 
                onFilterChange={(status) => onFilterChange({ status })} 
                loading={loading} 
            />

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <BarraFiltrosTareas 
                    isMobile={true}
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
                <BannerAprobacionJefe 
                    count={conteos?.EN_REVISION || 0}
                    isActive={false}
                    onClick={() => navigate('/tareas/por-aprobar')}
                />
            )}


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
                                <Icon name="task_alt" size="48px" className="mb-3 opacity-20" />
                                <p className="text-sm font-medium italic">Sin tareas pendientes</p>
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
                                        onEdit={setEditTarget}
                                        onChangeStatus={onChangeStatus}
                                        isMisTareas={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <TablaTareas 
                                    tareas={tareas}
                                    loading={loading}
                                    currentUser={currentUser}
                                    onChangeStatus={onChangeStatus}
                                    onViewDetail={onViewDetail}
                                    onEdit={setEditTarget}
                                    hidePagination={true}
                                    hideResponsables={true}
                                />
                            </div>
                        )
                }
            </div>

            {viewMode === 'cards' && page < totalPages && (
                <Button 
                    variant="outline" 
                    className="w-full py-4 rounded-3xl font-black uppercase text-[11px] tracking-widest border-2"
                    onClick={() => onFilterChange({ page: page + 1 })}
                    isLoading={loading}
                >
                    Ver más tareas
                </Button>
            )}

            <ModalEditarTarea 
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
