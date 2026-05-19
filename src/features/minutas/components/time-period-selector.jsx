import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * TimePeriodSelector — Filtros de estado + periodo compactos para la barra de búsqueda.
 * Versión compacta: se integra en una sola línea horizontal.
 */

const ESTADO_TABS = [
  { key: 'ACTIVA',  label: 'Activas',  icon: 'radio_button_checked' },
  { key: 'PROGRAMADA', label: 'Por Realizar', icon: 'event_upcoming' },
  { key: 'CERRADA', label: 'Cerradas', icon: 'check_circle' },
  { key: '',        label: 'Todas',    icon: 'list' },
];

const PERIOD_CHIPS = [
  { key: 'all',   label: 'Todo',   icon: 'all_inclusive' },
  { key: 'today', label: 'Hoy',    icon: 'today' },
  { key: 'week',  label: 'Semana', icon: 'date_range' },
  { key: 'month', label: 'Mes',    icon: 'calendar_month' },
];

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export const TimePeriodSelector = ({ 
  periodo = 'all', 
  year, 
  month,
  estadoFilter = 'ACTIVA',
  availableYears = [],
  onPeriodoChange, 
  onYearChange, 
  onMonthChange,
  onEstadoChange,
  className 
}) => {
  const showMonthSelector = periodo === 'month';

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Línea 1: Estado + Periodo + Años — todo inline */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Tabs de estado */}
        <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg">
          {ESTADO_TABS.map((tab) => {
            const isActive = estadoFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onEstadoChange?.(tab.key)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all active:scale-95',
                  isActive
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <Icon name={tab.icon} size="12px" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="w-px h-5 bg-slate-200" />

        {/* Periodo chips */}
        {PERIOD_CHIPS.map((p) => {
          const isActive = periodo === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onPeriodoChange(p.key)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95',
                isActive
                  ? 'bg-marca-primario text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              <Icon name={p.icon} size="12px" />
              {p.label}
            </button>
          );
        })}

        {/* Años inline */}
        {availableYears.length > 0 && (
          <>
            <span className="w-px h-5 bg-slate-200" />
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => {
                  onYearChange(y);
                  if (periodo === 'all' || periodo === 'today' || periodo === 'week') {
                    onPeriodoChange('month');
                  }
                }}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95',
                  year === y
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {y}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Línea 2: Meses — solo si periodo = month */}
      {showMonthSelector && (
        <div className="flex items-center gap-1 animate-in slide-in-from-top-2 fade-in duration-300">
          {MONTHS_SHORT.map((label, i) => {
            const mValue = i + 1;
            const currentMonth = new Date().getMonth() + 1;
            const isActive = month === mValue;
            const isCurrent = mValue === currentMonth;
            return (
              <button
                key={mValue}
                onClick={() => onMonthChange(mValue)}
                className={cn(
                  'px-2 py-1 rounded-md text-[10px] font-bold transition-all active:scale-95',
                  isActive
                    ? 'bg-marca-secundario text-white'
                    : isCurrent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
