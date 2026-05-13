// src/features/tareas/components/tarea-detail-drawer.jsx
import { useState } from 'react';
import { Icon, Button, Badge } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TAREA_STATUS_MAP, TAREA_STATUS_OPTS, TAREA_PRIORIDAD_OPTS } from '../../constants';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../../minutas/constants';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { createPortal } from 'react-dom';
import { TareaStatusBadge } from './tarea-status-badge';
import { TareaPriorityBadge } from './tarea-priority-badge';
import { formatFecha, formatFechaHora } from '@/lib/date';

export const TareaDetailDrawer = ({
    isOpen,
    onClose,
    tarea,
    onUpdate,
    submitting = false,
}) => {
    const isDesktop = useIsDesktop();
    const [activeTab, setActiveTab] = useState('info'); // info | history
    
    // States for editing
    const [estado, setEstado] = useState(tarea?.estadoOperativo || '');
    const [prioridad, setPrioridad] = useState(tarea?.prioridad || '');
    const [prevTareaId, setPrevTareaId] = useState(tarea?.id);

    // Sincronización síncrona durante el renderizado (Evita useEffect cascading render)
    if (tarea && tarea.id !== prevTareaId) {
        setEstado(tarea.estadoOperativo);
        setPrioridad(tarea.prioridad || '');
        setPrevTareaId(tarea.id);
    }

    if (!isOpen || !tarea) return null;

    const isClosed = tarea.estadoConceptual === 'CERRADO' || tarea.estadoConceptual === 'DESCARTADO';
    const clasif = CLASIFICACION_MAP[tarea.clasificacion];

    const handleSaveStatus = () => {
        onUpdate(tarea.id, { estadoOperativo: estado, prioridad });
    };

    const renderContent = () => (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Banner */}
            <div className="relative h-64 sm:h-80 shrink-0 overflow-hidden bg-slate-900 group">
                {tarea.imagenes?.[0] ? (
                    <img src={tarea.imagenes[0].url} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Detail" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 bg-slate-100">
                        <Icon name="image" size="80px" className="opacity-20" />
                        <p className="text-xs font-black uppercase tracking-tighter text-slate-400 mt-2">Sin imagen principal</p>
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 mb-3">
                         <Badge 
                            className="text-[10px] font-black text-white border-0 py-1 px-3 rounded-lg shadow-2xl" 
                            style={{ backgroundColor: clasif?.color }}
                        >
                            {clasif?.label}
                        </Badge>
                        <span className="text-white/40 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Ref: {tarea.id}</span>
                    </div>
                    <h2 className="text-white text-2xl sm:text-3xl font-black leading-[1.1] tracking-tight">
                        {tarea.descripcion}
                    </h2>
                    <div className="flex items-center gap-3 mt-4">
                        <TareaStatusBadge status={tarea.estadoOperativo} />
                        <TareaPriorityBadge priority={tarea.prioridad} />
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex bg-white px-8 border-b border-slate-200/60 sticky top-0 z-20">
                {[
                    { id: 'info', label: 'Información General', icon: 'info' },
                    { id: 'history', label: 'Línea de Tiempo', icon: 'history' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative",
                            activeTab === tab.id ? "text-marca-primario" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Icon name={tab.icon} size="16px" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-marca-primario rounded-t-full shadow-[0_-4px_10px_rgba(var(--marca-primario-rgb),0.3)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {activeTab === 'info' ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Context & Metadata Grid */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Icon name="grid_view" size="14px" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Área Operativa</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800">{AREA_MAP[tarea.area] || 'General'}</p>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Icon name="inventory" size="14px" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Línea de Negocio</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800">{LINEA_MAP[tarea.linea]?.label || 'Multilínea'}</p>
                            </div>
                            {tarea.minutaId && (
                                <div className="col-span-2 p-5 bg-marca-primario/5 rounded-3xl border border-marca-primario/10 flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-marca-primario/50">
                                        <Icon name="description" size="14px" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Origen</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">
                                        {tarea.minuta?.titulo || `Minuta #${tarea.minutaId}`}
                                    </p>
                                    {tarea.minuta?.fecha && (
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            Fecha: {formatFecha(tarea.minuta.fecha)}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Icon name="event" size="14px" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Fecha de Registro</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800">{formatFechaHora(tarea.createdAt)}</p>
                            </div>
                            {tarea.fechaVencimiento && (
                                <div className="p-5 bg-marca-primario/5 rounded-3xl border border-marca-primario/10 flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-marca-primario/50">
                                        <Icon name="event_busy" size="14px" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Vencimiento Operativo</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">{formatFecha(tarea.fechaVencimiento)}</p>
                                </div>
                            )}
                        </section>

                        {/* Evidence Gallery */}
                        {tarea.imagenes?.length > 0 && (
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    Evidencias Visuales
                                    <div className="h-px flex-1 bg-slate-200" />
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {tarea.imagenes.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                            <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Status Controls */}
                        {!isClosed && (
                            <section className="bg-white border-2 border-slate-100 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-marca-primario/10 flex items-center justify-center text-marca-primario">
                                        <Icon name="tune" size="20px" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 leading-none">Control Operativo</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Actualizar estado y prioridad</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {TAREA_STATUS_OPTS.map(opt => {
                                            const optInfo = TAREA_STATUS_MAP[opt.value];
                                            const isSelected = estado === opt.value;
                                            return (
                                                <button 
                                                    key={opt.value}
                                                    onClick={() => setEstado(opt.value)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-3 rounded-2xl border-2 transition-all text-left",
                                                        isSelected ? "shadow-lg scale-[1.03]" : "bg-white border-slate-50 text-slate-400 grayscale"
                                                    )}
                                                    style={isSelected ? { backgroundColor: optInfo.bg, borderColor: optInfo.border, color: optInfo.text } : {}}
                                                >
                                                    <Icon name={optInfo.icon} size="16px" />
                                                    <span className="text-[10px] font-black uppercase leading-none">{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-2 flex-wrap pt-2">
                                        {TAREA_PRIORIDAD_OPTS.map(opt => (
                                            <button 
                                                key={opt.value}
                                                onClick={() => setPrioridad(opt.value)}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all",
                                                    prioridad === opt.value ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    <Button 
                                        variant="guardar" 
                                        className="w-full py-4 rounded-2xl shadow-xl shadow-emerald-500/20 mt-4 font-black uppercase text-[11px] tracking-widest" 
                                        isLoading={submitting}
                                        onClick={handleSaveStatus}
                                        disabled={estado === tarea.estadoOperativo && prioridad === tarea.prioridad}
                                    >
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </section>
                        )}

                        {/* Assignees */}
                        <section className="space-y-4">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Equipo Responsable</h3>
                             <div className="grid grid-cols-1 gap-3">
                                 {tarea.asignaciones?.map(a => (
                                     <div key={a.id} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                         <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 shadow-inner flex items-center justify-center text-slate-400 ring-4 ring-slate-50">
                                             {a.usuario?.imagen ? <img src={a.usuario.imagen} className="w-full h-full object-cover" /> : <Icon name="person" size="24px" />}
                                         </div>
                                         <div className="flex-1">
                                             <p className="text-sm font-black text-slate-800 leading-tight">{a.usuario?.nombre}</p>
                                             <p className="text-[10px] font-bold text-marca-primario uppercase tracking-widest mt-0.5">{a.usuario?.rol}</p>
                                         </div>
                                         <Icon name="check_circle" className="text-emerald-500 opacity-20" size="20px" />
                                     </div>
                                 ))}
                                 {(!tarea.asignaciones || tarea.asignaciones.length === 0) && (
                                     <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                                         <Icon name="person_off" size="32px" className="mb-2 opacity-20" />
                                         <p className="text-[10px] font-bold uppercase tracking-widest">Sin asignar</p>
                                     </div>
                                 )}
                             </div>
                        </section>
                    </div>
                ) : (
                    /* History / Timeline */
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-200 before:rounded-full">
                            {/* Mock Timeline - En una implementación real vendría de tarea.historial */}
                            <div className="relative">
                                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-marca-primario border-4 border-white shadow-md z-10" />
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{formatFechaHora(tarea.createdAt)}</p>
                                    <p className="text-sm font-bold text-slate-800">Tarea Creada</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">Registro inicial desde la minuta.</p>
                                </div>
                            </div>
                            
                            <div className="relative opacity-50">
                                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-md z-10" />
                                <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300">
                                    <Icon name="more_horiz" size="32px" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Próximas actualizaciones...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Close */}
            {!isDesktop && (
                <div className="p-8 bg-white border-t border-slate-100 shrink-0 pb-[max(2rem,env(safe-area-inset-bottom))]">
                    <Button variant="cancelar" onClick={onClose} className="w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] border-2">
                        Cerrar Detalle
                    </Button>
                </div>
            )}
        </div>
    );

    const containerClasses = isDesktop 
        ? "fixed top-0 right-0 h-full w-[520px] bg-white shadow-drawer z-1000 animate-in slide-in-from-right duration-700"
        : "fixed inset-x-0 bottom-0 max-h-[95vh] bg-white rounded-t-[4rem] z-1000 animate-in slide-in-from-bottom duration-700 shadow-premium overflow-hidden";

    return createPortal(
        <div className="fixed inset-0 z-1000 flex items-end sm:items-stretch sm:justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
            <div className={containerClasses}>
                {isDesktop && (
                    <button 
                        onClick={onClose}
                        className="absolute top-8 left-[-70px] w-14 h-14 rounded-2xl bg-white text-slate-400 shadow-2xl flex items-center justify-center hover:text-rose-500 hover:scale-110 transition-all active:scale-95 group"
                    >
                        <Icon name="close" size="28px" className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                )}
                {!isDesktop && (
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 mx-auto mt-6 mb-2 shrink-0 shadow-inner" onClick={onClose} />
                )}
                {renderContent()}
            </div>
        </div>,
        document.body
    );
};
