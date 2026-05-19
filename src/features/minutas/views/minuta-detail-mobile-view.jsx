import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { MinutaContextPanel } from '../components/context/minuta-context-panel';
import { TimelineFilters } from '../components/timeline/timeline-filters';
import { EntryFeed } from '../components/timeline/entry-feed';
import { StickyNotesBoard } from '../components/notes/sticky-notes-board';
import { MobileQuickComposer } from '../components/composer/mobile-quick-composer';
import { ReviewDraftsModal } from '../components/review-drafts-modal';
import { OrganizeDrawer } from '../components/organization/organize-drawer';

/**
 * MinutaDetailMobileView — Vista especializada para dispositivos móviles.
 * Ajustada para que las notas salgan de lado (Drawer) sin tapar el Header ni el BottomNav.
 */
export const MinutaDetailMobileView = ({
  minuta,
  resumen,
  filteredEntries,
  politicasAcordadas = [],
  recordatoriosGenerales = [],
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
  users,
  handleIniciar,
  handleCancelar,
  iniciando,
  cancelando
}) => {
  return (
    <div className="flex h-full w-full flex-col bg-slate-50/50 relative overflow-hidden">
      
      {/* 1. Header de Contexto */}
      <div className="shrink-0">
        <MinutaContextPanel 
          minuta={minuta} 
          resumen={resumen} 
          entries={filteredEntries} 
          onIniciar={handleIniciar}
          onCancelar={handleCancelar}
          iniciando={iniciando}
          cancelando={cancelando}
        />
      </div>

      {/* 2. Área de Feed */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar px-4 pt-4 pb-32">
        
        {/* Políticas y Lineamientos Acordados (Mobile card format) */}
        {politicasAcordadas.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 shadow-xl text-white mb-6">
            <h3 className="fuente-titulos text-sm font-black tracking-wide flex items-center gap-1.5 mb-3">
              <span className="material-symbols-rounded text-brand text-xl">gavel</span>
              Políticas y Lineamientos Acordados
            </h3>
            <div className="space-y-3">
              {politicasAcordadas.map((p, idx) => (
                <div 
                  key={p.id || idx} 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between"
                >
                  <p className="text-white/90 text-xs font-medium leading-relaxed italic">
                    "{p.descripcion}"
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] text-white/40 font-mono">
                    <span>Área: {p.area}</span>
                    {p.linea && <span>Línea: {p.linea}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acuerdos y Recordatorios Generales (Mobile card format) */}
        {recordatoriosGenerales.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 rounded-2xl p-4 shadow-md mb-6">
            <h3 className="fuente-titulos text-sm font-extrabold text-slate-800 tracking-wide flex items-center gap-1.5 mb-3">
              <span className="material-symbols-rounded text-amber-600 text-xl">push_pin</span>
              Acuerdos y Recordatorios
            </h3>
            <div className="space-y-3">
              {recordatoriosGenerales.map((r, idx) => (
                <div 
                  key={r.id || idx} 
                  className="bg-white border border-amber-100 rounded-xl p-3 flex flex-col justify-between"
                >
                  <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                    "{r.descripcion}"
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[9px] text-slate-500 font-mono">
                    <span>Área: {r.area}</span>
                    {r.linea && <span>Línea: {r.linea}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 sticky top-0 z-20 mb-6">
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
      </main>

      {/* 3. Panel Lateral de Notas (De Lado y sin tapar layout) */}
      {showNotes && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 z-80" onClick={() => setShowNotes(false)} />
          <div 
            className="fixed top-16 bottom-20 right-0 w-[85%] max-w-sm bg-white z-90 shadow-2xl animate-in slide-in-from-right duration-300 rounded-l-3xl overflow-hidden flex flex-col border-l border-slate-100"
          >
            <StickyNotesBoard
              notas={[...draftNotes, ...(minuta.notasGenerales || [])]}
              minutaId={minuta.id}
              onCreateNota={(data) => addDraftNote(data.contenido)}
              onUpdateNota={updateDraftNote}
              onDeleteNota={removeDraftNote}
              onClose={() => setShowNotes(false)}
              isDrawer={false} // IMPORTANTE: false para que NO se renderice como BottomSheet interno
            />
          </div>
        </>
      )}

      {/* 4. Botones Flotantes */}
      <div className="fixed bottom-48 right-6 z-30 flex flex-col gap-4">
        {draftEntries.length > 0 && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xl active:scale-90 transition-all relative"
          >
            <Icon name="cloud_upload" size="32px" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {draftEntries.length}
            </div>
          </button>
        )}

        <button
          onClick={() => setShowNotes(true)}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-2xl active:scale-90 transition-all"
        >
          <Icon name="sticky_note_2" size="32px" />
        </button>
      </div>

      {/* 5. Bottom Sheet Composer */}
      <MobileQuickComposer
        minutaId={minuta.id}
        lineaDefault={minuta.lineaDefault}
        onSubmit={handleCapture}
        submitting={loadingTareas}
      />

      {/* 6. Modales */}
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