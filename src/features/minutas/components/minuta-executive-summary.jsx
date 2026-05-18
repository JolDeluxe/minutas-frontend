import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, PRIORIDAD_MAP } from '../constants';

/**
 * MinutaExecutiveSummary — Panel ejecutivo de resumen visual.
 * Diseñado para el dueño: semáforos grandes, barras de progreso, cero texto innecesario.
 * Todo se entiende con íconos y colores en < 5 segundos.
 */

const KpiBlock = ({ icon, value, label, color, bgColor, ringColor, pulse = false, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1.5 rounded-2xl p-3 md:p-4 transition-all hover:scale-105 active:scale-95 shadow-sm border min-w-[5rem]',
      bgColor,
      ringColor && `ring-1 ${ringColor}`
    )}
  >
    <div className={cn(
      'flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl shadow-lg',
      color,
      pulse && 'animate-pulse'
    )}>
      <Icon name={icon} size="24px" className="text-white drop-shadow-sm" />
    </div>
    <span className="text-2xl md:text-3xl font-black font-mono leading-none text-slate-900">
      {value}
    </span>
    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {label}
    </span>
  </button>
);

export const MinutaExecutiveSummary = ({ resumen, entries = [], onFilterByStatus }) => {
  if (!resumen) return null;

  const total = resumen.totalEntradas || 0;
  const atrasadas = resumen.atrasadas || 0;
  
  // Calculate from entries for live data
  let completadas = 0;
  let enProgreso = 0;
  let pendientes = 0;
  let cerradas = 0;

  for (const e of entries) {
    const estado = e.estado || e.estadoOperativo;
    if (estado === 'CERRADO') cerradas++;
    else if (estado === 'COMPLETADO') completadas++;
    else if (estado === 'EN_PROGRESO' || e.estadoOperativo === 'EN_PROGRESO') enProgreso++;
    else pendientes++;
  }

  const terminadas = completadas + cerradas;
  const porcentaje = total > 0 ? Math.round((terminadas / total) * 100) : 0;

  const porClasificacion = resumen.porClasificacion || {};
  const clasificaciones = Object.entries(porClasificacion);

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-4 md:p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      
      {/* Barra de Progreso General */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="trending_up" size="16px" className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso General</span>
          </div>
          <span className="text-lg md:text-xl font-black font-mono text-slate-900">{porcentaje}%</span>
        </div>
        <div className="relative h-3 md:h-4 rounded-full bg-slate-100 overflow-hidden shadow-inner">
          <div 
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out shadow-sm"
            style={{ width: `${porcentaje}%` }}
          />
          {atrasadas > 0 && (
            <div 
              className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-red-500/30 to-transparent animate-pulse"
              style={{ width: `${Math.min((atrasadas / total) * 100, 100 - porcentaje)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] font-bold text-slate-400">{terminadas} de {total} terminadas</span>
          {atrasadas > 0 && (
            <span className="text-[9px] font-black text-red-500 animate-pulse flex items-center gap-1">
              <Icon name="warning" size="10px" />
              {atrasadas} atrasada{atrasadas > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Semáforos KPI */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4">
        <KpiBlock
          icon="check_circle"
          value={terminadas}
          label="Listas"
          color="bg-emerald-500"
          bgColor="bg-emerald-50 border-emerald-100"
          onClick={() => onFilterByStatus?.('COMPLETADAS')}
        />
        <KpiBlock
          icon="autorenew"
          value={enProgreso}
          label="Proceso"
          color="bg-amber-500"
          bgColor="bg-amber-50 border-amber-100"
          onClick={() => onFilterByStatus?.('EN_PROGRESO')}
        />
        <KpiBlock
          icon="warning"
          value={atrasadas}
          label="Atrasadas"
          color="bg-red-500"
          bgColor={atrasadas > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}
          ringColor={atrasadas > 0 ? "ring-red-200" : ""}
          pulse={atrasadas > 0}
          onClick={() => onFilterByStatus?.('ATRASADAS')}
        />
        <KpiBlock
          icon="schedule"
          value={pendientes}
          label="Pendientes"
          color="bg-slate-400"
          bgColor="bg-slate-50 border-slate-100"
          onClick={() => onFilterByStatus?.('PENDIENTE')}
        />
      </div>

      {/* Mini-badges de Clasificación */}
      {clasificaciones.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
          {clasificaciones.map(([key, count]) => {
            const cfg = CLASIFICACION_MAP[key];
            if (!cfg) return null;
            return (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                style={{ 
                  backgroundColor: `${cfg.color}10`, 
                  color: cfg.color,
                  border: `1px solid ${cfg.color}20` 
                }}
              >
                <Icon name={cfg.icon} size="11px" />
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
