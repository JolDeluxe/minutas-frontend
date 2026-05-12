import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { ESTADO_CONCEPTUAL_MAP, LINEA_MAP } from '../../constants';

/**
 * MinutaContextPanel — Panel lateral izquierdo (desktop only).
 * Muestra contexto de la minuta: estado, resumen, métricas, accesos rápidos.
 */
export const MinutaContextPanel = ({ minuta, resumen }) => {
  if (!minuta) return null;

  const fecha = new Date(minuta.fecha || minuta.createdAt).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const estadoConceptualEntries = Object.entries(resumen?.conceptual || {});
  const totalEntradas = resumen?.totalEntradas || 0;

  return (
    <header className="w-full bg-white/60 backdrop-blur-sm border-b border-slate-200/60 px-6 py-3 shrink-0 flex items-center justify-between gap-6">
      {/* Lado izquierdo: Título e Info Principal */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-extrabold text-slate-900 fuente-titulos tracking-tight leading-tight truncate">
          {minuta.titulo}
        </h2>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <p className="text-xs text-slate-500 font-mono">#{minuta.id} · {fecha}</p>
          
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          
          {/* Estado */}
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
            minuta.estado === 'ACTIVA'
              ? 'bg-emerald-500/10 text-emerald-700'
              : 'bg-slate-500/10 text-slate-600'
          )}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              minuta.estado === 'ACTIVA' ? 'bg-emerald-500' : 'bg-slate-400'
            )} />
            {minuta.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'}
          </span>

          <span className="w-1 h-1 rounded-full bg-slate-300" />

          {/* Línea */}
          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100/50 px-2 py-0.5 rounded-md border border-slate-200/50">
            <Icon name="sell" size="12px" className="text-slate-400" />
            {LINEA_MAP[minuta.lineaDefault] || minuta.lineaDefault}
          </div>

          {/* Creador */}
          {minuta.creadoPor && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <div className="w-5 h-5 rounded-full bg-marca-primario/10 flex items-center justify-center">
                  <Icon name="person" size="12px" className="text-marca-primario" />
                </div>
                {minuta.creadoPor.nombre}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lado derecho: Métricas / Resumen */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Resumen ({totalEntradas})
          </span>
          <div className="flex gap-1.5">
            {estadoConceptualEntries.map(([estado, count]) => {
              const cfg = ESTADO_CONCEPTUAL_MAP[estado];
              if (!cfg) return null;
              return (
                <div 
                  key={estado} 
                  className="flex items-center gap-1 text-[11px] bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shadow-sm"
                  title={cfg.label}
                >
                  <Icon name={cfg.icon} size="12px" style={{ color: cfg.color }} />
                  <span className="font-bold text-slate-700 font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {minuta.notasGenerales?.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 rounded-md px-2 py-0.5 border border-amber-200/50 font-medium">
            <Icon name="sticky_note_2" size="12px" />
            {minuta.notasGenerales.length} notas de junta
          </div>
        )}
      </div>
    </header>
  );
};
