// src/features/tareas/views/historico-mobile.jsx
import { useState } from 'react';
import { Skeleton, Button, RefreshFab, Icon } from '@/components/ui/z_index';
import { HoyTareaCard } from '../components/hoy/hoy-tarea-card';
import { TareasSummaryBar } from '../components/historico/tareas-summary-bar';
import { TareasFilterBar } from '../components/historico/tareas-filter-bar';
import { TareaFormModal } from '../components/common/tarea-form-modal';

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
}) => {
    const [editTarget, setEditTarget] = useState(null);

    return (
        <div className="flex flex-col gap-4 pb-28 px-4 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="fuente-titulos text-xl text-marca-primario uppercase tracking-tight">Histórico de Entradas</h2>
                <div className="text-xs text-slate-500 font-bold uppercase">
                    {loading ? 'Cargando historial…' : `${totalParaPaginador} entradas registradas`}
                </div>
            </div>

            <TareasSummaryBar 
                totalParaSummary={totalParaSummary} 
                conteos={conteos} 
                filtroActual={onFilterChange?.status} 
                onFilterChange={(status) => onFilterChange({ status })} 
                loading={loading} 
            />

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <TareasFilterBar 
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

            <div className="flex flex-col gap-3">
                {loading && tareas.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                    : tareas.length === 0
                        ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Icon name="history" size="48px" className="mb-3 opacity-20" />
                                <p className="text-sm font-medium italic">No se encontraron entradas en el historial</p>
                            </div>
                        )
                        : tareas.map((tarea) => (
                            <HoyTareaCard 
                                key={tarea.id} 
                                tarea={tarea} 
                                currentUser={currentUser} 
                                onViewDetail={onChangeStatus} 
                                onEdit={setEditTarget}
                                onChangeStatus={onChangeStatus}
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
                    Cargar más historial
                </Button>
            )}

            <TareaFormModal 
                isOpen={Boolean(editTarget)} 
                onClose={() => setEditTarget(null)} 
                tareaAEditar={editTarget}
                onSuccess={() => { onRefresh(); setEditTarget(null); }}
            />

            <RefreshFab onClick={onRefresh} loading={loading} />
        </div>
    );
};
