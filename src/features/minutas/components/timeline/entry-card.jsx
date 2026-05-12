import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import {
  CLASIFICACION_MAP,
  AREA_MAP,
  LINEA_MAP,
  formatTime,
} from '../../constants';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Settings2
} from 'lucide-react';
import { LineIconSelector } from '../icons/line-icons';

/**
 * ImageViewer — Modal premium para ver imágenes con navegación y zoom.
 * SE USA PORTAL PARA RENDERIZAR FUERA DE LA JERARQUÍA DEL DOM (Encima de Sidebar).
 */
const ImageViewer = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Bloquear el scroll del body cuando el visor está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!images || images.length === 0) return null;
  const currentImg = images[currentIndex];

  // El portal renderiza esto al final del <body> para que nada (sidebar, etc) quede por encima
  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
      
      {/* Botón de Cerrar con z-index superior */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-600 transition-all z-[100001] shadow-2xl"
      >
        <X size={36} />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-8 md:p-12">
        {images.length > 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
            className="absolute left-8 w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-md"
          >
            <ChevronLeft size={48} />
          </button>
        )}

        <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center group pointer-events-auto">
           <img 
            src={currentImg.preview || currentImg.url} 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 select-none" 
            alt="Vista ampliada"
          />
        </div>

        {images.length > 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
            className="absolute right-8 w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-md"
          >
            <ChevronRight size={48} />
          </button>
        )}
      </div>

      {/* Indicadores de página */}
      <div className="absolute bottom-10 flex gap-3 z-[100001]">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300", 
              i === currentIndex ? "bg-white w-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-white/20 w-2.5 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

/**
 * EntryCard — Versión REFINADA (Resolviendo problemas de espacio).
 */
export const EntryCard = ({ 
  entry, 
  onOrganize, 
  onRemove,
  onUpdate
}) => {
  const isDraft = Boolean(entry.tempId);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(entry.descripcion);
  const [viewerIndex, setViewerIndex] = useState(null);
  const textareaRef = useRef(null);

  const clasif = CLASIFICACION_MAP[entry.clasificacion] || null;
  const lineaLabel = LINEA_MAP[entry.linea]?.label || entry.linea || 'N/A';
  
  const allImages = [
    ...(entry._localImagenes || []),
    ...(entry.imagenes || [])
  ];

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() !== entry.descripcion && onUpdate) {
      onUpdate(entry.tempId, { descripcion: editValue.trim() });
    }
  };

  const handleUpdateField = (field, value) => {
    if (isDraft && onUpdate) {
      onUpdate(entry.tempId, { [field]: value });
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col md:flex-row bg-white transition-all duration-300 rounded-[1.5rem] border border-slate-100 overflow-hidden',
          isDraft ? 'shadow-lg ring-1 ring-emerald-500/10' : 'shadow-sm hover:shadow-md',
          isEditing && 'ring-2 ring-marca-primario/10'
        )}
      >
        {/* LADO IZQUIERDO: Imágenes */}
        {allImages.length > 0 && (
          <div className="relative w-full md:w-36 h-36 md:h-auto shrink-0 bg-slate-50/30 flex items-center justify-center p-3">
            <div className="relative w-full h-full cursor-pointer" onClick={() => setViewerIndex(0)}>
              {allImages.slice(0, 2).reverse().map((img, idx) => {
                const isTop = idx === 1 || allImages.length === 1;
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "absolute inset-0 bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 transition-all duration-500",
                      !isTop && "translate-x-2 -translate-y-2 opacity-40 scale-95"
                    )}
                  >
                    <img src={img.preview || img.url} className="w-full h-full object-cover" />
                  </div>
                );
              })}
              {allImages.length > 1 && (
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded-md shadow-lg z-20">
                  +{allImages.length - 1}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 p-3 md:p-4 flex flex-col min-w-0">
          
          {/* Header Row: Linea Icon + Info + Clasif */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 shadow-sm text-slate-900">
                <LineIconSelector type={entry.linea} size={20} />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter truncate">
                    {AREA_MAP[entry.area] || entry.area}
                  </span>
                  <span className="text-slate-200 mx-0.5">/</span>
                  <span className="text-[9px] font-bold text-slate-500 truncate">
                    {lineaLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                   <span>{formatTime(entry.createdAt)}</span>
                   <span className="opacity-30">·</span>
                   <span>{new Date(entry.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              {isDraft ? (
                <>
                  <select 
                    value={entry.clasificacion} 
                    onChange={(e) => handleUpdateField('clasificacion', e.target.value)}
                    className="text-[9px] font-black uppercase tracking-tighter bg-slate-50 border border-slate-100 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-slate-100 transition-all cursor-pointer outline-none min-w-[90px]"
                    style={{ color: clasif?.color }}
                  >
                    {Object.entries(CLASIFICACION_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(entry.tempId); }}
                    className="w-7 h-7 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-md flex items-center justify-center transition-all active:scale-90"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                clasif && (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm"
                    style={{ backgroundColor: `${clasif.color}10`, color: clasif.color, border: `1px solid ${clasif.color}20` }}
                  >
                    <Icon name={clasif.icon} size="12px" />
                    {clasif.label}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Body: Texto */}
          <div className="flex-1 mt-1">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={handleBlur}
                className="w-full text-sm text-slate-900 leading-normal bg-slate-50 rounded-lg p-2 border border-slate-100 focus:ring-0 font-bold placeholder:text-slate-200 resize-none overflow-hidden"
                rows={1}
              />
            ) : (
              <h3 
                className={cn(
                  "text-[15px] text-slate-800 leading-relaxed font-bold transition-all",
                  isDraft ? "cursor-text bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200 hover:border-slate-300" : "px-1"
                )}
                onClick={() => isDraft && setIsEditing(true)}
              >
                {entry.descripcion || "Sin descripción..."}
              </h3>
            )}
          </div>

          {/* Footer */}
          {!isDraft && (
             <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); onOrganize(entry); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95"
                >
                  <Settings2 size={12} /> 
                  Organizar
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Modal de Visor */}
      {viewerIndex !== null && (
        <ImageViewer 
          images={allImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerIndex(null)} 
        />
      )}
    </>
  );
};
