// src/features/tareas/views/seguimientos-desktop.jsx
import { useState } from 'react';
import { RefreshFab } from '@/components/ui/z_index';
import { TareasSummaryBar } from '../components/historico/tareas-summary-bar';
import { TareasFilterBar } from '../components/historico/tareas-filter-bar';
import { TareasTable } from '../components/historico/tareas-table';
import { TareaFormModal } from '../components/common/tarea-form-modal';
import { ROLES_ADMIN } from '../constants';

export const SeguimientosDesktop = ({
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
    mostrarAtrasadas,
    onToggleAtrasadas,
    onFilterChange,
    onPageChange,
    onRefresh,
    onChangeStatus,
}) => {
    const [editTarget, setEditTarget] = useState(null);

    return (
        <div className="flex flex-col gap-5 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-full">
                <h2 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-wide">Seguimiento de Tareas</h2>
                <div className="text-sm text-slate-500 mt-0.5">
                    {loading ? 'Cargando…' : (
                        <>
                            Monitoreando <span className="font-extrabold text-marca-primario">{totalParaPaginador}</span> tareas activas
                        </>
                    )}
                </div>
            </div>

            <TareasSummaryBar 
                totalParaSummary={totalParaSummary}
                conteos={conteos}
                filtroActual={onFilterChange?.status}
                onFilterChange={(status) => onFilterChange({ status })}
                loading={loading}
            />

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <TareasFilterBar 
                    currentUser={currentUser}
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
                />
            </div>

            <div className="min-h-[400px]">
                <TareasTable 
                    tareas={tareas}
                    loading={loading}
                    currentUser={currentUser}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalParaPaginador}
                    onPageChange={onPageChange}
                    onViewDetail={onChangeStatus}
                    onEdit={(t) => setEditTarget(t)}
                    onChangeStatus={onChangeStatus}
                />
            </div>

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
