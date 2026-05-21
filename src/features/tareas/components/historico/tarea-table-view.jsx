// src/features/tareas/components/tarea-table-view.jsx
import { Icon, Badge } from '@/components/ui/z_index';
import { TAREA_STATUS_MAP } from '../../constants';
import { CLASIFICACION_MAP } from '../../../minutas/constants';
import { formatFecha } from '@/lib/date';

export const TareaTableView = ({ tareas = [], onDetail }) => {
    return (
        <div className="w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrada</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsables</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {tareas.map((tarea) => {
                        const status = TAREA_STATUS_MAP[tarea.estado] || TAREA_STATUS_MAP.PENDIENTE;
                        const clasif = CLASIFICACION_MAP[tarea.clasificacion];
                        
                        return (
                            <tr key={tarea.id} className="group hover:bg-slate-50/80 transition-all cursor-pointer" onClick={() => onDetail(tarea)}>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        {/* Thumbnail visible sin click */}
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                            {tarea.imagenes?.[0] ? (
                                                <img src={tarea.imagenes[0].url} className="w-full h-full object-cover" alt="Tarea" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Icon name="image" size="24px" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-slate-400">#{tarea.id}</span>
                                            <Badge 
                                                variant="outline" 
                                                className="text-[9px] font-black border-2" 
                                                style={{ borderColor: clasif?.border, color: clasif?.color }}
                                            >
                                                {clasif?.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 max-w-xs">
                                    <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-tight">
                                        {tarea.descripcion}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Icon name="event" size="14px" className="text-slate-400" />
                                            <span className="text-[11px] font-medium text-slate-500">
                                                {tarea.fechaVencimiento 
                                                    ? formatFecha(tarea.fechaVencimiento, 'Sin fecha') 
                                                    : (tarea.fechaSeguimiento ? formatFecha(tarea.fechaSeguimiento, 'Sin fecha') : 'Sin fecha')}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex -space-x-2">
                                        {tarea.asignaciones?.slice(0, 3).map((a) => (
                                            <div key={a.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm" title={a.usuario?.nombre}>
                                                {a.usuario?.imagen ? (
                                                    <img src={a.usuario.imagen} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                        {a.usuario?.nombre?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {tarea.asignaciones?.length > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                                                +{tarea.asignaciones.length - 3}
                                            </div>
                                        )}
                                        {(!tarea.asignaciones || tarea.asignaciones.length === 0) && (
                                            <span className="text-[11px] text-slate-400 italic">Sin asignar</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div 
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2"
                                        style={{ backgroundColor: status.bg, borderColor: status.border, color: status.text }}
                                    >
                                        <Icon name={status.icon} size="16px" />
                                        <span className="text-[11px] font-black uppercase tracking-tight">{status.label}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDetail(tarea); }}
                                        className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-marca-primario/10 hover:text-marca-primario transition-all active:scale-90 flex items-center justify-center"
                                    >
                                        <Icon name="visibility" size="20px" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {tareas.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-50/30">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                        <Icon name="search_off" size="40px" />
                    </div>
                    <p className="text-slate-400 font-bold">No se encontraron entradas</p>
                    <p className="text-[11px] text-slate-300 mt-1 uppercase tracking-widest font-black">Prueba ajustando los filtros</p>
                </div>
            )}
        </div>
    );
};
