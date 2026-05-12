import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { ESTADO_CONCEPTUAL_MAP, LINEA_MAP } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { useIsDesktop } from '@/hooks/useMediaQuery';

/**
 * MinutaContextPanel — Panel de contexto de la minuta.
 * Muestra información clave y permite la navegación hacia atrás en móviles.
 */
export const MinutaContextPanel = ({ minuta, resumen }) => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  if (!minuta) return null;

  const fecha = new Date(minuta.fecha || minuta.createdAt).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const estadoConceptualEntries = Object.entries(resumen?.conceptual || {});
  const totalEntradas = resumen?.totalEntradas || 0;

  return (
    <header className="w-full bg-white/60 backdrop-blur-sm border-b border-slate-200/60 px-4 md:px-6 py-3 shrink-0 flex items-center justify-between gap-4 md:gap-6">
      {/* Lado izquierdo: Botón Regresar + Título e Info Principal */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button 
          onClick={() => navigate('/minutas')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 active:scale-90 transition-all shrink-0"
          title="Regresar al listado"
        >
          <Icon name="chevron_left" size="24px" />
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 fuente-titulos tracking-tight leading-tight truncate">
            {minuta.titulo}
          </h2>
          <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
            <p className="text-[10px] md:text-xs text-slate-500 font-mono">#{minuta.id} · {fecha}</p>
            
            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-300" />
            
            {/* Estado */}
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider',
              minuta.estado === 'ACTIVA'
                ? 'bg-emerald-500/10 text-emerald-700'
                : 'bg-slate-500/10 text-slate-600'
            )}>
              <span className={cn(
                'w-1 h-1 md:w-1.5 md:h-1.5 rounded-full',
                minuta.estado === 'ACTIVA' ? 'bg-emerald-500' : 'bg-slate-400'
              )} />
              {minuta.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'}
            </span>

            <span className="w-1 h-1 rounded-full bg-slate-300" />

            {/* Línea */}
            <div className="flex items-center gap-1 text-[10px] md:text-[11px] text-slate-600 font-medium bg-slate-100/50 px-2 py-0.5 rounded-md border border-slate-200/50">
              <LineIconSelector type={minuta.lineaDefault} size={12} className="text-slate-900" />
              {LINEA_MAP[minuta.lineaDefault]?.label || minuta.lineaDefault}
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho: Métricas / Resumen */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Resumen ({totalEntradas})
          </span>
          <div className="flex gap-1 md:gap-1.5">
            {isDesktop ? (
              estadoConceptualEntries.map(([estado, count]) => {
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
              })
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                <Icon name="analytics" size="14px" className="text-slate-400" />
                {totalEntradas}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
