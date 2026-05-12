import { Badge, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { LINEA_MAP } from '../constants';
import { LineIconSelector } from './icons/line-icons';

const ESTADO_LABEL = {
    ACTIVA: 'Activa',
    CERRADA: 'Cerrada',
};

const ESTADO_COLORS = {
    ACTIVA: 'bg-green-100 text-green-800 border-green-200',
    CERRADA: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const MinutaCard = ({ minuta, onViewDetail, onEdit }) => {
    const estadoLabel = ESTADO_LABEL[minuta.estado] || minuta.estado;
    const estadoColor = ESTADO_COLORS[minuta.estado] || 'bg-slate-50 text-slate-600 border-slate-200';

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div 
                className="flex justify-between items-start mb-3 cursor-pointer"
                onClick={() => onViewDetail?.(minuta)}
            >
                <div className="flex-1 pr-2">
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight line-clamp-2">
                        {minuta.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                        #{minuta.id} • Creada el {new Date(minuta.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border", estadoColor)}>
                    {estadoLabel}
                </div>
            </div>

            <div className="space-y-1.5 mb-4 ml-1">
                <p className="flex items-center gap-2">
                    <LineIconSelector type={minuta.lineaDefault} size={14} className="text-slate-900 shrink-0" />
                    <span className="text-xs text-slate-600 font-medium">
                        {LINEA_MAP[minuta.lineaDefault]?.label || minuta.lineaDefault}
                    </span>
                </p>
                <p className="flex items-center gap-2">
                    <Icon name="person" size="xs" className="text-slate-300 shrink-0" />
                    <span className="text-xs text-slate-500">
                        {minuta.creador?.nombre || 'Desconocido'}
                    </span>
                </p>
                <p className="flex items-center gap-2">
                    <Icon name="format_list_bulleted" size="xs" className="text-slate-300 shrink-0" />
                    <span className="text-xs text-slate-500">
                        {minuta._count?.tareas || 0} Entradas
                    </span>
                </p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                    onClick={() => onViewDetail?.(minuta)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 active:scale-95 transition-all"
                >
                    <Icon name="visibility" size="xs" />
                    Ver Detalle
                </button>

                {onEdit && (
                    <button
                        onClick={() => onEdit?.(minuta)}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-marca-primario bg-marca-primario/10 hover:bg-marca-primario/20 active:scale-95 transition-all"
                    >
                        <Icon name="edit" size="xs" />
                    </button>
                )}
            </div>
        </div>
    );
};
