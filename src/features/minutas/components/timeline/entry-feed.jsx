import { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { getTemporalGroup } from '../../constants';
import { EntryCard } from './entry-card';

/**
 * EntryFeed — Feed de alto rendimiento con grid adaptativo.
 * Inicia en una columna y expande a dos cuando el espacio en escritorio lo permite.
 */
export const EntryFeed = ({
  entries = [],
  loading = false,
  meetingMode = false,
  filterActive = 'TODAS',
  onOrganize,
  onRemoveDraft,
  onUpdateDraft,
}) => {
  const grouped = useMemo(() => {
    const groups = [];
    let currentGroup = null;
    
    for (const entry of entries) {
      const label = getTemporalGroup(entry.createdAt);
      if (label !== currentGroup) {
        groups.push({ type: 'divider', label, key: `div-${label}-${entry.id || entry.tempId}` });
        currentGroup = label;
      }
      groups.push({ type: 'entry', data: entry, key: `ent-${entry.id || entry.tempId}` });
    }
    return groups;
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

  if (grouped.length === 0) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6 pb-40 px-1">
      {grouped.map((item) => {
        if (item.type === 'divider') {
          return (
            <div key={item.key} className="col-span-full flex items-center gap-6 py-6 first:pt-0">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 bg-transparent px-4">
                {item.label}
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
          );
        }
        
        return (
          <div key={item.key} className="animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
            <EntryCard
              entry={item.data}
              onOrganize={onOrganize}
              meetingMode={meetingMode}
              onRemove={onRemoveDraft}
              onUpdate={onUpdateDraft}
            />
          </div>
        );
      })}
    </div>
  );
};
