import { useState, useMemo } from 'react';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { DirectoryKpiBar } from '../components/directory-kpi-bar';
import { QuickNavigateCalendar } from '../components/quick-navigate-calendar';
import { Button, Icon, GlassViewToggle } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Agrupa las minutas por fecha (campo `fecha`) para mostrar encabezados tipo
 * "15 MAY 2026", "14 MAY 2026", etc.
 * El jefe necesita encontrar "la minuta del 28 de marzo" sin pensar.
 */
const groupByDate = (minutas) => {
    const groups = new Map();
    for (const m of minutas) {
        const d = new Date(m.fechaRealizada || m.fechaProgramada || m.createdAt);
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
    // Global Filter
    departamentoGlobal,
    setDepartamentoGlobal,
}) => {
    const { user } = useAuthStore();
    const [viewMode, setViewModeState] = useState(() => {
        return localStorage.getItem('minutas_view_mode') || 'table';
    });

    const setViewMode = (mode) => {
        setViewModeState(mode);
        localStorage.setItem('minutas_view_mode', mode);
    };

    // Filtrar por selectedDate SOLO para las tarjetas/tabla, no para el calendario
    const displayMinutas = useMemo(() => {
        if (!selectedDate) return minutas;
        return minutas.filter(m => {
            const d = new Date(m.fechaRealizada || m.fechaProgramada || m.createdAt);
            const sel = new Date(selectedDate);
            return d.getFullYear() === sel.getFullYear() && 
                   d.getMonth() === sel.getMonth() && 
                   d.getDate() === sel.getDate();
        });
    }, [minutas, selectedDate]);

    const hasContent = !loading && displayMinutas.length > 0;

    // Agrupar minutas filtradas por fecha
    const dateGroups = useMemo(() => groupByDate(displayMinutas), [displayMinutas]);

    const currentUser = user?.data || user;
    const isAdmin = currentUser?.rol === 'ADMIN' || currentUser?.rol === 'SUPER_ADMIN';
    const userDept = currentUser?.departamento === 'DISEÑO' ? 'DISENO' : currentUser?.departamento;

    const activeDept = isAdmin
        ? (departamentoGlobal === 'DISEÑO' ? 'DISENO' : departamentoGlobal === 'MARKETING' ? 'MARKETING' : null)
        : userDept;

    // IDs del backend por departamento
    const ultimaJuntaId = navegacionEjecutiva?.ultimaJuntaId;
    const juntaAnteriorId = navegacionEjecutiva?.juntaAnteriorId;

    const currentJuntaId = activeDept ? ultimaJuntaId?.[activeDept] : null;
    const prevJuntaId = activeDept ? juntaAnteriorId?.[activeDept] : null;

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
                
                {isAdmin && (
                    <div className="flex items-center self-center mx-4 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                        {['TODAS', 'DISEÑO', 'MARKETING'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setDepartamentoGlobal(opt)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    departamentoGlobal === opt 
                                        ? 'bg-white text-marca-primario shadow-sm ring-1 ring-slate-200/50' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {/* Atajos Ejecutivos de Dirección */}
                    {currentJuntaId && (
                        <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/50 p-1 rounded-xl mr-1">
                            <button
                                onClick={() => onViewDetail({ id: currentJuntaId })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200/50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                                title="Ver Junta Actual"
                            >
                                <Icon name="bolt" size="12px" className="text-emerald-600 animate-pulse" />
                                Junta Actual
                            </button>
                            {prevJuntaId && (
                                <button
                                    onClick={() => onViewDetail({ id: prevJuntaId })}
                                    className="flex-1 flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                                    title="Ver Junta Anterior"
                                >
                                    <Icon name="history" size="12px" className="text-slate-500" />
                                    Anterior
                                </button>
                            )}
                        </div>
                    )}

                    <Button
                        variant="guardar"
                        icon="add"
                        onClick={onOpenCreate}
                        className="shrink-0"
                    >
                        Nueva Minuta
                    </Button>
                </div>
            </div>

            {/* KPI BAR */}
            <DirectoryKpiBar 
                minutas={minutas} 
                loading={loading} 
                departamentoGlobal={departamentoGlobal}
                isAdmin={isAdmin}
            />

            {/* QUICK NAVIGATE: Calendario semanal */}
            <QuickNavigateCalendar 
                minutas={minutas}
                ultimaJuntaId={ultimaJuntaId}
                juntaAnteriorId={juntaAnteriorId}
                activeDept={activeDept}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                periodo={periodo}
                year={year}
                month={month}
                availableYears={availableYears}
                onPeriodoChange={onPeriodoChange}
                onYearChange={onYearChange}
                onMonthChange={onMonthChange}
                filters={filters}
                onApplyFilters={onApplyFilters}
            />

            {/* FILA: Search + Filtros rápidos */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm mb-2">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                        <Icon name="search" size="18px" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar por ID, Título o Tema..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                    />
                </div>

                <span className="w-px h-6 bg-slate-200" />

                <button
                    onClick={onToggleFilters}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                    title="Filtros Avanzados"
                >
                    <Icon name="tune" size="16px" />
                    <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-marca-primario text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold ml-1">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                <div className="flex-1" /> {/* Spacer */}
                
                <GlassViewToggle value={viewMode} onChange={setViewMode} />
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
                                            isAdmin={isAdmin}
                                            badge={
                                                ultimaJuntaId && (minuta.id === (
                                                    (minuta.departamento || minuta.creadoPor?.departamento) === 'MARKETING'
                                                        ? ultimaJuntaId.MARKETING
                                                        : ultimaJuntaId.DISENO
                                                ))
                                                    ? 'current'
                                                    : juntaAnteriorId && (minuta.id === (
                                                        (minuta.departamento || minuta.creadoPor?.departamento) === 'MARKETING'
                                                            ? juntaAnteriorId.MARKETING
                                                            : juntaAnteriorId.DISENO
                                                    ))
                                                        ? 'previous'
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
                    minutas={displayMinutas}
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
                    isAdmin={isAdmin}
                    ultimaJuntaId={ultimaJuntaId}
                    juntaAnteriorId={juntaAnteriorId}
                />
            )}
        </div>
    );
};
