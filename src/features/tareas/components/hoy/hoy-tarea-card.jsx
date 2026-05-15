// src/features/tareas/components/hoy/hoy-tarea-card.jsx
import { Icon } from '@/components/ui/z_index';
import { TareaStatusBadge } from '../common/tarea-status-badge';
import { TareaPriorityBadge } from '../common/tarea-priority-badge';

import { isPastDate, formatFecha } from '@/lib/date';
import { cn } from '@/utils/cn';
import { LINEA_MAP, CLASIFICACION_MAP } from '../../../minutas/constants';
import { LineIconSelector } from '../../../minutas/components/icons/line-icons';

const ESTADOS_FINALES = ['CERRADO', 'CANCELADA', 'DESCARTADO'];
const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

const isVencida = (tarea) => {
    if (!tarea.fechaVencimiento) return false;
    if (['COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    return isPastDate(tarea.fechaVencimiento);
};

export const HoyTareaCard = ({
    tarea,
    currentUser,
    onViewDetail,
    onChangeStatus,
    className,
}) => {

    const { rol } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;

    const estado = tarea.estado?.toUpperCase();
    const isEnProgreso = estado === 'EN_PROGRESO';
    const isCompletado = estado === 'COMPLETADO';
    const isRechazado = estado === 'RECHAZADO';
    const isCerrado = ESTADOS_FINALES.includes(estado);
    const isPendiente = !isEnProgreso && !isCompletado && !isCerrado && !isRechazado;
    
    const vencida = isVencida(tarea);


    // ── Clases de estado ───────────────────────────────────────────────────
    const stateStyles = {
        PENDIENTE:   'border-blue-500 bg-white',
        EN_PROGRESO: 'border-amber-500 bg-amber-50/30',
        COMPLETADO:  'border-emerald-500 bg-emerald-50/50',
        RECHAZADO:   'border-red-500 bg-red-50/50',
        CERRADO:     'border-slate-400 bg-slate-50 opacity-75 grayscale',
    };

    const currentStyle = stateStyles[estado] || 'border-slate-200 bg-white';

    const esAsignadoDirecto = tarea.responsables?.some((r) => r.id == currentUser?.id);

    return (
        <div
            onClick={() => onViewDetail?.(tarea)}
            className={cn(
                'relative border-l-[6px] rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:shadow-md cursor-pointer',
                currentStyle,
                className
            )}
        >
            {/* Status Badge (ELEGANTE) */}
            <div className="absolute top-4 right-4">
                <TareaStatusBadge status={estado} size="xs" />
            </div>

            <div className="flex items-start gap-3">
                {/* Thumbnail de imágenes */}
                {tarea.imagenes?.length > 0 && (
                    <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        <img src={tarea.imagenes[0].url} className="w-full h-full object-cover" alt="" />
                        {tarea.imagenes.length > 1 && (
                            <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-slate-900/80 text-white text-[8px] font-black rounded-md">
                                +{tarea.imagenes.length - 1}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black font-mono text-slate-400">#{tarea.id}</span>
                        {vencida && !isCompletado && !isCerrado && (
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white bg-red-500 px-2 py-0.5 rounded-lg shadow-sm">
                                Atrasada
                            </span>
                        )}
                        {tarea.prioridad && <TareaPriorityBadge priority={tarea.prioridad} />}
                    </div>
                    
                    <h3 className={cn(
                        "text-sm font-black text-slate-900 leading-snug line-clamp-2",
                        isCompletado && "line-through text-slate-400 opacity-70"
                    )}>
                        {tarea.descripcion}
                    </h3>
                </div>
            </div>

            {/* Metadatos Rápidos */}
            <div className="flex flex-wrap gap-1.5 items-center">
                {tarea.linea && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-lg">
                        <LineIconSelector type={tarea.linea} size={10} className="text-slate-500" />
                        <span className="text-[9px] font-black text-slate-600 uppercase">
                            {LINEA_MAP[tarea.linea]?.label || tarea.linea}
                        </span>
                    </div>
                )}
                {tarea.clasificacion && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-white" style={{ backgroundColor: CLASIFICACION_MAP[tarea.clasificacion]?.color }}>
                        <Icon name={CLASIFICACION_MAP[tarea.clasificacion]?.icon || 'label'} size="10px" />
                        <span className="text-[9px] font-black uppercase tracking-tight">
                            {CLASIFICACION_MAP[tarea.clasificacion]?.label || tarea.clasificacion}
                        </span>
                    </div>
                )}
                {tarea.fechaVencimiento && (
                    <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-lg border', vencida && !isCompletado ? 'bg-red-50 border-red-100' : 'bg-slate-100 border-slate-200')}>
                        <Icon name="event" size="10px" className={cn(vencida && !isCompletado ? 'text-red-500' : 'text-slate-400')} />
                        <span className={cn('text-[9px] font-bold', vencida && !isCompletado ? 'text-red-600' : 'text-slate-600')}>
                            {formatFecha(tarea.fechaVencimiento)}
                        </span>
                    </div>
                )}
            </div>

            {/* Origen (Minuta) */}
            {tarea.minuta && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                    <Icon name="description" size="12px" className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-500 truncate italic">
                        {tarea.minuta.titulo || `Minuta #${tarea.minutaId}`}
                    </span>
                </div>
            )}

            {/* Área de Acción Principal */}
            <div className="mt-2">
                {isPendiente && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChangeStatus?.(tarea.id, 'EN_PROGRESO');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                        <Icon name="play_arrow" size="sm" />
                        Iniciar Trabajo
                    </button>
                )}

                {isEnProgreso && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChangeStatus?.(tarea.id, (esJefe && esAsignadoDirecto) ? 'CERRADO' : 'COMPLETADO');
                        }}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest",
                            (esJefe && esAsignadoDirecto) 
                                ? "bg-black hover:bg-neutral-800 text-white shadow-black/20" 
                                : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                        )}
                    >
                        <Icon name={(esJefe && esAsignadoDirecto) ? "verified" : "check"} size="sm" />
                        {(esJefe && esAsignadoDirecto) ? "Terminar y Cerrar" : "Marcar como Completado"}
                    </button>
                )}

                {isCompletado && (
                    <div className="flex flex-col gap-2 animate-in zoom-in duration-300">
                        <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 border border-slate-100 text-slate-900 rounded-xl">
                            <Icon name="fact_check" size="14px" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Esperando Aprobación</span>
                        </div>
                        
                        {/* Solo Jefes/Gerentes pueden Aprobar (Estética Black) */}
                        {esJefe && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeStatus?.(tarea.id, 'CERRADO');
                                }}
                                className="flex items-center justify-center gap-2 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl shadow-2xl shadow-black/20 font-black text-[10px] uppercase tracking-widest transition-all w-full"
                            >
                                <Icon name="verified" size="xs" />
                                Aprobar y Cerrar Tarea
                            </button>
                        )}
                    </div>
                )}

                {isRechazado && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChangeStatus?.(tarea.id, 'EN_PROGRESO');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                        <Icon name="replay" size="sm" />
                        Reiniciar Trabajo
                    </button>
                )}

                {isCerrado && tarea.completadoAt && tarea.fechaVencimiento && new Date(tarea.completadoAt) > new Date(tarea.fechaVencimiento) && (
                    <div 
                        className="flex items-center gap-2 py-2.5 px-4 border rounded-xl"
                        style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                    >
                        <Icon name="history_toggle_off" size="16px" style={{ color: '#dc2626' }} />
                        <span 
                            className="text-[11px] font-black uppercase tracking-[0.1em] text-center w-full italic"
                            style={{ color: '#dc2626' }}
                        >
                            Entrega Tardía
                        </span>
                    </div>
                )}
            </div>


        </div>
    );
};
