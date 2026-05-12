import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../constants';

/**
 * QuickComposer — Estación de Captura Ejecutiva.
 * Diseño "Liquid Glass" refinado: controles potentes pero visualmente ligeros.
 * Siempre visibles, sin interrupciones.
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

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [descripcion]);

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newImages = validFiles.map(f => ({
      file: f,
      preview: URL.createObjectURL(f)
    }));
    setImagenes(prev => [...prev, ...newImages].slice(0, 3));
  };

  const handleFileChange = (e) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const removeImagen = (index) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
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
    <div className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] animate-in slide-in-from-top duration-500">
      <div className="max-w-[1500px] mx-auto p-4 md:p-6 lg:px-10">
        <div className="bg-slate-50/50 rounded-[2.5rem] p-3 border border-white shadow-inner flex items-center gap-4">
          
          {/* Contenedor Principal: Input + Controles */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            
            {/* Input de Entrada Grande */}
            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe la idea, acuerdo o tarea aquí..."
                className="w-full bg-white border border-slate-100 rounded-[2rem] px-8 py-5 text-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-marca-primario/5 transition-all resize-none placeholder:text-slate-300 shadow-sm leading-tight"
                style={{ minHeight: 80 }}
              />
              
              {/* Controles Multimedia Integrados */}
              <div className="absolute right-4 bottom-3 flex items-center gap-1.5">
                <button 
                  type="button"
                  title="Tomar Foto"
                  onClick={() => {
                    const input = fileInputRef.current;
                    if (input) {
                      input.setAttribute('capture', 'environment');
                      input.click();
                    }
                  }}
                  className="p-3 text-slate-400 hover:text-emerald-500 transition-all rounded-2xl hover:bg-emerald-50 active:scale-90"
                >
                  <Icon name="photo_camera" size="28px" />
                </button>
                <button 
                  type="button"
                  title="Subir de Galería"
                  onClick={() => {
                    const input = fileInputRef.current;
                    if (input) {
                      input.removeAttribute('capture');
                      input.click();
                    }
                  }}
                  className="p-3 text-slate-400 hover:text-blue-500 transition-all rounded-2xl hover:bg-blue-50 active:scale-90"
                >
                  <Icon name="collections" size="28px" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
              </div>
            </div>

            {/* Fila de Clasificadores y Contexto */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-4 py-1">
              
              {/* Área Selector */}
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área:</span>
                <div className="flex gap-1">
                  {Object.entries(AREA_MAP).map(([key, label]) => (
                    <button key={key} onClick={() => setArea(key)}
                      className={cn("px-4 py-1.5 rounded-xl text-[11px] font-black transition-all uppercase tracking-tighter border",
                      area === key ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Línea Selector */}
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Línea:</span>
                <div className="flex gap-1">
                  {Object.entries(LINEA_MAP).map(([key, label]) => (
                    <button key={key} onClick={() => setLinea(key)}
                      className={cn("px-4 py-1.5 rounded-xl text-[11px] font-black transition-all uppercase tracking-tighter border",
                      linea === key ? "bg-marca-primario text-white border-marca-primario shadow-lg" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clasificación (Solo si es DISEÑO) */}
              {area === 'DISENO' && (
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(CLASIFICACION_MAP).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setClasificacion(key)}
                        title={val.label}
                        className={cn(
                          "flex items-center gap-2 px-3 h-8 rounded-lg transition-all border whitespace-nowrap",
                          clasificacion === key 
                            ? "text-white shadow-md scale-105" 
                            : "bg-white text-slate-300 border-slate-100 hover:border-slate-200"
                        )}
                        style={clasificacion === key ? { backgroundColor: val.color, borderColor: val.color } : {}}
                      >
                        <Icon name={val.icon} size="16px" />
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-tighter",
                          clasificacion === key ? "text-white" : "text-slate-400"
                        )}>
                          {val.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview de Imágenes (Mini) */}
              {imagenes.length > 0 && (
                <div className="flex gap-2 ml-auto">
                  {imagenes.map((img, idx) => (
                    <div key={idx} className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 group">
                      <img src={img.preview} className="w-full h-full object-cover" alt="P" />
                      <button type="button" onClick={() => removeImagen(idx)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="close" size="14px" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botón de Registro Primario (Círculo Verde) */}
          <button
            onClick={handleSubmit}
            disabled={!descripcion.trim() || submitting}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl shrink-0 group",
              descripcion.trim() 
                ? "bg-emerald-500 text-white shadow-emerald-500/40 hover:bg-emerald-400" 
                : "bg-slate-100 text-slate-200 cursor-not-allowed border border-slate-200"
            )}
          >
            <Icon 
              name="add" 
              size="56px" 
              className={cn("transition-transform duration-500", descripcion.trim() && "group-hover:rotate-90")} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};
