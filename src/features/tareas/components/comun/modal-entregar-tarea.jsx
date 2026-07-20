import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { notify } from '@/components/notification/adaptive-notify';
import { addTareaImagen, createTareaNota } from '../../api/tareas-api';
import { validateImageFile } from '@/utils/validators';
import { cn } from '@/utils/cn';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export const ModalEntregarTarea = ({ isOpen, onClose, tareaId, onConfirm, submitting }) => {
    const isDesktop = useIsDesktop();
    const [comentario, setComentario] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            const validation = validateImageFile(selected);
            if (!validation.isValid) {
                notify.error(validation.error);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) {
            const validation = validateImageFile(dropped);
            if (!validation.isValid) {
                notify.error(validation.error);
                return;
            }
            setFile(dropped);
            setPreview(URL.createObjectURL(dropped));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleConfirm = async () => {
        try {
            setIsUploading(true);
            
            // 1. Agregar comentario si existe
            if (comentario.trim()) {
                await createTareaNota({ tareaId, contenido: comentario.trim(), esEntrega: true });
            }

            // 2. Subir imagen si existe
            if (file) {
                await addTareaImagen(tareaId, file, 'EVIDENCIA');
            }

            // 3. Confirmar entrega (cambiar estado a EN_REVISION)
            await onConfirm();
            
            // Limpiar al éxito
            setComentario('');
            setFile(null);
            if (preview) URL.revokeObjectURL(preview);
            setPreview(null);
            
            notify.success('Tarea entregada correctamente para revisión.');
            onClose();
        } catch (error) {
            console.error(error);
            notify.error('Error al enviar evidencias o entregar la tarea.');
        } finally {
            setIsUploading(false);
        }
    };

    const renderContent = () => (
        <div className="space-y-6">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                Adjunta opcionalmente un comentario explicativo o una imagen de evidencia física para validar tu entrega.
            </p>

            {/* Comentario */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">
                    Comentario de entrega
                </label>
                <textarea
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium resize-none focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all text-slate-700 min-h-[100px] placeholder:text-slate-400"
                    placeholder="Describe detalladamente el trabajo realizado o notas de entrega..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                />
            </div>

            {/* Imagen */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-sans">
                    Imagen de Evidencia
                </label>
                <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => !preview && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all bg-slate-50/50 relative overflow-hidden group min-h-[160px]",
                        "hover:border-amber-300 hover:bg-slate-50 border-slate-200",
                        preview ? "p-0 min-h-[220px] cursor-default border-solid border-slate-200" : ""
                    )}
                >
                    <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp, image/heic, image/heif" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                    />
                    {preview ? (
                        <div className="relative w-full h-full flex justify-center items-center bg-slate-900/5 p-2">
                            {file && /\.(heic|heif)$/i.test(file.name) ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-100/80 rounded-xl border border-slate-200 min-w-[200px] min-h-[120px]">
                                    <Icon name="image" size="32px" className="text-amber-500 mb-2" />
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Imagen HEIC</span>
                                    <span className="text-[10px] text-slate-400 font-bold mt-1 max-w-[180px] truncate">{file.name}</span>
                                </div>
                            ) : (
                                <img src={preview} alt="Vista previa" className="max-h-48 object-contain rounded-xl shadow-md border border-white" />
                            )}
                            <button
                                onClick={handleRemoveFile}
                                className="absolute top-4 right-4 bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 shadow-lg hover:scale-105 active:scale-95 transition-all z-10"
                                title="Eliminar imagen"
                            >
                                <Icon name="close" size="16px" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:text-amber-500 group-hover:border-amber-100 transition-all duration-300">
                                <Icon name="add_photo_alternate" size="24px" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Arrastra tu imagen o haz clic</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">Soporta JPEG, PNG, WEBP o HEIC (máx. 1)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="flex gap-3 w-full">
            <Button variant="neutro" onClick={onClose} disabled={isUploading || submitting} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors">
                Cancelar
            </Button>
            <Button 
                variant="primario" 
                onClick={handleConfirm} 
                isLoading={isUploading || submitting}
                icon="send"
                className="flex-[2] h-12 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 rounded-xl text-xs font-black uppercase tracking-widest"
            >
                Entregar Tarea
            </Button>
        </div>
    );

    if (isDesktop) {
        return createPortal(
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-12 py-6 flex items-center justify-between shrink-0 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Icon name="check_circle" size="20px" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">Entregar para Revisión</h2>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors active:scale-90 cursor-pointer">
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
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Icon name="check_circle" size="20px" />
                        </div>
                        <h2 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">Entregar para Revisión</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
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
        </div>,
        document.body
    );
};
