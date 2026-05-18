import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { MinutaContextPanel } from '../components/context/minuta-context-panel';
import { QuickComposer } from '../components/composer/quick-composer';
import { TimelineFilters } from '../components/timeline/timeline-filters';
import { EntryFeed } from '../components/timeline/entry-feed';
import { StickyNotesBoard } from '../components/notes/sticky-notes-board';
import { ReviewDraftsModal } from '../components/review-drafts-modal';
import { OrganizeDrawer } from '../components/organization/organize-drawer';
  
/**
 * MinutaDetailDesktopView — Vista especializada para estaciones de trabajo.
 * Muestra el panel de notas persistente y el composer como barra superior.
 */
export const MinutaDetailDesktopView = ({
  minuta,
  resumen,
  filteredEntries,
  loadingTareas,
  filterClasif,
  setFilterClasif,
  handleCapture,
  draftEntries,
  draftNotes,
  addDraftNote,
  updateDraftNote,
  removeDraftNote,
  updateDraftEntry,
  removeDraftEntry,
  setOrganizeEntry,
  organizeEntry,
  handleOrganizeSave,
  setShowReviewModal,
  showReviewModal,
  handleFinalSubmit,
  isSubmittingFinal,
  showNotes,
  setShowNotes,
  handleUpdateSavedEntry,
  handleCreateEntryNote,
  handleUpdateEntryNote,
  handleDeleteEntryNote,
  handleAddEntryImage,
  handleDeleteEntryImage,
  changeTareaStatus,
  users
}) => {
  return (
    <div className="flex h-full w-full flex-col bg-slate-50/50 relative">
      <MinutaContextPanel 
        minuta={minuta} 
        resumen={resumen} 
        entries={filteredEntries}
        onFilterByStatus={(status) => {
          // Map executive summary status to timeline filters
          if (status === 'COMPLETADAS') setFilterClasif('TODAS');
          else if (status === 'EN_PROGRESO') setFilterClasif('TODAS');
          else if (status === 'ATRASADAS') setFilterClasif('TODAS');
          else if (status === 'PENDIENTE') setFilterClasif('TODAS');
          else setFilterClasif('TODAS');
        }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Workspace Principal */}
        <main className="flex flex-1 flex-col min-w-0 bg-transparent">
          <QuickComposer
            minutaId={minuta.id}
            lineaDefault={minuta.lineaDefault}
            onSubmit={handleCapture}
            submitting={loadingTareas}
            isDesktop={true}
          />

          <div className="flex-1 overflow-y-auto px-10 py-1 scrollbar-thin">
            <div className="mx-auto max-w-[1500px] flex flex-col gap-8 pb-32">
              <div className="flex items-center gap-4 bg-white/40 p-2 rounded-2xl backdrop-blur-md border border-white/60 sticky top-0 z-20">
                <div className="flex-1 overflow-hidden">
                  <TimelineFilters active={filterClasif} onChange={setFilterClasif} />
                </div>
              </div>

              <EntryFeed
                entries={filteredEntries}
                loading={loadingTareas}
                meetingMode={true}
                filterActive={filterClasif}
                onOrganize={setOrganizeEntry}
                onRemoveDraft={removeDraftEntry}
                onUpdateDraft={updateDraftEntry}
                onUpdateSaved={handleUpdateSavedEntry}
                onCreateNote={handleCreateEntryNote}
                onUpdateNote={handleUpdateEntryNote}
                onDeleteNote={handleDeleteEntryNote}
                onAddImage={handleAddEntryImage}
                onDeleteImage={handleDeleteEntryImage}
                onChangeStatus={changeTareaStatus}
                users={users}
              />
            </div>
          </div>
        </main>

        {/* Notas Post-it como overlay para no cambiar el layout del workspace */}
        {showNotes && (
          <>
            <div
              className="absolute inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px] animate-in fade-in duration-200"
              onClick={() => setShowNotes(false)}
            />
            <div className="absolute right-5 top-5 bottom-5 z-50 w-[min(430px,calc(100%-2.5rem))] overflow-hidden rounded-4xl border border-amber-100 bg-white shadow-2xl shadow-slate-900/20 animate-in slide-in-from-right-4 fade-in duration-300">
              <StickyNotesBoard
                notas={[...draftNotes, ...(minuta.notasGenerales || [])]}
                minutaId={minuta.id}
                onCreateNota={(data) => addDraftNote(data.contenido)}
                onUpdateNota={updateDraftNote}
                onDeleteNota={removeDraftNote}
                onClose={() => setShowNotes(false)}
                isDrawer={false}
              />
            </div>
          </>
        )}

        {/* Botones Flotantes */}
        <div className="fixed bottom-10 right-10 z-30 flex gap-4">
          {draftEntries.length > 0 && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex h-16 px-6 items-center gap-3 rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-600/40 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all group"
            >
              <Icon name="cloud_upload" size="28px" className="group-hover:animate-bounce" />
              <span className="text-xs font-black uppercase tracking-widest pr-2">Guardar</span>
            </button>
          )}

          {!showNotes && (
            <button
              onClick={() => setShowNotes(true)}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-2xl shadow-amber-500/40 hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all"
            >
              <Icon name="sticky_note_2" size="32px" />
            </button>
          )}
        </div>
      </div>

      <ReviewDraftsModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleFinalSubmit}
        entries={draftEntries}
        notesCount={draftNotes.length}
        submitting={isSubmittingFinal}
      />

      {organizeEntry && (
        <OrganizeDrawer
          key={organizeEntry.tempId || organizeEntry.id}
          isOpen={Boolean(organizeEntry)}
          onClose={() => setOrganizeEntry(null)}
          entry={organizeEntry}
          onSave={handleOrganizeSave}
        />
      )}
    </div>
  );
};