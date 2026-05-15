import { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { EntryCard } from './entry-card';

/**
 * EntryFeed — Feed de entradas separadas por estado de guardado.
 * Prioriza borradores pendientes para evitar confundirlos con entradas persistidas.
 */
export const EntryFeed = ({
  entries = [],
  loading = false,
  meetingMode = false,
  filterActive = 'TODAS',
  onOrganize,
  onRemoveDraft,
  onUpdateDraft,
  onUpdateSaved,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onAddImage,
  onDeleteImage,
  onChangeStatus,
  users
}) => {
  const sections = useMemo(() => {
    const drafts = [];
    const saved = [];

    for (const entry of entries) {
      if (entry.tempId) drafts.push(entry);
      else saved.push(entry);
    }

    return [
      {
        key: 'drafts',
        label: 'Pendientes por guardar',
        tone: 'draft',
        entries: drafts,
      },
      {
        key: 'saved',
        label: 'Guardadas',
        tone: 'saved',
        entries: saved,
      },
    ].filter((section) => section.entries.length > 0);
  }, [entries]);

  if (loading && entries.length === 0) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-full bg-slate-100 rounded-3xl animate-pulse border border-slate-200" />
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-white rounded-4xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
          <Icon name="auto_stories" className="text-slate-200" size="48px" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Historial vacío</h3>
        <p className="text-sm text-slate-400 max-w-xs mt-2 font-medium">
          {filterActive !== 'TODAS'
            ? `No hay registros con el filtro "${filterActive}".`
            : 'Captura la primera entrada para comenzar el seguimiento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-40 px-1">
      {sections.map((section) => (
        <section key={section.key} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <div
              className={
                section.tone === 'draft'
                  ? 'rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700 shadow-sm'
                  : 'rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 shadow-sm'
              }
            >
              {section.label} ({section.entries.length})
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,34rem),1fr))] gap-4 md:gap-6">
            {section.entries.map((entry) => (
              <div key={`ent-${entry.id || entry.tempId}`} className="animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
                <EntryCard
                  entry={entry}
                  onOrganize={onOrganize}
                  meetingMode={meetingMode}
                  onRemove={onRemoveDraft}
                  onUpdate={onUpdateDraft}
                  onUpdateSaved={onUpdateSaved}
                  onCreateNote={onCreateNote}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                  onAddImage={onAddImage}
                  onDeleteImage={onDeleteImage}
                  onChangeStatus={onChangeStatus}
                  users={users}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
