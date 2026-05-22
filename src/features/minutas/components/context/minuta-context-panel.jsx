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
  minuta, resumen, onFilterByStatus, onFilterByTipo, onResetFilter, activeFilter,
  onIniciar, onCancelar, onCerrar, onReabrir, onFinalizar,
  iniciando, cancelando, cerrando, reabriendo, finalizando
}) => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  if (!minuta) return null;

  const fecha = new Date(minuta.fechaRealizada || minuta.fechaProgramada || minuta.createdAt).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="w-full bg-white border-b border-slate-200/60 shrink-0 relative shadow-sm">

      {/* Resumen Ejecutivo - Visible en Tablets y Desktop (Se oculta en móvil para evitar duplicidad) */}
      <div className="hidden md:block px-3 md:px-6 pt-3 pb-1 relative z-30 border-b border-slate-50">
        <MinutaExecutiveSummary 
          resumen={resumen} 
          onFilterByStatus={onFilterByStatus}
          onFilterByTipo={onFilterByTipo}
          onResetFilter={onResetFilter}
          activeFilter={activeFilter}
        />
      </div>

      {/* Header Unificado y Legible */}
      <header className="px-3 md:px-6 py-2.5 flex items-center justify-between gap-2 md:gap-4 relative z-20">
        
        {/* IZQUIERDA: Regresar e Info en bloque vertical compacto */}
        <div className="flex items-center gap-1.5 md:gap-3 min-w-0 flex-1">
          <button 
            onClick={() => navigate('/minutas')}
            className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90 transition-all shrink-0"
          >
            <Icon name="chevron_left" size="18px" />
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="text-[11px] xs:text-[13px] md:text-lg font-black text-slate-900 fuente-titulos tracking-tight leading-none truncate">
              {minuta.titulo}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="text-[7px] md:text-[10px] font-bold text-slate-400 font-mono whitespace-nowrap">#{minuta.id} · {fecha.split(',')[1] || fecha}</span>
               <div className="hidden sm:flex items-center gap-1 text-[8px] text-slate-500 font-black uppercase">
                  <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  <LineIconSelector type={minuta.lineaDefault} size={8} className="text-slate-400" />
                  <span>{LINEA_MAP[minuta.lineaDefault]?.label}</span>
               </div>
            </div>
          </div>
        </div>

        {/* DERECHA: Botones de Acción - Claros pero delgados */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {minuta.estado === 'PROGRAMADA' && (
            <Button variant="marca" icon="play_arrow" onClick={onIniciar} loading={iniciando} size="sm" className="h-7 px-2 md:px-4 text-[9px] font-black uppercase">
              <span className="hidden xs:inline">Iniciar</span>
            </Button>
          )}

          {minuta.estado === 'EN_CURSO' && (
            <Button variant="marca" icon="stop_circle" onClick={onFinalizar} loading={finalizando} size="sm" className="h-7 px-2 md:px-4 text-[9px] font-black uppercase shadow-sm">
              <span className="hidden xs:inline">Finalizar</span>
            </Button>
          )}

          {(minuta.estado === 'ACTIVA' || minuta.estado === 'EN_ORGANIZACION') && (
            <div className="flex items-center gap-1">
               <Button variant="dark" icon="check_circle" onClick={onCerrar} loading={cerrando} size="sm" className="h-7 px-1.5 xs:px-2 md:px-3 text-[9px] font-black uppercase">
                 <span className="hidden xs:inline">Forzar Cierre</span>
               </Button>
               
               <Button variant="outline" icon="lock_open" onClick={onReabrir} loading={reabriendo} size="sm" className="h-7 px-1.5 xs:px-2 md:px-3 text-[9px] font-black uppercase border-slate-200 bg-white text-slate-600">
                 <span className="hidden xs:inline">Reabrir Sesión</span>
               </Button>
            </div>
          )}

          {minuta.estado !== 'CANCELADA' && resumen?.totalEntradas === 0 && (
            <button onClick={onCancelar} disabled={cancelando} className="w-7 h-7 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 active:scale-90 transition-all">
               <Icon name="cancel" size="16px" />
            </button>
          )}
        </div>
      </header>

      {/* Comparación (Solo Desktop) */}
      {isDesktop && (
        <div className="px-4 md:px-6 pb-2 relative z-10">
          <MinutaJuntaComparison minutaId={minuta.id} />
        </div>
      )}
    </div>
  );
};

