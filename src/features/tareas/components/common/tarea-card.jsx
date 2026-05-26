import { Badge, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { formatFecha } from '@/lib/date';


const ESTADO_TAREA_LABEL = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En Revisión',
    CERRADA: 'Cerrada',
    CANCELADA: 'Cancelada',
};

const ESTADO_TAREA_COLOR = {
    PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
    CERRADA: 'bg-slate-50 text-slate-700 border-slate-200',
    CANCELADA: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PRIORIDAD_LABEL = {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    URGENTE: 'Urgente',
};

const PRIORIDAD_COLOR = {
    BAJA: 'text-slate-500',
    MEDIA: 'text-amber-600',
    ALTA: 'text-orange-600',
    URGENTE: 'text-rose-600',
};

export const TareaCard = ({ tarea, onViewDetail, onEdit, onOrganize }) => {
    const estadoLabel = ESTADO_TAREA_LABEL[tarea.estado] || tarea.estado;
    const estadoColor = ESTADO_TAREA_COLOR[tarea.estado] || 'bg-slate-50 text-slate-600 border-slate-200';
    
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div 
                className="flex justify-between items-start mb-3 cursor-pointer"
                onClick={() => onViewDetail?.(tarea)}
            >
                <div className="flex-1 pr-2">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-3 mb-1">
                        {tarea.descripcion}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                        #{tarea.id} • {tarea.area || 'Sin área'}
                    </p>
                </div>
                <div className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border shrink-0", estadoColor)}>
                    {estadoLabel}
                </div>
            </div>

            <div className="space-y-1.5 mb-4 ml-1">
                
                {tarea.prioridad && (
                    <p className="flex items-center gap-2">
                        <Icon name="flag" size="xs" className={cn("shrink-0", PRIORIDAD_COLOR[tarea.prioridad])} />
                        <span className={cn("text-xs font-bold", PRIORIDAD_COLOR[tarea.prioridad])}>
                            {PRIORIDAD_LABEL[tarea.prioridad]}
                        </span>
                    </p>
                )}

                {tarea.fechaVencimiento && (
                    <p className="flex items-center gap-2">
                        <Icon name="event" size="xs" className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500">
                            Vence: {formatFecha(tarea.fechaVencimiento)}
                        </span>
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                    onClick={() => onViewDetail?.(tarea)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 active:scale-95 transition-all"
                >
                    <Icon name="visibility" size="xs" />
                    Detalle
                </button>

                {onOrganize && (
                    <button
                        onClick={() => onOrganize?.(tarea)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-marca-primario bg-marca-primario/10 border border-marca-primario/20 active:scale-95 transition-all"
                    >
                        <Icon name="low_priority" size="xs" />
                        Organizar
                    </button>
                )}

                {onEdit && (
                    <button
                        onClick={() => onEdit?.(tarea)}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 active:scale-95 transition-all"
                    >
                        <Icon name="edit" size="xs" />
                    </button>
                )}
            </div>
        </div>
    );
};
