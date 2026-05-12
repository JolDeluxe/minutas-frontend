import { useRef } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP } from '../../constants';

const CHIPS = [
  { key: 'TODAS', label: 'Todas', icon: 'apps' },
  ...Object.entries(CLASIFICACION_MAP).map(([key, v]) => ({ key, label: v.label, icon: v.icon, color: v.color })),
  { key: 'SIN_CLASIFICAR', label: 'Sin clasificar', icon: 'help_outline', color: '#94a3b8' },
  { key: 'SIN_ORGANIZAR',  label: 'Sin organizar',  icon: 'pending_actions', color: '#f59e0b' },
];

export const TimelineFilters = ({ active = 'TODAS', onChange }) => {
  const ref = useRef(null);

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-1.5 overflow-x-auto scrollbar-none py-1.5 px-0.5"
        style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x proximity' }}
      >
        {CHIPS.map((c) => {
          const on = active === c.key;
          return (
            <button key={c.key} onClick={() => onChange(c.key)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-all active:scale-95',
                on ? 'text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200/80'
              )}
              style={on ? { backgroundColor: c.color || '#482b2c' } : undefined}
            >
              <Icon name={c.icon} size="14px"
                className={on ? 'text-white' : ''}
                style={!on && c.color ? { color: c.color } : undefined}
              />
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-cuadra-arena to-transparent pointer-events-none" />
    </div>
  );
};
