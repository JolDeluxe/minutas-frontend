import { useMemo } from 'react';
import { Badge, Icon, Card } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { LINEA_MAP, ESTADO_MINUTA_MAP } from '../constants';
import { LineIconSelector, MarketingIcon } from './icons/line-icons';

const ESTADO_COLORS = {
    PROGRAMADA:      'bg-indigo-50 text-indigo-700 border-indigo-200',
    EN_CURSO:        'bg-blue-50 text-blue-700 border-blue-200',
    EN_ORGANIZACION: 'bg-orange-50 text-orange-700 border-orange-200',
    ACTIVA:          'bg-emerald-50 text-emerald-700 border-emerald-200',
    CERRADA:         'bg-slate-100 text-slate-500 border-slate-200',
    CANCELADA:       'bg-red-50 text-red-700 border-red-200',
};

/**
 * Formatea la fecha real de la minuta para mostrar al ejecutivo.
 * El jefe necesita ver "15 May, 2026" — no "hace 4h".
 */
const formatFechaReal = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-MX', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });
};

export const MinutaCard = ({ minuta, onViewDetail, onEdit, onCancel, badge = null, isAdmin = false, onDownloadPdf, isGeneratingPdf }) => {
    const estadoLabel = ESTADO_MINUTA_MAP[minuta.estado]?.label || minuta.estado.replace(/_/g, ' ');
    const estadoColor = ESTADO_COLORS[minuta.estado] || 'bg-slate-50 text-slate-600 border-slate-200';
    
    // Resumen operativo del backend
    const resumen = minuta.resumenOperativo || {};
    const totalTareas = (resumen.completadas || 0) + (resumen.cerradas || 0) + (resumen.pendientes || 0);
    const porcentaje = resumen.porcentajeCompletado || 0;
    const atrasadas = resumen.atrasadas || 0;
    const completadas = resumen.cerradas || 0;

    const canCancel = minuta.estado !== 'CANCELADA' && !resumen.hasActiveTasks;
    const canEdit = minuta.estado !== 'CANCELADA' && minuta.estado !== 'CERRADA';
    
    // Fecha REAL — lo que el jefe necesita para "la minuta del 28 de marzo"
    const fechaReal = formatFechaReal(minuta.fechaRealizada || minuta.fechaProgramada || minuta.createdAt);
    
    const dept = minuta.departamento || minuta.creadoPor?.departamento;
    const isMarketing = dept === 'MARKETING';
    const isExterna = 'tema' in minuta;
    
    const lineInfo = isMarketing 
        ? { label: 'Marketing', color: '#7c3aed' } 
        : isExterna
        ? { label: minuta.area || 'Externo', color: '#d97706' }
        : (LINEA_MAP[minuta.lineaDefault] || { label: minuta.lineaDefault, color: '#64748b' });

    const title = isExterna ? minuta.tema : minuta.titulo;

    const BADGE_CONFIG = {
        current: {
            label: 'Junta Actual',
            bg: 'bg-emerald-600',
            border: 'border-emerald-400/40 ring-1 ring-emerald-400/20',
        },
        previous: {
            label: 'Junta Anterior — Revisar',
            bg: 'bg-indigo-600',
            border: 'border-indigo-400/40 ring-1 ring-indigo-400/20',
        },
    };
    const badgeCfg = badge ? BADGE_CONFIG[badge] : null;

    const isPendiente = useMemo(() => {
        if (minuta.estado !== 'PROGRAMADA' || !minuta.fechaProgramada) return false;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const programada = new Date(minuta.fechaProgramada);
        programada.setHours(0, 0, 0, 0);
        return programada < hoy;
    }, [minuta.estado, minuta.fechaProgramada]);

    const finalBadgeCfg = badgeCfg || (isPendiente ? {
        label: 'Pendiente de realizar',
        bg: 'bg-amber-500',
        border: 'border-amber-300 ring-1 ring-amber-300/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    } : null);

    return (
        <Card 
            className={cn(
                "transition-all duration-300 overflow-hidden group border cursor-pointer relative rounded-[1.5rem] shadow-sm hover:shadow-xl flex flex-col h-full",
                finalBadgeCfg ? finalBadgeCfg.border : "border-slate-200/80",
                isAdmin 
                    ? (isMarketing 
                        ? "bg-purple-50/50 border-purple-200 hover:bg-purple-100/60 hover:border-purple-300 border-l-4 border-l-purple-500" 
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 border-l-4 border-l-blue-500")
                    : "bg-white border-slate-200 hover:border-slate-300"
            )}
            onClick={() => onViewDetail?.(minuta)}
        >
            {/* Badge: Junta Actual / Junta Anterior / Pendiente */}
            {finalBadgeCfg && (
                <div className={cn(
                    "absolute top-0 left-0 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-br-xl z-10 shadow-sm",
                    finalBadgeCfg.bg
                )}>
                    {finalBadgeCfg.label}
                </div>
            )}

            <div className={cn("flex flex-row p-4 h-full", !isMarketing && "gap-4")}>
                
                {/* COLUMNA 1: IDENTIDAD VISUAL (Icono + Línea) - Oculta en Marketing y Externas */}
                {!isMarketing && !isExterna && (
                    <div className="flex flex-col items-center justify-center shrink-0 w-[82px] sm:w-[96px] h-full border-r border-slate-100/50 pr-4">
                        <div className="flex flex-col items-center justify-center w-full aspect-square rounded-[1.25rem] mb-2 transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: `${lineInfo.color}0f`, border: `1.5px solid ${lineInfo.color}25` }}>
                            <LineIconSelector type={minuta.lineaDefault} size={60} style={{ color: lineInfo.color }} />
                        </div>
                        <span className="font-black tracking-[0.1em] text-[7px] sm:text-[8px] uppercase font-mono text-center leading-none px-1" style={{ color: lineInfo.color }}>
                            {lineInfo.label}
                        </span>
                    </div>
                )}
                


                {/* COLUMNA 2: INFORMACIÓN DETALLADA */}
                <div className="flex flex-col flex-1 min-w-0 h-full">
                    
                    {/* Header: MN-ID + Dept + Estado */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wide">
                                MN-{String(minuta.id).padStart(3, '0')}
                            </span>
                            {isAdmin && !isExterna && (
                                <span className={cn(
                                    "px-1.5 py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-wider rounded border",
                                    isMarketing 
                                        ? "bg-purple-100/50 text-purple-700 border-purple-200/40" 
                                        : "bg-blue-100/50 text-blue-700 border-blue-200/40"
                                )}>
                                    {isMarketing ? 'Marketing' : 'Diseño'}
                                </span>
                            )}



                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {!!onDownloadPdf && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownloadPdf(minuta);
                                    }}
                                    disabled={isGeneratingPdf}
                                    className="h-6 w-6 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-all active:scale-90"
                                    title="Descargar PDF"
                                >
                                    <Icon name={isGeneratingPdf ? "hourglass_empty" : "picture_as_pdf"} className={cn("!text-[14px]", isGeneratingPdf && "animate-spin")} />
                                </button>
                            )}
                            {canEdit && !!onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(minuta);
                                    }}
                                    className="h-6 w-6 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-90"
                                    title="Editar Minuta"
                                >
                                    <Icon name="edit" className="!text-[14px]" />
                                </button>
                            )}
                            {canCancel && !!onCancel && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCancel(minuta);
                                    }}
                                    className="h-6 w-6 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all active:scale-90"
                                    title="Cancelar Minuta"
                                >
                                    <Icon name="delete" className="!text-[14px]" />
                                </button>
                            )}
                            {!isExterna && (
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md border shrink-0",
                                    estadoColor
                                )}>
                                    {minuta.estado === 'ACTIVA' && (
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                        </span>
                                    )}
                                    {estadoLabel}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Título: Con mejor tipografía */}
                    <h3 className="font-extrabold text-slate-900 text-[14px] sm:text-base leading-tight line-clamp-2 mb-3 fuente-titulos group-hover:text-marca-primario transition-colors" title={title}>
                        {title}
                    </h3>

                    {/* Footer Row: Fecha y Progreso */}
                    <div className="mt-auto flex flex-col gap-2.5">
                        
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 w-fit">
                            <Icon name="event" size="12px" className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-600">{fechaReal}</span>
                        </div>

                        {totalTareas > 0 ? (
                            <div className="space-y-1.5">
                                <div className="relative h-1.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                    <div 
                                        className={cn(
                                            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                                            porcentaje < 100 
                                                ? "bg-gradient-to-r from-amber-500 to-amber-400" 
                                                : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                        )}
                                        style={{ width: `${porcentaje}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between px-0.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5" title="Completadas">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-bold font-mono text-slate-500">{completadas}</span>
                                        </div>
                                        {atrasadas > 0 && (
                                            <div className="flex items-center gap-0.5 animate-pulse" title="Atrasadas">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                <span className="text-[9px] font-black font-mono text-red-600">{atrasadas}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-black font-mono text-slate-400">
                                        {porcentaje}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 opacity-60">
                                <Icon name="format_list_bulleted" size="12px" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Sin tareas</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
