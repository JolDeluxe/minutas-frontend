import { useState, useRef } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { Camera, X, Plus, Send } from 'lucide-react';

/**
 * MobileQuickComposer — Versión Sólida y Robusta para móviles.
 * Ajustada para evitar que el contenido se "rompa" al añadir fotos.
 */
export const MobileQuickComposer = ({ 
  minutaId, 
  lineaDefault, 
  onSubmit, 
  submitting 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [texto, setTexto] = useState('');
  const [area, setArea] = useState('DISENO');
  const [linea, setLinea] = useState(lineaDefault || 'CALZADO');
  const [clasificacion, setClasificacion] = useState('IDEA');
  
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
    if (e) e.preventDefault();
    if (!texto.trim() || submitting) return;

    onSubmit({
      tareas: [{
        tempId: Date.now(),
        descripcion: texto.trim(),
        area,
        linea,
        clasificacion: area === 'DISENO' ? (clasificacion || 'OTROS') : 'OTROS',
        minutaId: Number(minutaId),
        fecha: new Date().toISOString(),
        _localImagenes: localImages
      }]
    });

    setTexto('');
    setLocalImages([]);
    setExpanded(false);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (touchEnd - touchStart > 80 && expanded) setExpanded(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      {/* Overlay Sólido */}
      {expanded && (
        <div 
          className="fixed inset-x-0 top-12 bottom-16 bg-slate-900/35 z-[40] animate-in fade-in duration-300"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Drawer Sólido con Altura Dinámica/Ajustada */}
      <div 
        className={cn(
          "fixed left-3 right-3 z-[50] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white shadow-[0_-10px_50px_rgba(0,0,0,0.3)] border border-slate-200 flex flex-col overflow-hidden",
          expanded
            ? "bottom-16 h-[clamp(28rem,72dvh,42rem)] max-h-[calc(100dvh-5.5rem)] rounded-t-[1.75rem] rounded-b-2xl sm:left-1/2 sm:right-auto sm:w-[min(44rem,calc(100vw-3rem))] sm:-translate-x-1/2 [@media(max-height:720px)]:bottom-16 [@media(max-height:720px)]:h-[calc(100dvh-5.25rem)] [@media(max-height:720px)]:rounded-t-[1.35rem] [@media(min-height:860px)]:h-[clamp(32rem,68dvh,45rem)]"
            : "bottom-20 h-[4.5rem] rounded-2xl sm:left-6 sm:right-6"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Handle de arrastre */}
        <div className="w-full flex flex-col items-center py-2 shrink-0 cursor-pointer [@media(max-height:720px)]:py-1.5 [@media(min-height:860px)]:py-3" onClick={() => setExpanded(!expanded)}>
          <div className="w-12 h-1.5 bg-slate-100 rounded-full [@media(max-height:720px)]:h-1" />
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-4 pb-3 overflow-hidden [@media(max-height:720px)]:px-3 [@media(max-height:720px)]:pb-2 [@media(min-height:860px)]:px-5 [@media(min-height:860px)]:pb-4">
          
          {/* HEADER: Textarea + Botones rápidos */}
          <div className="flex items-start gap-3 shrink-0 mb-2 [@media(max-height:720px)]:mb-1.5 [@media(min-height:860px)]:mb-3">
            <textarea 
              placeholder="¿Qué pasó en la reunión?"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onFocus={() => setExpanded(true)}
              rows={expanded ? 2 : 1}
              className={cn(
                "flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold transition-all resize-none placeholder:text-slate-300 leading-snug focus:outline-none focus:border-marca-primario/40 focus:ring-4 focus:ring-marca-primario/10 [@media(max-height:720px)]:px-3 [@media(max-height:720px)]:py-2 [@media(max-height:720px)]:text-[13px] [@media(min-height:860px)]:text-base [@media(min-height:860px)]:px-5 [@media(min-height:860px)]:py-4",
                expanded && "min-h-[4.25rem] max-h-[5.25rem] [@media(min-height:860px)]:min-h-[5.25rem] [@media(min-height:860px)]:max-h-[6.25rem]",
                !expanded && "h-12 py-2.5 overflow-hidden"
              )}
            />
            {!expanded && (
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                >
                  <Camera size={22} />
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={!texto.trim()} 
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90",
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={localImages.length >= 3}
                    className="w-16 h-16 shrink-0 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-marca-primario hover:text-marca-primario transition-all active:scale-95 snap-start disabled:opacity-40 disabled:grayscale [@media(max-height:720px)]:w-12 [@media(max-height:720px)]:h-12 [@media(max-height:720px)]:rounded-xl [@media(min-height:860px)]:w-20 [@media(min-height:860px)]:h-20"
                  >
                    <Plus size={20} />
                    <span className="text-[9px] font-black mt-1 [@media(max-height:720px)]:hidden [@media(min-height:860px)]:text-[10px]">AÑADIR</span>
                  </button>

                  {localImages.map((img) => (
                    <div key={img.id} className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden group shadow-md snap-start border-2 border-white [@media(max-height:720px)]:w-12 [@media(max-height:720px)]:h-12 [@media(max-height:720px)]:rounded-xl [@media(min-height:860px)]:w-20 [@media(min-height:860px)]:h-20">
                      <img src={img.preview} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 backdrop-blur text-rose-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all [@media(max-height:720px)]:top-1 [@media(max-height:720px)]:right-1 [@media(max-height:720px)]:w-5 [@media(max-height:720px)]:h-5"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selectores */}
              <div className="grid gap-3 min-[560px]:grid-cols-2 [@media(max-height:720px)]:gap-2 [@media(min-height:860px)]:gap-4">
                {area === 'DISENO' && (
                  <>
                    <div className="animate-in fade-in slide-in-from-left-2 duration-400 delay-100">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">Clasificación de Entrada</span>
                      <div className="flex flex-wrap gap-2 [@media(max-height:720px)]:gap-1.5">
                        {Object.entries(CLASIFICACION_MAP).map(([key, val]) => (
                          <button 
                            key={key} 
                            onClick={() => setClasificacion(key)} 
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all active:scale-95 [@media(min-height:860px)]:px-3 [@media(min-height:860px)]:py-2 [@media(min-height:860px)]:text-[10px]", 
                              clasificacion === key 
                                ? "text-white shadow-xl translate-y-[-2px]" 
                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                            )}
                            style={{ 
                              backgroundColor: clasificacion === key ? val.color : undefined,
                              borderColor: clasificacion === key ? val.color : undefined
                            }}
                          >
                            <Icon name={val.icon} size="16px" />
                            {val.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-left-2 duration-400 delay-150">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">Línea de Producto</span>
                      <div className="flex flex-wrap gap-2 [@media(max-height:720px)]:gap-1.5">
                        {Object.entries(LINEA_MAP).map(([key, val]) => (
                          <button 
                            key={key} 
                            onClick={() => setLinea(key)} 
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all active:scale-95 [@media(min-height:860px)]:px-3 [@media(min-height:860px)]:py-2 [@media(min-height:860px)]:text-[10px]", 
                              linea === key 
                                ? "bg-slate-900 text-white border-slate-900 shadow-xl translate-y-[-2px]" 
                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                            )}
                          >
                            <LineIconSelector type={key} size={20} />
                            {val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="animate-in fade-in slide-in-from-left-2 duration-400 delay-200 min-[560px]:col-span-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5 ml-1">Área Responsable</span>
                  <div className="flex flex-wrap gap-2 [@media(max-height:720px)]:gap-1.5">
                    {Object.entries(AREA_MAP).map(([key, label]) => (
                      <button 
                        key={key} 
                        onClick={() => setArea(key)} 
                        className={cn(
                          "px-2.5 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all active:scale-95 [@media(min-height:860px)]:px-3 [@media(min-height:860px)]:py-2 [@media(min-height:860px)]:text-[10px]", 
                          area === key 
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
            <div className="shrink-0 pt-2 mt-1 border-t border-slate-100 flex items-center justify-between [@media(min-height:860px)]:pt-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={localImages.length >= 3}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all border border-slate-100 disabled:opacity-40 [@media(min-height:860px)]:px-4 [@media(min-height:860px)]:py-3 [@media(min-height:860px)]:text-[10px]"
                >
                  <Camera size={20} />
                  FOTOS
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!texto.trim() || submitting}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 font-black uppercase text-[9px] tracking-widest shadow-2xl [@media(min-height:860px)]:px-6 [@media(min-height:860px)]:py-3 [@media(min-height:860px)]:text-[10px]",
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
    </>
  );
};
