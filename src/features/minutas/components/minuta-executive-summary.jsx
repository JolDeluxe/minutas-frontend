import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * StatusBadge unificado con soporte de Tooltip.
 * El tooltip solo se muestra cuando el label de texto está oculto (pantallas < XL).
 */
const BadgeWithTooltip = ({ icon, value, label, shortLabel, onClick, active, colorClasses, compact = false }) => (
  <div className="relative group/tooltip inline-block">
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 font-bold cursor-pointer shrink-0',
        compact ? 'rounded-lg px-2 py-0.5 text-[10px]' : 'rounded-xl px-2.5 py-1 text-xs',
        active ? colorClasses.activeBg : 'bg-white',
        active ? colorClasses.activeText : 'text-slate-600',
        colorClasses.pulse
      )}
    >
      <Icon name={icon} size={compact ? "12px" : "14px"} className={cn(active ? colorClasses.activeText : colorClasses.iconColor)} />
      <span className="font-mono font-black">{value}</span>
      {compact && (
        <span className="font-black uppercase tracking-widest text-[8px] ml-0.5">
          {shortLabel || label}
        </span>
      )}
    </button>
    
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-[100]">
      {label}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
    </div>
  </div>
);

export const MinutaExecutiveSummary = ({ resumen, onFilterByStatus, onFilterByTipo, onToggleExternal, onResetFilter, activeFilter, isExterna }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!resumen) return null;

  const {
    totalTareas = 0,
    pendientes = 0,
    enRevision = 0,
    cerradas = 0,
    atrasadas = 0,
    porcentaje = 0,
    externas = 0,
    sinClasificar = 0,
  } = resumen;

  if (isExterna) {
    const extPendientes = totalTareas - cerradas;
    return (
      <div className="w-full bg-white/85 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-3 lg:px-5 lg:py-3.5 shadow-sm overflow-visible flex items-center gap-3 md:gap-5 flex-wrap">
          <div className="flex flex-col items-start shrink-0">
            <span className="text-xl lg:text-3xl font-black font-mono leading-none text-slate-900">{totalTareas}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Tareas<br/>Externas Registradas</span>
          </div>

          <div className="w-px h-8 bg-slate-200 shrink-0" />

          <div className="flex flex-col items-start shrink-0">
            <span className="text-xl lg:text-3xl font-black font-mono leading-none text-amber-500">{extPendientes}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/80 mt-1">Pendientes</span>
          </div>

          <div className="w-px h-8 bg-slate-200 shrink-0" />

          <div className="flex flex-col items-start shrink-0">
            <span className="text-xl lg:text-3xl font-black font-mono leading-none text-emerald-500">{cerradas}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/80 mt-1">Completadas</span>
          </div>

          <div className="w-px h-8 bg-slate-200 shrink-0 hidden md:block" />

          <div className="flex-1 min-w-[150px] w-full md:w-auto mt-2 md:mt-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Progreso de Tareas Externas</span>
              <span className={cn('text-[10px] font-black font-mono', porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600')}>{porcentaje}%</span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200/50">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-sm',
                  porcentaje < 100 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                )}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
      </div>
    );
  }

  const estado = activeFilter?.estado;
  const tipo = activeFilter?.tipo;
  const onlyExternal = activeFilter?.onlyExternal;

  const totalReal = totalTareas + sinClasificar + externas;

  const statusConfigs = {
    PENDIENTE: { icon: 'schedule', label: 'Pendientes', shortLabel: 'Pend.', colorClasses: { iconColor: 'text-amber-500', activeBg: 'bg-amber-50 border-amber-200', activeText: 'text-amber-700' } },
    EN_REVISION: { icon: 'visibility', label: 'En Revisión', shortLabel: 'En Rev.', colorClasses: { iconColor: 'text-blue-500', activeBg: 'bg-blue-50 border-blue-200', activeText: 'text-blue-700' } },
    CERRADA: { icon: 'check_circle', label: 'Cerradas', shortLabel: 'Cerr.', colorClasses: { iconColor: 'text-emerald-500', activeBg: 'bg-emerald-50 border-emerald-200', activeText: 'text-emerald-700' } },
    ATRASADA: { icon: 'warning', label: 'Atrasadas', shortLabel: 'Atras.', colorClasses: { iconColor: 'text-red-500', activeBg: 'bg-red-50 border-red-200', activeText: 'text-red-700', pulse: atrasadas > 0 ? 'animate-pulse' : '' } },
  };

  const tipoConfigs = {
    TAREA: {
      icon: 'task_alt',
      label: 'Tareas',
      shortLabel: 'Tareas',
      value: totalTareas,
      active: tipo === 'TAREA' && !onlyExternal,
      onClick: () => onFilterByTipo?.('TAREA'),
      colorClasses: { iconColor: 'text-rose-600', activeBg: 'bg-rose-50 border-rose-200', activeText: 'text-rose-700' }
    },
    SIN_ORGANIZAR: {
      icon: 'warning',
      label: 'Falta Clasificar',
      shortLabel: 'Sin Clasif.',
      value: sinClasificar,
      active: tipo === 'SIN_ORGANIZAR' && !onlyExternal,
      onClick: () => onFilterByTipo?.('SIN_ORGANIZAR'),
      colorClasses: { iconColor: 'text-amber-600', activeBg: 'bg-amber-50 border-amber-200', activeText: 'text-amber-700', pulse: sinClasificar > 0 ? 'animate-pulse' : '' }
    },
    EXTERNA: {
      icon: 'output',
      label: 'Externas',
      shortLabel: 'Ext.',
      value: externas,
      active: onlyExternal,
      onClick: () => onToggleExternal?.(),
      colorClasses: { iconColor: 'text-purple-600', activeBg: 'bg-purple-50 border-purple-200', activeText: 'text-purple-700' }
    }
  };

  return (
    <div className="w-full">
      {/* --- VISTA MÓVIL (< 768px) --- */}
      <div className="md:hidden w-full relative z-10">
        {isCollapsed ? (
          <div className="w-full bg-white border border-slate-200/60 rounded-2xl px-3 py-2 shadow-sm flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <button onClick={onResetFilter} className="flex items-center gap-1 active:scale-95 text-left cursor-pointer" title="Ver todo (Total de registros)">
                  <span className="font-mono font-black text-slate-900 text-sm">{totalReal}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Total</span>
                </button>
                <span className="text-slate-200 text-xs font-light">|</span>
                <button onClick={() => onFilterByTipo?.('TAREA')} className="flex items-center gap-1 active:scale-95 text-left cursor-pointer" title="Filtrar por Tareas Internas">
                  <span className="font-mono font-black text-slate-900 text-sm">{totalTareas}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Tareas</span>
                  <span className="text-slate-300 mx-0.5">·</span>
                  <span className={cn("font-mono font-black text-xs", porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600')}>{porcentaje}%</span>
                </button>
              </div>

              <div className="flex items-center gap-1 overflow-x-visible py-0.5 justify-end">
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  <Icon name="warning" size="10px" /> {sinClasificar}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  <Icon name="output" size="10px" /> {externas}
                </span>
              </div>

              <button type="button" onClick={() => setIsCollapsed(false)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0">
                <Icon name="expand_more" size="16px" />
              </button>
          </div>
        ) : (
          <div className="w-full bg-white border border-slate-200/60 rounded-2xl p-3.5 shadow-md flex flex-col gap-3">
            <div className="flex items-center gap-3 w-full">
              <button onClick={onResetFilter} className="flex flex-col items-start shrink-0 active:scale-95 cursor-pointer">
                <span className="text-lg font-black font-mono text-slate-900 leading-none">{totalReal}</span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400 mt-1">Total Gral.</span>
              </button>
              <div className="w-px h-5 bg-slate-200 shrink-0" />
              <button onClick={() => onFilterByTipo?.('TAREA')} className="flex flex-col items-start shrink-0 active:scale-95 cursor-pointer">
                <span className="text-lg font-black font-mono text-slate-900 leading-none">{totalTareas}</span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400 mt-1">Tareas Int.</span>
              </button>
              
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="relative h-2 flex-1 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div className={cn('absolute inset-y-0 left-0 transition-all duration-1000', porcentaje < 100 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${porcentaje}%` }} />
                </div>
                <span className={cn('text-[9px] font-black font-mono shrink-0', porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600')}>{porcentaje}%</span>
              </div>
              
              <button type="button" onClick={() => setIsCollapsed(true)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0">
                <Icon name="expand_less" size="16px" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 pt-2.5 border-t border-slate-100">
               <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Distribución de Puntos</span>
               <div className="flex flex-wrap gap-1.5">
                  <BadgeWithTooltip {...tipoConfigs.TAREA} compact />
                  <BadgeWithTooltip {...tipoConfigs.SIN_ORGANIZAR} compact />
                  <BadgeWithTooltip {...tipoConfigs.EXTERNA} compact />
               </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2.5 border-t border-slate-100">
               <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Estatus (Tareas Internas)</span>
               <div className="flex flex-wrap gap-1.5">
                  <BadgeWithTooltip {...statusConfigs.PENDIENTE} value={pendientes} compact onClick={() => onFilterByStatus?.('PENDIENTE')} active={estado === 'PENDIENTE'} />
                  <BadgeWithTooltip {...statusConfigs.EN_REVISION} value={enRevision} compact onClick={() => onFilterByStatus?.('EN_REVISION')} active={estado === 'EN_REVISION'} />
                  <BadgeWithTooltip {...statusConfigs.CERRADA} value={cerradas} compact onClick={() => onFilterByStatus?.('CERRADA')} active={estado === 'CERRADA'} />
                  <BadgeWithTooltip {...statusConfigs.ATRASADA} value={atrasadas} compact onClick={() => onFilterByStatus?.('ATRASADA')} active={estado === 'ATRASADA'} />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* --- VISTA DESKTOP (>= 768px) --- */}
      <div className="hidden md:flex flex-wrap lg:flex-nowrap w-full items-center justify-between gap-3 bg-white/85 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-3.5 lg:px-3.5 lg:py-2.5 shadow-sm overflow-visible">
        
        {/* Lado Izquierdo: Totales + Progreso */}
        <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto lg:flex-1 min-w-[280px] lg:min-w-[420px] pb-3 lg:pb-0 border-b border-slate-100 lg:border-b-0">
          {/* Total Real (Total General) */}
          <button onClick={onResetFilter} className="flex flex-col lg:flex-row lg:items-center gap-0 lg:gap-1.5 shrink-0 active:scale-95 text-left cursor-pointer" title="Ver todo (Total de registros)">
            <span className="text-xl lg:text-2xl font-black font-mono leading-none text-slate-900">{totalReal}</span>
            <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none lg:leading-tight">Total<br className="lg:hidden" /> General</span>
          </button>

          <div className="w-px h-5 bg-slate-200 shrink-0" />

          {/* Total Tareas */}
          <button onClick={() => onFilterByTipo?.('TAREA')} className="flex flex-col lg:flex-row lg:items-center gap-0 lg:gap-1.5 shrink-0 active:scale-95 text-left cursor-pointer" title="Filtrar por Tareas Internas">
            <span className="text-xl lg:text-2xl font-black font-mono leading-none text-slate-900">{totalTareas}</span>
            <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none lg:leading-tight">Total<br className="lg:hidden" /> Tareas</span>
          </button>

          <div className="hidden lg:block w-px h-6 bg-slate-200 shrink-0" />

          {/* Barra de Progreso */}
          <div className="flex items-center gap-2 flex-1 min-w-[80px] lg:min-w-[140px]">
            <div className="relative h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200/50">
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

        <div className="hidden lg:block w-px h-6 bg-slate-200 shrink-0" />

        {/* Centro: Distribución por Tipo */}
        <div className="flex items-center gap-1 xl:gap-1.5 shrink-0 pt-1 lg:pt-0">
          <span className="hidden xl:inline text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-slate-400 mr-1.5">Distribución:</span>
          <BadgeWithTooltip {...tipoConfigs.TAREA} />
          <BadgeWithTooltip {...tipoConfigs.SIN_ORGANIZAR} />
          <BadgeWithTooltip {...tipoConfigs.EXTERNA} />
        </div>

        <div className="hidden lg:block w-px h-6 bg-slate-200 shrink-0" />

        {/* Lado Derecho: Estatus */}
        <div className="flex items-center gap-1 xl:gap-1.5 shrink-0 pt-1 lg:pt-0 ml-auto lg:ml-0">
          <span className="hidden xl:inline text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-slate-400 mr-1.5">Estatus:</span>
          <BadgeWithTooltip {...statusConfigs.PENDIENTE} value={pendientes} onClick={() => onFilterByStatus?.('PENDIENTE')} active={estado === 'PENDIENTE'} />
          <BadgeWithTooltip {...statusConfigs.EN_REVISION} value={enRevision} onClick={() => onFilterByStatus?.('EN_REVISION')} active={estado === 'EN_REVISION'} />
          <BadgeWithTooltip {...statusConfigs.CERRADA} value={cerradas} onClick={() => onFilterByStatus?.('CERRADA')} active={estado === 'CERRADA'} />
          <BadgeWithTooltip {...statusConfigs.ATRASADA} value={atrasadas} onClick={() => onFilterByStatus?.('ATRASADA')} active={estado === 'ATRASADA'} />
        </div>
      </div>
    </div>
  );
};
