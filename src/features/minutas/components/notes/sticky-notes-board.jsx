import { useState, useCallback } from 'react';
import { Icon } from '@/components/ui/z_index';
import { StickyNote } from './sticky-note';
import { cn } from '@/utils/cn';

/**
 * StickyNotesBoard — Panel de notas rápidas tipo post-it.
 *
 * Desktop: Panel lateral derecho fijo.
 * Mobile: Drawer deslizable desde abajo.
 *
 * Backed by NotaGeneral model (contenido, minutaId, creadoPorId).
 */
export const StickyNotesBoard = ({
  notas = [],
  minutaId,
  onCreateNota,
  onUpdateNota,
  onDeleteNota,
  isDrawer = false,
  onClose,
}) => {
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!newContent.trim() || creating) return;
    setCreating(true);
    try {
      await onCreateNota({ contenido: newContent.trim(), minutaId: Number(minutaId) });
      setNewContent('');
    } catch (_e) {
      console.warn('Error creating note:', _e);
    } finally {
      setCreating(false);
    }
  }, [newContent, creating, minutaId, onCreateNota]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-1.5">
          <Icon name="sticky_note_2" size="16px" className="text-amber-500" />
          <span className="text-xs font-bold text-slate-700">Notas de Junta</span>
          <span className="text-[10px] text-slate-400 font-mono">({notas.length})</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100">
            <Icon name="close" size="16px" className="text-slate-400" />
          </button>
        )}
      </div>

      {/* New note input */}
      <div className="px-3 py-2 border-b border-slate-100 shrink-0">
        <div className="flex gap-1.5">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Agregar nota..."
            rows={1}
            className="flex-1 resize-none rounded-lg px-2.5 py-1.5 text-[12px] bg-amber-50/50 border border-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-300/50 placeholder:text-slate-400"
            style={{ fontSize: '16px', minHeight: 32 }}
          />
          <button
            onClick={handleCreate}
            disabled={!newContent.trim() || creating}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90',
              newContent.trim() ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'
            )}
          >
            <Icon name={creating ? 'progress_activity' : 'add'} size="16px" className={cn(creating && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notas.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="note_add" size="32px" className="text-slate-200 mx-auto mb-2" />
            <p className="text-[11px] text-slate-400">Sin notas aún</p>
          </div>
        ) : (
          notas.map((nota, i) => (
            <StickyNote
              key={nota.id}
              nota={nota}
              colorIndex={i}
              onUpdate={onUpdateNota}
              onDelete={onDeleteNota}
            />
          ))
        )}
      </div>
    </div>
  );

  // Drawer mode (mobile)
  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-100 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Desktop panel
  return (
    <aside className="h-full bg-white/60 backdrop-blur-sm border-l border-slate-200/60">
      {content}
    </aside>
  );
};
