import React, { useState } from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { MinutaContextPanel } from '../components/context/minuta-context-panel';
import { MinutaExecutiveSummary } from '../components/minuta-executive-summary';
import { MinutaJuntaComparison } from '../components/minuta-junta-comparison';
import { EntryFiltersBar } from '../components/timeline/entry-filters-bar';
import { EntryFeed } from '../components/timeline/entry-feed';
import { StickyNotesBoard } from '../components/notes/sticky-notes-board';
import { MobileQuickComposer } from '../components/composer/mobile-quick-composer';
import { ReviewDraftsModal } from '../components/review-drafts-modal';
import { EntryFormModal } from '../components/timeline/entry-form-modal';
import { OrganizeDrawer } from '../components/organization/organize-drawer';
import { Link } from 'react-router-dom';
import { canAccessModule } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { AREA_MAP } from '../constants';
import { PanelDetalleTarea } from '../../tareas/components/comun/panel-detalle-tarea';

export const MinutaDetailMobileView = ({
  minuta,
  resumen,
  allEntries,
  filteredEntries,
  politicasAcordadas = [],
  recordatoriosGenerales = [],
  loadingTareas,
  departamento,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode,
  handleCapture,
  draftEntries,
  draftNotes,
  addDraftNote,
  updateDraftNote,
  removeDraftNote,
  updateDraftEntry,
  removeDraftEntry,
  organizeEntry,
  setOrganizeEntry,
  handleOrganizeSave,
  editEntry,
  setEditEntry,
  handleEditEntrySave,
  isSavingEntry,
  setShowReviewModal,
  showReviewModal,
  handleFinalSubmit,
  isSubmittingFinal,
  showNotes,
  setShowNotes,
  handleCreateEntryNote,
  handleUpdateEntryNote,
  handleDeleteEntryNote,
  handleAddEntryImage,
  handleDeleteEntryImage,
  changeTareaStatus,
  users,
  handleIniciar,
  handleCancelar,
  handleCerrar,
  handleReabrir,
  handleFinalizar,
  iniciando,
  cancelando,
  cerrando,
  reabriendo,
  finalizando,
  minutaEstado,
  handleDeleteEntry,
  clearDrafts,
  handleDownloadPdf,
  isGeneratingPdf,
  handleToggleNotificado
}) => {
  const [showPoliticas, setShowPoliticas] = useState(false);
  const [showRecordatorios, setShowRecordatorios] = useState(false);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [selectedTareaForDetail, setSelectedTareaForDetail] = useState(null);
  const [isTareaDrawerOpen, setIsTareaDrawerOpen] = useState(false);
  const { user } = useAuthStore();
  const userRole = user?.data?.rol || user?.rol;

  if (!minuta) return null;

  return (
    <div className="flex h-full w-full flex-col bg-slate-50/50 relative overflow-hidden">
      
      <div className="shrink-0">
        <MinutaContextPanel 
          minuta={minuta} 
          resumen={resumen} 
          entries={filteredEntries} 
          onFilterByStatus={(status) => setActiveFilter(prev => ({ ...prev, estado: prev.estado === status ? null : status, tipo: 'TODAS' }))}
          onFilterByTipo={(tipo) => setActiveFilter(prev => ({ ...prev, tipo: prev.tipo === tipo ? 'TODAS' : tipo, estado: null }))}
          onResetFilter={() => setActiveFilter({ tipo: 'TODAS', estado: null, clasificacion: null, area: null, linea: null, search: '', onlyExternal: false })}
          activeFilter={activeFilter}
          onIniciar={handleIniciar}
          onCancelar={handleCancelar}
          onCerrar={handleCerrar}
          onReabrir={handleReabrir}
          onFinalizar={handleFinalizar}
          iniciando={iniciando}
          cancelando={cancelando}
          cerrando={cerrando}
          reabriendo={reabriendo}
          finalizando={finalizando}
          composerCollapsed={!composerExpanded}
        />
      </div>

      <main className={`flex-1 relative custom-scrollbar px-4 pt-4 ${filteredEntries.length === 0 ? 'overflow-hidden pb-4' : 'overflow-y-auto pb-44'}`}>
        
        <div className="mb-5 space-y-2">
          <MinutaExecutiveSummary 
            resumen={resumen} 
            onFilterByStatus={(status) => setActiveFilter(prev => ({ ...prev, estado: prev.estado === status ? null : status, tipo: 'TODAS' }))}
            onFilterByTipo={(tipo) => setActiveFilter(prev => ({ ...prev, tipo: prev.tipo === tipo ? 'TODAS' : tipo, estado: null }))}
            onResetFilter={() => setActiveFilter({ tipo: 'TODAS', estado: null, clasificacion: null, area: null, linea: null, search: '', onlyExternal: false })}
            activeFilter={activeFilter}
          />
          <MinutaJuntaComparison minutaId={minuta.id} />
        </div>

        {(politicasAcordadas.length > 0 || recordatoriosGenerales.length > 0) && (
          <div className="flex flex-col gap-2 mb-6">
            
            {politicasAcordadas.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300">
                <div className="w-full flex items-center justify-between active:bg-white/5 pr-2">
                  <button 
                    onClick={() => setShowPoliticas(!showPoliticas)}
                    className="flex-1 p-3 flex items-center gap-2"
                  >
                    <Icon name="policy" size="14px" className="text-brand" />
                    <h3 className="fuente-titulos text-[10px] font-black tracking-widest uppercase text-white opacity-90">Políticas</h3>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-mono text-slate-400">{politicasAcordadas.length}</span>
                    <Icon name="expand_more" size="16px" className={`text-slate-500 transition-transform duration-300 ${showPoliticas ? 'rotate-180' : ''}`} />
                  </button>

                  {showPoliticas && canAccessModule(userRole, 'politicas') && (
                    <Link to="/politicas" className="p-2 text-slate-500 active:text-brand animate-in fade-in duration-300">
                      <Icon name="arrow_forward" size="16px" />
                    </Link>
                  )}
                </div>

                {showPoliticas && (
                  <div className="px-2 pb-3 pt-1 space-y-1.5 animate-in slide-in-from-top-1 duration-200 bg-slate-900/40 border-t border-white/5">
                    {politicasAcordadas.map((p, idx) => (
                      <div key={p.id || idx} className="bg-white/5 border border-white/5 rounded-lg p-2 flex items-start gap-2 relative overflow-hidden">
                        <div className="w-0.5 h-full bg-brand/40 absolute left-0 top-0" />
                        <p className="text-white/80 text-[10px] leading-tight italic flex-1 pl-1">"{p.descripcion}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {recordatoriosGenerales.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                <div className="w-full flex items-center justify-between active:bg-slate-50 pr-2">
                  <button 
                    onClick={() => setShowRecordatorios(!showRecordatorios)}
                    className="flex-1 p-3 flex items-center gap-2"
                  >
                    <Icon name="notification_important" size="14px" className="text-violet-600" />
                    <h3 className="fuente-titulos text-[10px] font-black tracking-widest uppercase text-slate-700 opacity-90">Recordatorios</h3>
                    <span className="px-1.5 py-0.5 rounded bg-slate-50 text-[8px] font-mono text-slate-400">{recordatoriosGenerales.length}</span>
                    <Icon name="expand_more" size="16px" className={`text-slate-300 transition-transform duration-300 ${showRecordatorios ? 'rotate-180' : ''}`} />
                  </button>

                  {showRecordatorios && canAccessModule(userRole, 'recordatorios') && (
                    <Link to="/recordatorios" className="p-2 text-slate-400 active:text-violet-600 animate-in fade-in duration-300">
                      <Icon name="arrow_forward" size="16px" />
                    </Link>
                  )}
                </div>

                {showRecordatorios && (
                  <div className="px-2 pb-3 pt-1 space-y-1.5 animate-in slide-in-from-top-1 duration-200 bg-slate-50/30 border-t border-slate-100">
                    {recordatoriosGenerales.map((r, idx) => (
                      <div key={r.id || idx} className="bg-white border border-slate-100 rounded-lg p-2 flex items-center gap-2 relative overflow-hidden shadow-xs">
                        <div className="w-0.5 h-full bg-violet-500 absolute left-0 top-0" />
                        <p className="text-slate-700 text-[10px] leading-tight flex-1 pl-1">"{r.descripcion}"</p>
                        {r.asignaciones && r.asignaciones.length > 0 && (
                          <div className="flex -space-x-1 shrink-0">
                            {r.asignaciones.map((asig) => (
                              <Tooltip key={asig.id} text={asig.usuario?.nombre} position="top">
                                <div className="h-5 w-5 rounded-full border border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[7px] font-bold text-slate-500 shadow-xs shrink-0 transition-transform hover:scale-110 hover:z-10">
                                  {asig.usuario?.imagen ? (
                                    <img src={asig.usuario.imagen} alt={asig.usuario.nombre} className="h-full w-full object-cover" />
                                  ) : (
                                    asig.usuario?.nombre?.charAt(0)
                                  )}
                                </div>
                              </Tooltip>
                            ))}
                          </div>
                        )}
                        <span className="text-[7px] font-mono text-slate-300 uppercase shrink-0 ml-auto">{AREA_MAP[r.area] || r.area}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-lg px-1 py-2 mb-3 rounded-2xl border border-white/40 shadow-sm flex flex-col gap-2 transition-all duration-300"> 
          <EntryFiltersBar 
            activeFilter={activeFilter} 
            onChange={setActiveFilter}
            departamento={departamento}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isMobile={true}
            allEntries={allEntries}
          />
        </div>

        <EntryFeed
          entries={filteredEntries}
          loading={loadingTareas}
          meetingMode={true}
          filterActive={activeFilter.clasificacion || 'TODAS'}
          viewMode={viewMode}
          departamento={departamento}
          onOrganize={setOrganizeEntry}
          onRemove={handleDeleteEntry}
          onUpdateDraft={updateDraftEntry}
          onEdit={setEditEntry}
          onCreateNote={handleCreateEntryNote}
          onUpdateNote={handleUpdateEntryNote}
          onDeleteNote={handleDeleteEntryNote}
          onAddImage={handleAddEntryImage}
          onDeleteImage={handleDeleteEntryImage}
          onChangeStatus={changeTareaStatus}
          users={users}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
          onViewDetail={(t) => {
            setSelectedTareaForDetail(t);
            setIsTareaDrawerOpen(true);
          }}
          onToggleNotificado={handleToggleNotificado}
        />
      </main>
      
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
              isDrawer={false}
            />
          </div>
        </>
      )}

      {!composerExpanded && (
        <div className="fixed bottom-48 right-6 z-[60] flex flex-col gap-4">
          {draftEntries.length > 0 && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xl active:scale-90 transition-all relative"
            >
              <Icon name="cloud_upload" size="32px" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-in zoom-in">
                {draftEntries.length}
              </div>
            </button>
          )}

          <button
            onClick={() => setShowNotes(true)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-2xl active:scale-90 transition-all relative group"
          >
            <Icon name="sticky_note_2" size="32px" />
            {(draftNotes.length + (minuta.notasGenerales?.length || 0)) > 0 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-950 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-amber-500 shadow-lg">
                 {draftNotes.length + (minuta.notasGenerales?.length || 0)}
              </div>
            )}
          </button>
        </div>
      )}

      {(minuta?.estado === 'EN_CURSO' || minuta?.estado === 'PROGRAMADA') && (
        <MobileQuickComposer
          minutaId={minuta.id}
          lineaDefault={minuta.lineaDefault}
          departamento={departamento}
          onSubmit={handleCapture}
          submitting={loadingTareas}
          estado={minuta.estado}
          onIniciar={handleIniciar}
          iniciando={iniciando}
          onExpandedChange={setComposerExpanded}
        />
      )}

      <ReviewDraftsModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleFinalSubmit}
        entries={draftEntries}
        notesCount={draftNotes.length}
        submitting={isSubmittingFinal}
        minutaEstado={minutaEstado}
        onRemoveEntry={removeDraftEntry}
        onClearAll={clearDrafts}
      />

      {organizeEntry && (
        <OrganizeDrawer
          key={organizeEntry.tempId || organizeEntry.id}
          isOpen={Boolean(organizeEntry)}
          onClose={() => setOrganizeEntry(null)}
          entry={organizeEntry}
          onSave={handleOrganizeSave}
          departamento={departamento}
        />
      )}

      {editEntry && (
        <EntryFormModal
          key={editEntry.tempId || editEntry.id}
          isOpen={Boolean(editEntry)}
          onClose={() => setEditEntry(null)}
          entry={editEntry}
          onSave={handleEditEntrySave}
          submitting={isSavingEntry}
          departamento={departamento}
        />
      )}

      {isTareaDrawerOpen && selectedTareaForDetail && (
        <PanelDetalleTarea
          isOpen={isTareaDrawerOpen}
          onClose={() => {
            setIsTareaDrawerOpen(false);
            setSelectedTareaForDetail(null);
          }}
          tarea={selectedTareaForDetail}
          onChangeStatus={async (id, payload) => {
            const statusPayload = typeof payload === 'string' ? { estado: payload } : payload;
            await changeTareaStatus(id, statusPayload);
            setSelectedTareaForDetail(prev => prev && prev.id === id ? { ...prev, estado: statusPayload.estado } : prev);
          }}
          onDelete={async (id) => {
            if (handleDeleteEntry) await handleDeleteEntry(id);
            setIsTareaDrawerOpen(false);
            setSelectedTareaForDetail(null);
          }}
          currentUser={user?.data || user}
        />
      )}
    </div>
  );
};