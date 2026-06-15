import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { LINEA_MAP, ESTADO_MINUTA_MAP } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { MinutaExecutiveSummary } from '../minuta-executive-summary';
import { MinutaJuntaComparison } from '../minuta-junta-comparison';

/**
 * MinutaContextPanel — Panel de contexto de la minuta.
 * Ahora incluye el resumen ejecutivo visual y comparación con junta anterior.
 */
export const MinutaContextPanel = ({ 
  minuta, resumen, onFilterByStatus, onFilterByTipo, onToggleExternal, onResetFilter, activeFilter,
  onIniciar, onCancelar, onCerrar, onReabrir, onFinalizar,
  iniciando, cancelando, cerrando, reabriendo, finalizando,
  composerCollapsed = true,
  VistaSwitcher,
  vistaResumen = false,
}) => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [showExternalDetails, setShowExternalDetails] = useState(false);

  if (!minuta) return null;

  const fecha = new Date(minuta.fechaRealizada || minuta.fechaProgramada || minuta.createdAt).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const getEstadoClasses = (estado) => {
    switch (estado) {
      case 'ACTIVA': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EN_CURSO': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'EN_ORGANIZACION': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CERRADA': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'CANCELADA': return 'bg-red-50 text-red-700 border-red-200';
      case 'PROGRAMADA': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const estadoLabel = ESTADO_MINUTA_MAP[minuta.estado]?.label || minuta.estado;
  const isExterna = 'tema' in minuta;

  return (
    <div className="w-full bg-white border-b border-slate-200/60 shrink-0 relative shadow-sm">

      {/* Resumen Ejecutivo - Visible en Tablets y Desktop (Se oculta en móvil o si estamos en la vista de resumen) */}
      {!vistaResumen && (
        <div className="hidden md:block px-3 md:px-6 pt-3 pb-1 relative z-30 border-b border-slate-50">
          <MinutaExecutiveSummary 
            resumen={resumen} 
            onFilterByStatus={onFilterByStatus}
            onFilterByTipo={onFilterByTipo}
            onToggleExternal={onToggleExternal}
            onResetFilter={onResetFilter}
            activeFilter={activeFilter}
            isExterna={isExterna}
          />
        </div>
      )}

      {/* Header Unificado y Legible */}
      <header className="px-3 md:px-6 py-2.5 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4 relative z-20">
        
        {/* FILA 1 (Móvil) / PANEL IZQUIERDO (Desktop) */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button 
            onClick={() => navigate('/minutas')}
            className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90 transition-all shrink-0"
          >
            <Icon name="chevron_left" size="18px" />
          </button>
 
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h2 className="text-[12px] xs:text-[14px] md:text-lg font-black text-slate-900 fuente-titulos tracking-tight leading-tight md:truncate break-words whitespace-normal md:whitespace-nowrap" title={isExterna ? minuta.tema : minuta.titulo}>
                {isExterna ? minuta.tema : minuta.titulo}
              </h2>
              {!isExterna && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[7px] md:text-[9px] font-black uppercase tracking-wider border shrink-0",
                  getEstadoClasses(minuta.estado)
                )}>
                  {estadoLabel}
                </span>
              )}
            </div>
            
            {/* Metadata (Visible en este bloque solo en Desktop) */}
            <div className="hidden md:flex items-center gap-1.5">
               <span className="text-[7px] md:text-[10px] font-bold text-slate-400 font-mono whitespace-nowrap">#{minuta.id} · {fecha.split(',')[1] || fecha}</span>
               <div className="flex items-center gap-1 text-[8px] md:text-[10px] text-slate-500 font-black uppercase">
                  <span className="w-0.5 h-0.5 rounded-full bg-slate-300 mx-0.5" />
                  {isExterna ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-700">{minuta.area || 'Externo'}</span>
                      {minuta.departamento && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[9px]">{minuta.departamento}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <LineIconSelector type={minuta.lineaDefault} size={isDesktop ? 26 : 18} className="text-slate-400 shrink-0" />
                      <span className="hidden xs:inline">{LINEA_MAP[minuta.lineaDefault]?.label}</span>
                    </>
                  )}
               </div>
            </div>

            {/* Objetivo y Participantes (Solo Minutas Externas) */}
            {isExterna && (
              <div className="mt-2 flex items-start md:items-center gap-3 md:gap-4 flex-col md:flex-row text-[10px] md:text-xs">
                {minuta.objetivo && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Icon name="flag" size="14px" className="text-amber-500 shrink-0" />
                    <span className="font-black uppercase tracking-wider text-slate-400">Objetivo:</span>
                    <span className="font-medium">{minuta.objetivo}</span>
                  </div>
                )}
                {minuta.objetivo && minuta.integrantes && (
                  <span className="hidden md:block w-px h-3.5 bg-slate-300 shrink-0" />
                )}
                {minuta.integrantes && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Icon name="groups" size="14px" className="text-blue-500 shrink-0" />
                    <span className="font-black uppercase tracking-wider text-slate-400">Participantes:</span>
                    <span className="font-medium">{minuta.integrantes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* En móvil, renderizamos el Switcher al lado derecho del título para que quepa en la primera fila */}
          {VistaSwitcher && (
            <div className="flex md:hidden items-center shrink-0 ml-1.5">
              <VistaSwitcher />
            </div>
          )}
        </div>

        {/* Switch Tareas / Resumen — visible en el header en desktop */}
        {VistaSwitcher && (
          <div className="hidden md:flex items-center shrink-0">
            <VistaSwitcher />
          </div>
        )}

        {/* FILA 2 (Solo Móvil) - Contiene metadatos y botones de acción lado a lado */}
        <div className="flex md:hidden items-center justify-between gap-2 border-t border-slate-100 pt-2 mt-0.5">
          {/* Metadata en Móvil */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[8px] font-bold text-slate-400 font-mono whitespace-nowrap">#{minuta.id} · {fecha.split(',')[1] || fecha}</span>
            <div className="flex items-center gap-1 text-[8px] text-slate-500 font-black uppercase">
              {isExterna ? (
                <>
                  <span className="font-extrabold text-slate-700">{minuta.area || 'Externo'}</span>
                  {minuta.departamento && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                      <span className="text-[7px]">{minuta.departamento}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <LineIconSelector type={minuta.lineaDefault} size={14} className="text-slate-400 shrink-0" />
                  <span>{LINEA_MAP[minuta.lineaDefault]?.label}</span>
                </>
              )}
            </div>
          </div>

          {/* Botones de Acción en Móvil */}
          <div className="flex items-center gap-1 shrink-0">
            {!isExterna && minuta.estado === 'PROGRAMADA' && (
              <Button variant="marca" icon="play_arrow" onClick={onIniciar} loading={iniciando} size="sm" className="h-7 px-2 text-[9px] font-black uppercase">
                <span>Iniciar</span>
              </Button>
            )}

            {!isExterna && minuta.estado === 'EN_CURSO' && resumen?.totalValidas > 0 && composerCollapsed && (
              <Button variant="marca" icon="stop_circle" onClick={onFinalizar} loading={finalizando} size="sm" className="h-7 px-2 text-[9px] font-black uppercase shadow-sm">
                <span>Finalizar</span>
              </Button>
            )}

            {!isExterna && (minuta.estado === 'ACTIVA' || minuta.estado === 'EN_ORGANIZACION' || minuta.estado === 'CERRADA') && (
              <div className="flex items-center gap-1">
                 {(minuta.estado === 'ACTIVA' || minuta.estado === 'EN_ORGANIZACION') && (
                   <Button variant="dark" icon="check_circle" onClick={onCerrar} loading={cerrando} size="sm" className="h-7 px-1.5 text-[9px] font-black uppercase">
                     <span>Forzar Cierre</span>
                   </Button>
                 )}
                 
                 <Button variant="outline" icon="lock_open" onClick={onReabrir} loading={reabriendo} size="sm" className="h-7 px-1.5 text-[9px] font-black uppercase border-slate-200 bg-white text-slate-600">
                   <span>Reabrir</span>
                 </Button>
              </div>
            )}

            {minuta.estado !== 'CANCELADA' && !resumen?.hasActiveTasks && (
              <button onClick={onCancelar} disabled={cancelando} className="w-7 h-7 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 active:scale-90 transition-all">
                 <Icon name="delete" size="16px" />
              </button>
            )}
          </div>
        </div>

        {/* PANEL DE ACCIONES (Solo Desktop) */}
        <div className="hidden md:flex items-center gap-1 shrink-0 ml-auto">
          {!isExterna && minuta.estado === 'PROGRAMADA' && (
            <Button variant="marca" icon="play_arrow" onClick={onIniciar} loading={iniciando} size="sm" className="h-7 px-2 md:px-4 text-[9px] font-black uppercase">
              <span className="hidden xs:inline">Iniciar</span>
            </Button>
          )}

          {!isExterna && minuta.estado === 'EN_CURSO' && resumen?.totalValidas > 0 && composerCollapsed && (
            <Button variant="marca" icon="stop_circle" onClick={onFinalizar} loading={finalizando} size="sm" className="h-7 px-2 md:px-4 text-[9px] font-black uppercase shadow-sm">
              <span className="hidden xs:inline">Finalizar</span>
            </Button>
          )}

          {!isExterna && (minuta.estado === 'ACTIVA' || minuta.estado === 'EN_ORGANIZACION' || minuta.estado === 'CERRADA') && (
            <div className="flex items-center gap-1">
               {(minuta.estado === 'ACTIVA' || minuta.estado === 'EN_ORGANIZACION') && (
                 <Button variant="dark" icon="check_circle" onClick={onCerrar} loading={cerrando} size="sm" className="h-7 px-1.5 xs:px-2 md:px-3 text-[9px] font-black uppercase">
                   <span className="hidden xs:inline">Forzar Cierre</span>
                 </Button>
               )}
               
               <Button variant="outline" icon="lock_open" onClick={onReabrir} loading={reabriendo} size="sm" className="h-7 px-1.5 xs:px-2 md:px-3 text-[9px] font-black uppercase border-slate-200 bg-white text-slate-600">
                 <span className="hidden xs:inline">Reabrir Sesión</span>
               </Button>
            </div>
          )}

          {minuta.estado !== 'CANCELADA' && !resumen?.hasActiveTasks && (
            <button onClick={onCancelar} disabled={cancelando} className="w-7 h-7 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 active:scale-90 transition-all">
               <Icon name="delete" size="16px" />
            </button>
          )}
        </div>
      </header>

      {/* EXTERNAL MINUTA DETAILS - Solo para minutas externas */}
      {isExterna && (
        <div className="px-4 md:px-6 pb-2 pt-1 relative z-10 flex flex-col gap-2">
          {!isDesktop && (
            <button
              onClick={() => setShowExternalDetails(!showExternalDetails)}
              className="flex items-center justify-between w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold uppercase"
            >
              <div className="flex items-center gap-2">
                <Icon name="info" size="16px" className="text-brand" />
                <span>Detalles de Minuta</span>
              </div>
              <Icon name="expand_more" size="18px" className={cn("transition-transform", showExternalDetails ? "rotate-180" : "")} />
            </button>
          )}

          <div className={cn(
            "flex flex-col gap-2 transition-all duration-300 overflow-hidden",
            !isDesktop && !showExternalDetails ? "max-h-0 opacity-0" : "max-h-[1500px] opacity-100"
          )}>
            <div className="flex flex-col gap-4">

              {minuta.asistentes && (
                <div className="text-sm mt-1 pt-3 border-t border-slate-100">
                  <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Icon name="how_to_reg" size="14px" className="text-slate-400" />
                    Asistentes
                  </span>
                  <p className="text-slate-600 text-xs md:text-sm pl-5">{minuta.asistentes}</p>
                </div>
              )}

              {(minuta.resumenTemas || minuta.resumenAcuerdos || minuta.resumenProximosPasos) && (
                <div className="flex flex-col gap-3 mt-1 pt-2 border-t border-slate-100">
                  {minuta.resumenTemas && (
                    <div className="text-sm">
                      <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Icon name="format_list_bulleted" size="14px" className="text-slate-400" />
                        Temas Tratados
                      </span>
                      <p className="text-slate-600 text-xs md:text-sm whitespace-pre-wrap pl-5">{minuta.resumenTemas}</p>
                    </div>
                  )}
                  {minuta.resumenAcuerdos && (
                    <div className="text-sm">
                      <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Icon name="handshake" size="14px" className="text-slate-400" />
                        Acuerdos
                      </span>
                      <p className="text-slate-600 text-xs md:text-sm whitespace-pre-wrap pl-5">{minuta.resumenAcuerdos}</p>
                    </div>
                  )}
                  {minuta.resumenProximosPasos && (
                    <div className="text-sm">
                      <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Icon name="next_plan" size="14px" className="text-slate-400" />
                        Próximos Pasos
                      </span>
                      <p className="text-slate-600 text-xs md:text-sm whitespace-pre-wrap pl-5">{minuta.resumenProximosPasos}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Comparación (Solo Desktop y si no estamos en vista de resumen) */}
      {isDesktop && !vistaResumen && (
        <div className="px-4 md:px-6 pb-2 relative z-10">
          <MinutaJuntaComparison minutaId={minuta.id} />
        </div>
      )}
    </div>
  );
};
