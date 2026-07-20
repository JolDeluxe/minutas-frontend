// minutas-frontend\src\features\minutas\views\minutas-mobile.jsx

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { GlassFab, GlassPaginationPill, GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { Icon } from '@/components/ui/icon';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { QuickNavigateCalendar } from '../components/quick-navigate-calendar';
import { DirectoryKpiBar } from '../components/directory-kpi-bar';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { DisenoIcon, MarketingIcon } from '../components/icons/line-icons';

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
    onCancel,
    filters,
    showFilters,
    onToggleFilters,
    onApplyFilters,
    activeFiltersCount,
    periodo,
    year,
    month,
    estadoFilter,
    availableYears,
    onPeriodoChange,
    onYearChange,
    onMonthChange,
    onEstadoChange,
    selectedDate,
    onSelectDate,
    navegacionEjecutiva,
    departamentoGlobal,
    setDepartamentoGlobal,
    isExterna,
    onDownloadPdf,
    isGeneratingPdf,
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
    const hasPaginator = hasContent && totalPages > 1;

    const statusGroups = useMemo(() => groupByStatusCategory(displayMinutas), [displayMinutas]);

    const currentUser = user?.data || user;
    const isAdmin = currentUser?.rol === 'ADMIN' || currentUser?.rol === 'SUPER_ADMIN';
    const userDept = currentUser?.departamento === 'DISEÑO' ? 'DISENO' : currentUser?.departamento;

    const activeDept = isAdmin
        ? (departamentoGlobal === 'DISEÑO' ? 'DISENO' : departamentoGlobal === 'MARKETING' ? 'MARKETING' : null)
        : userDept;

    const ultimaJuntaId = navegacionEjecutiva?.ultimaJuntaId;
    const juntaAnteriorId = navegacionEjecutiva?.juntaAnteriorId;

    const currentJuntaId = activeDept ? ultimaJuntaId?.[activeDept] : null;
    const prevJuntaId = activeDept ? juntaAnteriorId?.[activeDept] : null;

    return (
        <>
            {/* Elementos Estáticos de Cabecera */}
            <div className="px-1 mb-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    {departamentoGlobal === 'EXTERNO' ? 'Minutas Externas' : 'Directorio'}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 font-medium leading-snug">
                    {departamentoGlobal === 'EXTERNO' 
                        ? (estadoFilter === 'CERRADA' ? 'Cerradas' : 'Todas')
                        : (estadoFilter === 'ACTIVA' ? 'Minutas activas' : estadoFilter === 'CERRADA' ? 'Cerradas' : 'Todas')
                    }
                </p>
            </div>

            {isAdmin && (
                <div className="flex items-center mx-1 mb-3 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                    {['DISEÑO', 'MARKETING', 'EXTERNO'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => setDepartamentoGlobal(opt)}
                            className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-[10px] font-black tracking-wider uppercase rounded-lg transition-all ${
                                departamentoGlobal === opt
                                    ? `bg-white shadow-sm ring-1 ring-slate-200/50 ${opt === 'MARKETING' ? 'text-purple-600' : opt === 'EXTERNO' ? 'text-amber-600' : 'text-blue-600'}`
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {opt === 'DISEÑO' && <DisenoIcon size={14} />}
                            {opt === 'MARKETING' && <MarketingIcon size={14} />}
                            {opt === 'EXTERNO' && <Icon name="domain" size="14px" />}
                            {opt}
                        </button>
                    ))}
                </div>
            )}
            <div className="px-1 mb-1">
                <DirectoryKpiBar 
                    minutas={displayMinutas} 
                    loading={loading} 
                    departamentoGlobal={departamentoGlobal}
                    isAdmin={isAdmin}
                    isExterna={departamentoGlobal === 'EXTERNO'}
                />
            </div>

            {currentJuntaId && (
                <div className="flex gap-2 w-full mb-3 px-1">
                    <button
                        onClick={() => onViewDetail({ id: currentJuntaId })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/40 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                        <Icon name="bolt" size="12px" className="text-emerald-600 animate-pulse" />
                        Junta Actual
                    </button>
                    {prevJuntaId && (
                        <button
                            onClick={() => onViewDetail({ id: prevJuntaId })}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                        >
                            <Icon name="history" size="12px" className="text-slate-500" />
                            Anterior
                        </button>
                    )}
                </div>
            )}

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
                className="mb-3 mx-1"
            />

            <div className="sticky top-0 z-30 bg-white/40 backdrop-blur-lg px-1 py-2 mb-3 rounded-2xl border border-white/40 shadow-sm flex flex-col gap-2 transition-all duration-300">
                
                {/* Caja del Buscador con diseño limpio */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon name="search" size="sm" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar por ID, Título o Tema..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200/70 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400 shadow-inner"
                    />
                </div>

                {/* Fila de Botones de control */}
                <div className="flex justify-between items-center w-full px-0.5">
                    <button
                        onClick={onToggleFilters}
                        style={{
                            ...glassBase(showFilters || activeFiltersCount > 0 ? 'primary' : 'light'),
                            borderRadius: 14,
                            padding: '7px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        className="active:scale-95 transition-all outline-none border border-slate-200/50 shadow-sm"
                    >
                        {(showFilters || activeFiltersCount > 0) && <GlassSheen />}
                        <Icon 
                            name="filter_list" 
                            size="sm" 
                            className={showFilters || activeFiltersCount > 0 ? "text-white relative z-10" : "text-slate-700 relative z-10"} 
                        />
                        <span className={cn("text-xs font-bold relative z-10", showFilters || activeFiltersCount > 0 ? "text-white" : "text-slate-700")}>
                            Filtros Avanzados
                        </span>
                        {activeFiltersCount > 0 && (
                            <span className="absolute top-1 right-1 bg-white text-marca-primario text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold z-20 shadow-sm">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                    
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                </div>

                {/* El panel expansible inyectado internamente para que comparta el contexto Sticky */}
                <MinutasInlineFilters 
                    isOpen={showFilters} 
                    filters={filters} 
                    onApplyFilters={onApplyFilters} 
                    isMobile={true} 
                />
            </div>

            {/* Listado de Contenido (Cards / Tabla) */}
            {viewMode === 'cards' ? (
                <div className={cn('flex flex-col gap-6 pb-24 px-1', hasPaginator && 'pb-36')}>
                    {loading ? (
                        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-[1.5rem] h-44 animate-pulse" />
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
                        statusGroups.map((group) => (
                            <div key={group.key} className="mb-6">
                                <h2 className="text-lg font-black text-slate-900 fuente-titulos tracking-tight mb-3 pl-1 flex items-center gap-2.5">
                                    <span className={cn("w-1 h-5 rounded-full", group.color)} />
                                    {group.label}
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1 shrink-0">
                                        {group.minutas.length}
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-4">
                                    {group.minutas.map(minuta => (
                                        <MinutaCard 
                                            key={minuta.id} 
                                            minuta={minuta} 
                                            onViewDetail={onViewDetail}
                                            onEdit={onEdit}
                                            onCancel={onCancel}
                                            isAdmin={isAdmin}
                                            onDownloadPdf={isExterna ? () => onDownloadPdf(minuta) : undefined}
                                            isGeneratingPdf={isGeneratingPdf === minuta.id}
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
                <div className={cn('pb-24 px-1', hasPaginator && 'pb-36')}>
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
                        hidePagination={true}
                        isExterna={isExterna}
                        onDownloadPdf={isExterna ? onDownloadPdf : undefined}
                        isGeneratingPdf={isGeneratingPdf}
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