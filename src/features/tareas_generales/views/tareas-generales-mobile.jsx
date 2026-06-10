// src/features/tareas_generales/views/tareas-generales-mobile.jsx
import React from 'react';
import { Icon, GlassFab, GlassPaginationPill, ScrollToTopButton } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { TareasGeneralesExecutiveSummary } from '../components/tareas-generales-executive-summary';
import { TareasGeneralesInlineFilters } from '../components/tareas-generales-inline-filters';
import { EntryCard } from '../../minutas/components/timeline/entry-card';

export const TareasGeneralesMobile = ({
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
    currentUser,
    onChangeStatus,
}) => {
    return (
        <>
            {/* Header Mobile */}
            <div className="px-1 mb-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    Tareas Generales
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 font-medium leading-snug">
                    Módulo de Admin — Sin minuta
                </p>
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

            {/* Mobile search and filters controls */}
            <div className="sticky top-0 z-30 bg-white/40 backdrop-blur-lg px-1 py-2 mb-3 rounded-2xl border border-white/40 shadow-sm flex flex-col gap-2 transition-all duration-300">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon name="search" size="sm" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={filters.q}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar tarea..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200/70 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400 shadow-inner"
                    />
                </div>

                <div className="flex justify-between items-center w-full px-0.5">
                    <button
                        onClick={onToggleFilters}
                        style={{
                            ...glassBase(showFilters || activeFilterCount > 0 ? 'primary' : 'light'),
                            borderRadius: 14,
                            padding: '7px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        className="active:scale-95 transition-all outline-none border border-slate-200/50 shadow-sm cursor-pointer"
                    >
                        {(showFilters || activeFilterCount > 0) && <GlassSheen />}
                        <Icon 
                            name="filter_list" 
                            size="sm" 
                            className={showFilters || activeFilterCount > 0 ? "text-white relative z-10" : "text-slate-700 relative z-10"} 
                        />
                        <span className={cn("text-xs font-bold relative z-10", showFilters || activeFilterCount > 0 ? "text-white" : "text-slate-700")}>
                            Filtros Avanzados
                        </span>
                        {activeFilterCount > 0 && (
                            <span className="absolute top-1 right-1 bg-white text-marca-primario text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold z-20 shadow-sm">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                <TareasGeneralesInlineFilters
                    isOpen={showFilters}
                    filters={filters}
                    onApplyFilters={onApplyFilters}
                    isMobile={true}
                />
            </div>

            {/* Cards Feed */}
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                {tareas.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 font-medium shadow-sm">
                        No hay tareas generales registradas.
                    </div>
                ) : (
                    tareas.map(tarea => (
                        <EntryCard
                            key={tarea.id}
                            entry={{ ...tarea, tipo: 'SIN_ORGANIZAR' }}
                            departamento={currentUser?.departamento === 'DISEÑO' ? 'DISENO' : (currentUser?.departamento || 'DISENO')}
                            onRemove={onRemove}
                            onEdit={onEdit}
                            onCreateNote={async (id, content) => {
                                const ok = await onCreateNota({ tareaId: id, contenido: content });
                                onRefresh?.();
                                return Boolean(ok);
                            }}
                            onUpdateNote={async (tareaId, notaId, content) => {
                                await onUpdateNota(notaId, { contenido: content });
                                onRefresh?.();
                            }}
                            onDeleteNote={async (tareaId, notaId) => {
                                await onDeleteNote(notaId);
                                onRefresh?.();
                            }}
                            onChangeStatus={onChangeStatus}
                            onDownloadPdf={onDownloadPdf}
                            isGeneratingPdf={isGeneratingPdf}
                            onToggleNotificado={onToggleNotificado}
                            hideStatus={true}
                        />
                    ))
                )}
            </div>

            {/* Mobile Paginador */}
            {meta.totalPages > 1 && (
                <GlassPaginationPill
                    page={filters.page}
                    totalPages={meta.totalPages}
                    totalItems={meta.totalFiltrado}
                    onPageChange={onPageChange}
                    loading={loading}
                    bottom="80px"
                />
            )}

            {/* Mobile Floating Action Button and ScrollToTopButton */}
            <>
                <GlassFab
                    icon="add"
                    onClick={onOpenCreate}
                    variant="primary"
                    size={56}
                    bottom={meta.totalPages > 1 ? '104px' : '84px'}
                    right="20px"
                />
                <ScrollToTopButton bottom={meta.totalPages > 1 ? '104px' : '84px'} left="20px" />
            </>
        </>
    );
};
