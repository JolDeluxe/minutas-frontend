import { useState, useMemo } from 'react';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { TimePeriodSelector } from '../components/time-period-selector';
import { DirectoryKpiBar } from '../components/directory-kpi-bar';
import { QuickNavigateCalendar } from '../components/quick-navigate-calendar';
import { Button, Icon, GlassViewToggle } from '@/components/ui/z_index';

/**
 * Agrupa las minutas por fecha (campo `fecha`) para mostrar encabezados tipo
 * "15 MAY 2026", "14 MAY 2026", etc.
 * El jefe necesita encontrar "la minuta del 28 de marzo" sin pensar.
 */
const groupByDate = (minutas) => {
    const groups = new Map();
    for (const m of minutas) {
        const d = new Date(m.fecha || m.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!groups.has(key)) {
            groups.set(key, { date: d, key, minutas: [] });
        }
        groups.get(key).minutas.push(m);
    }
    // Ordenar por fecha descendente
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
    
    return d.toLocaleDateString('es-MX', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    }).toUpperCase();
};

export const MinutasDesktop = ({
    minutas,
    loading,
    page,
    limit,
    totalPages,
    totalItems,
    sortConfig,
    query,
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

    // Agrupar minutas por fecha
    const dateGroups = useMemo(() => groupByDate(minutas), [minutas]);

    // IDs del backend — GLOBALES, no afectados por filtros
    const ultimaJuntaId = navegacionEjecutiva?.ultimaJuntaId;
    const juntaAnteriorId = navegacionEjecutiva?.juntaAnteriorId;

    return (
        <div className="flex flex-col gap-2 relative">
            
            {/* HEADER: Título + Acciones */}
            <div className="flex justify-between items-end mb-1">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                        Directorio
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        {estadoFilter === 'ACTIVA' 
                            ? 'Minutas activas — pendientes de revisión'
                            : estadoFilter === 'CERRADA'
                                ? 'Minutas cerradas — historial completado'
                                : 'Todas las minutas del sistema'
                        }
                    </p>
                </div>
                
                <Button
                    variant="guardar"
                    icon="add"
                    onClick={onOpenCreate}
                    className="shrink-0"
                >
                    Nueva Minuta
                </Button>
            </div>

            {/* KPI BAR */}
            <DirectoryKpiBar minutas={minutas} loading={loading} />

            {/* QUICK NAVIGATE: Calendario semanal */}
            <QuickNavigateCalendar 
                minutas={minutas}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
            />

            {/* FILA: Search + Filtros rápidos */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm mb-2">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                        <Icon name="search" size="18px" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar por ID, Título o Tema..."
                        className="w-full pl-7 pr-3 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                    />
                </div>

                <span className="w-px h-6 bg-slate-200" />

                {/* Filtro rápido de estado */}
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
                />

                <span className="w-px h-6 bg-slate-200" />
                
                <GlassViewToggle value={viewMode} onChange={setViewMode} />

                <button
                    onClick={onToggleFilters}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all active:scale-95 relative"
                    title="Más filtros"
                >
                    <Icon name="tune" size="18px" />
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-marca-primario text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            <MinutasInlineFilters 
                isOpen={showFilters} 
                filters={filters} 
                onApplyFilters={onApplyFilters} 
                isMobile={false} 
            />

            {/* CONTENIDO: Cards agrupadas por fecha o Tabla */}
            {viewMode === 'cards' ? (
                <div className="flex flex-col gap-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl h-48 animate-pulse" />
                            ))}
                        </div>
                    ) : !hasContent ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                            <Icon name="event_note" className="text-slate-200 text-6xl mb-3" />
                            <p className="text-slate-500 text-sm font-medium">
                                {estadoFilter === 'ACTIVA' 
                                    ? 'No hay minutas activas.' 
                                    : 'No se encontraron minutas.'
                                }
                            </p>
                        </div>
                    ) : (
                        dateGroups.map((group) => (
                            <div key={group.key}>
                                {/* ENCABEZADO DE FECHA — como en el mockup Stitch */}
                                <h2 className="text-xl font-black text-slate-900 fuente-titulos tracking-tight mb-3 pl-1">
                                    {formatDateHeader(group.date)}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                />
            )}
        </div>
    );
};
