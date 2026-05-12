import { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { getTemporalGroup } from '../../constants';
import { EntryCard } from './entry-card';
// import { cn } from '@/utils/cn';

/**
 * EntryFeed — Feed cronológico con agrupación temporal.
 * Agrupa entradas por HOY / AYER / ESTA SEMANA / SEMANA PASADA.
 */
export const EntryFeed = ({
  entries = [],
  loading = false,
  meetingMode = false,
  filterActive = 'TODAS',
  onOrganize,
}) => {
  const grouped = useMemo(() => {
    const groups = [];
    let currentGroup = null;
    for (const entry of entries) {
      const label = getTemporalGroup(entry.createdAt);
      if (label !== currentGroup) {
        groups.push({ type: 'divider', label, key: `d-${label}-${entry.id}` });
        currentGroup = label;
      }
      groups.push({ type: 'entry', data: entry, key: `e-${entry.id}` });
    }
    return groups;
  }, [entries]);

  if (loading) {
    return (
      <div className="space-y-2 px-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg h-16 animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon name="edit_note" className="text-slate-200 mb-3" size="48px" />
        <p className="text-sm text-slate-500 font-medium">
          {filterActive !== 'TODAS'
            ? 'No hay entradas con este filtro.'
            : 'Sin entradas aún.'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Usa el composer para capturar la primera.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-3 items-start px-1">
      {grouped.map((item) => {
        if (item.type === 'divider') {
          return (
            <div key={item.key} className="col-span-full flex items-center gap-2 py-2 mt-1 first:mt-0 px-1">
              <div className="h-px bg-slate-200/80 flex-1" />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 shrink-0">
                {item.label}
              </span>
              <div className="h-px bg-slate-200/80 flex-1" />
            </div>
          );
        }
        return (
          <EntryCard
            key={item.key}
            entry={item.data}
            onOrganize={onOrganize}
            meetingMode={meetingMode}
          />
        );
      })}
    </div>
  );
};
