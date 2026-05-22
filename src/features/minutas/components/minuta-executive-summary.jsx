import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const StatusBadge = ({ icon, value, label, onClick, active, colorClasses }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-1.5 rounded-xl md:rounded-2xl px-2 py-1 md:px-3 md:py-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 text-xs font-bold cursor-pointer',
      active ? colorClasses.activeBg : 'bg-white',
      active ? colorClasses.activeText : 'text-slate-600',
      colorClasses.pulse
    )}
  >
    <Icon name={icon} size="14px" className={cn(active ? colorClasses.activeText : colorClasses.iconColor)} />
    <span className="font-mono font-black">{value}</span>
    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{label}</span>
  </button>
);

const TipoBadge = ({ icon, value, label, onClick, active, colorClasses }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-1.5 rounded-xl md:rounded-2xl px-2 py-1 md:px-3 md:py-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-100 text-xs font-bold cursor-pointer',
      active ? colorClasses.activeBg : 'bg-white',
      active ? colorClasses.activeText : 'text-slate-500'
    )}
  >
    <Icon name={icon} size="14px" />
    <span className="font-mono font-black">{value}</span>
    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{label}</span>
  </button>
);

export const MinutaExecutiveSummary = ({ resumen, onFilterByStatus, onFilterByTipo, onResetFilter, activeFilter }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!resumen) return null;

  const {
    totalTareas = 0,
    pendientes = 0,
    enRevision = 0,
    cerradas = 0,
    atrasadas = 0,
    porcentaje = 0,
    totalPoliticas = 0,
    totalRecordatorios = 0,
  } = resumen;

  const estado = activeFilter?.estado;
  const tipo = activeFilter?.tipo;

  return (
    <div className="w-full">
      {/* --- VISTA MÓVIL (md:hidden) --- */}
      <div className="md:hidden w-full">
        {isCollapsed ? (
          /* Estado Colapsado Minimalista */
          <div className="w-full bg-white border border-slate-200/60 rounded-2xl px-3 py-1.5 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
              <button
                onClick={onResetFilter}
                className="flex items-center gap-1 hover:opacity-75 active:scale-95 text-left cursor-pointer"
              >
                <span className="font-mono font-black text-slate-900">{totalTareas}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tareas</span>
                <span className="text-slate-300 mx-0.5">·</span>
                <span className={cn(
                  "font-mono font-black",
                  porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600'
                )}>{porcentaje}%</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[200px]">
                <button
                  onClick={() => onFilterByStatus?.('PENDIENTE')}
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer",
                    estado === 'PENDIENTE' ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600"
                  )}
                >
                  <Icon name="schedule" size="12px" />
                  <span className="font-mono">{pendientes}</span>
                </button>
                <button
                  onClick={() => onFilterByStatus?.('EN_REVISION')}
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer",
                    estado === 'EN_REVISION' ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-600"
                  )}
                >
                  <Icon name="visibility" size="12px" />
                  <span className="font-mono">{enRevision}</span>
                </button>
                <button
                  onClick={() => onFilterByStatus?.('CERRADA')}
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer",
                    estado === 'CERRADA' ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
                  )}
                >
                  <Icon name="check_circle" size="12px" />
                  <span className="font-mono">{cerradas}</span>
                </button>
                {atrasadas > 0 && (
                  <button
                    onClick={() => onFilterByStatus?.('ATRASADA')}
                    className={cn(
                      "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold animate-pulse transition-all cursor-pointer",
                      estado === 'ATRASADA' ? "bg-red-500 text-white" : "bg-red-50 text-red-600"
                    )}
                  >
                    <Icon name="warning" size="12px" />
                    <span className="font-mono">{atrasadas}</span>
                  </button>
                )}
                <button
                  onClick={() => onFilterByTipo?.('POLITICA')}
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer",
                    tipo === 'POLITICA' ? "bg-violet-500 text-white" : "bg-violet-50 text-violet-600"
                  )}
                >
                  <Icon name="gavel" size="12px" />
                  <span className="font-mono">{totalPoliticas}</span>
                </button>
                <button
                  onClick={() => onFilterByTipo?.('RECORDATORIO')}
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer",
                    tipo === 'RECORDATORIO' ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600"
                  )}
                >
                  <Icon name="push_pin" size="12px" />
                  <span className="font-mono">{totalRecordatorios}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 active:scale-90 transition-all shrink-0 cursor-pointer"
                title="Expandir resumen"
              >
                <Icon name="expand_more" size="16px" />
              </button>
            </div>
          </div>
        ) : (
          /* Estado Expandido Móvil (2 Filas Compactas) */
          <div className="w-full bg-white/90 border border-slate-200/60 rounded-2xl p-3 shadow-md animate-in fade-in zoom-in-95 duration-300 flex flex-col gap-2.5">
            {/* Fila 1: Total Tareas + Progress Bar + Collapse Button */}
            <div className="flex items-center justify-between gap-3 w-full">
              <button
                onClick={onResetFilter}
                className="flex items-center gap-1.5 shrink-0 transition-all hover:opacity-70 active:scale-95 cursor-pointer"
              >
                <span className="text-xl font-black font-mono leading-none text-slate-900">
                  {totalTareas}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">
                  Tareas
                </span>
              </button>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative h-2 flex-1 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-sm',
                      porcentaje < 100
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    )}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-black font-mono shrink-0',
                  porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600'
                )}>
                  {porcentaje}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 active:scale-90 transition-all shrink-0 cursor-pointer"
                title="Colapsar resumen"
              >
                <Icon name="expand_less" size="16px" />
              </button>
            </div>

            {/* Fila 2: Badges agrupados horizontalmente */}
            <div className="flex flex-wrap items-center justify-between gap-1 w-full pt-1.5 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1">
                <StatusBadge
                  icon="schedule"
                  value={pendientes}
                  label="Pendientes"
                  onClick={() => onFilterByStatus?.('PENDIENTE')}
                  active={estado === 'PENDIENTE'}
                  colorClasses={{
                    iconColor: 'text-amber-500',
                    activeBg: 'bg-amber-50 border-amber-200',
                    activeText: 'text-amber-700',
                  }}
                />
                <StatusBadge
                  icon="visibility"
                  value={enRevision}
                  label="Revisión"
                  onClick={() => onFilterByStatus?.('EN_REVISION')}
                  active={estado === 'EN_REVISION'}
                  colorClasses={{
                    iconColor: 'text-blue-500',
                    activeBg: 'bg-blue-50 border-blue-200',
                    activeText: 'text-blue-700',
                  }}
                />
                <StatusBadge
                  icon="check_circle"
                  value={cerradas}
                  label="Cerradas"
                  onClick={() => onFilterByStatus?.('CERRADA')}
                  active={estado === 'CERRADA'}
                  colorClasses={{
                    iconColor: 'text-emerald-500',
                    activeBg: 'bg-emerald-50 border-emerald-200',
                    activeText: 'text-emerald-700',
                  }}
                />
                <StatusBadge
                  icon="warning"
                  value={atrasadas}
                  label="Atrasadas"
                  onClick={() => onFilterByStatus?.('ATRASADA')}
                  active={estado === 'ATRASADA'}
                  colorClasses={{
                    iconColor: 'text-red-500',
                    activeBg: 'bg-red-50 border-red-200',
                    activeText: 'text-red-700',
                    pulse: atrasadas > 0 ? 'animate-pulse' : '',
                  }}
                />
              </div>

              <div className="flex items-center gap-1">
                <TipoBadge
                  icon="gavel"
                  value={totalPoliticas}
                  label="Políticas"
                  onClick={() => onFilterByTipo?.('POLITICA')}
                  active={tipo === 'POLITICA'}
                  colorClasses={{
                    activeBg: 'bg-violet-50 border-violet-200',
                    activeText: 'text-violet-700',
                  }}
                />
                <TipoBadge
                  icon="push_pin"
                  value={totalRecordatorios}
                  label="Recordatorios"
                  onClick={() => onFilterByTipo?.('RECORDATORIO')}
                  active={tipo === 'RECORDATORIO'}
                  colorClasses={{
                    activeBg: 'bg-orange-50 border-orange-200',
                    activeText: 'text-orange-700',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- VISTA DESKTOP (hidden md:block) --- */}
      <div className="hidden md:block w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl px-4 py-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex flex-row items-center gap-3">
          {/* Total KPI */}
          <button
            onClick={onResetFilter}
            className="flex items-center gap-2 shrink-0 transition-all hover:opacity-70 active:scale-95 text-left cursor-pointer"
          >
            <span className="text-2xl md:text-3xl font-black font-mono leading-none text-slate-900">
              {totalTareas}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Total<br />Tareas
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* Progress Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative h-3 flex-1 rounded-full bg-slate-100 overflow-hidden shadow-inner">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-sm',
                  porcentaje < 100
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                )}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <span className={cn(
              'text-xs font-black font-mono shrink-0',
              porcentaje < 100 ? 'text-amber-600' : 'text-emerald-600'
            )}>
              {porcentaje}%
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* Semaphore KPIs */}
          <div className="flex items-center gap-1.5">
            <StatusBadge
              icon="schedule"
              value={pendientes}
              label="Pendientes"
              onClick={() => onFilterByStatus?.('PENDIENTE')}
              active={estado === 'PENDIENTE'}
              colorClasses={{
                iconColor: 'text-amber-500',
                activeBg: 'bg-amber-50 border-amber-200',
                activeText: 'text-amber-700',
              }}
            />
            <StatusBadge
              icon="visibility"
              value={enRevision}
              label="Revisión"
              onClick={() => onFilterByStatus?.('EN_REVISION')}
              active={estado === 'EN_REVISION'}
              colorClasses={{
                iconColor: 'text-blue-500',
                activeBg: 'bg-blue-50 border-blue-200',
                activeText: 'text-blue-700',
              }}
            />
            <StatusBadge
              icon="check_circle"
              value={cerradas}
              label="Cerradas"
              onClick={() => onFilterByStatus?.('CERRADA')}
              active={estado === 'CERRADA'}
              colorClasses={{
                iconColor: 'text-emerald-500',
                activeBg: 'bg-emerald-50 border-emerald-200',
                activeText: 'text-emerald-700',
              }}
            />
            <StatusBadge
              icon="warning"
              value={atrasadas}
              label="Atrasadas"
              onClick={() => onFilterByStatus?.('ATRASADA')}
              active={estado === 'ATRASADA'}
              colorClasses={{
                iconColor: 'text-red-500',
                activeBg: 'bg-red-50 border-red-200',
                activeText: 'text-red-700',
                pulse: atrasadas > 0 ? 'animate-pulse' : '',
              }}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* Policies & Reminders */}
          <div className="flex items-center gap-1.5">
            <TipoBadge
              icon="gavel"
              value={totalPoliticas}
              label="Políticas"
              onClick={() => onFilterByTipo?.('POLITICA')}
              active={tipo === 'POLITICA'}
              colorClasses={{
                activeBg: 'bg-violet-50 border-violet-200',
                activeText: 'text-violet-700',
              }}
            />
            <TipoBadge
              icon="push_pin"
              value={totalRecordatorios}
              label="Recordatorios"
              onClick={() => onFilterByTipo?.('RECORDATORIO')}
              active={tipo === 'RECORDATORIO'}
              colorClasses={{
                activeBg: 'bg-orange-50 border-orange-200',
                activeText: 'text-orange-700',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
