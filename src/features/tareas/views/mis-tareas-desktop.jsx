import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, RefreshFab, Icon, GlassViewToggle } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TareaCard } from '../components/comun/tarjeta-tarea';
import { ResumenTareasActivas } from '../components/comun/resumen-tareas-activas';
import { BarraFiltrosTareas } from '../components/comun/barra-filtros-tareas';
import { ModalEditarTarea } from '../components/comun/modal-editar-tarea';
import { PanelDetalleTarea } from '../components/comun/panel-detalle-tarea';
import { TablaTareas } from '../components/comun/tabla-tareas';
import { BannerAprobacionJefe } from '../components/comun/banner-aprobacion-jefe';
import { ROLES_ADMIN } from '../constants';


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

export const MisTareasDesktop = ({
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
    onChangeStatus,
    onViewDetail,
    onRefresh,
    filtroLinea,
    onLineaChange,
    filtroClasificacion,
    onClasificacionChange,
    statusActual,
    onDelete,
    viewMode,
    onViewChange,
}) => {
    const navigate = useNavigate();
    const [editTarget, setEditTarget] = useState(null);

    return (
        <div className="flex flex-col gap-3 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-sm">
                <div>
                    <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-tighter">Mis Tareas</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {loading ? 'Sincronizando…' : (
                            <>
                                <span className="text-marca-primario">{tareas.length}</span> tarea{tareas.length !== 1 ? 's' : ''} asignada{tareas.length !== 1 ? 's' : ''}
                                {totalAtrasadasGlobal > 0 && (
                                    <span className="ml-2 text-estado-rechazado">· {totalAtrasadasGlobal} fuera de tiempo</span>
                                )}
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

            {['ADMIN', 'JEFE', 'GERENCIA'].includes(currentUser?.rol) && (
                <BannerAprobacionJefe 
                    count={conteos?.EN_REVISION || 0}
                    isActive={false}
                    onClick={() => navigate('/tareas/por-aprobar')}
                />
            )}


            <ResumenTareasActivas 
                totalParaSummary={totalParaSummary} 
                conteos={conteos} 
                filtroActual={statusActual} 
                onFilterChange={(status) => onFilterChange({ status })} 
                loading={loading} 
            />

            <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
                <BarraFiltrosTareas 
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

            <div className="">
                {loading
                    ? (
                        <div className={cn(
                            "grid gap-4",
                            viewMode === 'cards' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                        )}>
                            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    )
                    : tareas.length === 0
                        ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <Icon name="task" size="64px" className="mb-4 opacity-20" />
                                <p className="text-lg font-medium italic">No se encontraron tareas</p>
                                <button onClick={onRefresh} className="mt-4 text-marca-primario hover:underline font-bold">Refrescar</button>
                            </div>
                        )
                        : viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {tareas.map((tarea) => (
                                    <TareaCard 
                                        key={tarea.id} 
                                        tarea={tarea} 
                                        currentUser={currentUser} 
                                        onViewDetail={onViewDetail} 
                                        onEdit={setEditTarget}
                                        onChangeStatus={onChangeStatus}
                                        onDelete={onDelete}
                                        isMisTareas={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <TablaTareas 
                                    tareas={tareas}
                                    loading={loading}
                                    currentUser={currentUser}
                                    onChangeStatus={onChangeStatus}
                                    onViewDetail={onViewDetail}
                                    onEdit={setEditTarget}
                                    onDelete={onDelete}
                                    hidePagination={true}
                                    hideResponsables={true}
                                />
                            </div>
                        )
                }
            </div>

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
