import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { Camera, X, Plus, AlertCircle } from 'lucide-react';

/**
 * QuickComposer — Estación de Captura Ejecutiva para Escritorio.
 * Versión optimizada con mejor gestión de imágenes y validaciones.
 */
export const QuickComposer = ({
  minutaId,
  lineaDefault,
  onSubmit,
  submitting = false,
  isDesktop = false,
}) => {
  const [descripcion, setDescripcion] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [area, setArea] = useState('DISENO');
  const [linea, setLinea] = useState(lineaDefault || 'CALZADO');
  const [imagenes, setImagenes] = useState([]);
  const [showLimitError, setShowLimitError] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 108) + 'px';
    }
  }, [descripcion]);

  // Limpiar error de límite tras unos segundos
  useEffect(() => {
    if (showLimitError) {
      const timer = setTimeout(() => setShowLimitError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLimitError]);

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    
    if (imagenes.length + validFiles.length > 3) {
      setShowLimitError(true);
      // Solo tomamos los que quepan hasta llegar a 3
      const remainingSlots = 3 - imagenes.length;
      if (remainingSlots <= 0) return;
      
      const newImages = validFiles.slice(0, remainingSlots).map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
        id: Math.random().toString(36).substr(2, 9)
      }));
      setImagenes(prev => [...prev, ...newImages]);
    } else {
      const newImages = validFiles.map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
        id: Math.random().toString(36).substr(2, 9)
      }));
      setImagenes(prev => [...prev, ...newImages]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const removeImagen = (id) => {
    setImagenes(prev => {
      const imgToRemove = prev.find(img => img.id === id);
      if (imgToRemove) URL.revokeObjectURL(imgToRemove.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const handleSubmit = useCallback(() => {
    if (!descripcion.trim() || submitting) return;

    const payload = {
      tareas: [{
        descripcion: descripcion.trim(),
        area,
        linea,
        clasificacion: area === 'DISENO' ? (clasificacion || 'OTROS') : 'OTROS',
        minutaId: Number(minutaId),
        _localImagenes: imagenes,
      }],
    };

    onSubmit(payload);
    setDescripcion('');
    setImagenes([]);
    if (isDesktop) textareaRef.current?.focus();
  }, [descripcion, area, linea, clasificacion, minutaId, imagenes, onSubmit, submitting, isDesktop]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1500px] mx-auto p-3 md:p-4 lg:px-8">
        <div className="bg-slate-50/50 rounded-[1.75rem] p-3 border border-white shadow-inner flex items-start gap-0.5">
          
          {/* Contenedor Principal: Input + Controles */}
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            
            {/* Input de Entrada Grande */}
            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe la idea, acuerdo o tarea aquí..."
                className="w-full bg-white border border-slate-100 rounded-[1.5rem] px-5 py-4 text-base lg:text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-marca-primario/5 transition-all resize-none placeholder:text-slate-300 shadow-sm leading-tight"
                style={{ minHeight: 64 }}
              />
              
              {/* Controles Multimedia Integrados */}
              <div className="absolute right-4 bottom-3 flex items-center gap-5">
                {showLimitError && (
                  <div className="flex items-center gap-5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold animate-in fade-in slide-in-from-right-2 duration-300">
                    <AlertCircle size={14} />
                    Máximo 3 imágenes
                  </div>
                )}
                
                <button 
                  type="button"
                  title="Subir Imágenes"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-2 text-slate-400 hover:text-marca-primario transition-all rounded-xl hover:bg-white active:scale-90 border border-transparent hover:border-slate-100",
                    imagenes.length >= 3 && "opacity-50 cursor-not-allowed grayscale"
                  )}
                  disabled={imagenes.length >= 3}
                >
                  <Camera size={21} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
              </div>
            </div>

            {/* Fila de Clasificadores, Contexto y PREVIEW DE IMÁGENES */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-2 py-1">
              
              {/* Sección de Previsualización de Imágenes Mejorada */}
              {imagenes.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                   <div className="flex flex-col mr-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Imágenes</span>
                      <span className={cn("text-[10px] font-bold", imagenes.length === 3 ? "text-amber-500" : "text-slate-500")}>
                        {imagenes.length}/3
                      </span>
                   </div>
                   <div className="flex gap-2">
                    {imagenes.map((img) => (
                      <div key={img.id} className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100 group transition-all hover:scale-105">
                        <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button" 
                          onClick={() => removeImagen(img.id)} 
                          className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    {imagenes.length < 3 && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-slate-400 hover:text-slate-400 transition-all bg-white/50 active:scale-95"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                   </div>
                </div>
              )}

              {/* Área Selector */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4 min-h-8">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área:</span>
                <div className="flex gap-1.5">
                  {Object.entries(AREA_MAP).map(([key, label]) => (
                    <button key={key} onClick={() => setArea(key)}
                      className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter border",
                      area === key ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Línea Selector */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4 min-h-8">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Línea:</span>
                <div className="flex gap-1.5">
                  {Object.entries(LINEA_MAP).map(([key, val]) => (
                    <button key={key} onClick={() => setLinea(key)}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter border",
                      linea === key ? "bg-marca-primario text-white border-marca-primario shadow-lg" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50")}>
                      <LineIconSelector type={key} size={16} />
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clasificación (Solo si es DISEÑO) */}
              {area === 'DISENO' && (
                <div className="flex items-center gap-3 border-l border-slate-200 pl-4 min-h-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(CLASIFICACION_MAP).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setClasificacion(key)}
                        title={val.label}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 h-8 rounded-xl transition-all border whitespace-nowrap",
                          clasificacion === key 
                            ? "text-white shadow-md scale-105" 
                            : "bg-white text-slate-300 border-slate-100 hover:border-slate-200"
                        )}
                        style={clasificacion === key ? { backgroundColor: val.color, borderColor: val.color } : {}}
                      >
                        <Icon name={val.icon} size="16px" />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-tighter",
                          clasificacion === key ? "text-white" : "text-slate-400"
                        )}>
                          {val.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de Registro Primario (Círculo Grande) */}
          <button
            onClick={handleSubmit}
            disabled={!descripcion.trim() || submitting}
            className={cn(
              "w-[4.5rem] h-[4.5rem] lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl shrink-0 group relative",
              descripcion.trim() 
                ? "bg-emerald-600 text-white shadow-emerald-600/40 hover:bg-emerald-500" 
                : "bg-slate-100 text-slate-200 cursor-not-allowed border border-slate-200"
            )}
          >
            {submitting ? (
              <Icon name="progress_activity" size="34px" className="animate-spin" />
            ) : (
              <Icon 
                name="add" 
                size="44px" 
                className={cn("transition-transform duration-500", descripcion.trim() && "group-hover:rotate-90")} 
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
