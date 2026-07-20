import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';

/**
 * StickyNote — Nota rápida visual tipo post-it.
 * Estilo Post-it: fondo amarillo suave, tipografía manuscrita o legible, sin bordes rígidos.
 */
export const StickyNote = ({
  nota,
  onUpdate,
  onDelete,
}) => {
  const [content, setContent] = useState(nota.contenido || '');
  const textareaRef = useRef(null);

  // Sincronizar estado local si la nota cambia externamente
  useEffect(() => {
    setContent(nota.contenido || '');
  }, [nota.contenido]);

  // Auto-resize on mount and content change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleBlur = () => {
    if (content.trim() !== nota.contenido) {
      onUpdate?.(nota.id, content.trim());
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <div
      className={cn(
        'group relative rounded-2xl p-5 transition-all duration-300 shadow-lg shadow-amber-500/5 border-l-4 border-amber-400 bg-[#fffbeb] hover:shadow-xl hover:scale-[1.02]',
      )}
      style={{ minHeight: 120 }}
    >
      {/* Botón de Eliminación (X) */}
      {onDelete && (
        <button
          onClick={() => onDelete(nota.id)}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white z-10"
        >
          <Icon name="close" size="16px" />
        </button>
      )}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Escribe algo..."
        className="w-full bg-transparent resize-none text-[15px] text-amber-900 leading-snug focus:outline-none p-0 border-none font-medium placeholder:text-amber-200 overflow-hidden"
      />

      <div className="mt-4 flex items-center justify-between opacity-30 group-hover:opacity-60 transition-opacity">
        <Icon name="push_pin" size="14px" className="text-amber-600 rotate-12" />
        <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest">
           {new Date(nota.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
