import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import {
  CLASIFICACION_MAP,
  AREA_MAP,
  LINEA_MAP,
  formatTime,
} from '../../constants';
import { useState, useRef, useEffect } from 'react';

/**
 * EntryCard — Tarjeta de Registro Premium optimizada para captura.
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
  const textareaRef = useRef(null);

  const clasif = CLASIFICACION_MAP[entry.clasificacion] || null;

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      // Auto-resize textarea
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
    <div
      className={cn(
        'group relative flex flex-col bg-white/70 backdrop-blur-md transition-all duration-300 rounded-4xl border border-slate-100 overflow-hidden',
        isDraft ? 'shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]' : 'shadow-sm opacity-80 grayscale-[0.5]',
        isEditing && 'ring-2 ring-marca-primario/20 border-marca-primario/20 bg-white'
      )}
    >
      <div className="p-6 md:p-8">
        {/* Header de Contexto: Flexbox robusto para evitar colisiones */}
        <div className="flex items-center justify-between gap-4 mb-5">
          
          {/* Lado Izquierdo: Info de Entrada */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Entrada</span>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="text-[10px] font-bold text-slate-400">{formatTime(entry.createdAt)}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
               <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                {AREA_MAP[entry.area] || entry.area}
               </span>
               <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                {LINEA_MAP[entry.linea] || 'N/A'}
               </span>
            </div>
          </div>
          
          {/* Lado Derecho: Controles de Clasificación y Borrado */}
          <div className="flex items-center gap-2 shrink-0">
            {isDraft ? (
              <>
                <select 
                  value={entry.clasificacion} 
                  onChange={(e) => handleUpdateField('clasificacion', e.target.value)}
                  className="text-[10px] font-black uppercase tracking-widest bg-slate-100/50 border-none rounded-xl px-3 py-2 focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer"
                  style={{ color: clasif?.color }}
                >
                  {Object.entries(CLASIFICACION_MAP).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>

                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(entry.tempId); }}
                  className="w-10 h-10 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-all active:scale-90"
                  title="Eliminar borrador"
                >
                  <Icon name="close" size="20px" />
                </button>
              </>
            ) : (
              clasif && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  style={{ backgroundColor: `${clasif.color}15`, color: clasif.color }}
                >
                  <Icon name={clasif.icon} size="14px" />
                  {clasif.label}
                </span>
              )
            )}
          </div>
        </div>

        {/* Contenido Editable */}
        <div className="relative">
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
              className="w-full text-xl text-slate-900 leading-snug bg-transparent border-none focus:ring-0 p-0 font-bold placeholder:text-slate-200 resize-none overflow-hidden"
              rows={1}
            />
          ) : (
            <h3 
              className={cn(
                "text-xl text-slate-800 leading-snug font-bold transition-colors cursor-text hover:bg-slate-50/50 rounded-xl p-1 -m-1",
                !isDraft && "cursor-default"
              )}
              onClick={() => isDraft && setIsEditing(true)}
            >
              {entry.descripcion || "Sin descripción..."}
            </h3>
          )}
        </div>

        {/* Imágenes */}
        {(entry._localImagenes?.length > 0 || entry.imagenes?.length > 0) && (
          <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-none">
            {entry._localImagenes?.map((img, i) => (
              <div key={`l-${i}`} className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100 shrink-0">
                <img src={img.preview} className="w-full h-full object-cover" />
              </div>
            ))}
            {entry.imagenes?.map((img, i) => (
              <div key={`d-${i}`} className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100 shrink-0">
                <img src={img.url} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Footer con Acción de Organización */}
        {!isDraft && (
           <div className="mt-6 flex justify-end">
              <button
                onClick={() => onOrganize(entry)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-marca-primario hover:bg-marca-primario/5 transition-all"
              >
                <Icon name="tune" size="16px" /> 
                Formalizar
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
