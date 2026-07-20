import { useState, useCallback } from 'react';
import { Icon } from '@/components/ui/icon';
import { StickyNote } from './sticky-note';
import { cn } from '@/utils/cn';

/**
 * StickyNotesBoard — Panel de notas rápidas tipo post-it responsivo.
 * Refactorizado para comportarse como Aside en Desktop y Overlay/Grid en Mobile.
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
    <div className="flex flex-col h-full bg-[#fefce8]/40 backdrop-blur-xl">
      {/* Header Visual */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-amber-100/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Icon name="sticky_note_2" size="24px" className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-amber-900 tracking-tight">Notas de Junta</span>
            <span className="text-[10px] text-amber-600/60 font-black uppercase tracking-[0.2em]">{notas.length} registradas</span>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-amber-100/50 transition-colors active:scale-90"
          >
            <Icon name="close" size="24px" className="text-amber-400" />
          </button>
        )}
      </div>

      {/* Input de Nueva Nota: Más limpio */}
      <div className="px-6 py-6 border-b border-amber-100/20 bg-amber-50/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nueva nota..."
              rows={1}
              className="w-full resize-none rounded-2xl px-6 py-4 text-[15px] bg-white border border-amber-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/5 transition-all placeholder:text-amber-200 shadow-sm font-medium"
              style={{ minHeight: 56 }}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!newContent.trim() || creating}
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl',
              newContent.trim() 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-slate-100 text-slate-300 shadow-none opacity-50'
            )}
          >
            {creating ? (
              <Icon name="progress_activity" size="20px" className="animate-spin" />
            ) : (
              <Icon name="add" size="28px" />
            )}
          </button>
        </div>
      </div>

      {/* Listado de Notas (Post-its) */}
      <div className={cn(
        "flex-1 overflow-y-auto p-6 scrollbar-thin",
        isDrawer ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"
      )}>
        {notas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-20 grayscale">
            <Icon name="post_add" size="64px" className="text-amber-300 mb-4" />
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">El tablero está listo</p>
          </div>
        ) : (
          [...notas].reverse().map((nota, i) => (
            <div key={nota.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <StickyNote
                nota={nota}
                onUpdate={onUpdateNota}
                onDelete={onDeleteNota}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Renderizado como Drawer (Mobile)
  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-[120] flex items-end justify-center animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full rounded-t-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-center pt-3 pb-1 shrink-0 bg-white">
            <div className="w-12 h-1.5 rounded-full bg-slate-200" />
          </div>
          <div className="flex-1 overflow-hidden">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Renderizado como Aside (Desktop)
  return (
    <aside className="h-full flex flex-col overflow-hidden">
      {content}
    </aside>
  );
};
