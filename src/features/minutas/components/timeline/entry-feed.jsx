import { useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { EntryCard } from './entry-card';
import { EntryTable } from './entry-table';

export const EntryFeed = ({
  entries = [],
  loading = false,
  meetingMode = false,
  filterActive = 'TODAS',
  viewMode = 'cards',
  departamento = 'DISENO',
  onOrganize,
  onRemove,
  onUpdateDraft,
  onUpdateSaved,
  onEdit,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onAddImage,
  onDeleteImage,
  onChangeStatus,
  users,
  onDownloadPdf,
  isGeneratingPdf,
  onViewDetail
}) => {
  const sections = useMemo(() => {
    const drafts = [];
    const internal = [];
    const external = [];

    for (const entry of entries) {
      if (entry.tipo === 'POLITICA' || entry.tipo === 'RECORDATORIO' || entry.tipo === 'DESCARTADA' || entry.estado === 'DESCARTADA') continue;
      
      if (entry.tempId) {
        drafts.push(entry);
      } else {
        const isExternal = (departamento === 'DISENO' && entry.area !== 'DISENO') || 
                          (departamento === 'MARKETING' && entry.area !== 'MARKETING');
        
        if (isExternal) external.push(entry);
        else internal.push(entry);
      }
    }

    return [
      { key: 'drafts', label: 'Borradores en vivo', tone: 'draft', entries: drafts, icon: 'edit_note' },
      { key: 'internal', label: 'Seguimiento Interno', tone: 'saved', entries: internal, icon: 'assignment' },
      { key: 'external', label: 'Tareas Externas (Otras Áreas)', tone: 'external', entries: external, icon: 'output' },
    ].filter((section) => section.entries.length > 0);
  }, [entries, departamento]);

  if (loading && entries.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 w-full bg-slate-100 rounded-3xl animate-pulse border border-slate-200" />
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-white rounded-4xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
          <Icon name="auto_stories" className="text-slate-200" size="48px" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Historial vacío</h3>
        <p className="text-sm text-slate-400 max-w-xs mt-2 font-medium">
          {filterActive !== 'TODAS'
            ? `No hay registros operativos con el filtro "${filterActive}".`
            : 'Captura la primera entrada para comenzar el seguimiento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 px-1">
      {sections.map((section) => (
        <section key={section.key} className="flex flex-col gap-5">
          <div className="flex items-center gap-4 px-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg shadow-sm border",
              section.tone === 'draft' ? "bg-emerald-500 border-emerald-400 text-white" : 
              section.tone === 'external' ? "bg-marca-primario border-marca-acento text-white" : 
              "bg-slate-800 border-slate-700 text-white"
            )}>
              <Icon name={section.icon} size="18px" />
            </div>
            <h3 className={cn(
              "text-[10px] font-black uppercase tracking-[0.25em]",
              section.tone === 'draft' ? "text-emerald-700" : 
              section.tone === 'external' ? "text-marca-primario" : 
              "text-slate-500"
            )}>
              {section.label} ({section.entries.length})
            </h3>
            <div className="h-px flex-1 bg-slate-200/60" />
          </div>

          <div className={cn(
            "grid gap-4 md:gap-6",
            viewMode === 'table' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {viewMode === 'table' ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
                <EntryTable
                  entries={section.entries}
                  departamento={departamento}
                  onOrganize={onOrganize}
                  onRemove={onRemove}
                  onUpdateDraft={onUpdateDraft}
                  onUpdateSaved={onUpdateSaved}
                  onEdit={onEdit}
                  onCreateNote={onCreateNote}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                  onChangeStatus={onChangeStatus}
                  users={users}
                  onDownloadPdf={onDownloadPdf}
                  isGeneratingPdf={isGeneratingPdf}
                  onViewDetail={onViewDetail}
                />
              </div>
            ) : (
              section.entries.map((entry) => (
                <div key={`ent-${entry.id || entry.tempId}`} className="animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out h-full">
                  <EntryCard
                    entry={entry}
                    departamento={departamento}
                    onOrganize={onOrganize}
                    meetingMode={meetingMode}
                    onRemove={onRemove}
                    onUpdate={onUpdateDraft}
                    onEdit={onEdit}
                    onCreateNote={onCreateNote}
                    onUpdateNote={onUpdateNote}
                    onDeleteNote={onDeleteNote}
                    onAddImage={onAddImage}
                    onDeleteImage={onDeleteImage}
                    onChangeStatus={onChangeStatus}
                    users={users}
                    onDownloadPdf={onDownloadPdf}
                    isGeneratingPdf={isGeneratingPdf}
                    onViewDetail={onViewDetail}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
};
