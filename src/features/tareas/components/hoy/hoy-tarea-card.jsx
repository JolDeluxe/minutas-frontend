// src/features/tareas/components/hoy/hoy-tarea-card.jsx
import { useState, useRef, useEffect } from 'react';
import { Icon, Tooltip, Badge } from '@/components/ui/z_index';
import { TareaStatusBadge } from '../common/tarea-status-badge';
import { TareaPriorityBadge } from '../common/tarea-priority-badge';
import { isPastDate, formatFecha, formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';
import { LINEA_MAP, CLASIFICACION_MAP, AREA_MAP } from '../../../minutas/constants';
import { LineIconSelector } from '../../../minutas/components/icons/line-icons';

const ROLES_ADMIN = ['GERENCIA', 'JEFE'];
const ROLES_SUPERVISOR = ['GERENCIA', 'JEFE'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA'];

const isVencida = (tarea) => {
    if (!tarea.fechaVencimiento) return false;
    if (['COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    return isPastDate(tarea.fechaVencimiento);
};

const getStatusLabelData = (tarea) => {
    if (tarea.estado === 'RECHAZADO') {
        return {
            label: 'Atención requerida: Tarea rechazada',
            icon: 'warning',
            colorClasses: 'text-white bg-estado-rechazado border-estado-rechazado shadow-sm',
            pulse: true,
        };
    }
    if (tarea.estado === 'COMPLETADO') {
        return {
            label: 'Tarea en espera de aprobación',
            icon: 'hourglass_top',
            colorClasses: 'text-estado-resuelto bg-estado-resuelto/10 border-estado-resuelto/20',
            pulse: false,
        };
    }
    if (tarea.estado === 'EN_PROGRESO') {
        return {
            label: `Tarea en progreso`,
            icon: 'timer',
            colorClasses: 'text-estado-en-progreso bg-estado-en-progreso/10 border-estado-en-progreso/20',
            pulse: true,
        };
    }
    return null;
};

const getEstadoActionMeta = (estado) => {
    switch (estado) {
        case 'ASIGNADA': return { text: 'Iniciar', icon: 'play_arrow' };
        case 'EN_PROGRESO': return { text: 'Finalizar', icon: 'check_circle' };
        case 'EN_PAUSA': return { text: 'Reanudar', icon: 'play_arrow' };
        case 'RECHAZADO': return { text: 'Reiniciar', icon: 'replay' };
        default: return { text: 'Estado', icon: 'swap_horiz' };
    }
};

export const HoyTareaCard = ({
    tarea,
    currentUser,
    onViewDetail,
    onEdit,
    onAssign,
    onChangeStatus,
    onReview,
    onCancel,
    isHighlighted = false,
    className,
}) => {
    const { rol, id: userId } = currentUser ?? {};
    const [responsablesExpanded, setResponsablesExpanded] = useState(false);
    const [showHighlight, setShowHighlight] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        if (!isHighlighted) return;

        const highlightTimer = setTimeout(() => {
            setShowHighlight(true);
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);

        const fadeTimer = setTimeout(() => setShowHighlight(false), 4000);

        return () => {
            clearTimeout(highlightTimer);
            clearTimeout(fadeTimer);
        };
    }, [isHighlighted]);

    const esAdmin = ROLES_ADMIN.includes(rol);
    const esSupervisor = ROLES_SUPERVISOR.includes(rol);
    const esCoordinador = rol === 'COORDINADOR';
    const esCreador = tarea.creadorId === userId;
    const esResponsable = tarea.responsables?.some((r) => r.id === userId);
    const tieneResponsables = tarea.responsables?.length > 0;

    const vencida = isVencida(tarea);
    const esRechazada = tarea.estado === 'RECHAZADO';
    const statusLabelData = getStatusLabelData(tarea);
    const actionMeta = getEstadoActionMeta(tarea.estado);

    const puedeEditar =
        !['EN_PROGRESO', 'COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado) &&
        (esAdmin || (esCreador && tarea.estado === 'PENDIENTE'));

    const puedeAsignar =
        esAdmin &&
        !['EN_PROGRESO', 'COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado);

    const puedeCambiarEstado =
        tieneResponsables &&
        !['COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado) &&
        (esAdmin || (esCoordinador && esResponsable));

    const puedeRevisar =
        tarea.estado === 'COMPLETADO' &&
        (esSupervisor || esCreador);

    const puedeCancelar =
        !ESTADOS_FINALES.includes(tarea.estado) &&
        tarea.estado !== 'COMPLETADO' &&
        (esSupervisor || (esCreador && tarea.estado === 'PENDIENTE'));

    const esAsignarPrimario = tarea.estado === 'PENDIENTE';
    const esEstadoPrimario = ['ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RECHAZADO'].includes(tarea.estado);

    const responsablesExtra = (tarea.responsables?.length || 0) - 2;
    const responsablesMostrar = responsablesExpanded
        ? tarea.responsables
        : tarea.responsables?.slice(0, 2);

    const baseClasses = esRechazada
        ? 'border-estado-rechazado/40 bg-red-50/40'
        : vencida
            ? 'border-orange-300/50 bg-orange-50/30'
            : 'border-slate-200';

    return (
        <div
            ref={cardRef}
            onClick={() => onViewDetail?.(tarea)}
            className={cn(
                'bg-white border rounded-[2rem] p-4 shadow-sm flex flex-col gap-2.5 transition-all duration-700 hover:shadow-md cursor-pointer',
                showHighlight
                    ? 'border-yellow-400 bg-yellow-50/50 shadow-[0_0_0_4px_rgba(250,204,21,0.45),0_8px_24px_rgba(250,204,21,0.2)] -translate-y-0.5'
                    : baseClasses,
                className
            )}
        >
            <div
                className="flex items-start gap-3"
            >
                {/* Thumbnail de imágenes */}
                {tarea.imagenes?.length > 0 && (
                    <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={tarea.imagenes[0].url} className="w-full h-full object-cover" alt="" />
                        {tarea.imagenes.length > 1 && (
                            <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-slate-900/80 text-white text-[8px] font-black rounded-md">
                                +{tarea.imagenes.length - 1}
                            </div>
                        )}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                            #{tarea.id}
                        </span>
                        {vencida && !esRechazada && (
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white bg-red-500 px-2 py-0.5 rounded-lg shadow-sm">
                                Atrasada
                            </span>
                        )}
                    </div>
                    
                    <h3 className="text-[14px] font-black text-slate-900 leading-tight line-clamp-2 mb-1.5">
                        {tarea.descripcion}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 items-center">
                        {tarea.linea && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-lg">
                                <LineIconSelector type={tarea.linea} size={12} className="text-slate-500" />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">
                                    {LINEA_MAP[tarea.linea]?.label || tarea.linea}
                                </span>
                            </div>
                        )}
                         {tarea.clasificacion && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-white shadow-xs" style={{ backgroundColor: CLASIFICACION_MAP[tarea.clasificacion]?.color }}>
                                <Icon name={CLASIFICACION_MAP[tarea.clasificacion]?.icon || 'label'} size="11px" />
                                <span className="text-[9px] font-black uppercase tracking-tight">
                                    {CLASIFICACION_MAP[tarea.clasificacion]?.label || tarea.clasificacion}
                                </span>
                            </div>
                        )}
                        {tarea.fechaVencimiento && (
                            <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-lg border', vencida ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100')}>
                                <Icon name="event" size="11px" className={cn(vencida ? 'text-orange-500' : 'text-slate-400')} />
                                <span className={cn('text-[9px] font-bold', vencida ? 'text-orange-600' : 'text-slate-500')}>
                                    {formatFecha(tarea.fechaVencimiento)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <TareaStatusBadge status={tarea.estadoOperativo || tarea.estado} />
                    <TareaPriorityBadge priority={tarea.prioridad} />
                </div>
            </div>

            {tarea.minuta && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                    <Icon name="description" size="12px" className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-600 truncate">
                        {tarea.minuta.titulo || `Minuta #${tarea.minutaId}`}
                    </span>
                </div>
            )}

            {statusLabelData && (
                <div className={cn('flex items-center gap-2 px-3 py-1.5 border rounded-lg', statusLabelData.colorClasses)}>
                    <Icon
                        name={statusLabelData.icon}
                        size="xs"
                        className={cn('shrink-0', statusLabelData.pulse && 'animate-pulse')}
                    />
                    <span className="text-[11px] font-bold font-mono">
                        {statusLabelData.label}
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap w-full mt-auto" onClick={(e) => e.stopPropagation()}>
                {puedeCancelar && (
                    <Tooltip text="Cancelar" variant="error">
                        <button
                            onClick={() => onCancel?.(tarea)}
                            className="flex items-center justify-center p-1.5 rounded-lg text-estado-rechazado bg-estado-rechazado/10 hover:bg-estado-rechazado/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Icon name="cancel" size="xs" />
                        </button>
                    </Tooltip>
                )}

                <Tooltip text="Ver detalle" variant="dark">
                    <button
                        onClick={() => onViewDetail?.(tarea)}
                        className="flex items-center justify-center p-1.5 rounded-md text-slate-600 hover:bg-slate-600/10 transition-colors cursor-pointer"
                    >
                        <Icon name="visibility" size="sm" />
                    </button>
                </Tooltip>

                <div className="flex-1 min-w-[8px]" />

                {puedeEditar && (
                    <Tooltip text="Editar" variant="dark">
                        <button
                            onClick={() => onEdit?.(tarea)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-prioridad-media bg-prioridad-media/10 hover:bg-prioridad-media/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Icon name="edit" size="xs" />
                        </button>
                    </Tooltip>
                )}

                {puedeCambiarEstado && (
                    <button
                        onClick={() => onChangeStatus?.(tarea)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer',
                            esEstadoPrimario
                                ? 'px-3 py-1.5 text-white bg-estado-en-progreso shadow-sm'
                                : 'px-2.5 py-1.5 text-estado-en-progreso bg-estado-en-progreso/10 hover:bg-estado-en-progreso/20'
                        )}
                    >
                        <Icon name={actionMeta.icon} size="xs" />
                        {esEstadoPrimario && <span className="hidden min-[360px]:inline">{actionMeta.text}</span>}
                    </button>
                )}

                {puedeAsignar && (
                    <Tooltip text="Asignar responsables" variant="dark">
                        <button
                            onClick={() => onAssign?.(tarea)}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer',
                                esAsignarPrimario
                                    ? 'px-3 py-1.5 text-white bg-estado-asignada shadow-sm'
                                    : 'px-2.5 py-1.5 text-estado-asignada bg-estado-asignada/10 hover:bg-estado-asignada/20'
                            )}
                        >
                            <Icon name="person_add" size="xs" />
                            {esAsignarPrimario && <span className="hidden min-[360px]:inline">Asignar</span>}
                        </button>
                    </Tooltip>
                )}

                {puedeRevisar && (
                    <button
                        onClick={() => onReview?.(tarea)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-estado-resuelto active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                        <Icon name="fact_check" size="xs" />
                        <span className="hidden min-[360px]:inline">Revisar</span>
                    </button>
                )}
            </div>
        </div>
    );
};
