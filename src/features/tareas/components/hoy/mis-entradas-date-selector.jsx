// src/features/tareas/components/hoy/mis-entradas-date-selector.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const PERIODOS = [
    { id: 'today', label: 'Hoy', icon: 'today' },
    { id: 'week', label: 'Esta Semana', icon: 'date_range' },
    { id: 'month', label: 'Este Mes', icon: 'calendar_month' },
    { id: 'all', label: 'Todo', icon: 'all_inclusive' },
];

export const MisEntradasDateSelector = ({ value = 'all', onChange, loading }) => {
    return (
        <div className="flex items-center justify-between gap-3 w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-marca-primario/10 flex items-center justify-center text-marca-primario shrink-0">
                    <Icon name="event_repeat" size="xs" />
                </div>
                <span className="text-xs font-black text-slate-700 hidden sm:block">Período</span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
                {PERIODOS.map((p) => {
                    const isActive = value === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => onChange(p.id)}
                            disabled={loading}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                                isActive 
                                    ? "bg-white text-marca-primario shadow-md shadow-marca-primario/10 border border-marca-primario/10" 
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <Icon name={p.icon} size="xs" />
                            {p.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
