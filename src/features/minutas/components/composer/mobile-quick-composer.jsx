import { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getCatalogos } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { Camera, X, Plus, Send } from 'lucide-react';

/**
 * MobileQuickComposer — Versión Sólida y Robusta para móviles.
 * Ajustada para evitar que el contenido se "rompa" al añadir fotos.
 */
export const MobileQuickComposer = ({ 
  minutaId, 
  lineaDefault, 
  departamento,
  onSubmit, 
  submitting,
  estado,
  onIniciar,
  iniciando = false
}) => {
  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);
  const tieneLineas = catalogos.lineas.length > 0;

  if (estado === 'PROGRAMADA') {
    return createPortal(
      <div className="fixed left-3 right-3 bottom-20 z-[99] rounded-2xl bg-white border border-slate-200 p-4 shadow-[0_-10px_50px_rgba(0,0,0,0.15)] flex flex-col items-center gap-3 text-center sm:left-6 sm:right-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minuta Programada</span>
        </div>
        <p className="text-[11px] font-bold text-slate-500 max-w-xs leading-relaxed">
          Esta junta aún no ha comenzado. Debes iniciar la junta para poder capturar acuerdos y tareas en tu móvil.
        </p>
        <button
          onClick={onIniciar}
          disabled={iniciando}
          className="w-full flex items-center justify-center gap-2 py-3 bg-marca-primario hover:bg-marca-primario/90 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 touch-manipulation cursor-pointer"
        >
          {iniciando ? (
            <Icon name="progress_activity" size="14px" className="animate-spin" />
          ) : (
            <Icon name="play_arrow" size="14px" />
          )}
          {iniciando ? 'Iniciando...' : 'Iniciar Junta'}
        </button>
      </div>,
      document.body
    );
  }

  const [expanded, setExpanded] = useState(false);
  const [texto, setTexto] = useState('');
  const [area, setArea] = useState(catalogos.areas[0]?.value || 'DISENO');
  const [linea, setLinea] = useState(tieneLineas ? (lineaDefault || catalogos.lineas[0]?.value) : null);
  const [clasificacion, setClasificacion] = useState('');
  
  const [localImages, setLocalImages] = useState([]);
  const fileInputRef = useRef(null);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, Math.max(0, 3 - localImages.length));
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setLocalImages(prev => [...prev, ...newImages]);
    setExpanded(true);
  };

  const removeImage = (id) => {
    setLocalImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!texto.trim() || submitting) return;

    const esPolitica = clasificacion === 'POLITICAS';

    onSubmit({
      tareas: [{
        tempId: Date.now(),
        descripcion: texto.trim(),
        area,
        linea: tieneLineas ? linea : null,
        clasificacion: clasificacion || 'OTROS',
        tipo: esPolitica ? 'POLITICA' : undefined,
        minutaId: Number(minutaId),
        fecha: new Date().toISOString(),
        _localImagenes: localImages
      }]
    });

    setTexto('');
    setLocalImages([]);
    setExpanded(false);
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpanded(false);
  };

  const handleTriggerUpload = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (localImages.length >= 3) return;
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (id) => (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    removeImage(id);
  };

  const handleSelectClasificacion = (value) => (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setClasificacion(value);
  };

  const handleSelectLinea = (value) => (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLinea(value);
  };

  const handleSelectArea = (value) => (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setArea(value);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);
  
  const handleTouchEndClose = () => {
    if (touchStart && touchEnd && touchEnd - touchStart > 50 && expanded) {
      setExpanded(false);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleTouchEndOpen = () => {
    if (touchStart && touchEnd && touchStart - touchEnd > 50 && !expanded) {
      setExpanded(true);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return createPortal(
    <>
      {/* Drawer / Estación de Captura - Se expande a pantalla completa sin dejar espacios en blanco */}
      <div 
        className={cn(
          "fixed bg-white flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          expanded
            ? "inset-0 z-[99] rounded-none bg-slate-50"
            : "left-3 right-3 bottom-20 h-[4.5rem] z-[50] rounded-2xl shadow-[0_-10px_50px_rgba(0,0,0,0.15)] border border-slate-200 sm:left-6 sm:right-6"
        )}
      >
        
        {!expanded ? (
          /* Handle de arrastre - solo cuando no está expandido */
          <div 
            className="w-full flex flex-col items-center py-2 shrink-0 cursor-pointer" 
            onClick={() => setExpanded(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEndOpen}
          >
            <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
          </div>
        ) : (
          /* Header del Workspace - solo cuando está expandido */
          <div 
            className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/60 shrink-0 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEndClose}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estación de Captura Ejecutiva</span>
            </div>
            <button 
              onTouchEnd={handleClose}
              onClick={handleClose}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border border-slate-200/30 touch-manipulation"
              title="Volver a la minuta"
            >
              <X size={12} />
              Volver a la Minuta
            </button>
          </div>
        )}

        <div className={cn(
          "flex-1 min-h-0 flex flex-col overflow-hidden transition-all",
          expanded ? "px-4 pt-4 bg-slate-50" : "px-4 pb-3"
        )}>
          
          {/* HEADER: Textarea + Botones rápidos */}
          <div className="flex items-start gap-3 shrink-0 mb-2">
            <textarea 
              placeholder="¿Qué pasó en la reunión?"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onFocus={() => setExpanded(true)}
              rows={expanded ? 3 : 1}
              className={cn(
                "flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold transition-all resize-none placeholder:text-slate-300 leading-snug focus:outline-none focus:border-marca-primario/40 focus:ring-4 focus:ring-marca-primario/10",
                expanded && "min-h-[6rem] max-h-[8rem] bg-white border-slate-200 shadow-inner",
                !expanded && "h-12 py-2.5 overflow-hidden"
              )}
            />
            {!expanded && (
              <div className="flex gap-2 shrink-0">
                <button 
                  onTouchEnd={handleTriggerUpload}
                  onClick={handleTriggerUpload}
                  className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-all touch-manipulation"
                >
                  <Camera size={22} />
                </button>
                <button 
                  onTouchEnd={handleSubmit}
                  onClick={handleSubmit} 
                  disabled={!texto.trim()} 
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 touch-manipulation",
                    texto.trim() ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-50 text-slate-200"
                  )}
                >
                  <Send size={20} />
                </button>
              </div>
            )}
          </div>

          {/* CUERPO: Scrollable Area */}
          <div className={cn(
            "flex-1 flex flex-col min-h-0 transition-all duration-500",
            expanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}>
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-3 pb-2 [@media(max-height:720px)]:space-y-2 [@media(max-height:720px)]:pb-1 [@media(min-height:860px)]:space-y-4 [@media(min-height:860px)]:pb-3">
              
              {/* Sección Fotos */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-1.5 px-1">
                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Documentación Visual</span>
                   {localImages.length > 0 && <span className="text-[10px] font-bold text-slate-400">{localImages.length} fotos</span>}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  <button 
                    onTouchEnd={handleTriggerUpload}
                    onClick={handleTriggerUpload}
                    disabled={localImages.length >= 3}
                    className="w-16 h-16 shrink-0 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-marca-primario hover:text-marca-primario transition-all active:scale-95 snap-start disabled:opacity-40 disabled:grayscale touch-manipulation [@media(max-height:720px)]:w-12 [@media(max-height:720px)]:h-12 [@media(max-height:720px)]:rounded-xl [@media(min-height:860px)]:w-20 [@media(min-height:860px)]:h-20"
                  >
                    <Plus size={20} />
                    <span className="text-[9px] font-black mt-1 [@media(max-height:720px)]:hidden [@media(min-height:860px)]:text-[10px]">AÑADIR</span>
                  </button>

                  {localImages.map((img) => (
                    <div key={img.id} className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden group shadow-md snap-start border-2 border-white [@media(max-height:720px)]:w-12 [@media(max-height:720px)]:h-12 [@media(max-height:720px)]:rounded-xl [@media(min-height:860px)]:w-20 [@media(min-height:860px)]:h-20">
                      <img src={img.preview} className="w-full h-full object-cover" />
                      <button 
                        onTouchEnd={handleRemoveImage(img.id)}
                        onClick={handleRemoveImage(img.id)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 backdrop-blur text-rose-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all touch-manipulation [@media(max-height:720px)]:top-1 [@media(max-height:720px)]:right-1 [@media(max-height:720px)]:w-5 [@media(max-height:720px)]:h-5"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selectores */}
              <div className="grid gap-3 min-[560px]:grid-cols-2 [@media(max-height:720px)]:gap-2 [@media(min-height:860px)]:gap-4">
                  <>
                    <div className="animate-in fade-in slide-in-from-left-2 duration-400 delay-100">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">Clasificación de Entrada</span>
                      <div className="flex flex-wrap gap-2 [@media(max-height:720px)]:gap-1.5">
                        {catalogos.clasificaciones.map(({ value, label, color, icon }) => (
                          <button 
                            key={value} 
                            onTouchEnd={handleSelectClasificacion(value)}
                            onClick={handleSelectClasificacion(value)} 
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all active:scale-95 touch-manipulation [@media(min-height:860px)]:px-3 [@media(min-height:860px)]:py-2 [@media(min-height:860px)]:text-[10px]", 
                              clasificacion === value 
                                ? "text-white shadow-xl translate-y-[-2px]" 
                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                            )}
                            style={{ 
                              backgroundColor: clasificacion === value ? color : undefined,
                              borderColor: clasificacion === value ? color : undefined
                            }}
                          >
                            <Icon name={icon} size="16px" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {tieneLineas && (
                      <div className="animate-in fade-in slide-in-from-left-2 duration-400 delay-150">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">Línea de Producto</span>
                        <div className="flex flex-wrap gap-2 [@media(max-height:720px)]:gap-1.5">
                          {catalogos.lineas.map(({ value, label }) => (
                            <button 
                              key={value} 
                              onTouchEnd={handleSelectLinea(value)}
                              onClick={handleSelectLinea(value)} 
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all active:scale-95 touch-manipulation [@media(min-height:860px)]:px-3 [@media(min-height:860px)]:py-2 [@media(min-height:860px)]:text-[10px]", 
                                linea === value 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-xl translate-y-[-2px]" 
                                  : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                              )}
                            >
                              <LineIconSelector type={value} size={20} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>

                <div className="animate-in fade-in slide-in-from-left-2 duration-400 delay-200 min-[560px]:col-span-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">Área Responsable</span>
                  <div className="flex flex-wrap gap-2 [@media(max-height:720px)]:gap-1.5">
                    {catalogos.areas.map(({ value, label }) => (
                      <button 
                        key={value} 
                        onTouchEnd={handleSelectArea(value)}
                        onClick={handleSelectArea(value)} 
                        className={cn(
                          "px-2.5 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all active:scale-95 touch-manipulation [@media(min-height:860px)]:px-3 [@media(min-height:860px)]:py-2 [@media(min-height:860px)]:text-[10px]", 
                          area === value 
                            ? "bg-marca-primario text-white border-marca-primario shadow-xl translate-y-[-2px]" 
                            : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER: Acciones Finales (FIJO) */}
            {expanded && (
              <div className="shrink-0 border-t border-slate-200/60 flex items-center justify-between bg-white pt-4 pb-6 px-4 -mx-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] animate-in slide-in-from-bottom-2 duration-300">
                <button 
                  type="button"
                  onTouchEnd={handleTriggerUpload}
                  onClick={handleTriggerUpload}
                  disabled={localImages.length >= 3}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all border border-slate-100 disabled:opacity-40 touch-manipulation"
                >
                  <Camera size={20} />
                  FOTOS
                </button>

                <button
                  type="button"
                  onTouchEnd={handleSubmit}
                  onClick={handleSubmit}
                  disabled={!texto.trim() || submitting}
                  className={cn(
                    "px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 font-black uppercase text-[9px] tracking-widest shadow-2xl touch-manipulation",
                    texto.trim() ? "bg-emerald-600 text-white shadow-emerald-600/30" : "bg-slate-50 text-slate-200 shadow-none border border-slate-100"
                  )}
                >
                  {submitting ? (
                    <Icon name="progress_activity" className="animate-spin" size="20px" />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting ? 'GUARDANDO...' : 'GUARDAR ENTRADA'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Input Oculto */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
    </>,
    document.body
  );
};
