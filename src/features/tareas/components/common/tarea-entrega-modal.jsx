import React, { useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { notify } from '@/components/notification/adaptive-notify';
import { addTareaImagen, createTareaNota } from '../../api/tareas-api';
import { cn } from '@/utils/cn';

export const TareaEntregaModal = ({ isOpen, onClose, tareaId, onConfirm, submitting }) => {
    const [comentario, setComentario] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.type.startsWith('image/')) {
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
                await createTareaNota({ tareaId, contenido: comentario.trim() });
            }

            // 2. Subir imagen si existe
            if (file) {
                await addTareaImagen(tareaId, file);
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalHeader title="Entregar Tarea para Revisión" onClose={onClose} />
            
            <ModalBody>
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
                                accept="image/jpeg, image/png, image/webp" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                            />
                            {preview ? (
                                <div className="relative w-full h-full flex justify-center items-center bg-slate-900/5 p-2">
                                    <img src={preview} alt="Vista previa" className="max-h-48 object-contain rounded-xl shadow-md border border-white" />
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
                                        <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Arrastra tu imagen de evidencia o haz clic</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">Soporta JPEG, PNG o WEBP (máx. 1)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isUploading || submitting}>
                    Cancelar
                </Button>
                <Button 
                    variant="primario" 
                    onClick={handleConfirm} 
                    isLoading={isUploading || submitting}
                    icon="send"
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                    Entregar Tarea
                </Button>
            </ModalFooter>
        </Modal>
    );
};
