import { useState, useMemo } from 'react';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { DirectoryKpiBar } from '../components/directory-kpi-bar';
import { QuickNavigateCalendar } from '../components/quick-navigate-calendar';
import { Button, Icon, GlassViewToggle } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { DisenoIcon, MarketingIcon } from '../components/icons/line-icons';
import {cn} from '@/utils/cn';

const groupByStatusCategory = (minutas) => {
    const groups = [
        {
            key: 'PROCESO',
            label: 'Juntas en Proceso',
            color: 'bg-emerald-500',
            minutas: []
        },
        {
            key: 'PROGRAMADAS',
            label: 'Juntas Programadas',
            color: 'bg-blue-500',
            minutas: []
        },
        {
            key: 'HISTORIAL',
            label: 'Historial de Juntas',
            color: 'bg-slate-400',
            minutas: []
        }
    ];

    for (const m of minutas) {
        const status = m.estado?.toUpperCase() || 'PROGRAMADA';
        if (['EN_CURSO', 'EN_ORGANIZACION', 'ACTIVA'].includes(status)) {
            groups[0].minutas.push(m);
        } else if (status === 'PROGRAMADA') {
            groups[1].minutas.push(m);
        } else {
            groups[2].minutas.push(m);
        }
    }

    return groups.filter(g => g.minutas.length > 0);
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
    onCancel,
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
        const saved = localStorage.getItem('minutas_view_mode');
        if (saved) return saved;
        return window.innerWidth >= 1024 ? 'table' : 'cards';
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

    // Agrupar minutas filtradas por categoría de estado
    const statusGroups = useMemo(() => groupByStatusCategory(displayMinutas), [displayMinutas]);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                        Minutas
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
                    <div className="flex-shrink-0 flex justify-center py-1 animate-in fade-in duration-300">
                        <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/50 shadow-inner max-w-xs backdrop-blur-md">
                            {['DISEÑO', 'MARKETING'].map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setDepartamentoGlobal(opt)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        departamentoGlobal === opt 
                                            ? `bg-white shadow-sm ring-1 ring-slate-200/50 font-bold ${opt === 'MARKETING' ? 'text-purple-600' : 'text-blue-600'}` 
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                                    }`}
                                >
                                    {opt === 'DISEÑO' && <DisenoIcon size={14} />}
                                    {opt === 'MARKETING' && <MarketingIcon size={14} />}
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex flex-1 items-center gap-2 justify-end shrink-0">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-[1.5rem] h-44 animate-pulse" />
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
                        statusGroups.map((group) => (
                            <div key={group.key} className="mb-8">
                                <h2 className="text-xl font-black text-slate-900 fuente-titulos tracking-tight mb-4 pl-1 flex items-center gap-3">
                                    <span className={cn("w-1.5 h-6 rounded-full", group.color)} />
                                    {group.label}
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full ml-1 shrink-0">
                                        {group.minutas.length}
                                    </span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {group.minutas.map(minuta => (
                                        <MinutaCard 
                                            key={minuta.id} 
                                            minuta={minuta} 
                                            onViewDetail={onViewDetail}
                                            onEdit={onEdit}
                                            onCancel={onCancel}
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
                    onCancel={onCancel}
                    isAdmin={isAdmin}
                    ultimaJuntaId={ultimaJuntaId}
                    juntaAnteriorId={juntaAnteriorId}
                />
            )}
        </div>
    );
};
