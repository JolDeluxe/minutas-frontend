// src/features/tareas/components/tarea-card-grid.jsx
import { Icon, Badge } from '@/components/ui/z_index';
import { TAREA_STATUS_MAP } from '../../constants';
import { CLASIFICACION_MAP } from '../../../minutas/constants';
import { formatFecha } from '@/lib/date';

export const TareaCardGrid = ({ tareas = [], onDetail }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tareas.map((tarea) => {
                const status = TAREA_STATUS_MAP[tarea.estado] || TAREA_STATUS_MAP.PENDIENTE;
                const clasif = CLASIFICACION_MAP[tarea.clasificacion];
                const imagenesCaptura = tarea.imagenes?.filter(img => img.tipo !== 'EVIDENCIA') || [];
                const coverImage = imagenesCaptura.length > 0 ? imagenesCaptura[0] : tarea.imagenes?.[0];

                return (
                    <div 
                        key={tarea.id} 
                        onClick={() => onDetail(tarea)}
                        className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden flex flex-col hover:translate-y-[-4px] transition-all duration-300 cursor-pointer"
                    >
                        {/* Card Header with Image */}
                        <div className="relative h-44 overflow-hidden">
                            {coverImage ? (
                                <img src={coverImage.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Tarea" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                                    <Icon name="image" size="48px" />
                                    <span className="text-[10px] font-black uppercase mt-2 tracking-widest">Sin imagen</span>
                                </div>
                            )}
                            
                            {/* Floating Status Badge */}
                            <div className="absolute top-4 right-4 shadow-xl">
                                <div 
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-sm"
                                    style={{ backgroundColor: status.bg, borderColor: status.border, color: status.text }}
                                >
                                    <Icon name={status.icon} size="14px" />
                                    <span className="text-[10px] font-black uppercase tracking-tight">{status.label}</span>
                                </div>
                            </div>

                            {/* Classification Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent">
                                 <Badge 
                                    className="text-[9px] font-black text-white border-0" 
                                    style={{ backgroundColor: clasif?.color }}
                                >
                                    {clasif?.label}
                                </Badge>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono text-slate-400 font-bold tracking-tighter">#{tarea.id}</span>
                                <div className="flex items-center gap-1.5">
                                    <Icon name="event" size="14px" className="text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-500">
                                        {tarea.fechaVencimiento 
                                            ? formatFecha(tarea.fechaVencimiento, '—') 
                                            : (tarea.fechaSeguimiento ? formatFecha(tarea.fechaSeguimiento, '—') : '—')}
                                    </span>
                                </div>
                            </div>

                            <p className="text-[15px] font-black text-slate-800 leading-tight mb-4 line-clamp-3">
                                {tarea.descripcion}
                            </p>

                            {/* Responsibles Footer */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <div className="flex -space-x-1.5">
                                    {tarea.asignaciones?.slice(0, 4).map((a) => (
                                        <div key={a.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                            {a.usuario?.imagen ? (
                                                <img src={a.usuario.imagen} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                    {a.usuario?.nombre?.[0]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-marca-primario group-hover:text-white transition-all flex items-center justify-center shadow-inner">
                                    <Icon name="arrow_forward" size="20px" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
