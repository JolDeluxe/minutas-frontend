import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { Tooltip } from '@/components/ui/tooltip';
import { MinutaContextPanel } from '../components/context/minuta-context-panel';
import { QuickComposer } from '../components/composer/quick-composer';
import { EntryFiltersBar } from '../components/timeline/entry-filters-bar';
import { EntryFeed } from '../components/timeline/entry-feed';
import { StickyNotesBoard } from '../components/notes/sticky-notes-board';
import { ReviewDraftsModal } from '../components/review-drafts-modal';
import { EntryFormModal } from '../components/timeline/entry-form-modal';
import { OrganizeDrawer } from '../components/organization/organize-drawer';
import { useAuthStore } from '@/stores/auth-store';
import { canAccessModule } from '@/config/modules-config';
import { AREA_MAP } from '../constants';
import { PanelDetalleTarea } from '../../tareas/components/comun/panel-detalle-tarea';
  
export const MinutaDetailDesktopView = ({
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
  handleCreateGeneralNote,
  handleUpdateGeneralNote,
  handleDeleteGeneralNote,
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
  handleDownloadPdf,
  isGeneratingPdf,
  handleToggleNotificado,
  VistaSwitcher,
  vistaResumen,
}) => {
  const [showPoliticas, setShowPoliticas] = useState(false);
  const [showRecordatorios, setShowRecordatorios] = useState(false);
  const [composerCollapsed, setComposerCollapsed] = useState(true);
  const [selectedTareaForDetail, setSelectedTareaForDetail] = useState(null);
  const [isTareaDrawerOpen, setIsTareaDrawerOpen] = useState(false);
  const { user } = useAuthStore();
  const userRole = user?.data?.rol || user?.rol;

  useEffect(() => {
    if (minuta?.estado !== 'EN_CURSO' && minuta?.estado !== 'PROGRAMADA') {
      setComposerCollapsed(true);
    }
  }, [minuta?.estado]);

  if (!minuta) return null;

  return (
    <div className="flex h-full w-full flex-col bg-slate-50/50 relative">
      <MinutaContextPanel 
        minuta={minuta} 
        resumen={resumen} 
        entries={filteredEntries}
        onFilterByStatus={(status) => setActiveFilter(prev => ({ ...prev, estado: prev.estado === status ? null : status, tipo: 'TODAS', onlyExternal: false }))}
        onFilterByTipo={(tipo) => setActiveFilter(prev => ({ ...prev, tipo: prev.tipo === tipo ? 'TODAS' : tipo, estado: null, onlyExternal: false }))}
        onToggleExternal={() => setActiveFilter(prev => ({ ...prev, onlyExternal: !prev.onlyExternal, tipo: 'TODAS', estado: null }))}
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
        composerCollapsed={composerCollapsed}
        VistaSwitcher={VistaSwitcher}
        vistaResumen={vistaResumen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <main className="relative flex flex-1 flex-col min-w-0 bg-transparent">
          {(minuta?.estado === 'EN_CURSO' || minuta?.estado === 'PROGRAMADA') && (
            <QuickComposer
              minutaId={minuta.id}
              lineaDefault={minuta.lineaDefault}
              departamento={departamento}
              onSubmit={handleCapture}
              submitting={loadingTareas}
              isDesktop={true}
              estado={minuta.estado}
              onIniciar={handleIniciar}
              iniciando={iniciando}
              onCollapseChange={setComposerCollapsed}
            />
          )}

          <div className={`flex-1 px-10 py-1 scrollbar-thin ${filteredEntries.length === 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <div className={`mx-auto max-w-full flex flex-col gap-6 ${filteredEntries.length === 0 ? 'pb-4' : 'pb-10'}`}>
              
              {(politicasAcordadas.length > 0 || recordatoriosGenerales.length > 0) && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                  {politicasAcordadas.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-fit">
                      <div className="w-full flex items-center justify-between hover:bg-white/5 transition-colors pr-2">
                        <button 
                          onClick={() => setShowPoliticas(!showPoliticas)}
                          className="flex-1 px-4 py-2 flex items-center gap-2.5 text-white"
                        >
                          <Icon name="policy" size="16px" className="text-brand" />
                          <h3 className="fuente-titulos text-[11px] font-black tracking-widest uppercase opacity-90">Políticas</h3>
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-400">{politicasAcordadas.length}</span>
                          <Icon name="expand_more" size="18px" className={`text-slate-500 transition-transform duration-300 ${showPoliticas ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showPoliticas && canAccessModule(userRole, 'politicas') && (
                          <Link 
                            to="/politicas" 
                            className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-brand hover:bg-brand/10 transition-all flex items-center gap-1 animate-in fade-in duration-300"
                          >
                            <span>Ver Todas</span>
                            <Icon name="arrow_forward" size="12px" />
                          </Link>
                        )}
                      </div>

                      {showPoliticas && (
                        <div className="px-3 pb-3 pt-1 animate-in slide-in-from-top-1 duration-200 border-t border-white/5 bg-slate-900/40">
                          <div className="flex flex-col gap-2">
                            {politicasAcordadas.map((p, idx) => (
                              <div key={p.id || idx} className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-start gap-3 relative overflow-hidden">
                                <div className="w-0.5 h-full bg-brand/40 absolute left-0 top-0" />
                                <p className="text-white/90 text-[11px] leading-snug italic flex-1 pl-1">"{p.descripcion}"</p>
                                <span className="text-[8px] font-mono text-white/20 uppercase shrink-0 pt-0.5">{p.area}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {recordatoriosGenerales.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                      <div className="w-full flex items-center justify-between hover:bg-slate-50 transition-colors pr-2">
                        <button 
                          onClick={() => setShowRecordatorios(!showRecordatorios)}
                          className="flex-1 px-4 py-2 flex items-center gap-2.5 text-slate-700"
                        >
                          <Icon name="notification_important" size="16px" className="text-violet-500" />
                          <h3 className="fuente-titulos text-[11px] font-black tracking-widest uppercase opacity-90">Recordatorios</h3>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-mono text-slate-400">{recordatoriosGenerales.length}</span>
                          <Icon name="expand_more" size="18px" className={`text-slate-300 transition-transform duration-300 ${showRecordatorios ? 'rotate-180' : ''}`} />
                        </button>

                        {showRecordatorios && canAccessModule(userRole, 'recordatorios') && (
                          <Link 
                            to="/recordatorios" 
                            className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center gap-1 animate-in fade-in duration-300"
                          >
                            <span>Ver Todos</span>
                            <Icon name="arrow_forward" size="12px" />
                          </Link>
                        )}
                      </div>

                      {showRecordatorios && (
                        <div className="px-3 pb-3 pt-1 animate-in slide-in-from-top-1 duration-200 border-t border-slate-100 bg-slate-50/30">
                          <div className="flex flex-col gap-2">
                            {recordatoriosGenerales.map((r, idx) => (
                              <div key={r.id || idx} className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-3 relative overflow-hidden shadow-xs">
                                <div className="w-0.5 h-full bg-violet-400 absolute left-0 top-0" />
                                <p className="text-slate-700 text-[11px] font-medium leading-snug flex-1 pl-1">"{r.descripcion}"</p>
                                {r.asignaciones && r.asignaciones.length > 0 && (
                                  <div className="flex -space-x-1.5 shrink-0">
                                    {r.asignaciones.map((asig) => (
                                      <Tooltip key={asig.id} text={asig.usuario?.nombre} position="top">
                                        <div className="h-6 w-6 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm shrink-0 transition-transform hover:scale-110 hover:z-10">
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
                                <span className="text-[8px] font-mono text-slate-300 uppercase shrink-0">{AREA_MAP[r.area] || r.area}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 bg-slate-50/90 p-2 rounded-2xl backdrop-blur-md border border-slate-200/50 sticky top-0 z-30 shadow-sm">
                <div className="flex-1 overflow-hidden">
                  <EntryFiltersBar 
                    activeFilter={activeFilter} 
                    onChange={setActiveFilter}
                    departamento={departamento}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    allEntries={allEntries}
                  />
                </div>
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
              />            </div>
          </div>
        </main>
        
        {showNotes && (
          <>
            <div
              className="absolute inset-0 z-[90] bg-slate-900/10 backdrop-blur-[1px] animate-in fade-in duration-200"
              onClick={() => setShowNotes(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 z-[100] w-[min(430px,calc(100%-2.5rem))] overflow-hidden rounded-l-[2rem] border-l border-amber-100 bg-white shadow-2xl shadow-slate-900/20 animate-in slide-in-from-right-4 fade-in duration-300">
              <StickyNotesBoard
                notas={minuta.notasGenerales || []}
                minutaId={minuta.id}
                onCreateNota={handleCreateGeneralNote}
                onUpdateNota={handleUpdateGeneralNote}
                onDeleteNota={handleDeleteGeneralNote}
                onClose={() => setShowNotes(false)}
                isDrawer={false}
              />
            </div>
          </>
        )}

        {composerCollapsed && (
          <div className="fixed bottom-24 right-10 z-[60] flex gap-4">
            {(draftEntries.length > 0) && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex h-16 px-6 items-center gap-3 rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-600/40 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all group relative"
              >
                <Icon name="cloud_upload" size="28px" className="group-hover:animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest pr-2">Guardar</span>
                {(draftEntries.length) > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-in zoom-in">
                    {draftEntries.length}
                  </div>
                )}
              </button>
            )}

            {!showNotes && (
              <button
                onClick={() => setShowNotes(true)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-2xl shadow-amber-500/40 hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all relative group"
              >
                <Icon name="sticky_note_2" size="32px" />
                {(minuta.notasGenerales?.length || 0) > 0 && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-950 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-amber-500 shadow-lg group-hover:scale-110 transition-transform">
                     {minuta.notasGenerales?.length || 0}
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <ReviewDraftsModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleFinalSubmit}
        entries={draftEntries}
        notesCount={0}
        submitting={isSubmittingFinal}
        minutaEstado={minutaEstado}
        onRemoveEntry={removeDraftEntry}
        users={users}
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
          departamento={minuta?.departamento || 'DISENO'}
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
          onChangeStatus={async (id, payload, silent) => {
            const statusPayload = typeof payload === 'string' ? { estado: payload } : payload;
            await changeTareaStatus(id, statusPayload, silent);
            setSelectedTareaForDetail(prev => prev && prev.id === id ? { ...prev, estado: statusPayload.estado } : prev);
          }}
          onDelete={async (id) => {
            if (handleDeleteEntry) await handleDeleteEntry(id);
            setIsTareaDrawerOpen(false);
            setSelectedTareaForDetail(null);
          }}
          currentUser={user?.data || user}
          users={users}
          onCreateNota={async (id, content) => {
            const success = await handleCreateEntryNote(id, content);
            if (success) {
              const currentUserData = user?.data || user;
              setSelectedTareaForDetail(prev => {
                if (!prev) return prev;
                const newNotes = [...(prev.notas || [])];
                newNotes.unshift({
                  id: Date.now(),
                  contenido: content,
                  creadoPorId: currentUserData?.id,
                  creadoPor: currentUserData,
                  createdAt: new Date().toISOString(),
                  esEntrega: false
                });
                return { ...prev, notas: newNotes };
              });
            }
          }}
          onDeleteNota={async (id) => {
            const success = await handleDeleteEntryNote(selectedTareaForDetail.id, id);
            if (success) {
              setSelectedTareaForDetail(prev => {
                if (!prev) return prev;
                const oldNotes = prev.notas || [];
                return { ...prev, notas: oldNotes.filter(n => n.id !== id) };
              });
            }
          }}
        />
      )}
    </div>
  );
};