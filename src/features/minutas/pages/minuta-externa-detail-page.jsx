import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { Icon, Button, Modal, ModalHeader, ModalBody, Tooltip, ConfirmModal } from '@/components/ui/z_index';
import { MinutaContextPanel } from '../components/context/minuta-context-panel';
import { TablaGenerales } from '@/features/tareas_generales/components/tabla-generales';
import { EntryCard } from '../components/timeline/entry-card';
import { QuickComposer } from '../components/composer/quick-composer';
import { MobileQuickComposer } from '../components/composer/mobile-quick-composer';
import { EntryFiltersBar } from '../components/timeline/entry-filters-bar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ModalNuevaGeneral } from '@/features/tareas_generales/components/modal-nueva-general';
import { MinutaResumen } from './minuta-resumen';
import { ShareTareaModal } from '@/features/tareas_generales/components/share-tarea-modal';

import {
  getMinutaExternaById,
  cerrarMinutaExterna,
  createTareasExternas,
  updateMinutaExterna,
  deleteTareaExterna,
  toggleNotificadoExterna,
  deleteMinutaExterna,
  updateTareaExterna,
  createTareaExternaNota,
  updateTareaExternaNota,
  deleteTareaExternaNota,
  generarPdfMinutaExterna
} from '../api/minutas-api';

export default function MinutaExternaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [minuta, setMinuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState({ tipo: 'TODAS', estado: null, clasificacion: null, area: null, linea: null, search: '', onlyExternal: false });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('minutas_view_mode') || 'table');
  const [composerCollapsed, setComposerCollapsed] = useState(false);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [vistaResumen, setVistaResumen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
  const [sharePdfData, setSharePdfData] = useState(null);

  const handleDownloadPdf = async (areaOrId) => {
    setIsGeneratingPdf(areaOrId || true);
    try {
      const { data } = await generarPdfMinutaExterna(id);
      const pdfUrl = data?.data?.pdfUrl || data?.pdfUrl;
      if (pdfUrl) {
        setSharePdfData({
          url: pdfUrl,
          area: mappedMinuta?.area || 'EXTERNO',
          descripcion: mappedMinuta?.titulo || 'Minuta Externa'
        });
      } else {
        notify.error('No se pudo obtener la URL del PDF.');
      }
    } catch (err) {
      console.error(err);
      notify.error('Error al generar el PDF de la minuta');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const [resumen, setResumen] = useState({ temas: '', acuerdos: '', proximosPasos: '' });

  const loadMinuta = async () => {
    try {
      setLoading(true);
      const res = await getMinutaExternaById(id);
      const data = res.data?.data || res.data;
      setMinuta(data);
      setResumen({
        temas: data.resumenTemas || '',
        acuerdos: data.resumenAcuerdos || '',
        proximosPasos: data.resumenProximosPasos || ''
      });
    } catch (error) {
      console.error(error);
      notify.error('Error al cargar la minuta externa');
      navigate('/minutas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (tarea) => {
    setEditData({
      ...tarea,
      linea: tarea.departamento || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTarea = async (payload, tareaId) => {
    setSubmittingTask(true);
    try {
      if (tareaId) {
        const updatePayload = {
          descripcion: payload.descripcion,
          area: payload.area,
          departamento: payload.linea || null,
          fechaVencimiento: payload.fechaVencimiento || null,
        };
        await updateTareaExterna(tareaId, updatePayload);
        notify.success('Tarea actualizada correctamente');
      }
      setIsModalOpen(false);
      setEditData(null);
      loadMinuta();
    } catch (err) {
      notify.error(err?.response?.data?.error || 'Error al guardar la tarea');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleCreateNota = async ({ tareaId, contenido }) => {
    try {
      await createTareaExternaNota({ tareaExternaId: tareaId, contenido });
      loadMinuta();
    } catch (err) {
      notify.error('Error al agregar nota');
    }
  };

  const handleUpdateNota = async (notaId, { contenido }) => {
    try {
      await updateTareaExternaNota(notaId, { contenido });
      loadMinuta();
    } catch (err) {
      notify.error('Error al actualizar nota');
    }
  };

  const handleDeleteNota = async (notaId) => {
    try {
      await deleteTareaExternaNota(notaId);
      loadMinuta();
    } catch (err) {
      notify.error('Error al eliminar nota');
    }
  };

  useEffect(() => {
    if (id) {
      loadMinuta();
    }
  }, [id]);

  const handleCapture = async (data) => {
    setIsSubmitting(true);
    try {
      const incomingTarea = data?.tareas?.[0] || data;
      const payload = {
        tareas: [{
          descripcion: incomingTarea.descripcion,
          area: incomingTarea.area || minuta.area || 'OTRA',
          departamento: incomingTarea.linea || minuta.departamento || undefined,
          fechaVencimiento: incomingTarea.fechaVencimiento || undefined,
          estado: 'PENDIENTE',
          notas: incomingTarea.notas || [],
          _localImages: incomingTarea._localImages || []
        }]
      };
      await createTareasExternas(id, payload);
      notify.success('Tarea agregada');
      loadMinuta();
    } catch (err) {
      notify.error('Error al agregar tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (tareaId) => {
    try {
      await deleteTareaExterna(tareaId);
      notify.success('Tarea eliminada');
      loadMinuta();
    } catch (err) {
      notify.error('Error al eliminar tarea');
    }
  };

  const handleToggleNotificado = async (tareaId) => {
    try {
      await toggleNotificadoExterna(tareaId);
      notify.success('Estado de completado actualizado');
      loadMinuta();
    } catch (err) {
      notify.error('Error al actualizar estado');
    }
  };

  const handleCerrar = async () => {
    setShowCloseModal(true);
  };

  const confirmCerrar = async () => {
    setCerrando(true);
    try {
      await cerrarMinutaExterna(id);
      notify.success('Minuta cerrada correctamente');
      loadMinuta();
      setShowCloseModal(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al cerrar la minuta';
      notify.error(msg);
    } finally {
      setCerrando(false);
    }
  };

  const handleCancelar = () => {
    setShowCancelModal(true);
  };

  const confirmCancelar = async () => {
    setCancelando(true);
    try {
      await deleteMinutaExterna(id);
      notify.success('Minuta cancelada');
      loadMinuta();
      setShowCancelModal(false);
    } catch (err) {
      notify.error('Error al cancelar');
    } finally {
      setCancelando(false);
    }
  };

  // Mappers para simular la estructura de Minuta normal
  const mappedMinuta = useMemo(() => {
    if (!minuta) return null;
    return {
      ...minuta,
      titulo: minuta.tema || minuta.objetivo || 'Minuta Externa',
    };
  }, [minuta]);

  // Mapeamos TODAS las tareas para contadores
  const allMappedTareas = useMemo(() => {
    if (!minuta?.tareas) return [];
    return minuta.tareas.map(t => ({
      ...t,
      tipo: 'TAREA',
      clasificacion: t.departamento || 'EXTERNO', 
      responsables: [],
      isExternal: true,
      estado: t.estado === 'CANCELADA' ? 'CANCELADA' : (t.notificadoAt ? 'CERRADA' : (t.estado === 'CERRADA' ? 'CERRADA' : 'PENDIENTE'))
    }));
  }, [minuta]);

  // Aplicamos los filtros
  const filteredTareas = useMemo(() => {
    let filtered = [...allMappedTareas];
    
    if (activeFilter.estado) {
      filtered = filtered.filter(t => t.estado === activeFilter.estado);
    }
    if (activeFilter.linea) {
      filtered = filtered.filter(t => t.clasificacion === activeFilter.linea);
    }
    if (activeFilter.search) {
      const q = activeFilter.search.toLowerCase();
      filtered = filtered.filter(t => t.descripcion?.toLowerCase().includes(q));
    }
    
    return filtered;
  }, [allMappedTareas, activeFilter]);

  const stats = useMemo(() => {
    if (!allMappedTareas) return {};
    const validTareas = allMappedTareas.filter(t => t.estado !== 'CANCELADA');
    const total = validTareas.length;
    const completadas = validTareas.filter(t => t.estado === 'CERRADA').length;
    return {
      totalTareas: total,
      cerradas: completadas,
      pendientes: total - completadas,
      porcentaje: total === 0 ? 0 : Math.round((completadas / total) * 100)
    };
  }, [allMappedTareas]);

  // Switch toggle component reutilizable
  const VistaSwitcher = () => (
    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5 md:p-1 border border-slate-200 shadow-inner">
      <button
        onClick={() => setVistaResumen(false)}
        className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
          !vistaResumen
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Icon name="task_alt" size="11px" />
        <span>Tareas</span>
      </button>
      <button
        onClick={() => setVistaResumen(true)}
        className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
          vistaResumen
            ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Icon name="summarize" size="11px" />
        <span>Resumen</span>
      </button>
    </div>
  );

  if (loading && !minuta) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-marca-primario border-t-transparent" />
      </div>
    );
  }

  if (!minuta) return null;


  return (
    <div className="flex h-full w-full flex-col bg-slate-50/50 relative">
      
      {/* PANEL IZQUIERDO (Mismo diseño que DISEÑO/MARKETING) */}
      <MinutaContextPanel 
        minuta={mappedMinuta}
        resumen={{ ...resumen, ...stats, esExterna: true }}
        entries={filteredTareas}
        onFilterByStatus={(status) => setActiveFilter(prev => ({ ...prev, estado: prev.estado === status ? null : status }))}
        onFilterByTipo={() => {}}
        onToggleExternal={() => {}}
        onResetFilter={() => setActiveFilter({ tipo: 'TODAS', estado: null, search: '', onlyExternal: false })}
        activeFilter={activeFilter}
        onCerrar={handleCerrar}
        onCancelar={handleCancelar}
        cerrando={cerrando}
        cancelando={cancelando}
        iniciando={false}
        finalizando={false}
        composerCollapsed={isDesktop ? (vistaResumen ? true : composerCollapsed) : (vistaResumen ? true : !composerExpanded)}
        VistaSwitcher={VistaSwitcher}
        vistaResumen={vistaResumen}
      />

      {vistaResumen ? (
        <div className="flex-1 px-4 md:px-10 py-6 overflow-y-auto scrollbar-thin bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <MinutaResumen
              minuta={minuta}
              tareas={allMappedTareas}
              onSwitchToTareas={() => setVistaResumen(false)}
              onResumenUpdated={(updates) => setMinuta(prev => ({ ...prev, ...updates }))}
              esExterna={true}
            />
          </div>
        </div>
      ) : (
        /* ÁREA CENTRAL (Tareas y Composer) */
        <div className="flex flex-1 overflow-hidden relative">
        <main className="relative flex flex-1 flex-col min-w-0 bg-transparent">
          {(mappedMinuta.estado === 'ACTIVA' || mappedMinuta.estado === 'PROGRAMADA') && (
            isDesktop ? (
              <QuickComposer
                minutaId={mappedMinuta.id}
                lineaDefault={minuta.departamento}
                areaDefault={minuta.area}
                departamento="EXTERNO"
                onSubmit={handleCapture}
                submitting={isSubmitting}
                isDesktop={true}
                estado="EN_CURSO"
                onCollapseChange={setComposerCollapsed}
              />
            ) : (
              <MobileQuickComposer
                minutaId={mappedMinuta.id}
                lineaDefault={minuta.departamento}
                areaDefault={minuta.area}
                departamento="EXTERNO"
                onSubmit={handleCapture}
                submitting={isSubmitting}
                estado="EN_CURSO"
                onExpandedChange={setComposerExpanded}
              />
            )
          )}

          <div className="flex-1 px-4 md:px-10 py-6 overflow-y-auto scrollbar-thin">
            <div className="mx-auto max-w-full flex flex-col gap-6 pb-10">
              
              {isDesktop ? (
                <div className="flex items-center gap-4 bg-slate-50/90 p-2 rounded-2xl backdrop-blur-md border border-slate-200/50 sticky top-0 z-30 shadow-sm">
                  <div className="flex-1 overflow-hidden">
                    <EntryFiltersBar 
                      activeFilter={activeFilter} 
                      onChange={setActiveFilter}
                      departamento="EXTERNO"
                      viewMode={viewMode}
                      setViewMode={(mode) => {
                        setViewMode(mode);
                        localStorage.setItem('minutas_view_mode', mode);
                      }}
                      allEntries={allMappedTareas}
                    />
                  </div>
                </div>
              ) : (
                <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-lg px-1 py-2 mb-3 rounded-2xl border border-white/40 shadow-sm flex flex-col gap-2 transition-all duration-300">
                  <EntryFiltersBar 
                    activeFilter={activeFilter} 
                    onChange={setActiveFilter}
                    departamento="EXTERNO"
                    viewMode={viewMode}
                    setViewMode={(mode) => {
                      setViewMode(mode);
                      localStorage.setItem('minutas_view_mode', mode);
                    }}
                    isMobile={true}
                    allEntries={allMappedTareas}
                  />
                </div>
              )}

              {filteredTareas.length > 0 && (
                <>
                  {viewMode === 'table' ? (
                    <TablaGenerales
                      tareas={filteredTareas}
                      loading={loading}
                      onToggleNotificado={handleToggleNotificado}
                      onRemove={handleDeleteEntry}
                      onEdit={handleOpenEdit}
                      onCreateNota={handleCreateNota}
                      onUpdateNota={handleUpdateNota}
                      onDeleteNota={handleDeleteNota}
                      onDownloadPdf={handleDownloadPdf}
                      isGeneratingPdf={isGeneratingPdf}
                      currentUser={user?.data || user}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-slate-50">
                      {filteredTareas.map(tarea => (
                        <EntryCard
                          key={tarea.id}
                          entry={tarea}
                          onRemove={handleDeleteEntry}
                          onToggleNotificado={handleToggleNotificado}
                          onEdit={handleOpenEdit}
                          onCreateNote={async (id, content) => {
                            await handleCreateNota({ tareaId: id, contenido: content });
                            return true;
                          }}
                          onUpdateNote={async (tareaId, notaId, content) => {
                            await handleUpdateNota(notaId, { contenido: content });
                          }}
                          onDeleteNote={async (tareaId, notaId) => {
                            await handleDeleteNota(notaId);
                          }}
                          hideStatus={true}
                          currentUser={user?.data || user}
                          className="rounded-[1.25rem] shadow-sm border-slate-200"
                          onDownloadPdf={handleDownloadPdf}
                          isGeneratingPdf={isGeneratingPdf ? tarea.area : null}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {allMappedTareas.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Icon name="inbox" size="48px" className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Aún no hay tareas externas registradas</h3>
                  <p className="text-slate-500 max-w-sm">Utiliza el panel superior para registrar los acuerdos y tareas asignadas a este departamento.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      )}

      {showCloseModal && (
        <ConfirmModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          onConfirm={confirmCerrar}
          title="Cerrar Minuta Externa"
          message="¿Estás seguro de que deseas cerrar esta minuta? Ya no podrás agregar nuevas tareas."
          confirmText="Cerrar Minuta"
          cancelText="Volver"
          variant="success"
        />
      )}

      {showCancelModal && (
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={confirmCancelar}
          title="Cancelar Minuta Externa"
          message="¿Estás seguro de que deseas cancelar la minuta? Esta acción no se puede deshacer."
          confirmText="Cancelar Minuta"
          cancelText="Volver"
          variant="danger"
        />
      )}

      {isModalOpen && (
        <ModalNuevaGeneral
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditData(null); }}
          onSave={handleSaveTarea}
          users={[]}
          editData={editData}
          submitting={submittingTask}
        />
      )}

      {sharePdfData && (
        <ShareTareaModal
          isOpen={Boolean(sharePdfData)}
          onClose={() => setSharePdfData(null)}
          data={sharePdfData}
        />
      )}

    </div>
  );
}
