// minutas-frontend\src\features\minutas\views\minutas-mobile.jsx

import { useState, useMemo } from 'react';
import { Button, GlassFab, GlassPaginationPill, GlassViewToggle, ScrollToTopButton, Icon } from '@/components/ui/z_index';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { QuickNavigateCalendar } from '../components/quick-navigate-calendar';
import { DirectoryKpiBar } from '../components/directory-kpi-bar';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';

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
}) => {
    const { user } = useAuthStore();
    const [viewMode, setViewModeState] = useState(() => {
        return localStorage.getItem('minutas_view_mode') || 'table';
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

    const dateGroups = useMemo(() => groupByDate(displayMinutas), [displayMinutas]);

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
                    Directorio
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 font-medium leading-snug">
                    {estadoFilter === 'ACTIVA' ? 'Minutas activas' : estadoFilter === 'CERRADA' ? 'Cerradas' : 'Todas'}
                </p>
            </div>

            {isAdmin && (
                <div className="flex items-center mx-1 mb-3 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                    {['TODAS', 'DISEÑO', 'MARKETING'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => setDepartamentoGlobal(opt)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                departamentoGlobal === opt 
                                    ? 'bg-white text-marca-primario shadow-sm ring-1 ring-slate-200/50' 
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
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

            {/* 🌟 BARRA ULTRA PREMIUM: STICKY + LIQUID GLASS FILTER BOARD */}
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
                <div className={cn('flex flex-col gap-5 pb-24 px-1', hasPaginator && 'pb-36')}>
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
                        isAdmin={isAdmin}
                        ultimaJuntaId={ultimaJuntaId}
                        juntaAnteriorId={juntaAnteriorId}
                        hidePagination={true}
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