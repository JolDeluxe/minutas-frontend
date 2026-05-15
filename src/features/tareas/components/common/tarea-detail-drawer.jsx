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
import { TareaLifecycleStepper } from './tarea-lifecycle-stepper';
import { formatFecha, formatFechaHora } from '@/lib/date';


export const TareaDetailDrawer = ({
    isOpen,
    onClose,
    tarea,
    onChangeStatus,
    onUpdate,
    submitting = false,
    currentUser,
}) => {
    const isDesktop = useIsDesktop();
    const [activeTab, setActiveTab] = useState('info'); 
    
    if (!isOpen || !tarea) return null;

    const { rol, id: userId } = currentUser ?? {};
    const esJefe = ['ADMIN', 'JEFE', 'GERENCIA'].includes(rol);
    const esAsignadoDirecto = tarea.responsables?.some((r) => r.id == userId);
    const esResponsable = esAsignadoDirecto || esJefe;


    const estado = tarea.estado?.toUpperCase();
    const isEnProgreso = estado === 'EN_PROGRESO';
    const isCompletado = estado === 'COMPLETADO';
    const isRechazado = estado === 'RECHAZADO';
    const isCerrado = estado === 'CERRADO' || estado === 'DESCARTADO' || estado === 'CANCELADA';
    const isPendiente = !isEnProgreso && !isCompletado && !isCerrado && !isRechazado;


    // ── Clases de estado para el Drawer ────────────────────────────────────
    const headerColors = {
        PENDIENTE:   'bg-blue-600',
        EN_PROGRESO: 'bg-amber-500',
        COMPLETADO:  'bg-emerald-600',
        RECHAZADO:   'bg-red-600',
        CERRADO:     'bg-slate-500',
    };

    const clasif = CLASIFICACION_MAP[tarea.clasificacion];
    const renderContent = () => (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Banner */}
            <div className={cn(
                "relative h-64 sm:h-80 shrink-0 overflow-hidden group",
                headerColors[estado] || 'bg-slate-900'
            )}>
                {tarea.imagenes?.[0] ? (
                    <img src={tarea.imagenes[0].url} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Detail" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                         <Icon name="image" size="80px" className="opacity-20" />
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 z-10">
                    <div className="flex items-center gap-2 mb-3">
                         <Badge className="text-[10px] font-black bg-white/20 text-white border-0 py-1 px-3 rounded-lg backdrop-blur-md">
                            {clasif?.label || 'General'}
                        </Badge>
                        <span className="text-white/40 text-[10px] font-mono font-bold tracking-widest uppercase">Ref: {tarea.id}</span>
                    </div>
                    <h2 className={cn(
                        "text-white text-2xl sm:text-4xl font-black leading-tight tracking-tight",
                        isCompletado && "line-through opacity-80"
                    )}>
                        {tarea.descripcion}
                    </h2>
                    <div className="flex items-center gap-3 mt-4">
                        <TareaStatusBadge status={tarea.estado} />
                        <TareaPriorityBadge priority={tarea.prioridad} />
                    </div>
                </div>
            </div>

            {/* Lifecycle Stepper (NUEVO) */}
            <div className="bg-white border-b border-slate-100 px-6">
                <TareaLifecycleStepper estado={tarea.estado} />
            </div>

            {/* Tabs Navigation */}

            <div className="flex bg-white px-8 border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
                {[
                    { id: 'info', label: 'Información', icon: 'info' },
                    { id: 'history', label: 'Historial', icon: 'history' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                            activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Icon name={tab.icon} size="16px" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {activeTab === 'info' ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Metadata Grid */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Área Operativa</span>
                                <p className="text-sm font-bold text-slate-800">{AREA_MAP[tarea.area] || 'General'}</p>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Línea</span>
                                <p className="text-sm font-bold text-slate-800">{LINEA_MAP[tarea.linea]?.label || 'Multi'}</p>
                            </div>
                            {tarea.minuta && (
                                <div className="col-span-2 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Origen</span>
                                    <p className="text-sm font-bold text-slate-800">{tarea.minuta.titulo || `Minuta #${tarea.minutaId}`}</p>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Registrada el {formatFechaHora(tarea.createdAt)}</p>
                                </div>
                            )}
                            {tarea.fechaVencimiento && (
                                <div className="col-span-2 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Vencimiento Operativo</span>
                                    <p className="text-sm font-bold text-slate-800">{formatFecha(tarea.fechaVencimiento)}</p>
                                </div>
                            )}
                        </section>

                        {/* Evidence Gallery */}
                        {tarea.imagenes?.length > 0 && (
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    Evidencias Visuales
                                    <div className="h-px flex-1 bg-slate-200" />
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {tarea.imagenes.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                            <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Control Operativo (Prioridad) */}
                        <section className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Icon name="tune" size="20px" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 leading-none">Prioridad</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Ajustar importancia de la tarea</p>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {TAREA_PRIORIDAD_OPTS.map(opt => {
                                    const isSelected = tarea.prioridad === opt.value;
                                    return (
                                        <button 
                                            key={opt.value}
                                            disabled={isCerrado}
                                            onClick={() => onUpdate?.(tarea.id, { prioridad: opt.value })}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all active:scale-95",
                                                isSelected ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300",
                                                isCerrado && "opacity-50 cursor-not-allowed grayscale-[0.5]"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Responsibles */}
                        <section className="space-y-4">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Equipo Responsable</h3>
                             <div className="grid grid-cols-1 gap-3">
                                 {tarea.responsables?.map(u => (
                                     <div key={u.id} className="flex items-center gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                         <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                             {u.imagen ? <img src={u.imagen} className="w-full h-full object-cover" /> : <Icon name="person" size="24px" />}
                                         </div>
                                         <div className="flex-1">
                                             <p className="text-sm font-black text-slate-800 leading-tight">{u.nombre}</p>
                                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{u.rol}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </section>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                            <Icon name="history" size="64px" className="mb-4 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Historial completo en desarrollo</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer de Acciones */}
            <div className="p-8 border-t border-slate-200 bg-white shrink-0 pb-[max(2rem,env(safe-area-inset-bottom))]">
                {/* 1. Flujo de Coordinador: Iniciar/Reiniciar */}
                {(isPendiente || isRechazado) && (
                    <Button 
                        onClick={() => onChangeStatus?.(tarea.id, 'EN_PROGRESO')}
                        className={cn(
                            "w-full py-7 rounded-2xl shadow-xl font-black uppercase text-[12px] tracking-[0.2em] animate-in zoom-in duration-300 active:scale-95 transition-all",
                            isRechazado ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                        )}
                        isLoading={submitting}
                    >
                        <Icon name={isRechazado ? "replay" : "play_arrow"} className="mr-2" />
                        {isRechazado ? "Reiniciar Trabajo" : "Iniciar Trabajo"}
                    </Button>
                )}

                {/* 2. Flujo de Coordinador: Completar */}
                {isEnProgreso && (
                    <Button 
                        onClick={() => onChangeStatus?.(tarea.id, (esJefe && esAsignadoDirecto) ? 'CERRADO' : 'COMPLETADO')}
                        className={cn(
                            "w-full py-7 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] animate-in zoom-in duration-300 active:scale-95 transition-all shadow-xl",
                            (esJefe && esAsignadoDirecto) 
                                ? "bg-black hover:bg-neutral-800 text-white shadow-black/20" 
                                : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                        )}
                        isLoading={submitting}
                    >
                        <Icon name={(esJefe && esAsignadoDirecto) ? "verified" : "check"} className="mr-2" />
                        {(esJefe && esAsignadoDirecto) ? "Terminar y Cerrar" : "Marcar como Completado"}
                    </Button>
                )}

                {/* 3. Flujo de JEFATURA: Aprobar y Cerrar */}
                {isCompletado && esJefe && (
                    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl mb-2">
                             <Icon name="fact_check" size="20px" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-center">Validación de Jefatura</span>
                        </div>
                        
                        <Button 
                            onClick={() => onChangeStatus?.(tarea.id, 'CERRADO')}
                            className="py-8 rounded-2xl bg-black hover:bg-neutral-800 text-white shadow-2xl shadow-black/20 font-black uppercase text-[12px] tracking-[0.2em] active:scale-95 transition-all w-full"
                            isLoading={submitting}
                        >
                            <Icon name="verified" className="mr-3" />
                            Aprobar y Cerrar Tarea
                        </Button>
                    </div>
                )}

                {/* 4. Estados Finales / Solo Lectura */}
                {isCompletado && !esJefe && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 py-5 px-6 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl mb-4">
                            <Icon name="lock" size="20px" />
                            <span className="text-xs font-black uppercase tracking-tight text-center">Entregado. En espera de validación.</span>
                        </div>
                        <Button variant="outline" onClick={onClose} className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 border-2">
                            Cerrar Detalle
                        </Button>
                    </div>
                )}

                {isCerrado && (
                    <div className="space-y-3">
                        {tarea.completadoAt && tarea.fechaVencimiento && new Date(tarea.completadoAt) > new Date(tarea.fechaVencimiento) && (
                            <div 
                                className="flex items-center justify-center gap-2 py-3 px-6 border rounded-2xl mb-4"
                                style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                            >
                                <Icon name="history_toggle_off" size="20px" style={{ color: '#dc2626' }} />
                                <span 
                                    className="text-xs font-black uppercase tracking-widest text-center"
                                    style={{ color: '#dc2626' }}
                                >
                                    Entrega Tardía
                                </span>
                            </div>
                        )}
                        <Button variant="outline" onClick={onClose} className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 border-2">
                            Cerrar Detalle
                        </Button>
                    </div>
                )}
                
                {isPendiente && !esResponsable && (
                     <Button variant="outline" onClick={onClose} className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 text-slate-400">
                        Cerrar Detalle
                    </Button>
                )}

                 {/* 5. KILL SWITCH: Descarte Logico para Jefatura */}
                 {!isCerrado && esJefe && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <Button 
                            onClick={() => onUpdate?.(tarea.id, { estadoConceptual: 'DESCARTADO' })}
                            variant="ghost"
                            className="w-full py-4 text-red-500 hover:text-red-700 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest transition-all"
                            isLoading={submitting}
                        >
                            <Icon name="delete_sweep" className="mr-2" />
                            Descartar Entrada (Fin de Vida)
                        </Button>
                        <p className="text-[9px] text-slate-400 font-medium text-center mt-2 px-6">
                            Esta acción cerrará la tarea permanentemente y la sacará de los indicadores operativos.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );

    const containerClasses = isDesktop 
        ? "fixed top-0 right-0 h-full w-[520px] bg-white shadow-drawer z-1000 animate-in slide-in-from-right duration-700"
        : "fixed inset-x-0 bottom-0 h-[92vh] bg-white rounded-t-[4rem] z-1000 animate-in slide-in-from-bottom duration-700 shadow-premium overflow-hidden";

    return createPortal(
        <div className="fixed inset-0 z-1000 flex items-end sm:items-stretch sm:justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
            <div className={containerClasses}>
                {isDesktop && (
                    <button 
                        onClick={onClose}
                        className="absolute top-8 left-[-70px] w-14 h-14 rounded-2xl bg-white text-slate-400 shadow-2xl flex items-center justify-center hover:text-rose-500 hover:scale-110 transition-all active:scale-95 group z-50"
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

