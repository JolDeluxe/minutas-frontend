import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Icon, Modal, ModalHeader, ModalBody, ModalFooter, Button as UIButton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getCatalogos, LINEAS_POR_AREA } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { Camera, X, Plus, AlertCircle, Save, StickyNote, Trash2 } from 'lucide-react';

/**
 * AllNotesModal — Modal para gestionar todas las notas rápidas cuando exceden el límite visual.
 */
const AllNotesModal = ({ isOpen, onClose, notas, onUpdate, onRemove, onAdd }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="Todas las Notas Rápidas" onClose={onClose} />
      <ModalBody>
        <div className="grid grid-cols-2 gap-4">
          {notas.map((nota, idx) => (
            <div key={idx} className="relative group animate-in zoom-in-95 duration-200">
              <textarea
                value={nota}
                onChange={(e) => onUpdate(idx, e.target.value)}
                placeholder="Escribe una nota..."
                className="w-full h-32 p-3 text-xs font-medium bg-[#fffbeb] border border-amber-200 rounded-xl resize-none shadow-sm focus:ring-2 focus:ring-amber-400/20 focus:border-amber-300 outline-none text-amber-900"
              />
              <button
                onClick={() => onRemove(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={onAdd}
            disabled={notas.some(n => !n.trim())}
            className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/30 text-amber-400 hover:bg-amber-50 hover:text-amber-500 transition-all disabled:opacity-40"
          >
            <Plus size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Añadir</span>
          </button>
        </div>
      </ModalBody>
      <ModalFooter>
        <UIButton variant="dark" onClick={onClose}>Listo</UIButton>
      </ModalFooter>
    </Modal>
  );
};

/**
 * QuickComposer — Estación de Captura Ejecutiva para Escritorio.
 */
export const QuickComposer = ({
  minutaId,
  lineaDefault,
  departamento,
  onSubmit,
  submitting = false,
  isDesktop = false,
  estado,
  onIniciar,
  iniciando = false,
  onCollapseChange,
}) => {
  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);

  const [descripcion, setDescripcion] = useState('');
  const [notasRapidas, setNotasRapidas] = useState([]);
  const [clasificacion, setClasificacion] = useState('');
  const [area, setArea] = useState(catalogos.areas[0]?.value || 'DISENO');
  
  const lineasDisponibles = useMemo(() => LINEAS_POR_AREA[area] || [], [area]);
  const tieneLineas = lineasDisponibles.length > 0;

  const [linea, setLinea] = useState(tieneLineas ? (lineaDefault || lineasDisponibles[0]?.value) : null);
  const [imagenes, setImagenes] = useState([]);
  const [showLimitError, setShowLimitError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Validación personalizada solicitada por el usuario
  const isValid = useMemo(() => {
    if (!descripcion.trim()) return false;
    
    // Si el área es Diseño o Marketing, requerir línea (si aplica) y clasificación
    const isOperationalArea = area === 'DISENO' || area === 'MARKETING';
    if (isOperationalArea) {
      const hasLinea = tieneLineas ? !!linea : true;
      const hasClasif = !!clasificacion;
      return hasLinea && hasClasif;
    }
    
    // Para otras áreas, solo se requiere la descripción
    return true;
  }, [descripcion, area, linea, clasificacion, tieneLineas]);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  useEffect(() => {
    if (!isCollapsed && isDesktop) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed, isDesktop]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      // Ajuste dinámico de altura para evitar scroll excesivo del componente
      ta.style.height = Math.min(200, Math.max(100, ta.scrollHeight)) + 'px';
    }
  }, [descripcion]);

  useEffect(() => {
    if (showLimitError) {
      const timer = setTimeout(() => setShowLimitError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLimitError]);

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

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const remainingSlots = 3 - imagenes.length;
    if (remainingSlots <= 0) {
      setShowLimitError(true);
      return;
    }
    const newImages = validFiles.slice(0, remainingSlots).map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImagenes(prev => [...prev, ...newImages]);
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
    if (!isValid || submitting) return;
    const esPolitica = clasificacion === 'POLITICAS';
    const payload = {
      tareas: [{
        descripcion: descripcion.trim(),
        area,
        linea: tieneLineas ? linea : null,
        clasificacion: clasificacion || 'OTROS',
        tipo: esPolitica ? 'POLITICA' : undefined,
        minutaId: Number(minutaId),
        _localImages: imagenes,
        notas: notasRapidas.filter(n => n.trim()).map(n => ({ contenido: n.trim() })),
      }],
    };
    onSubmit(payload);
    setDescripcion('');
    setNotasRapidas([]);
    setImagenes([]);

    // --- REINICIAR SELECTORES A SUS VALORES INICIALES ---
    const defaultArea = catalogos.areas[0]?.value || departamento;
    const defaultLineas = LINEAS_POR_AREA[defaultArea] || [];
    setArea(defaultArea);
    setLinea(defaultLineas.length > 0 ? (lineaDefault || defaultLineas[0]?.value) : null);
    setClasificacion('');

    if (isDesktop) textareaRef.current?.focus();
  }, [
    isValid, 
    descripcion, 
    notasRapidas, 
    area, 
    linea, 
    clasificacion, 
    minutaId, 
    imagenes, 
    onSubmit, 
    submitting, 
    isDesktop, 
    tieneLineas,
    catalogos,
    departamento,
    lineaDefault
  ]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const visibleNotesCount = 2;

  return (
    <div className={cn(
      "transition-all duration-300 relative overflow-visible",
      (isCollapsed && estado !== 'PROGRAMADA')
        ? "w-full sticky top-0 h-12 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm z-30" 
        : "absolute inset-0 bg-slate-50/98 backdrop-blur-md flex flex-col p-2 md:p-3 lg:p-4 z-[60]"
    )}>
      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 rounded-full w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-90 outline-none"
        >
          <Icon name="expand_more" size="18px" />
        </button>
      )}

      {isCollapsed ? (
        <div className="h-full flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Captura</span>
           {descripcion.trim() && <span className="text-[11px] font-bold text-slate-900 truncate max-w-md italic opacity-60">"{descripcion.substring(0, 60)}..."</span>}
           <button onClick={() => setIsCollapsed(false)} className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg"><Plus size={12} /> Nueva Tarea</button>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full gap-2 animate-in fade-in zoom-in-95 duration-300 min-h-0 max-w-5xl mx-auto">
          <div className="flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Captura</span>
            </div>
            <button onClick={() => setIsCollapsed(true)} className="flex items-center gap-1.5 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md border border-slate-700 cursor-pointer"><X size={16} /> Cerrar Captura</button>
          </div>

          <div className="flex-1 bg-white border border-slate-200/60 rounded-[1.5rem] p-4 lg:p-6 shadow-2xl flex flex-col gap-4 min-h-0 overflow-hidden">
            {/* 1. INPUT DESCRIPCION (GRANDE) */}
            <div className="relative flex-1 min-h-0 group">
              <textarea
                ref={textareaRef}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe la idea, acuerdo o tarea aquí..."
                className="w-full h-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-3 text-sm lg:text-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-marca-primario/5 transition-all resize-none placeholder:text-slate-300 shadow-inner custom-scrollbar"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {showLimitError && <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[8px] font-black uppercase animate-in fade-in slide-in-from-right-2 duration-300 border border-rose-100"><AlertCircle size={10} /> Máximo 3 fotos</div>}
              </div>
            </div>

            {/* 2. NOTAS | IMAGENES (SIDE BY SIDE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 bg-slate-50/40 p-3 rounded-[1.5rem] border border-slate-100/60 shadow-inner">
              {/* Notas */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Notas (Opcional)</span>
                  </div>
                  {notasRapidas.length > visibleNotesCount && (
                     <button onClick={() => setShowAllNotes(true)} className="text-[8px] font-black text-amber-600 uppercase hover:underline">Ver {notasRapidas.length}</button>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <button
                    onClick={handleAddNota}
                    disabled={notasRapidas.some(n => !n.trim())}
                    className="w-12 h-12 shrink-0 border-2 border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center text-amber-500 bg-white hover:bg-amber-50 transition-all active:scale-95 disabled:opacity-40"
                  >
                    <Plus size={16} />
                    <span className="text-[6px] font-black uppercase">Nota</span>
                  </button>

                  {notasRapidas.slice(0, visibleNotesCount).map((nota, idx) => (
                    <div key={idx} className="relative w-12 h-12 shrink-0 group animate-in zoom-in-95 duration-300">
                      <textarea
                        value={nota}
                        onChange={(e) => handleUpdateNota(idx, e.target.value)}
                        placeholder="..."
                        className="w-full h-full p-1.5 text-[8px] font-bold bg-[#fffbeb] border border-amber-200 rounded-xl resize-none shadow-sm focus:ring-2 focus:ring-amber-400/20 focus:border-amber-300 outline-none text-amber-900 placeholder:text-amber-300"
                      />
                      <button onClick={() => handleRemoveNota(idx)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-rose-500 border border-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-500 hover:text-white"><X size={8} /></button>
                    </div>
                  ))}
                  
                  {notasRapidas.length > visibleNotesCount && !showAllNotes && (
                    <button onClick={() => setShowAllNotes(true)} className="w-12 h-12 shrink-0 bg-amber-200/50 rounded-xl flex items-center justify-center text-amber-700 active:scale-95 transition-all">
                      <span className="text-xs font-black">+{notasRapidas.length - visibleNotesCount}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Imágenes */}
              <div className="flex flex-col gap-1.5 border-l border-slate-200 pl-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Imágenes (Opcional)</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{imagenes.length} / 3</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imagenes.length >= 3}
                    className="w-12 h-12 shrink-0 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-40"
                  >
                    <Camera size={16} />
                    <span className="text-[6px] font-black uppercase">Foto</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />

                  {imagenes.map((img) => (
                    <div key={img.id} className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-white shadow-sm group transition-all hover:scale-105">
                      <img src={img.preview} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImagen(img.id)} className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} strokeWidth={3} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. AREA | LINEA | CLASIFICACION (ROW) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
               <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Área</label>
                  <select value={area} onChange={(e) => {
                    const newArea = e.target.value;
                    setArea(newArea);
                    const newLineas = LINEAS_POR_AREA[newArea] || [];
                    setLinea(newLineas.length > 0 ? newLineas[0].value : null);
                  }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-marca-primario/10 transition-all shadow-sm">
                    {catalogos.areas.map(({ value, label }) => (<option key={value} value={value}>{label}</option>))}
                  </select>
               </div>

               {tieneLineas && (
                 <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Línea</label>
                    <select value={linea || ''} onChange={(e) => setLinea(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-marca-primario/10 transition-all shadow-sm">
                      <option value="">— Seleccionar Línea —</option>
                      {lineasDisponibles.map(({ value, label }) => (<option key={value} value={value}>{label}</option>))}
                    </select>
                 </div>
               )}

               <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Clasificación</label>
                  <select value={clasificacion} onChange={(e) => setClasificacion(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-marca-primario/10 transition-all shadow-sm">
                    <option value="">— Seleccionar Tipo —</option>
                    {catalogos.clasificaciones.map(({ value, label }) => (<option key={value} value={value}>{label}</option>))}
                  </select>
               </div>
            </div>

            {/* 4. BOTÓN GUARDAR (PROMINENTE) */}
            <div className="flex flex-col gap-2 mt-2 shrink-0">
               <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                className={cn(
                  "w-full flex items-center justify-center gap-3 py-3 lg:py-4 rounded-2xl font-black text-xs lg:text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                  isValid ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                )}
              >
                {submitting ? <Icon name="progress_activity" size="20px" className="animate-spin" /> : <Save size={20} />}
                {submitting ? 'Guardando...' : 'Registrar Tarea'}
              </button>
              
              <div className="flex justify-center items-center gap-2">
                 <p className="text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Icon name="keyboard_return" size="14px" className="opacity-50" />
                    Presiona <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Enter</span> para guardar rápido
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {estado === 'PROGRAMADA' && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100"><Icon name="event" size="32px" /></div>
          <h3 className="fuente-titulos text-xl font-black text-slate-800 uppercase tracking-wider">Minuta Programada</h3>
          <p className="max-w-md text-sm text-slate-400 mt-2 font-medium">Inicia la junta para poder capturar acuerdos, tareas y subir imágenes.</p>
          <button onClick={onIniciar} disabled={iniciando} className="mt-6 flex items-center gap-2 px-6 py-3 bg-marca-primario hover:bg-marca-primario/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-marca-primario/25 transition-all active:scale-95 disabled:opacity-50">{iniciando ? <Icon name="progress_activity" size="16px" className="animate-spin" /> : <Icon name="play_arrow" size="16px" />} {iniciando ? 'Iniciando...' : 'Iniciar Junta Ahora'}</button>
        </div>
      )}

      <AllNotesModal
        isOpen={showAllNotes}
        onClose={() => setShowAllNotes(false)}
        notas={notasRapidas}
        onUpdate={handleUpdateNota}
        onRemove={handleRemoveNota}
        onAdd={handleAddNota}
      />
    </div>
  );
};
