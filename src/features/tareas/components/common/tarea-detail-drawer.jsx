// src/features/tareas/components/common/tarea-detail-drawer.jsx
import { useState, useEffect } from 'react';
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TAREA_STATUS_MAP, TAREA_STATUS_OPTS, TAREA_PRIORIDAD_OPTS } from '../../constants';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../../minutas/constants';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { createPortal } from 'react-dom';
import { TareaStatusBadge } from './tarea-status-badge';
import { TareaPriorityBadge } from './tarea-priority-badge';
import { TareaEntregaModal } from './tarea-entrega-modal';
import { formatFecha, formatFechaHora } from '@/lib/date';

const ImageViewer = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    if (!images || images.length === 0) return null;
    const currentImg = images[currentIndex];

    return createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-auto">
            {/* Close Button */}
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-600 transition-all z-[100001] shadow-lg active:scale-95"
            >
                <Icon name="close" size="24px" />
            </button>

            {/* Main Area */}
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12">
                {images.length > 1 && (
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); 
                        }}
                        className="absolute left-4 sm:left-8 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-sm active:scale-95"
                    >
                        <Icon name="chevron_left" size="32px" />
                    </button>
                )}

                <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center">
                    <img 
                        src={currentImg.url} 
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" 
                        alt="Evidencia ampliada" 
                    />
                </div>

                {images.length > 1 && (
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); 
                        }}
                        className="absolute right-4 sm:right-8 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-sm active:scale-95"
                    >
                        <Icon name="chevron_right" size="32px" />
                    </button>
                )}
            </div>

            {/* Pagination Indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-8 flex gap-2 z-[100001]">
                    {images.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentIndex(i)} 
                            className={cn(
                                "h-2 rounded-full transition-all duration-300", 
                                i === currentIndex ? "bg-white w-8 shadow-md" : "bg-white/30 w-2 hover:bg-white/50"
                            )} 
                        />
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
};

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
    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(null);
    
    if (!isOpen || !tarea) return null;

    const { rol, id: userId } = currentUser ?? {};
    const esJefe = ['ADMIN', 'JEFE', 'GERENCIA'].includes(rol);
    const esAsignadoDirecto = tarea.responsables?.some((r) => r.id == userId);
    const esResponsable = esAsignadoDirecto || esJefe;

    const estado = tarea.estado?.toUpperCase();
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrado = estado === 'CERRADA' || estado === 'DESCARTADA' || estado === 'CANCELADA';

    const renderContent = () => (
        <div className="flex flex-col h-full bg-white">
            {/* Minimal Clean Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-slate-400 text-xs font-mono font-bold tracking-wider">REF-#{tarea.id}</span>
                    <TareaStatusBadge status={tarea.estado} size="xs" />
                    <TareaPriorityBadge priority={tarea.prioridad} />
                </div>
                
                <h2 className={cn(
                    "text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight",
                    isCerrado && "line-through opacity-60 text-slate-400"
                )}>
                    {tarea.descripcion}
                </h2>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                {/* Core Details Grid */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col gap-1.5 shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Área Operativa</span>
                        <p className="text-sm font-bold text-slate-800">{AREA_MAP[tarea.area] || 'General'}</p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col gap-1.5 shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Línea</span>
                        <p className="text-sm font-bold text-slate-800">{LINEA_MAP[tarea.linea]?.label || tarea.linea || 'Multi'}</p>
                    </div>

                    {tarea.fechaVencimiento && (
                        <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col gap-1.5 shadow-sm">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Vencimiento Operativo</span>
                            <div className="flex items-center gap-2">
                                <Icon name="event" size="sm" className="text-slate-400" />
                                <p className="text-sm font-bold text-slate-800">{formatFecha(tarea.fechaVencimiento)}</p>
                            </div>
                        </div>
                    )}

                    {tarea.minuta && (
                        <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col gap-1.5 shadow-sm">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Minuta de Origen</span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-bold text-slate-800">{tarea.minuta.titulo || `Minuta #${tarea.minutaId}`}</p>
                                <p className="text-[10px] text-slate-400 font-medium italic">Registrada el {formatFechaHora(tarea.createdAt)}</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Evidence visual section */}
                {tarea.imagenes?.length > 0 && (
                    <section className="space-y-3 animate-in fade-in duration-300">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">Evidencias Visuales</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {tarea.imagenes.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setActiveImageIndex(idx)}
                                    className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white group cursor-pointer shadow-sm hover:shadow-md hover:border-blue-200 active:scale-98 transition-all relative"
                                >
                                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Evidencia" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                                        <div className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-lg text-slate-700 hover:scale-110 active:scale-95 transition-all">
                                            <Icon name="zoom_in" size="18px" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Comments / Notes Section */}
                {tarea.notas?.length > 0 && (
                    <section className="space-y-3 animate-in fade-in duration-300">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">Notas y Comentarios de Entrega</h3>
                        <div className="space-y-3">
                            {tarea.notas.map((nota) => {
                                const creador = nota.creadoPor || {};
                                return (
                                    <div key={nota.id} className="p-4 bg-slate-50 border border-slate-100/80 rounded-2xl shadow-sm flex flex-col gap-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 shadow-inner">
                                                {creador.imagen ? (
                                                    <img src={creador.imagen} className="w-full h-full object-cover" alt={creador.nombre} />
                                                ) : (
                                                    creador.nombre?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{creador.nombre || 'Usuario'}</p>
                                                <p className="text-[9px] text-slate-400 font-semibold">{formatFechaHora(nota.createdAt)}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 leading-relaxed pl-1 whitespace-pre-line">
                                            {nota.contenido}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Team Section */}
                <section className="space-y-3">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Equipo Responsable</h3>
                     <div className="grid grid-cols-1 gap-2">
                         {tarea.responsables?.length > 0 ? (
                             tarea.responsables.map(u => (
                                 <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/80 shadow-sm">
                                     <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 shadow-inner">
                                         {u.imagen ? <img src={u.imagen} className="w-full h-full object-cover" alt={u.nombre} /> : u.nombre?.charAt(0)}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className="text-sm font-bold text-slate-800 truncate">{u.nombre}</p>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u.rol}</p>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <p className="text-xs text-slate-400 italic px-1">Sin responsables asignados.</p>
                         )}
                     </div>
                </section>
            </div>

            {/* Clean Premium Action Footer */}
            <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                {/* 1. Coordinador Action: Entregar */}
                {isPendiente && esResponsable && (
                    <Button 
                        onClick={() => setIsEntregaModalOpen(true)}
                        className="w-full py-4.5 rounded-xl font-black uppercase text-[11px] tracking-widest bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                        isLoading={submitting}
                        icon="check"
                    >
                        Entregar para Revisión
                    </Button>
                )}

                {/* 2. Jefatura Action: Aprobar */}
                {isEnRevision && esJefe && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 justify-center py-2.5 px-4 bg-blue-50 border border-blue-100/50 text-blue-700 rounded-xl">
                             <Icon name="fact_check" size="16px" />
                             <span className="text-[9px] font-black uppercase tracking-wider">Validación de Jefatura Pendiente</span>
                        </div>
                        
                        <Button 
                            onClick={() => onChangeStatus?.(tarea.id, 'CERRADA')}
                            className="py-5 rounded-xl bg-black hover:bg-neutral-800 text-white shadow-lg shadow-black/20 font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all w-full"
                            isLoading={submitting}
                            icon="verified"
                        >
                            Aprobar y Cerrar Tarea
                        </Button>
                    </div>
                )}

                {/* 3. Read Only Status States */}
                {isEnRevision && !esJefe && (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 border border-emerald-100/50 text-emerald-700 rounded-xl">
                        <Icon name="lock" size="16px" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Entregada · En espera de validación</span>
                    </div>
                )}

                {/* 4. Kill Switch logic for Jefes */}
                {!isCerrado && esJefe && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <Button 
                            onClick={() => onUpdate?.(tarea.id, { estado: 'DESCARTADA' })}
                            variant="ghost"
                            className="w-full py-3.5 text-red-500 hover:text-red-700 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest transition-all"
                            isLoading={submitting}
                            icon="delete_sweep"
                        >
                            Descartar Tarea
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    const containerClasses = isDesktop 
        ? "fixed top-0 right-0 h-full w-[460px] bg-white shadow-2xl border-l border-slate-100 z-1000 animate-in slide-in-from-right duration-500"
        : "fixed inset-x-0 bottom-0 h-[85vh] bg-white rounded-t-[2.5rem] z-1000 animate-in slide-in-from-bottom duration-500 shadow-drawer overflow-hidden";

    return createPortal(
        <div className="fixed inset-0 z-1000 flex items-end sm:items-stretch sm:justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-300" onClick={onClose} />
            <div className={containerClasses}>
                {isDesktop && (
                    <button 
                        onClick={onClose}
                        className="absolute top-6 left-[-56px] w-11 h-11 rounded-xl bg-white text-slate-400 shadow-md flex items-center justify-center hover:text-rose-500 hover:scale-105 transition-all active:scale-95 group z-50 border border-slate-100"
                    >
                        <Icon name="close" size="20px" className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                )}
                {!isDesktop && (
                    <div className="w-12 h-1 rounded-full bg-slate-200 mx-auto mt-4 mb-2 shrink-0" onClick={onClose} />
                )}
                {renderContent()}
            </div>
            {isEntregaModalOpen && (
                <TareaEntregaModal
                    isOpen={isEntregaModalOpen}
                    onClose={() => setIsEntregaModalOpen(false)}
                    tareaId={tarea.id}
                    submitting={submitting}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(tarea.id, 'EN_REVISION');
                    }}
                />
            )}
            {activeImageIndex !== null && (
                <ImageViewer
                    images={tarea.imagenes}
                    initialIndex={activeImageIndex}
                    onClose={() => setActiveImageIndex(null)}
                />
            )}
        </div>,
        document.body
    );
};
