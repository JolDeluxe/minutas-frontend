import { useState, useMemo } from 'react';
import { Button, GlassFab, GlassPaginationPill, GlassViewToggle, ScrollToTopButton, Icon } from '@/components/ui/z_index';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { TimePeriodSelector } from '../components/time-period-selector';
import { QuickNavigateCalendar } from '../components/quick-navigate-calendar';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

/**
 * Agrupa las minutas por fecha para headers tipo "15 MAY 2026"
 */
const groupByDate = (minutas) => {
    const groups = new Map();
    for (const m of minutas) {
        const d = new Date(m.fechaRealizada || m.fechaProgramada || m.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!groups.has(key)) groups.set(key, { date: d, key, minutas: [] });
        groups.get(key).minutas.push(m);
    }
    return Array.from(groups.values()).sort((a, b) => b.date - a.date);
};

const formatDateHeader = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = today.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'HOY';
    if (days === 1) return 'AYER';
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
};

export const MinutasMobile = ({
    minutas,
    loading,
    page,
    limit,
    totalPages,
    totalItems,
    query,
    sortConfig,
    onPageChange,
    onSortChange,
    onSearchChange,
    onViewDetail,
    onOpenCreate,
    onEdit,
    filters,
    showFilters,
    onToggleFilters,
    onApplyFilters,
    activeFiltersCount,
    // Periodo
    periodo,
    year,
    month,
    estadoFilter,
    availableYears,
    onPeriodoChange,
    onYearChange,
    onMonthChange,
    onEstadoChange,
    // Quick navigate
    selectedDate,
    onSelectDate,
    // Navegación ejecutiva (del backend, GLOBAL)
    navegacionEjecutiva,
}) => {
    const [viewMode, setViewMode] = useState('cards');
    const hasContent = !loading && minutas.length > 0;
    const hasPaginator = hasContent && totalPages > 1;

    const dateGroups = useMemo(() => groupByDate(minutas), [minutas]);

    // IDs del backend — GLOBALES, no afectados por filtros
    const ultimaJuntaId = navegacionEjecutiva?.ultimaJuntaId;
    const juntaAnteriorId = navegacionEjecutiva?.juntaAnteriorId;

    return (
        <>
            <div className="px-1 mb-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    Directorio
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 font-medium leading-snug">
                    {estadoFilter === 'ACTIVA' ? 'Minutas activas' : estadoFilter === 'CERRADA' ? 'Cerradas' : 'Todas'}
                </p>
            </div>

            {/* ACCESO RÁPIDO EJECUTIVO MÓVIL ( Diseño Premium Minimalista ) */}
            {ultimaJuntaId && (
                <div className="flex gap-2 w-full mb-3 px-1">
                    <button
                        onClick={() => onViewDetail({ id: ultimaJuntaId })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/40 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                        <Icon name="bolt" size="12px" className="text-emerald-600 animate-pulse" />
                        Junta Actual
                    </button>
                    {juntaAnteriorId && (
                        <button
                            onClick={() => onViewDetail({ id: juntaAnteriorId })}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                        >
                            <Icon name="history" size="12px" className="text-slate-500" />
                            Anterior
                        </button>
                    )}
                </div>
            )}

            {/* Quick Navigate Calendar */}
            <QuickNavigateCalendar
                minutas={minutas}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                className="mb-3"
            />

            {/* Search + filtros */}
            <div className="mb-3 flex flex-col gap-2">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon name="search" size="sm" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar por ID, Título o Tema..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex justify-between items-center w-full">
                    <button
                        onClick={onToggleFilters}
                        style={{
                            ...glassBase(activeFiltersCount > 0 ? 'primary' : 'light'),
                            borderRadius: 14,
                            padding: '6px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        className="active:scale-95 transition-all outline-none"
                    >
                        {activeFiltersCount > 0 && <GlassSheen />}
                        <Icon 
                            name="filter_list" 
                            size="sm" 
                            className={activeFiltersCount > 0 ? "text-white relative z-10" : "text-slate-700 relative z-10"} 
                        />
                        <span className={cn("text-xs font-bold relative z-10", activeFiltersCount > 0 ? "text-white" : "text-slate-700")}>
                            Filtros
                        </span>
                        {activeFiltersCount > 0 && (
                            <span className="absolute top-1 right-1 bg-white text-marca-primario text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold z-20 shadow-sm">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {/* Filtros de Periodo */}
            <TimePeriodSelector
                periodo={periodo}
                year={year}
                month={month}
                estadoFilter={estadoFilter}
                availableYears={availableYears}
                onPeriodoChange={onPeriodoChange}
                onYearChange={onYearChange}
                onMonthChange={onMonthChange}
                onEstadoChange={onEstadoChange}
                className="mb-3"
            />

            <MinutasInlineFilters 
                isOpen={showFilters} 
                filters={filters} 
                onApplyFilters={onApplyFilters} 
                isMobile={true} 
            />

            {viewMode === 'cards' ? (
                <div className={cn('flex flex-col gap-5 pb-24', hasPaginator && 'pb-36')}>
                    {loading ? (
                        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl h-40 animate-pulse" />
                            ))}
                        </div>
                    ) : !hasContent ? (
                        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 mt-4 shadow-sm">
                            <Icon name="event_note" className="text-slate-200 text-5xl mb-3" />
                            <p className="text-slate-500 text-sm font-medium">
                                {estadoFilter === 'ACTIVA' ? 'No hay minutas activas.' : 'No se encontraron minutas.'}
                            </p>
                        </div>
                    ) : (
                        dateGroups.map((group) => (
                            <div key={group.key}>
                                <h2 className="text-lg font-black text-slate-900 fuente-titulos tracking-tight mb-2 pl-1">
                                    {formatDateHeader(group.date)}
                                </h2>
                                <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
                                    {group.minutas.map(minuta => (
                                        <MinutaCard 
                                            key={minuta.id} 
                                            minuta={minuta} 
                                            onViewDetail={onViewDetail}
                                            onEdit={onEdit}
                                            badge={
                                                minuta.id === ultimaJuntaId ? 'current'
                                                : minuta.id === juntaAnteriorId ? 'previous'
                                                : null
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className={cn('pb-24', hasPaginator && 'pb-36')}>
                    <MinutasTable
                        minutas={minutas}
                        loading={loading}
                        page={page}
                        limit={limit}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        sortConfig={sortConfig}
                        onPageChange={onPageChange}
                        onSortChange={onSortChange}
                        onViewDetail={onViewDetail}
                        onEdit={onEdit}
                        ultimaJuntaId={ultimaJuntaId}
                        juntaAnteriorId={juntaAnteriorId}
                    />
                </div>
            )}

            {hasPaginator && (
                <GlassPaginationPill
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={onPageChange}
                    loading={loading}
                    bottom="80px"
                />
            )}

            <GlassFab
                icon="add"
                onClick={onOpenCreate}
                variant="primary"
                size={56}
                bottom={hasPaginator ? '104px' : '84px'}
                right="20px"
            />
            
            <ScrollToTopButton bottom={hasPaginator ? '104px' : '84px'} left="20px" />
        </>
    );
};
