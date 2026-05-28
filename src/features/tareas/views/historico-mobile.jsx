// src/features/tareas/views/historico-mobile.jsx
import { useState } from 'react';
import { Skeleton, Button, RefreshFab, Icon, GlassViewToggle } from '@/components/ui/z_index';
import { TareaCard } from '../components/comun/tarjeta-tarea';
import { ResumenHistorico } from '../components/historico/resumen-historico';
import { BarraFiltrosHistorico } from '../components/historico/barra-filtros-historico';
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

export const HistoricoMobile = ({
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
    onReview,
    page,
    totalPages,
    totalParaPaginador,
    // Fechas
    showDates,
    year,
    month,
    onYearChange,
    onMonthChange,
    existenciaGlobal,
    viewMode,
    onViewChange,
}) => {
    const [editTarget, setEditTarget] = useState(null);

    return (
        <div className="flex flex-col gap-4 pb-28 px-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h2 className="fuente-titulos text-xl text-marca-primario uppercase tracking-tight">Histórico de Tareas</h2>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {loading ? 'Cargando historial…' : `${totalParaPaginador} tareas registradas`}
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

            <ResumenHistorico 
                totalParaSummary={totalParaSummary} 
                conteos={conteos} 
                filtroActual={onFilterChange?.status} 
                onFilterChange={(status) => onFilterChange({ status })} 
                loading={loading} 
            />

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <BarraFiltrosHistorico 
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
                    // Props de fechas
                    showDates={showDates}
                    year={year}
                    month={month}
                    onYearChange={onYearChange}
                    onMonthChange={onMonthChange}
                    existenciaGlobal={existenciaGlobal}
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
                                <Icon name="history" size="48px" className="mb-3 opacity-20" />
                                <p className="text-sm font-medium italic">No se encontraron tareas en el historial</p>
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
                                        onReview={onReview}
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
                                    onEdit={setEditTarget}
                                    onChangeStatus={onChangeStatus}
                                    onReview={onReview}
                                    hidePagination={true}
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
                    Cargar más historial
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
