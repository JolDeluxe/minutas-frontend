import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Modal, ModalHeader, ModalBody, ModalFooter, Button as UIButton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getCatalogos, LINEAS_POR_AREA } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { Camera, X, Plus, Send, StickyNote } from 'lucide-react';

/**
 * MobileAllNotesModal — Versión móvil para ver todas las notas.
 */
const MobileAllNotesModal = ({ isOpen, onClose, notas, onUpdate, onRemove, onAdd }) => {
  return (
    <div className={cn(
      "fixed inset-0 z-[130] bg-slate-950/40 backdrop-blur-sm flex items-end justify-center transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "bg-white w-full rounded-t-[2rem] max-h-[85vh] flex flex-col transition-transform duration-300 transform",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex justify-center pt-4 pb-2"><div className="w-12 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900">Todas las Notas</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notas.map((nota, idx) => (
            <div key={idx} className="relative group animate-in slide-in-from-bottom-2 duration-300">
              <textarea
                value={nota}
                onChange={(e) => onUpdate(idx, e.target.value)}
                placeholder="Escribe una nota..."
                className="w-full h-24 p-4 text-sm font-medium bg-[#fffbeb] border border-amber-200 rounded-2xl resize-none outline-none text-amber-900"
              />
              <button
                onClick={() => onRemove(idx)}
                className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={onAdd}
            disabled={notas.some(n => !n.trim())}
            className="w-full py-4 border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/30 text-amber-500 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest disabled:opacity-40"
          >
            <Plus size={20} /> Añadir Nueva Nota
          </button>
        </div>
        <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-slate-100">
          <UIButton variant="dark" onClick={onClose} className="w-full h-12 rounded-xl">Listo</UIButton>
        </div>
      </div>
    </div>
  );
};

/**
 * MobileQuickComposer — Versión Sólida y Robusta para móviles.
 * Rediseñado según la solicitud del usuario:
 * Desc > Notas > Imágenes > Línea (visual naranja) > Área / Clasificación (Selects nativos)
 */
export const MobileQuickComposer = ({
  minutaId,
  lineaDefault,
  departamento,
  onSubmit,
  submitting,
  estado,
  onIniciar,
  iniciando = false,
  onExpandedChange
}) => {
  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);

  const [expanded, setExpanded] = useState(false);
  const [texto, setTexto] = useState('');
  const [notasRapidas, setNotasRapidas] = useState([]);
  const [area, setArea] = useState(catalogos.areas[0]?.value || 'DISENO');
  
  const lineasDisponibles = useMemo(() => LINEAS_POR_AREA[area] || [], [area]);
  const tieneLineas = lineasDisponibles.length > 0;

  const [linea, setLinea] = useState(tieneLineas ? (lineaDefault || lineasDisponibles[0]?.value) : null);
  const [clasificacion, setClasificacion] = useState('');
  const [localImages, setLocalImages] = useState([]);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const fileInputRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Validación personalizada
  const isValid = useMemo(() => {
    if (!texto.trim()) return false;
    const isOperationalArea = area === 'DISENO' || area === 'MARKETING';
    if (isOperationalArea) {
      const hasLinea = tieneLineas ? !!linea : true;
      const hasClasif = !!clasificacion;
      return hasLinea && hasClasif;
    }
    return true;
  }, [texto, area, linea, clasificacion, tieneLineas]);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  const handleAddNota = () => {
    if (notasRapidas.some(n => !n.trim())) return;
    setNotasRapidas([...notasRapidas, '']);
  };

  const handleUpdateNota = (index, value) => {
    const newNotas = [...notasRapidas];
    newNotas[index] = value;
    setNotasRapidas(newNotas);
  };

  const handleRemoveNota = (index) => {
    setNotasRapidas(notasRapidas.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, Math.max(0, 3 - localImages.length));
    const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString(36).substr(2, 9) }));
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
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isValid || submitting) return;
    const esPolitica = clasificacion === 'POLITICAS';
    onSubmit({
      tareas: [{
        descripcion: texto.trim(),
        area,
        linea: tieneLineas ? linea : null,
        clasificacion: clasificacion || 'OTROS',
        tipo: esPolitica ? 'POLITICA' : undefined,
        minutaId: Number(minutaId),
        fecha: new Date().toISOString(),
        _localImages: localImages,
        notas: notasRapidas.filter(n => n.trim()).map(n => ({ contenido: n.trim() })),
      }]
    });
    setTexto('');
    setNotasRapidas([]);
    setLocalImages([]);
    setExpanded(false);
  };

  const handleClose = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setExpanded(false);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);
  const handleTouchEndClose = () => { if (touchStart && touchEnd && touchEnd - touchStart > 50 && expanded) setExpanded(false); setTouchStart(null); setTouchEnd(null); };
  const handleTouchEndOpen = () => { if (touchStart && touchEnd && touchStart - touchEnd > 50 && !expanded) setExpanded(true); setTouchStart(null); setTouchEnd(null); };

  if (estado === 'PROGRAMADA') {
    return createPortal(
      <div className="fixed left-3 right-3 bottom-20 z-[99] rounded-2xl bg-white border border-slate-200 p-4 shadow-[0_-10px_50px_rgba(0,0,0,0.15)] flex flex-col items-center gap-3 text-center sm:left-6 sm:right-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minuta Programada</span></div>
        <p className="text-[11px] font-bold text-slate-500 max-w-xs leading-relaxed">Debes iniciar la junta para poder capturar acuerdos y tareas.</p>
        <button onClick={onIniciar} disabled={iniciando} className="w-full flex items-center justify-center gap-2 py-3 bg-marca-primario text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 touch-manipulation cursor-pointer">{iniciando ? <Icon name="progress_activity" size="14px" className="animate-spin" /> : <Icon name="play_arrow" size="14px" />} {iniciando ? 'Iniciando...' : 'Iniciar Junta Ahora'}</button>
      </div>,
      document.body
    );
  }

  return createPortal(
    <>
      <div className={cn("fixed bg-white flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]", expanded ? "inset-0 z-[120] rounded-none bg-slate-50" : "left-3 right-3 bottom-20 h-[4.5rem] z-[50] rounded-2xl shadow-[0_-10px_50px_rgba(0,0,0,0.15)] border border-slate-200 sm:left-6 sm:right-6")}>
        {!expanded ? (
          <div className="w-full flex flex-col items-center py-2 shrink-0 cursor-pointer" onClick={() => setExpanded(true)} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEndOpen}><div className="w-12 h-1 bg-slate-100 rounded-full" /></div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/60 shrink-0 select-none" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEndClose}>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Captura Mobile</span></div>
            <button onClick={handleClose} className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border border-slate-300 cursor-pointer touch-manipulation"><X size={14} /> Volver / Cerrar</button>
          </div>
        )}

        <div className={cn("flex-1 min-h-0 flex flex-col overflow-hidden transition-all", expanded ? "px-4 pt-4 bg-slate-50" : "px-4 pb-3")}>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-start gap-3 w-full">
              <textarea placeholder="¿Qué pasó en la reunión?" value={texto} onChange={(e) => setTexto(e.target.value)} onFocus={() => setExpanded(true)} rows={expanded ? 3 : 1} className={cn("flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold transition-all resize-none focus:outline-none focus:border-marca-primario/40", expanded ? "min-h-[6rem] max-h-[8rem] bg-white border-slate-200 shadow-inner" : "h-12 py-2.5 overflow-hidden")} />
              {!expanded && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-all touch-manipulation"><Camera size={22} /></button>
                  <button onClick={handleSubmit} disabled={!texto.trim()} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 touch-manipulation", texto.trim() ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-50 text-slate-200")}><Send size={20} /></button>
                </div>
              )}
            </div>
          </div>

          <div className={cn("flex-1 flex flex-col min-h-0 transition-all duration-500", expanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-6 py-4">
              
              {/* NOTAS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Notas Rápidas</span>
                  {notasRapidas.length > 2 && <button onClick={() => setShowAllNotes(true)} className="text-[8px] font-black text-amber-600 uppercase">Ver todas ({notasRapidas.length})</button>}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1">
                  <button onClick={handleAddNota} disabled={notasRapidas.some(n => !n.trim())} className="w-16 h-16 shrink-0 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center text-amber-500 bg-white active:scale-95 disabled:opacity-40"><Plus size={20} /><span className="text-[6px] font-black uppercase">Nota</span></button>
                  {notasRapidas.slice(0, 2).map((nota, idx) => (
                    <div key={idx} className="relative w-16 h-16 shrink-0 group animate-in zoom-in-95 duration-300">
                      <textarea value={nota} onChange={(e) => handleUpdateNota(idx, e.target.value)} placeholder="..." className="w-full h-full p-2 text-[9px] font-bold bg-[#fffbeb] border border-amber-200 rounded-2xl resize-none outline-none text-amber-900 placeholder:text-amber-300" />
                      <button onClick={() => handleRemoveNota(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-md border border-rose-50"><X size={10} /></button>
                    </div>
                  ))}
                  {notasRapidas.length > 2 && (
                    <button onClick={() => setShowAllNotes(true)} className="w-16 h-16 shrink-0 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800 text-xs font-black">+{notasRapidas.length - 2}</button>
                  )}
                </div>
              </div>

              {/* IMÁGENES */}
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Imágenes Adjuntas ({localImages.length}/3)</span>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1">
                  <button onClick={() => fileInputRef.current?.click()} disabled={localImages.length >= 3} className="w-16 h-16 shrink-0 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white active:scale-95 disabled:opacity-40"><Camera size={20} /><span className="text-[6px] font-black uppercase">Foto</span></button>
                  {localImages.map((img) => (
                    <div key={img.id} className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm"><img src={img.preview} className="w-full h-full object-cover" /><button onClick={() => removeImage(img.id)} className="absolute inset-0 bg-slate-900/40 text-white flex items-center justify-center opacity-0 active:opacity-100 transition-opacity"><X size={18} /></button></div>
                  ))}
                </div>
              </div>

              {/* LÍNEA (CUADROS VISUALES NARANJA) */}
              {tieneLineas && (
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Línea de Producto</span>
                  <div className="grid grid-cols-4 gap-2 px-1">
                    {lineasDisponibles.map(({ value, label }) => (
                      <button 
                        key={value} 
                        onClick={() => setLinea(value)} 
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all active:scale-95 touch-manipulation aspect-square gap-1 relative overflow-hidden", 
                          linea === value 
                            ? "bg-orange-50 border-orange-500 shadow-md scale-[1.02]" 
                            : "bg-white border-slate-100 opacity-60"
                        )}
                      >
                        {linea === value && (
                          <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white rounded-full p-0.5 shadow-sm">
                            <Icon name="check" size="10px" weight={900} />
                          </div>
                        )}
                        <LineIconSelector type={value} size={35} />
                        <span className={cn(
                          "text-[7px] font-black uppercase tracking-tighter truncate w-full text-center leading-none",
                          linea === value ? "text-orange-600" : "text-slate-400"
                        )}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ÁREA | CLASIFICACIÓN (SELECTS NATIVOS ADAPTABLES) */}
              <div className="grid grid-cols-2 gap-2.5 px-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Área</span>
                  <div className="relative">
                    <select 
                      value={area} 
                      onChange={(e) => {
                        const newArea = e.target.value;
                        setArea(newArea);
                        const newLineas = LINEAS_POR_AREA[newArea] || [];
                        setLinea(newLineas.length > 0 ? newLineas[0].value : null);
                      }}
                      className="w-full bg-white border-2 border-slate-100 rounded-xl pl-2 pr-7 py-2.5 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-marca-primario/40 transition-all appearance-none shadow-sm h-11 truncate"
                    >
                      {catalogos.areas.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Icon name="expand_more" size="14px" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Clasificación</span>
                  <div className="relative">
                    <select 
                      value={clasificacion} 
                      onChange={(e) => setClasificacion(e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 rounded-xl pl-2 pr-7 py-2.5 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-marca-primario/40 transition-all appearance-none shadow-sm h-11 truncate"
                    >
                      <option value="">— Tipo —</option>
                      {catalogos.clasificaciones.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Icon name="expand_more" size="14px" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FOOTER FIXO (EXPANDED) */}
            <div className="shrink-0 border-t border-slate-200/60 flex items-center justify-between bg-white pt-4 pb-8 px-4 -mx-4 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={localImages.length >= 3} className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 disabled:opacity-40 touch-manipulation"><Camera size={20} /> FOTO</button>
              <button type="button" onClick={handleSubmit} disabled={!isValid || submitting} className={cn("px-8 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest shadow-2xl touch-manipulation", isValid ? "bg-emerald-600 text-white shadow-emerald-600/30" : "bg-slate-100 text-slate-300 shadow-none border border-slate-100")}>
                {submitting ? <Icon name="progress_activity" className="animate-spin" size="20px" /> : <Send size={18} />}
                {submitting ? 'GUARDANDO...' : 'GUARDAR ENTRADA'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileAllNotesModal isOpen={showAllNotes} onClose={() => setShowAllNotes(false)} notas={notasRapidas} onUpdate={handleUpdateNota} onRemove={handleRemoveNota} onAdd={handleAddNota} />
      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </>,
    document.body
  );
};
