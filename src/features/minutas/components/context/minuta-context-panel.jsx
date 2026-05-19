import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { LINEA_MAP } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { MinutaExecutiveSummary } from '../minuta-executive-summary';
import { MinutaJuntaComparison } from '../minuta-junta-comparison';

/**
 * MinutaContextPanel — Panel de contexto de la minuta.
 * Ahora incluye el resumen ejecutivo visual y comparación con junta anterior.
 */
export const MinutaContextPanel = ({ 
  minuta, resumen, entries = [], onFilterByStatus,
  onIniciar, onCancelar, iniciando, cancelando 
}) => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  if (!minuta) return null;

  const fecha = new Date(minuta.fechaRealizada || minuta.fechaProgramada || minuta.createdAt).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm border-b border-slate-200/60 shrink-0">
      {/* Header superior: Navegación + Info básica */}
      <header className="px-4 md:px-6 py-3 flex items-center justify-between gap-4 md:gap-6">
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

              {/* Atajos Ejecutivos */}
              {minuta.isJuntaActual && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/40 whitespace-nowrap shadow-sm">
                  Junta Actual
                </span>
              )}
              {minuta.isJuntaAnterior && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/40 whitespace-nowrap shadow-sm">
                  Anterior
                </span>
              )}

              <span className="w-1 h-1 rounded-full bg-slate-300" />

              {/* Línea */}
              <div className="flex items-center gap-1 text-[10px] md:text-[11px] text-slate-600 font-medium bg-slate-100/50 px-2 py-0.5 rounded-md border border-slate-200/50">
                <LineIconSelector type={minuta.lineaDefault} size={12} className="text-slate-900" />
                {LINEA_MAP[minuta.lineaDefault]?.label || minuta.lineaDefault}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {minuta.estado === 'PROGRAMADA' && (
            <Button
              variant="marca"
              icon="play_arrow"
              onClick={onIniciar}
              loading={iniciando}
              size="sm"
            >
              Iniciar Junta
            </Button>
          )}

          {minuta.estado !== 'CANCELADA' && resumen?.totalValidas === 0 && (
            <Button
              variant="peligro"
              icon="cancel"
              onClick={onCancelar}
              loading={cancelando}
              size="sm"
            >
              Cancelar Minuta
            </Button>
          )}
        </div>
      </header>

      {/* Panel Ejecutivo */}
      <div className="px-4 md:px-6 pb-3 space-y-2">
        <MinutaExecutiveSummary 
          resumen={resumen} 
          entries={entries}
          onFilterByStatus={onFilterByStatus}
        />
        <MinutaJuntaComparison minutaId={minuta.id} />
      </div>
    </div>
  );
};
