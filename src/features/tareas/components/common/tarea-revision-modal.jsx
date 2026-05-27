import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { formatFecha, formatFechaHora } from '@/lib/date';
import { AREA_MAP, LINEA_MAP } from '../../../minutas/constants';
import { TareaPriorityBadge } from './tarea-priority-badge';

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
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-600 transition-all z-[100001] shadow-lg active:scale-95 cursor-pointer"
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
                        className="absolute left-4 sm:left-8 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-sm active:scale-95 cursor-pointer"
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
                        className="absolute right-4 sm:right-8 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-sm active:scale-95 cursor-pointer"
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
                                "h-2 rounded-full transition-all duration-300 cursor-pointer", 
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

export const TareaRevisionModal = ({ isOpen, onClose, tarea, onConfirm, submitting }) => {
    const isDesktop = useIsDesktop();
    const [viewerState, setViewerState] = useState(null);

    if (!isOpen || !tarea) return null;

    const imagenesEvidencia = tarea.imagenes?.filter(img => img.tipo === 'EVIDENCIA') || [];
    const areaText = AREA_MAP[tarea.area] || 'General';
    const lineaText = LINEA_MAP[tarea.linea]?.label || tarea.linea || 'Multi';

    const handleApprove = async () => {
        if (onConfirm) {
            await onConfirm();
        }
    };

    const renderContent = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Column: Description and Metadata */}
                <div className="md:col-span-7 space-y-6">
                    {/* Descripción */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">
                            Descripción de la Tarea
                        </label>
                        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-700 leading-relaxed max-h-[160px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                            {tarea.descripcion}
                        </div>
                    </div>

                    {/* Header con datos básicos resumidos */}
                    <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span>Información de la Tarea</span>
                            <span className="font-mono text-[10px]">REF-#{tarea.id}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-slate-400 font-bold uppercase text-[8px] block">Área</span>
                                <span className="font-bold text-slate-800">{areaText}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold uppercase text-[8px] block">Línea</span>
                                <span className="font-bold text-slate-800">{lineaText}</span>
                            </div>
                            {tarea.fechaVencimiento && (
                                <div className="col-span-2 pt-1.5 border-t border-slate-200/50">
                                    <span className="text-slate-400 font-bold uppercase text-[8px] block">Vencimiento</span>
                                    <span className="font-bold text-slate-800 flex items-center gap-1">
                                        <Icon name="event" size="14px" className="text-slate-400 shrink-0" />
                                        {formatFecha(tarea.fechaVencimiento)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Evidence & Comments */}
                <div className="md:col-span-5 space-y-6">
                    {/* Evidencias de Entrega */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1 font-sans flex items-center gap-1">
                            <Icon name="verified" size="14px" className="text-amber-400" /> Evidencias de Entrega
                        </label>
                        {imagenesEvidencia.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {imagenesEvidencia.map((img, idx) => (
                                    <div 
                                        key={img.id || idx} 
                                        onClick={() => setViewerState({ images: imagenesEvidencia, index: idx })}
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-200 bg-amber-50 group cursor-pointer shadow-sm hover:shadow-md hover:border-amber-400 active:scale-98 transition-all relative shrink-0"
                                    >
                                        <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Evidencia" />
                                        <div className="absolute inset-0 bg-amber-900/0 group-hover:bg-amber-900/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                                            <Icon name="zoom_in" size="16px" className="text-amber-600 drop-shadow-sm" />
                                        </div>
                                        <div className="absolute top-1 right-1 bg-amber-500 text-white text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm border border-amber-400 leading-none">
                                            EVID
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-5 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-xs bg-slate-50/50">
                                Sin evidencia visual.
                            </div>
                        )}
                    </div>

                    {/* Comentarios de Entrega */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">
                            Notas y Comentarios
                        </label>
                        {tarea.notas?.length > 0 ? (
                            <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                {tarea.notas.map((nota) => {
                                    const creador = nota.creadoPor || {};
                                    return (
                                        <div key={nota.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] shrink-0 shadow-inner">
                                                    {creador.imagen ? (
                                                        <img src={creador.imagen} className="w-full h-full object-cover" alt={creador.nombre} />
                                                    ) : (
                                                        creador.nombre?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 leading-tight">
                                                    <p className="text-[11px] font-bold text-slate-800 truncate">{creador.nombre || 'Usuario'}</p>
                                                    <p className="text-[8px] text-slate-400 font-semibold">{formatFechaHora(nota.createdAt)}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed pl-0.5 whitespace-pre-line">
                                                {nota.contenido}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-5 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-xs bg-slate-50/50">
                                Sin comentarios.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="flex gap-3 w-full">
            <Button 
                variant="neutro" 
                onClick={onClose} 
                disabled={submitting} 
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
            >
                Cerrar Ventana
            </Button>
            <Button 
                variant="primario" 
                onClick={handleApprove} 
                isLoading={submitting}
                icon="verified"
                className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
            >
                Aprobar y Cerrar Tarea
            </Button>
        </div>
    );

    if (isDesktop) {
        return createPortal(
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
                <div className="relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                    <div className="px-12 py-6 flex items-center justify-between shrink-0 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Icon name="fact_check" size="20px" />
                            </div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">Validación de Entrega</h2>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors active:scale-90 cursor-pointer border border-slate-100">
                            <Icon name="close" size="20px" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar">
                        {renderContent()}
                    </div>
                    <div className="px-12 pt-6 pb-10 bg-slate-50/50 border-t border-slate-100 shrink-0">
                        {renderFooter()}
                    </div>
                </div>
                {viewerState !== null && (
                    <ImageViewer
                        images={viewerState.images}
                        initialIndex={viewerState.index}
                        onClose={() => setViewerState(null)}
                    />
                )}
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white w-full rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300 ease-out max-h-[92vh] flex flex-col overflow-hidden">
                <div className="flex justify-center pt-4 pb-2" onClick={onClose}>
                    <div className="w-12 h-1.5 rounded-full bg-slate-200" />
                </div>
                <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Icon name="fact_check" size="20px" />
                        </div>
                        <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none">Validación de Entrega</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-slate-100 cursor-pointer">
                        <Icon name="close" size="20px" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 custom-scrollbar">
                    {renderContent()}
                </div>
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                    {renderFooter()}
                </div>
            </div>
            {viewerState !== null && (
                <ImageViewer
                    images={viewerState.images}
                    initialIndex={viewerState.index}
                    onClose={() => setViewerState(null)}
                />
            )}
        </div>,
        document.body
    );
};
