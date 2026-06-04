// src/features/tareas/views/historico-desktop.jsx
import { useState } from 'react';
import { GlassViewToggle, GlassPaginationPill } from '@/components/ui/z_index';
import { ResumenHistorico } from '../components/historico/resumen-historico';
import { BarraFiltrosHistorico } from '../components/historico/barra-filtros-historico';
import { TablaTareas } from '../components/comun/tabla-tareas';
import { TareaCard } from '../components/comun/tarjeta-tarea';
import { ModalEditarTarea } from '../components/comun/modal-editar-tarea';
import { ROLES_ADMIN } from '../constants';
import { cn } from '@/utils/cn';

export const HistoricoDesktop = ({
    tareas,
    loading,
    currentUser,
    users = [],
    page,
    totalPages,
    totalParaPaginador,
    totalParaSummary,
    conteos,
    totalAtrasadasGlobal,
    query,
    onSearchChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroResponsable,
    onResponsableChange,
    filtroLinea,
    onLineaChange,
    mostrarAtrasadas,
    onToggleAtrasadas,
    onFilterChange,
    onPageChange,
    onRefresh,
    onChangeStatus,
    onViewDetail,
    onDelete,
    onReview,
    showDates,
    year,
    month,
    onYearChange,
    onMonthChange,
    existenciaGlobal,
    viewMode,
    onViewChange,
    statusActual,
    filtroDepartamento,
}) => {
    const [editTarget, setEditTarget] = useState(null);

    const activeDept = currentUser?.rol === 'ADMIN' ? (filtroDepartamento || 'DISENO') : (currentUser?.departamento || 'DISENO');
    const isMarketing = activeDept === 'MARKETING';
    const deptColorClass = isMarketing ? 'text-purple-700' : 'text-blue-700';

    return (
        <div className="flex flex-col gap-5 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-sm">
                <div>
                    <h2 className={cn("fuente-titulos text-2xl uppercase tracking-tighter", deptColorClass)}>Histórico de Tareas</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {loading ? 'Sincronizando…' : (
                            <>
                                Mostrando <span className={deptColorClass}>{totalParaPaginador}</span> tareas en el historial
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

            <ResumenHistorico 
                totalParaSummary={totalParaSummary}
                conteos={conteos}
                filtroActual={statusActual}
                onFilterChange={(status) => onFilterChange({ status })}
                loading={loading}
            />

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <BarraFiltrosHistorico 
                    currentUser={currentUser}
                    query={query}
                    onSearchChange={onSearchChange}
                    filtroPrioridad={filtroPrioridad}
                    onPrioridadChange={onPrioridadChange}
                    filtroResponsable={filtroResponsable}
                    onResponsableChange={onResponsableChange}
                    filtroLinea={filtroLinea}
                    onLineaChange={onLineaChange}
                    opcionesResponsables={users}
                    mostrarAtrasadas={mostrarAtrasadas}
                    onToggleAtrasadas={onToggleAtrasadas}
                    totalAtrasadasGlobal={totalAtrasadasGlobal}
                    // Props de fechas
                    showDates={showDates}
                    year={year}
                    month={month}
                    onYearChange={onYearChange}
                    onMonthChange={onMonthChange}
                    existenciaGlobal={existenciaGlobal}
                />
            </div>

            <div className="min-h-[400px]">
                {viewMode === 'cards' ? (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {tareas.map((tarea) => (
                                <TareaCard 
                                    key={tarea.id} 
                                    className="h-full"
                                    tarea={tarea} 
                                    currentUser={currentUser} 
                                    onViewDetail={onViewDetail} 
                                    onEdit={(t) => setEditTarget(t)}
                                    onChangeStatus={onChangeStatus}
                                    onDelete={onDelete}
                                    onReview={onReview}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4">
                                <GlassPaginationPill 
                                    page={page} 
                                    totalPages={totalPages} 
                                    totalItems={totalParaPaginador} 
                                    onPageChange={onPageChange} 
                                    loading={loading}
                                    bottom="24px"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <TablaTareas 
                        tareas={tareas}
                        loading={loading}
                        currentUser={currentUser}
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalParaPaginador}
                        onPageChange={onPageChange}
                        onViewDetail={onViewDetail}
                        onEdit={(t) => setEditTarget(t)}
                        onChangeStatus={onChangeStatus}
                        onDelete={onDelete}
                        onReview={onReview}
                    />
                )}
            </div>

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
