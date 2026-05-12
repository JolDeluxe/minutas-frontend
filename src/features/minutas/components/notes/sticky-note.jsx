import { useState, useRef } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const COLORS = [
  { bg: 'bg-amber-50', border: 'border-amber-200/60', shadow: 'shadow-amber-100/40' },
  { bg: 'bg-blue-50',  border: 'border-blue-200/60',  shadow: 'shadow-blue-100/40' },
  { bg: 'bg-rose-50',  border: 'border-rose-200/60',  shadow: 'shadow-rose-100/40' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200/60', shadow: 'shadow-emerald-100/40' },
  { bg: 'bg-violet-50', border: 'border-violet-200/60', shadow: 'shadow-violet-100/40' },
];

/**
 * StickyNote — Nota rápida visual tipo post-it.
 *
 * NOT a chat. NOT a comment. NOT a thread.
 * Represents: ideas rápidas, recordatorios, contexto visual, notas de junta.
 *
 * Editable inline, lightweight, persistent.
 */
export const StickyNote = ({
  nota,
  colorIndex = 0,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(nota.contenido || '');
  const textRef = useRef(null);

  const color = COLORS[colorIndex % COLORS.length];

  const handleSave = () => {
    setEditing(false);
    if (content.trim() !== nota.contenido) {
      onUpdate?.(nota.id, content.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setContent(nota.contenido || '');
      setEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg p-3 border transition-all group relative',
        color.bg, color.border,
        'hover:shadow-md',
        editing && 'ring-1 ring-slate-300 shadow-md'
      )}
      style={{ minHeight: 72 }}
    >
      {/* Content */}
      {editing ? (
        <textarea
          ref={textRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className={cn(
            'w-full bg-transparent resize-none text-[12px] text-slate-700 leading-relaxed focus:outline-none',
            'min-h-[48px]'
          )}
          style={{ fontSize: '16px' }}
        />
      ) : (
        <p
          className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap cursor-text min-h-[32px]"
          onClick={() => setEditing(true)}
        >
          {nota.contenido || 'Nota vacía...'}
        </p>
      )}

      {/* Timestamp */}
      <p className="text-[9px] text-slate-400 mt-2 font-mono">
        {new Date(nota.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Delete button — visible on hover */}
      {onDelete && (
        <button
          onClick={() => onDelete(nota.id)}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <Icon name="close" size="12px" className="text-slate-400 hover:text-red-500" />
        </button>
      )}
    </div>
  );
};
