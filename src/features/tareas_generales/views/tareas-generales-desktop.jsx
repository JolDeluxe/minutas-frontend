// src/features/tareas_generales/views/tareas-generales-desktop.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { TareasGeneralesExecutiveSummary } from '../components/tareas-generales-executive-summary';
import { TareasGeneralesInlineFilters } from '../components/tareas-generales-inline-filters';
import { TablaGenerales } from '../components/tabla-generales';

export const TareasGeneralesDesktop = ({
    tareas,
    meta,
    loading,
    filters,
    showFilters,
    activeFilterCount,
    resumen,
    onSearchChange,
    onApplyFilters,
    onToggleFilters,
    onFilterByNotificado,
    onFilterByTipo,
    onResetFilter,
    onPageChange,
    onRefresh,
    onOpenCreate,
    onEdit,
    onRemove,
    onCreateNota,
    onUpdateNota,
    onDeleteNote,
    onDownloadPdf,
    isGeneratingPdf,
    onToggleNotificado,
    onViewDetail,
    currentUser,
}) => {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <Icon name="assignment" size="24px" className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight fuente-titulos leading-none">Tareas Generales</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            Módulo de Admin
                        </p>
                    </div>
                </div>
                
            </div>

            {/* Summary Bar */}
            <TareasGeneralesExecutiveSummary
                resumen={resumen}
                onFilterByNotificado={onFilterByNotificado}
                onFilterByTipo={onFilterByTipo}
                onResetFilter={onResetFilter}
                activeFilter={{
                    notificado: filters.notificado,
                    tipo: filters.tipo
                }}
                loading={loading}
            />

            <div className="flex items-center justify-end gap-2.5">
                    <Button
                        variant="guardar"
                        icon="add"
                        onClick={onOpenCreate}
                        className="shrink-0"
                    >
                        Nueva Tarea
                    </Button>
                </div>

            {/* Desktop search and filters controls */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm mb-2">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                        <Icon name="search" size="18px" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={filters.q}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar tarea..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                    />
                </div>

                <span className="w-px h-6 bg-slate-200" />

                <button
                    onClick={onToggleFilters}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                    title="Filtros Avanzados"
                >
                    <Icon name="tune" size="16px" />
                    <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-marca-primario text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold ml-1">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            <TareasGeneralesInlineFilters
                isOpen={showFilters}
                filters={filters}
                onApplyFilters={onApplyFilters}
                isMobile={false}
            />

            {/* Tabla Feed */}
            <TablaGenerales
                tareas={tareas}
                loading={loading}
                currentUser={currentUser}
                onEdit={onEdit}
                onRemove={onRemove}
                onCreateNota={onCreateNota}
                onUpdateNota={onUpdateNota}
                onDeleteNota={onDeleteNote}
                onDownloadPdf={onDownloadPdf}
                isGeneratingPdf={isGeneratingPdf}
                onToggleNotificado={onToggleNotificado}
                onViewDetail={onViewDetail}
            />

            {/* Desktop Paginador */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        disabled={filters.page <= 1}
                        onClick={() => onPageChange(filters.page - 1)}
                        className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-slate-300 disabled:opacity-40 transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                        Anterior
                    </button>
                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                        Página {filters.page} de {meta.totalPages}
                    </span>
                    <button
                        disabled={filters.page >= meta.totalPages}
                        onClick={() => onPageChange(filters.page + 1)}
                        className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-slate-300 disabled:opacity-40 transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </>
    );
};
