import { useMemo, useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { LINEA_MAP } from '../constants';
import { LineIconSelector } from './icons/line-icons';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
};

const getMonthlyDays = (targetDate) => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - daysToSubtract);
  
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
};

const isSameDay = (a, b) => {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
};

const dateToKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getMinutaBadgeStyle = (m, isSelected) => {
  const dept = m.departamento || m.creadoPor?.departamento || 'DISENO';
  const isMarketing = dept === 'MARKETING';
  const lineColor = isMarketing ? '#8b5cf6' : (LINEA_MAP[m.lineaDefault]?.color || '#3b82f6');
  
  if (isSelected) {
    return {
      bgClass: "bg-slate-800 border-slate-700 text-white hover:bg-slate-750",
      iconColor: "#ffffff",
      deptColor: isMarketing ? "#c084fc" : "#60a5fa"
    };
  }
  
  // Statuses are color-coded based on the defined state: Activas = verde, Pendientes/Programadas = azul, Cerradas = gris
  if (m.estado === 'ACTIVA') {
    return {
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-2xs",
      iconColor: lineColor,
      deptColor: lineColor
    };
  } else if (m.estado === 'PROGRAMADA') {
    return {
      bgClass: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-2xs",
      iconColor: lineColor,
      deptColor: lineColor
    };
  } else {
    return {
      bgClass: "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-150 hover:border-slate-250 shadow-2xs",
      iconColor: lineColor,
      deptColor: lineColor
    };
  }
};

const getDayStyle = (minutasDia) => {
  if (minutasDia.length === 0) return undefined;
  
  if (minutasDia.length === 1) {
    const m = minutasDia[0];
    const dept = m.departamento || m.creadoPor?.departamento || 'DISENO';
    const isMarketing = dept === 'MARKETING';
    const lineColor = isMarketing ? '#8b5cf6' : (LINEA_MAP[m.lineaDefault]?.color || '#3b82f6');
    return { 
      backgroundColor: `${lineColor}1c`, // ~11% opacity of the department/line color
      borderColor: `${lineColor}55`,     // ~33% opacity border
      borderWidth: '1.5px' 
    };
  }
  
  // Day with multiple meetings
  const depts = minutasDia.map(m => (m.departamento || m.creadoPor?.departamento || 'DISENO') === 'MARKETING' ? 'MARKETING' : 'DISENO');
  const hasMarketing = depts.includes('MARKETING');
  const hasDiseno = depts.includes('DISENO');
  
  if (hasMarketing && hasDiseno) {
    // Beautiful linear gradient mixing Marketing (purple) and Diseño (blue/line color)
    const mDiseno = minutasDia.find(m => (m.departamento || m.creadoPor?.departamento || 'DISENO') !== 'MARKETING');
    const colorMkt = '#8b5cf6';
    const colorDis = LINEA_MAP[mDiseno?.lineaDefault]?.color || '#3b82f6';
    return {
      background: `linear-gradient(135deg, ${colorMkt}1f 0%, ${colorDis}1f 100%)`,
      borderColor: '#cbd5e1e0',
      borderWidth: '1.5px'
    };
  } else if (hasMarketing) {
    return { 
      backgroundColor: '#8b5cf61c', 
      borderColor: '#8b5cf655', 
      borderWidth: '1.5px' 
    };
  } else {
    const m = minutasDia[0];
    const lineColor = LINEA_MAP[m.lineaDefault]?.color || '#3b82f6';
    return { 
      backgroundColor: `${lineColor}1c`, 
      borderColor: `${lineColor}55`, 
      borderWidth: '1.5px' 
    };
  }
};

const renderCornerIcon = (minutasDia, ultimaJuntaId, juntaAnteriorId) => {
  const hasActual = minutasDia.some(m => m.id === ultimaJuntaId?.[(m.departamento || m.creadoPor?.departamento) === 'MARKETING' ? 'MARKETING' : 'DISENO']);
  const hasAnterior = !hasActual && minutasDia.some(m => m.id === juntaAnteriorId?.[(m.departamento || m.creadoPor?.departamento) === 'MARKETING' ? 'MARKETING' : 'DISENO']);
  
  if (hasActual) {
    return (
      <div 
        className="absolute top-1 right-1 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.55)] border border-amber-300 animate-pulse shrink-0 z-20" 
        title="Junta Actual (Minuta Activa) ⚡"
      >
        <Icon name="bolt" size="10px" className="font-black" />
      </div>
    );
  }
  if (hasAnterior) {
    return (
      <div 
        className="absolute top-1 right-1 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-indigo-600 text-white shadow-[0_0_8px_rgba(79,70,229,0.55)] border border-indigo-400 shrink-0 z-20" 
        title="Junta Anterior 🕒"
      >
        <Icon name="history" size="10px" className="font-black" />
      </div>
    );
  }
  return null;
};

const renderMinutasBadges = (minutasDia, isSelected) => {
  if (minutasDia.length === 0) return <div className="h-6 mt-1" />;
  
  return (
    <div className="flex flex-row flex-wrap justify-center items-center gap-1 w-full mt-1 min-h-6">
      {minutasDia.slice(0, 2).map((m, idx) => {
        const dept = m.departamento || m.creadoPor?.departamento || 'DISENO';
        const isMarketing = dept === 'MARKETING';
        const style = getMinutaBadgeStyle(m, isSelected);
        
        const showText = minutasDia.length === 1;
        const estadoText = m.estado === 'PROGRAMADA' ? 'Programada' : m.estado === 'ACTIVA' ? 'Activa' : 'Cerrada';
        
        return (
          <div 
            key={m.id || idx}
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider shadow-2xs transition-all cursor-pointer shrink-0 max-w-full overflow-hidden",
              style.bgClass
            )}
            title={`MN-${String(m.id).padStart(3, '0')} [${isMarketing ? 'Marketing' : 'Diseño'}]: ${m.titulo} — (${estadoText})`}
          >
            {m.estado === 'ACTIVA' ? (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            ) : m.estado === 'PROGRAMADA' ? (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-slate-450 shrink-0" />
            )}
            
            {isMarketing ? (
              <MarketingIcon size={10} style={{ color: style.iconColor }} className="shrink-0" />
            ) : (
              <LineIconSelector type={m.lineaDefault} size={15} style={{ color: style.iconColor }} className="shrink-0" />
            )}
            
            {showText && (
              <span className="truncate leading-none select-none tracking-tight">
                {estadoText}
              </span>
            )}
          </div>
        );
      })}
      
      {minutasDia.length > 2 && (
        <span className={cn(
          "text-[8px] font-black font-mono leading-none ml-0.5 shrink-0",
          isSelected ? "text-slate-300" : "text-slate-600"
        )}>
          +{minutasDia.length - 2}
        </span>
      )}
    </div>
  );
};

export const QuickNavigateCalendar = ({ 
  minutas = [], 
  selectedDate,
  onSelectDate,
  
  // Period & Date range states from parent page
  periodo = 'all',
  year = null,
  month = null,
  availableYears = [],
  onPeriodoChange,
  onYearChange,
  onMonthChange,
  
  filters = {},
  onApplyFilters,
  ultimaJuntaId = null,
  juntaAnteriorId = null,
  activeDept = null,
  className 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [calendarView, setCalendarView] = useState('weekly'); // 'weekly' | 'monthly'

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Initialize the calendar starting on Monday of the current week
  const [baseDate, setBaseDate] = useState(() => {
    return getMonday(today);
  });

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);

  const monthlyDays = useMemo(() => {
    return getMonthlyDays(baseDate);
  }, [baseDate]);

  // Map dates to minutas for icons
  const minutasPorFecha = useMemo(() => {
    const map = new Map();
    for (const m of minutas) {
      if (m.estado === 'CANCELADA' || m.estado === 'EN_REVISION') continue;
      const d = new Date(m.fechaRealizada || m.fechaProgramada || m.createdAt);
      if (!isNaN(d.getTime())) {
        const key = dateToKey(d);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(m);
      }
    }
    return map;
  }, [minutas]);

  // Synchronize baseDate with year/month when they change from the parent filter dropdowns
  useEffect(() => {
    if (year !== null || month !== null) {
      const currentYear = year ?? today.getFullYear();
      const currentMonth = month ? (month - 1) : today.getMonth();
      const targetDate = new Date(currentYear, currentMonth, 1);
      
      if (targetDate.getFullYear() !== baseDate.getFullYear() || targetDate.getMonth() !== baseDate.getMonth()) {
        const d = new Date(targetDate);
        if (calendarView === 'weekly') {
          setBaseDate(getMonday(d));
          return;
        }
        setBaseDate(d);
      }
    }
  }, [year, month, calendarView, today]);

  // Synchronize baseDate with selectedDate when a date is selected from outside
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        if (calendarView === 'weekly') {
          const start = getMonday(d);
          if (start.getTime() !== baseDate.getTime()) {
            setBaseDate(start);
          }
        } else {
          if (d.getFullYear() !== baseDate.getFullYear() || d.getMonth() !== baseDate.getMonth()) {
            setBaseDate(new Date(d.getFullYear(), d.getMonth(), 1));
          }
        }
      }
    }
  }, [selectedDate, calendarView]);

  const handlePrevWeek = () => {
    const newBase = new Date(baseDate);
    newBase.setDate(newBase.getDate() - 7);
    setBaseDate(newBase);
  };

  const handleNextWeek = () => {
    const newBase = new Date(baseDate);
    newBase.setDate(newBase.getDate() + 7);
    setBaseDate(newBase);
  };

  const handlePrevMonth = () => {
    const newBase = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
    setBaseDate(newBase);
    if (periodo === 'month') {
      onMonthChange?.(newBase.getMonth() + 1);
      onYearChange?.(newBase.getFullYear());
    } else if (periodo === 'year') {
      onYearChange?.(newBase.getFullYear());
    }
  };

  const handleNextMonth = () => {
    const newBase = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
    setBaseDate(newBase);
    if (periodo === 'month') {
      onMonthChange?.(newBase.getMonth() + 1);
      onYearChange?.(newBase.getFullYear());
    } else if (periodo === 'year') {
      onYearChange?.(newBase.getFullYear());
    }
  };

  const hasActiveFilters = selectedDate || filters.fechaDesde || filters.fechaHasta || (periodo !== 'all' && periodo !== 'today');

  // Format single label of active filters to show in collapsed state
  const activeFilterLabel = useMemo(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      return `Día: ${d.getDate()} ${d.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase().replace('.', '')}`;
    }
    if (filters.fechaDesde || filters.fechaHasta) {
      const fd = filters.fechaDesde ? new Date(filters.fechaDesde + 'T00:00:00') : null;
      const fh = filters.fechaHasta ? new Date(filters.fechaHasta + 'T23:59:59') : null;
      const labelD = fd ? fd.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '...';
      const labelH = fh ? fh.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '...';
      return `Rango: ${labelD} - ${labelH}`;
    }
    if (periodo !== 'all') {
      const pLabel = periodo === 'today' ? 'Hoy' : periodo === 'week' ? 'Esta Semana' : periodo === 'month' ? 'Mensual' : 'Anual';
      let extra = '';
      if (periodo === 'month' && month) {
        const dateMonth = new Date(2026, month - 1, 1);
        extra = ` (${dateMonth.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}`;
        if (year) extra += ` ${year}`;
        extra += ')';
      } else if (year) {
        extra = ` (${year})`;
      }
      return `${pLabel}${extra}`;
    }
    return 'Ninguno';
  }, [selectedDate, filters.fechaDesde, filters.fechaHasta, periodo, year, month]);

  const handleClearAll = () => {
    onApplyFilters?.({ ...filters, fechaDesde: '', fechaHasta: '' });
    onPeriodoChange?.('all');
    onSelectDate?.(null);
  };

  const handleSelectDay = (day) => {
    onApplyFilters?.({ ...filters, fechaDesde: '', fechaHasta: '' });
    onSelectDate?.(day);
  };

  const handleRangeChange = (field, value) => {
    onSelectDate?.(null);
    onApplyFilters?.({ ...filters, [field]: value });
  };
  return (
    <div className={cn("mb-3 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all overflow-hidden", className)}>
      
      {/* 1. COLLAPSED HEADER BAR */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between py-2 px-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <Icon name="calendar_month" size="16px" className={cn("transition-colors", hasActiveFilters ? "text-marca-primario" : "text-slate-400")} />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
            Calendario y Filtros de Fecha
          </span>
          
          {hasActiveFilters ? (
            <span className="inline-flex items-center gap-1 bg-marca-primario/10 text-marca-primario text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-marca-primario/20 shadow-xs animate-pulseFast">
              <span className="w-1.5 h-1.5 rounded-full bg-marca-primario"></span>
              {activeFilterLabel}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">
              (Historial completo)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all flex items-center gap-0.5"
              title="Limpiar todos los filtros de fecha"
            >
              <Icon name="close" size="12px" />
              Limpiar
            </button>
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center"
          >
            <Icon name={isExpanded ? "expand_less" : "expand_more"} size="18px" />
          </button>
        </div>
      </div>

      {/* 2. EXPANDED PANEL */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-3 bg-white space-y-4 animate-fadeIn">
          
          {/* A. NAVIGATION CALENDAR BAR AND SWITCHER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Icon name="event" size="11px" />
                {calendarView === 'weekly' ? 'Vista Semanal' : 'Vista Mensual'}
              </span>
              
              {/* Month / Year — prominent center label */}
              <span className="text-base font-extrabold text-slate-800 tracking-tight fuente-titulos capitalize">
                {baseDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
              </span>

              {/* View switcher */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 shadow-inner shrink-0">
                <button
                  type="button"
                  onClick={() => setCalendarView('weekly')}
                  className={cn(
                    "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                    calendarView === 'weekly' 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Semana
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarView('monthly')}
                  className={cn(
                    "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                    calendarView === 'monthly' 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Mes
                </button>
              </div>
            </div>
            
            {calendarView === 'weekly' ? (
              <div className="flex items-center gap-1.5">
                {/* Prev Week Button */}
                <button 
                  type="button"
                  onClick={handlePrevWeek} 
                  className="h-10 w-7 flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-90 shadow-xs shrink-0"
                  title="Semana anterior"
                >
                  <Icon name="chevron_left" size="18px" />
                </button>

                {/* Days Row */}
                <div className="flex flex-1 gap-1 overflow-hidden">
                  {weekDays.map((day) => {
                    const key = dateToKey(day);
                    const isToday = isSameDay(day, today);
                    const minutasDia = minutasPorFecha.get(key) || [];
                    const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
                    const isPast = day < today && !isToday;
                    const isWknd = day.getDay() === 0 || day.getDay() === 6;
                    
                    const dayStyle = getDayStyle(minutasDia);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        style={!isSelected && minutasDia.length > 0 ? dayStyle : undefined}
                        className={cn(
                          'flex-1 flex flex-col items-center py-1 px-0.5 rounded-xl border transition-all active:scale-95 relative min-w-0',
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-slate-900 scale-102 z-10'
                            : isToday
                              ? 'bg-marca-primario/5 text-marca-primario border-marca-primario/30 shadow-xs ring-1 ring-marca-primario/20'
                              : minutasDia.length > 0
                                ? 'bg-slate-50/50 text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-xs'
                                : isWknd
                                  ? 'bg-slate-100/80 text-slate-400 border-slate-200/40 hover:border-slate-300 hover:bg-white/80'
                                  : 'bg-slate-50/50 text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-xs',
                          isPast && !isSelected && 'opacity-85'
                        )}
                      >
                        {renderCornerIcon(minutasDia, ultimaJuntaId, juntaAnteriorId)}
                        {/* Weekday abbreviation */}
                        <span className={cn(
                          'text-[8px] font-bold uppercase tracking-wider leading-none',
                          isSelected ? 'text-slate-300' : isToday ? 'text-marca-primario/80' : 'text-slate-400'
                        )}>
                          {DIAS_SEMANA[(day.getDay() + 6) % 7]}
                        </span>

                        {/* Day Number */}
                        <span className={cn(
                          'text-xs font-black font-mono leading-none my-0.5',
                          isSelected ? 'text-white' : isToday ? 'text-marca-primario' : 'text-slate-800'
                        )}>
                          {day.getDate()}
                        </span>

                        {/* Month abbreviation */}
                        <span className={cn(
                          'text-[7px] font-semibold leading-none',
                          isSelected ? 'text-slate-400' : 'text-slate-400'
                        )}>
                          {day.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase().replace('.', '')}
                        </span>

                        {/* Minutas indicators: LED badges for state and department */}
                        {renderMinutasBadges(minutasDia, isSelected)}
                      </button>
                    );
                  })}
                </div>

                {/* Next Week Button */}
                <button 
                  type="button"
                  onClick={handleNextWeek} 
                  className="h-10 w-7 flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-90 shadow-xs shrink-0"
                  title="Semana siguiente"
                >
                  <Icon name="chevron_right" size="18px" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Prev Month Button */}
                <button 
                  type="button"
                  onClick={handlePrevMonth} 
                  className="h-12 w-7 flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-90 shadow-xs shrink-0"
                  title="Mes anterior"
                >
                  <Icon name="chevron_left" size="18px" />
                </button>

                {/* Monthly Grid */}
                <div className="flex-1 flex flex-col gap-1">
                  {/* Grid Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DIAS_SEMANA.map((dayName) => (
                      <span key={dayName} className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none py-1">
                        {dayName}
                      </span>
                    ))}
                  </div>

                  {/* Grid 42 Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthlyDays.map((day) => {
                      const key = dateToKey(day);
                      const isToday = isSameDay(day, today);
                      const minutasDia = minutasPorFecha.get(key) || [];
                      const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
                      const isCurrentMonth = day.getMonth() === baseDate.getMonth();
                      const isPast = day < today && !isToday;
                      const isWknd = day.getDay() === 0 || day.getDay() === 6;

                      const dayStyle = getDayStyle(minutasDia);

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          style={!isSelected && minutasDia.length > 0 ? dayStyle : undefined}
                          className={cn(
                            'flex flex-col items-center py-1.5 px-0.5 rounded-xl border transition-all active:scale-95 relative min-w-0 h-16 justify-between',
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-slate-900 z-10'
                              : isToday
                                ? 'bg-marca-primario/5 text-marca-primario border-marca-primario/30 shadow-xs ring-1 ring-marca-primario/20'
                                : minutasDia.length > 0
                                  ? (isCurrentMonth
                                      ? 'bg-slate-50/50 text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-xs'
                                      : 'bg-slate-100/30 text-slate-400 border-dashed border-slate-200/50 opacity-40 hover:bg-white')
                                  : isWknd
                                    ? (isCurrentMonth
                                        ? 'bg-slate-100/80 text-slate-400 border-slate-200/50 hover:border-slate-200/50 hover:bg-slate-200/50 hover:text-slate-600 scale-[0.85] opacity-60'
                                        : 'bg-slate-200/30 text-slate-400 border-dashed border-slate-200/30 opacity-30 scale-[0.85]')
                                    : isCurrentMonth
                                      ? 'bg-slate-50/50 text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-xs'
                                      : 'bg-slate-100/30 text-slate-400 border-dashed border-slate-200/50 opacity-40 hover:bg-white hover:opacity-80',
                            isPast && !isSelected && isCurrentMonth && 'opacity-85'
                          )}
                        >
                          {renderCornerIcon(minutasDia, ultimaJuntaId, juntaAnteriorId)}
                          <span className={cn(
                            'text-xs font-black font-mono leading-none',
                            isSelected ? 'text-white' : isToday ? 'text-marca-primario' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                          )}>
                            {day.getDate()}
                          </span>

                          {renderMinutasBadges(minutasDia, isSelected)}

                          <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-wide font-mono scale-90">
                            {day.toLocaleDateString('es-MX', { month: 'short' }).substring(0, 3).toUpperCase().replace('.', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Month Button */}
                <button 
                  type="button"
                  onClick={handleNextMonth} 
                  className="h-12 w-7 flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-90 shadow-xs shrink-0"
                  title="Mes siguiente"
                >
                  <Icon name="chevron_right" size="18px" />
                </button>
              </div>
            )}
          </div>

          {/* B. DATE RANGE & ADVANCED FILTERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-[40%_1fr] gap-4 pt-3 border-t border-slate-100">
            
            {/* COLUMN 1: CUSTOM DATE RANGE PICKER */}
            <div className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-3 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Icon name="date_range" size="12px" className="text-indigo-500" />
                Rango de Fechas
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Desde</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={filters.fechaDesde || ''}
                      onChange={(e) => handleRangeChange('fechaDesde', e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl p-2.5 md:p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-marca-primario/30 focus:border-marca-primario text-slate-700"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Hasta</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={filters.fechaHasta || ''}
                      onChange={(e) => handleRangeChange('fechaHasta', e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl p-2.5 md:p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-marca-primario/30 focus:border-marca-primario text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: PERIOD / MONTH / YEAR SELECTORS */}
            <div className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-3 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Icon name="calendar_month" size="12px" className="text-amber-500" />
                Periodo, Año y Mes
              </span>
              
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Periodo</label>
                  <select 
                    value={periodo} 
                    onChange={(e) => {
                      onSelectDate?.(null);
                      onPeriodoChange?.(e.target.value);
                    }}
                    className="w-full text-xs md:text-[11px] font-bold bg-white border border-slate-200 rounded-xl p-2.5 md:p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-marca-primario/30 focus:border-marca-primario text-slate-700 appearance-none"
                  >
                    <option value="all">Historial completo</option>
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Mensual</option>
                    <option value="year">Anual</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Año</label>
                  <select 
                    value={year || ''} 
                    disabled={periodo !== 'month' && periodo !== 'year'}
                    onChange={(e) => {
                      onSelectDate?.(null);
                      onYearChange?.(e.target.value ? Number(e.target.value) : null);
                    }}
                    className="w-full text-xs md:text-[11px] font-bold bg-white border border-slate-200 rounded-xl p-2.5 md:p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-marca-primario/30 focus:border-marca-primario text-slate-700 disabled:opacity-50 disabled:bg-slate-100 appearance-none"
                  >
                    <option value="">(Año)</option>
                    {availableYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Mes</label>
                  <select 
                    value={month || ''} 
                    disabled={periodo !== 'month'}
                    onChange={(e) => {
                      onSelectDate?.(null);
                      onMonthChange?.(e.target.value ? Number(e.target.value) : null);
                    }}
                    className="w-full text-xs md:text-[11px] font-bold bg-white border border-slate-200 rounded-xl p-2.5 md:p-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-marca-primario/30 focus:border-marca-primario text-slate-700 disabled:opacity-50 disabled:bg-slate-100 appearance-none"
                  >
                    <option value="">(Mes)</option>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(2026, i, 1).toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* C. BOTTOM ACTIONS ROW */}
          <div className="pt-2 flex justify-between items-center">
            {hasActiveFilters ? (
              <button
                onClick={handleClearAll}
                className="px-4 py-2.5 md:py-2 text-[11px] md:text-xs font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <Icon name="block" size="14px" />
                <span className="hidden sm:inline">Limpiar todos los filtros</span>
                <span className="sm:hidden">Limpiar</span>
              </button>
            ) : (
              <div className="text-[10px] text-slate-400 font-bold hidden sm:block">
                * Filtros inactivos: mostrando todas las fechas.
              </div>
            )}
            
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2.5 md:py-2 text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ml-auto"
            >
              <Icon name="close" size="14px" />
              Cerrar
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
