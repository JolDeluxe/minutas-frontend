import { useMemo } from 'react';
import { Badge, Icon, Card } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { LINEA_MAP } from '../constants';
import { LineIconSelector } from './icons/line-icons';

const ESTADO_LABEL = {
    PROGRAMADA: 'Programada',
    ACTIVA: 'Activa',
    CERRADA: 'Cerrada',
    CANCELADA: 'Cancelada',
};

const ESTADO_COLORS = {
    PROGRAMADA: 'bg-blue-50 text-blue-700 border-blue-200',
    ACTIVA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CERRADA: 'bg-slate-100 text-slate-500 border-slate-200',
    CANCELADA: 'bg-red-50 text-red-700 border-red-200',
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

export const MinutaCard = ({ minuta, onViewDetail, onEdit, badge = null, isAdmin = false }) => {
    const estadoLabel = ESTADO_LABEL[minuta.estado] || minuta.estado;
    const estadoColor = ESTADO_COLORS[minuta.estado] || 'bg-slate-50 text-slate-600 border-slate-200';
    
    // Resumen operativo del backend
    const resumen = minuta.resumenOperativo || {};
    const total = resumen.totalEntradas || minuta._count?.tareas || 0;
    const porcentaje = resumen.porcentajeCompletado || 0;
    const atrasadas = resumen.atrasadas || 0;
    const completadas = (resumen.completadas || 0) + (resumen.cerradas || 0);
    const enProgreso = resumen.enProgreso || 0;
    const pendientes = resumen.pendientes || 0;
    
    // Fecha REAL — lo que el jefe necesita para "la minuta del 28 de marzo"
    const fechaReal = formatFechaReal(minuta.fechaRealizada || minuta.fechaProgramada || minuta.createdAt);
    
    const dept = minuta.departamento || minuta.creadoPor?.departamento;
    const isMarketing = dept === 'MARKETING';
    const isDiseno = dept === 'DISENO';
    const lineInfo = isMarketing 
        ? { label: 'Campaña', color: '#8b5cf6' } 
        : (LINEA_MAP[minuta.lineaDefault] || { label: minuta.lineaDefault, color: '#64748b' });

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
                "transition-all duration-200 overflow-hidden group border cursor-pointer relative rounded-2xl shadow-sm hover:shadow-lg",
                finalBadgeCfg ? finalBadgeCfg.border : "border-slate-200/80",
                isAdmin 
                    ? (isMarketing 
                        ? "bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 border-l-4 border-l-purple-500" 
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 border-l-4 border-l-blue-500")
                    : "bg-white border-slate-200 hover:border-slate-300"
            )}
            onClick={() => onViewDetail?.(minuta)}
        >
            {/* Badge: Junta Actual / Junta Anterior / Pendiente */}
            {finalBadgeCfg && (
                <div className={cn(
                    "absolute top-0 left-0 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-br-xl z-10",
                    finalBadgeCfg.bg
                )}>
                    {finalBadgeCfg.label}
                </div>
            )}

            <div className="p-4">
                {/* Fila 1: ID + Departamento (Admin) + Estado */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wide">
                            MN-{String(minuta.id).padStart(3, '0')}
                        </span>
                        {isAdmin && (
                            <span className={cn(
                                "px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded border",
                                isMarketing 
                                    ? "bg-purple-50 text-purple-700 border-purple-200/60" 
                                    : "bg-blue-50 text-blue-700 border-blue-200/60"
                            )}>
                                {isMarketing ? 'Marketing' : 'Diseño'}
                            </span>
                        )}
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border",
                        estadoColor
                    )}>
                        {minuta.estado === 'ACTIVA' && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        )}
                        {estadoLabel}
                    </div>
                </div>

                {/* Fila 2: TÍTULO GRANDE */}
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight line-clamp-2 mb-3 fuente-titulos">
                    {minuta.titulo}
                </h3>

                {/* Fila 3: Metadatos — Fecha + Línea */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                        <Icon name="event" size="14px" className="text-slate-400" />
                        <span className="font-bold text-slate-600">{fechaReal}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl" style={{ backgroundColor: `${lineInfo.color}0a`, border: `1.5px solid ${lineInfo.color}25` }}>
                        {isMarketing ? (
                            <Icon name="campaign" size="35px" style={{ color: lineInfo.color }} />
                        ) : (
                            <LineIconSelector type={minuta.lineaDefault} size={35} style={{ color: lineInfo.color }} />
                        )}
                        <span className="font-black tracking-[0.15em] text-[6px] uppercase font-mono text-center leading-none" style={{ color: lineInfo.color }}>
                            {lineInfo.label}
                        </span>
                    </div>
                </div>

                {/* Fila 4: Barra de progreso + conteo de entradas */}
                {total > 0 ? (
                    <div>
                        <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden mb-1.5">
                            <div 
                                className={cn(
                                    "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                                    porcentaje < 100 
                                        ? "bg-gradient-to-r from-amber-500 to-amber-400" 
                                        : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                )}
                                style={{ width: `${porcentaje}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5" title="Completadas">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold font-mono text-slate-500">{completadas}</span>
                                </div>
                                {enProgreso > 0 && (
                                    <div className="flex items-center gap-0.5" title="En progreso">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span className="text-[10px] font-bold font-mono text-slate-500">{enProgreso}</span>
                                    </div>
                                )}
                                {atrasadas > 0 && (
                                    <div className="flex items-center gap-0.5 animate-pulse" title="Atrasadas">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-[10px] font-black font-mono text-red-600">{atrasadas}</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                                <span className="font-black text-slate-600">{total}</span> entradas · {porcentaje}%
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Icon name="format_list_bulleted" size="14px" />
                        <span className="text-[11px] font-medium">Sin entradas</span>
                    </div>
                )}
            </div>
        </Card>
    );
};
