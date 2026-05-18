import { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * QuickNavigateCalendar — Tira de calendario semanal para saltar a fechas.
 * Muestra los 7 días de la semana actual con un punto en los días que tienen minutas.
 * El jefe toca un día y ve las minutas de ese día.
 *
 * Inspirado en el "QUICK NAVIGATE" del mockup Google Stitch.
 */

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const getWeekDays = (referenceDate) => {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }
  return days;
};

const isSameDay = (a, b) => {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
};

export const QuickNavigateCalendar = ({ 
  minutas = [], 
  selectedDate,
  onSelectDate,
  onViewFullCalendar,
  className 
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Semana actual como referencia
  const weekDays = useMemo(() => getWeekDays(today), [today]);

  // Set de fechas (como string yyyy-mm-dd) que tienen minutas
  const datesWithMinutas = useMemo(() => {
    const set = new Set();
    for (const m of minutas) {
      const d = new Date(m.fecha || m.createdAt);
      if (!isNaN(d.getTime())) {
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
    }
    return set;
  }, [minutas]);

  const dateToKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Navegación Rápida
        </span>
        {onViewFullCalendar && (
          <button 
            onClick={onViewFullCalendar}
            className="text-[10px] font-bold text-marca-primario hover:underline"
          >
            Ver Calendario Completo
          </button>
        )}
      </div>

      <div className="flex gap-1.5">
        {weekDays.map((day) => {
          const key = dateToKey(day);
          const isToday = isSameDay(day, today);
          const hasMinutas = datesWithMinutas.has(key);
          const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
          const isPast = day < today && !isToday;

          return (
            <button
              key={key}
              onClick={() => onSelectDate?.(day)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl border transition-all active:scale-95',
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                  : isToday
                    ? 'bg-white text-slate-900 border-slate-300 shadow-md ring-1 ring-slate-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:shadow-sm',
                isPast && !isSelected && 'opacity-70'
              )}
            >
              {/* Mes abreviado */}
              <span className={cn(
                'text-[8px] font-bold uppercase tracking-wider',
                isSelected ? 'text-slate-400' : 'text-slate-400'
              )}>
                {day.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase().replace('.', '')}
              </span>

              {/* Número del día */}
              <span className={cn(
                'text-lg font-black font-mono leading-none',
                isSelected ? 'text-white' : isToday ? 'text-slate-900' : 'text-slate-700'
              )}>
                {day.getDate()}
              </span>

              {/* Nombre del día */}
              <span className={cn(
                'text-[8px] font-medium',
                isSelected ? 'text-slate-400' : 'text-slate-400'
              )}>
                {DIAS_SEMANA[day.getDay()]}
              </span>

              {/* Dot indicator — tiene minutas ese día */}
              {hasMinutas && (
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full mt-0.5',
                  isSelected ? 'bg-white' : 'bg-marca-primario'
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
