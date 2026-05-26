// src/features/tareas/components/hoy/hoy-tarea-card.jsx
import { Icon } from '@/components/ui/z_index';
import { TareaStatusBadge } from '../common/tarea-status-badge';
import { TareaPriorityBadge } from '../common/tarea-priority-badge';

import { TareaEntregaModal } from '../common/tarea-entrega-modal';
import { isPastDate, formatFecha } from '@/lib/date';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { LINEA_MAP, CLASIFICACION_MAP } from '../../../minutas/constants';
import { LineIconSelector } from '../../../minutas/components/icons/line-icons';

const ESTADOS_FINALES = ['CERRADO', 'CANCELADA', 'DESCARTADO'];
const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

const isVencida = (tarea) => {
    if (!tarea.fechaVencimiento) return false;
    if (['EN_REVISION', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    return isPastDate(tarea.fechaVencimiento);
};

export const HoyTareaCard = ({
    tarea,
    currentUser,
    onViewDetail,
    onChangeStatus,
    className,
}) => {

    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);

    const { rol } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;

    const estado = tarea.estado?.toUpperCase();
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrado = ESTADOS_FINALES.includes(estado);
    
    const vencida = isVencida(tarea);


    const isMarketing = tarea.departamento === 'MARKETING';

    // ── Clases de estado ───────────────────────────────────────────────────
    const stateStyles = isMarketing ? {
        PENDIENTE:   'border-purple-500 bg-purple-50/40 hover:bg-purple-100/50',
        EN_REVISION: 'border-amber-500 bg-amber-50/30',
        CERRADA:     'border-slate-400 bg-slate-50 opacity-75 grayscale',
        CANCELADA:   'border-red-500 bg-red-50/50',
    } : {
        PENDIENTE:   'border-blue-500 bg-white hover:bg-slate-50/50',
        EN_REVISION: 'border-amber-500 bg-amber-50/30',
        CERRADA:     'border-slate-400 bg-slate-50 opacity-75 grayscale',
        CANCELADA:   'border-red-500 bg-red-50/50',
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
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-black font-mono text-slate-400">#{tarea.id}</span>
                        {['ADMIN', 'GERENCIA', 'JEFE'].includes(currentUser?.rol) && (
                            <span className={cn(
                                "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border whitespace-nowrap",
                                isMarketing 
                                    ? "bg-purple-100/50 text-purple-700 border-purple-200/40" 
                                    : "bg-blue-100/50 text-blue-700 border-blue-200/40"
                            )}>
                                {isMarketing ? 'Marketing' : 'Diseño'}
                            </span>
                        )}
                        {vencida && !isEnRevision && !isCerrado && (
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white bg-red-500 px-2 py-0.5 rounded-lg shadow-sm">
                                Atrasada
                            </span>
                        )}
                        {tarea.prioridad && <TareaPriorityBadge priority={tarea.prioridad} />}
                    </div>
                    
                    <h3 className={cn(
                        "text-sm font-black text-slate-900 leading-snug line-clamp-2",
                        isCerrado && "line-through text-slate-400 opacity-70"
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
                    <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-lg border', vencida && !isEnRevision ? 'bg-red-50 border-red-100' : 'bg-slate-100 border-slate-200')}>
                        <Icon name="event" size="10px" className={cn(vencida && !isEnRevision ? 'text-red-500' : 'text-slate-400')} />
                        <span className={cn('text-[9px] font-bold', vencida && !isEnRevision ? 'text-red-600' : 'text-slate-600')}>
                            {formatFecha(tarea.fechaVencimiento)}
                        </span>
                    </div>
                )}
            </div>

            {/* Responsables */}
            {tarea.responsables?.length > 0 && (
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Resp:</span>
                    <div className="flex -space-x-2">
                        {tarea.responsables.map((r) => (
                            <div 
                                key={r.id} 
                                className="h-7 w-7 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm shrink-0 ring-1 ring-slate-200/60 transition-transform hover:scale-105 hover:z-10"
                                title={r.nombre}
                            >
                                {r.imagen ? (
                                    <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" />
                                ) : (
                                    r.nombre?.charAt(0)
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Origen (Minuta) */}
            {tarea.minuta && (
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50/50 border border-slate-100 rounded-xl flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                        <Icon name="description" size="12px" className="text-slate-300 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-500 truncate italic" title={tarea.minuta.titulo}>
                            {tarea.minuta.titulo || `Minuta #${tarea.minutaId}`}
                        </span>
                    </div>
                    {tarea.minuta.isJuntaActual && (
                        <span className="inline-flex items-center px-1.5 py-px rounded-full text-[7px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/40 whitespace-nowrap shadow-sm">
                            Junta Actual
                        </span>
                    )}
                    {tarea.minuta.isJuntaAnterior && (
                        <span className="inline-flex items-center px-1.5 py-px rounded-full text-[7px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/40 whitespace-nowrap shadow-sm">
                            Anterior
                        </span>
                    )}
                </div>
            )}

            {/* Área de Acción Principal */}
            <div className="mt-2">
                {isPendiente && esAsignadoDirecto && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEntregaModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                        <Icon name="check" size="sm" />
                        Entregar para Revisión
                    </button>
                )}

                {isEnRevision && (
                    <div className="flex flex-col gap-2 animate-in zoom-in duration-300">
                        <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 border border-slate-100 text-slate-900 rounded-xl">
                            <Icon name="fact_check" size="14px" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Esperando Aprobación</span>
                        </div>
                        
                        {/* Solo Jefes/Gerentes pueden Aprobar (Estética Black) */}
                        {esJefe && onChangeStatus && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeStatus?.(tarea.id, 'CERRADA');
                                }}
                                className="flex items-center justify-center gap-2 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl shadow-2xl shadow-black/20 font-black text-[10px] uppercase tracking-widest transition-all w-full"
                            >
                                <Icon name="verified" size="xs" />
                                Aprobar y Cerrar Tarea
                            </button>
                        )}
                    </div>
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

            {isEntregaModalOpen && (
                <TareaEntregaModal
                    isOpen={isEntregaModalOpen}
                    onClose={() => setIsEntregaModalOpen(false)}
                    tareaId={tarea.id}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(tarea.id, 'EN_REVISION');
                    }}
                />
            )}
        </div>
    );
};
