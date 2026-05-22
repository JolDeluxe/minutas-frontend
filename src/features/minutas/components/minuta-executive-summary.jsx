import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * StatusBadge unificado con soporte de Tooltip.
 * El tooltip solo se muestra cuando el label de texto está oculto (pantallas < XL).
 */
const BadgeWithTooltip = ({ icon, value, label, onClick, active, colorClasses, compact = false }) => (
  <div className="relative group/tooltip inline-block">
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 font-bold cursor-pointer shrink-0',
        compact ? 'rounded-lg px-1.5 py-0.5 text-[10px]' : 'rounded-xl px-2 py-1 md:px-2.5 md:py-1 text-xs',
        active ? colorClasses.activeBg : 'bg-white',
        active ? colorClasses.activeText : 'text-slate-600',
        colorClasses.pulse
      )}
    >
      <Icon name={icon} size={compact ? "12px" : "14px"} className={cn(active ? colorClasses.activeText : colorClasses.iconColor)} />
      <span className="font-mono font-black">{value}</span>
      {!compact && <span className="text-[9px] font-black uppercase tracking-widest hidden xl:inline">{label}</span>}
    </button>
    
    <div className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-[100]",
      !compact && "xl:hidden"
    )}>
      {label}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
    </div>
  </div>
);

export const MinutaExecutiveSummary = ({ resumen, onFilterByStatus, onResetFilter, activeFilter }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!resumen) return null;

  const {
    totalTareas = 0,
    pendientes = 0,
    enRevision = 0,
    cerradas = 0,
    atrasadas = 0,
    porcentaje = 0,
  } = resumen;

  const estado = activeFilter?.estado;

  const statusConfigs = {
    PENDIENTE: { icon: 'schedule', label: 'Pendientes', colorClasses: { iconColor: 'text-amber-500', activeBg: 'bg-amber-50 border-amber-200', activeText: 'text-amber-700' } },
    EN_REVISION: { icon: 'visibility', label: 'En Revisión', colorClasses: { iconColor: 'text-blue-500', activeBg: 'bg-blue-50 border-blue-200', activeText: 'text-blue-700' } },
    CERRADA: { icon: 'check_circle', label: 'Cerradas', colorClasses: { iconColor: 'text-emerald-500', activeBg: 'bg-emerald-50 border-emerald-200', activeText: 'text-emerald-700' } },
    ATRASADA: { icon: 'warning', label: 'Atrasadas', colorClasses: { iconColor: 'text-red-500', activeBg: 'bg-red-50 border-red-200', activeText: 'text-red-700', pulse: atrasadas > 0 ? 'animate-pulse' : '' } },
  };

  return (
    <div className="w-full">
      {/* --- VISTA MÓVIL (< 768px) --- */}
      <div className="md:hidden w-full relative z-10">
        {isCollapsed ? (
          <div className="w-full bg-white border border-slate-200/60 rounded-2xl px-2.5 py-1.5 shadow-sm flex items-center justify-between gap-1.5">
              <button onClick={onResetFilter} className="flex items-center gap-1 active:scale-95 text-left cursor-pointer shrink-0">
                <span className="font-mono font-black text-slate-900">{totalTareas}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 hidden xs:inline">Tareas</span>
                <span className="text-slate-300 mx-0.5 hidden xs:inline">·</span>
                <span className={cn("font-mono font-black", porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600')}>{porcentaje}%</span>
              </button>

              <div className="flex items-center gap-1 overflow-x-visible py-0.5 justify-end">
                <BadgeWithTooltip {...statusConfigs.PENDIENTE} value={pendientes} compact onClick={() => onFilterByStatus?.('PENDIENTE')} active={estado === 'PENDIENTE'} />
                <BadgeWithTooltip {...statusConfigs.EN_REVISION} value={enRevision} compact onClick={() => onFilterByStatus?.('EN_REVISION')} active={estado === 'EN_REVISION'} />
                <BadgeWithTooltip {...statusConfigs.CERRADA} value={cerradas} compact onClick={() => onFilterByStatus?.('CERRADA')} active={estado === 'CERRADA'} />
              </div>

              <button type="button" onClick={() => setIsCollapsed(false)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0">
                <Icon name="expand_more" size="16px" />
              </button>
          </div>
        ) : (
          <div className="w-full bg-white border border-slate-200/60 rounded-2xl p-3 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3 w-full">
              <button onClick={onResetFilter} className="flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer">
                <span className="text-xl font-black font-mono text-slate-900">{totalTareas}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tareas</span>
              </button>
              <div className="flex items-center gap-2 flex-1">
                <div className="relative h-2 flex-1 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div className={cn('absolute inset-y-0 left-0 transition-all duration-1000', porcentaje < 100 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${porcentaje}%` }} />
                </div>
                <span className={cn('text-[10px] font-black font-mono', porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600')}>{porcentaje}%</span>
              </div>
              <button type="button" onClick={() => setIsCollapsed(true)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0">
                <Icon name="expand_less" size="16px" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
               <BadgeWithTooltip {...statusConfigs.PENDIENTE} value={pendientes} onClick={() => onFilterByStatus?.('PENDIENTE')} active={estado === 'PENDIENTE'} />
               <BadgeWithTooltip {...statusConfigs.EN_REVISION} value={enRevision} onClick={() => onFilterByStatus?.('EN_REVISION')} active={estado === 'EN_REVISION'} />
               <BadgeWithTooltip {...statusConfigs.CERRADA} value={cerradas} onClick={() => onFilterByStatus?.('CERRADA')} active={estado === 'CERRADA'} />
               <BadgeWithTooltip {...statusConfigs.ATRASADA} value={atrasadas} onClick={() => onFilterByStatus?.('ATRASADA')} active={estado === 'ATRASADA'} />
            </div>
          </div>
        )}
      </div>

      {/* --- VISTA DESKTOP (>= 768px) Siempre en una sola línea --- */}
      <div className="hidden md:flex w-full items-center gap-2 lg:gap-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl px-3 lg:px-5 py-2.5 shadow-sm overflow-visible">
        
        {/* Lado Izquierdo: Total + Progreso */}
        <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
          <button onClick={onResetFilter} className="flex flex-col lg:flex-row lg:items-center gap-0 lg:gap-1.5 shrink-0 active:scale-95 text-left cursor-pointer">
            <span className="text-xl lg:text-2xl font-black font-mono leading-none text-slate-900">{totalTareas}</span>
            <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none lg:leading-tight">Total<br className="lg:hidden" /> Tareas</span>
          </button>

          <div className="w-px h-6 bg-slate-200 shrink-0" />

          {/* Barra de Progreso - Máximo espacio posible */}
          <div className="flex items-center gap-2 flex-1 min-w-[60px] lg:min-w-[120px]">
            <div className="relative h-2.5 lg:h-3 flex-1 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200/50">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-sm',
                  porcentaje < 100 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                )}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <span className={cn('text-[10px] lg:text-xs font-black font-mono shrink-0', porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600')}>
              {porcentaje}%
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200 shrink-0 hidden lg:block" />

        {/* Lado Derecho: Filtros Rápidos (Sin etiquetas hasta XL, con Tooltips) */}
        <div className="flex items-center gap-1 xl:gap-1.5 shrink-0">
          <BadgeWithTooltip {...statusConfigs.PENDIENTE} value={pendientes} onClick={() => onFilterByStatus?.('PENDIENTE')} active={estado === 'PENDIENTE'} />
          <BadgeWithTooltip {...statusConfigs.EN_REVISION} value={enRevision} onClick={() => onFilterByStatus?.('EN_REVISION')} active={estado === 'EN_REVISION'} />
          <BadgeWithTooltip {...statusConfigs.CERRADA} value={cerradas} onClick={() => onFilterByStatus?.('CERRADA')} active={estado === 'CERRADA'} />
          <BadgeWithTooltip {...statusConfigs.ATRASADA} value={atrasadas} onClick={() => onFilterByStatus?.('ATRASADA')} active={estado === 'ATRASADA'} />
        </div>
      </div>
    </div>
  );
};
