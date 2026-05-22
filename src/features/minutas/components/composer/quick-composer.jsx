import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getCatalogos, AREA_MAP } from '../../constants';
import { LineIconSelector } from '../icons/line-icons';
import { Camera, X, Plus, AlertCircle } from 'lucide-react';

/**
 * QuickComposer — Estación de Captura Ejecutiva para Escritorio.
 * Versión optimizada con mejor gestión de imágenes y validaciones.
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
}) => {
  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);
  const tieneLineas = catalogos.lineas.length > 0;

  const [descripcion, setDescripcion] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [area, setArea] = useState(catalogos.areas[0]?.value || 'DISENO');
  const [linea, setLinea] = useState(tieneLineas ? (lineaDefault || catalogos.lineas[0]?.value) : null);
  const [imagenes, setImagenes] = useState([]);
  const [showLimitError, setShowLimitError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [composerMode, setComposerMode] = useState(() => localStorage.getItem('composer_mode') || 'compact');

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => localStorage.setItem('composer_mode', composerMode), [composerMode]);

  // Autofocus when expanded
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
        linea: tieneLineas ? linea : null,
        clasificacion: clasificacion || 'OTROS',
        minutaId: Number(minutaId),
        _localImagenes: imagenes,
      }],
    };

    onSubmit(payload);
    setDescripcion('');
    setImagenes([]);
    if (isDesktop) textareaRef.current?.focus();
  }, [descripcion, area, linea, clasificacion, minutaId, imagenes, onSubmit, submitting, isDesktop, tieneLineas]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn(
      "transition-all duration-300 relative overflow-hidden",
      (isCollapsed && estado !== 'PROGRAMADA')
        ? "w-full sticky top-0 h-12 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] z-30" 
        : "absolute inset-0 bg-slate-50/98 backdrop-blur-md flex flex-col p-4 md:p-6 lg:p-8 z-30"
    )}>
      {/* Botón de Toggle Flotante (Pestaña) - Solo visible en modo colapsado */}
      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 rounded-full w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-90 outline-none"
          title="Mostrar Estación de Captura"
        >
          <Icon name="expand_more" size="18px" />
        </button>
      )}

      {isCollapsed ? (
        <div className="h-full flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estación de Captura Minimizada</span>
           {descripcion.trim() && (
             <span className="text-[11px] font-bold text-slate-900 truncate max-w-md italic opacity-60">
               "{descripcion.substring(0, 60)}..."
             </span>
           )}
           <button 
             onClick={() => setIsCollapsed(false)}
             className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
           >
             <Plus size={12} />
             Nueva Entrada
           </button>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full gap-4 animate-in fade-in zoom-in-95 duration-300 min-h-0 flex-1">
          
          {/* Header del Workspace */}
          <div className="flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estación de Captura Ejecutiva</span>
            </div>
            
            <button 
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-200/60 hover:bg-slate-250 text-slate-700 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-sm border border-slate-300/20"
              title="Minimizar y volver a la minuta"
            >
              <X size={14} />
              Volver a la Minuta
            </button>
          </div>

          {/* Tarjeta del Formulario Principal */}
          <div className="flex-1 bg-white border border-slate-200/60 rounded-[2.5rem] p-6 lg:p-8 shadow-xl flex flex-col gap-6 min-h-0">
            
            {/* Textarea de gran tamaño */}
            <div className="relative flex-1 min-h-0 flex flex-col group">
              <textarea
                ref={textareaRef}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe la idea, acuerdo o tarea aquí..."
                className="w-full flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-base lg:text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-marca-primario/5 transition-all resize-none placeholder:text-slate-300 shadow-inner"
              />
              
              {/* Cámara flotante dentro del Textarea */}
              <div className="absolute right-4 bottom-4 flex items-center gap-3">
                {showLimitError && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold animate-in fade-in slide-in-from-right-2 duration-300">
                    <AlertCircle size={14} />
                    Máximo 3 imágenes
                  </div>
                )}
                
                <button 
                  type="button"
                  title="Subir Imágenes"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-2.5 text-slate-400 hover:text-marca-primario transition-all rounded-xl hover:bg-white active:scale-90 border border-slate-100/50 shadow-sm",
                    imagenes.length >= 3 && "opacity-50 cursor-not-allowed grayscale"
                  )}
                  disabled={imagenes.length >= 3}
                >
                  <Camera size={21} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
              </div>
            </div>

            {/* Previsualización de Imágenes */}
            {imagenes.length > 0 && (
              <div className="flex items-center gap-3 shrink-0 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <div className="flex flex-col mr-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Imágenes</span>
                  <span className="text-[10px] font-bold text-slate-500">{imagenes.length}/3</span>
                </div>
                <div className="flex gap-2">
                  {imagenes.map((img) => (
                    <div key={img.id} className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md group transition-all hover:scale-105">
                      <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        type="button" 
                        onClick={() => removeImagen(img.id)} 
                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuración y Selectores en Grid Espacioso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
              
              {/* Área Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Área de Responsabilidad:</span>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-marca-primario/20 transition-all shadow-sm"
                >
                  {catalogos.areas.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Línea Select (si aplica) */}
              {tieneLineas ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Línea de Producto:</span>
                  <select
                    value={linea || ''}
                    onChange={(e) => setLinea(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-marca-primario/20 transition-all shadow-sm"
                  >
                    {catalogos.lineas.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="hidden md:block" />
              )}

              {/* Clasificación Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clasificación / Tipo:</span>
                <select
                  value={clasificacion}
                  onChange={(e) => setClasificacion(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-marca-primario/20 transition-all shadow-sm"
                >
                  <option value="">— Seleccionar —</option>
                  {catalogos.clasificaciones.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón de Envío Grande al final */}
            <div className="flex justify-end gap-3 shrink-0 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!descripcion.trim() || submitting}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer",
                  descripcion.trim() 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20" 
                    : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none"
                )}
              >
                {submitting ? (
                  <Icon name="progress_activity" size="16px" className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Registrar Entrada
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Overlay de bloqueo para juntas Programadas */}
      {estado === 'PROGRAMADA' && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-md border border-indigo-100">
            <Icon name="event" size="32px" />
          </div>
          <h3 className="fuente-titulos text-xl font-black text-slate-800 uppercase tracking-wider">Minuta Programada</h3>
          <p className="max-w-md text-sm text-slate-400 mt-2 font-medium">
            Esta junta aún no ha comenzado. Debes iniciar la junta para poder capturar acuerdos, tareas y subir imágenes.
          </p>
          <button
            onClick={onIniciar}
            disabled={iniciando}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-marca-primario hover:bg-marca-primario/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-marca-primario/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {iniciando ? (
              <Icon name="progress_activity" size="16px" className="animate-spin" />
            ) : (
              <Icon name="play_arrow" size="16px" />
            )}
            {iniciando ? 'Iniciando...' : 'Iniciar Junta Ahora'}
          </button>
        </div>
      )}
    </div>
  );
};
