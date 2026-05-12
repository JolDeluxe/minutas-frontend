import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMinutaById } from '../api/minutas-api';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';

import { Icon, Skeleton } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';

import { MinutaContextPanel } from '../components/context/minuta-context-panel';
import { TimelineFilters } from '../components/timeline/timeline-filters';
import { EntryFeed } from '../components/timeline/entry-feed';
import { QuickComposer } from '../components/composer/quick-composer';
import { OrganizeDrawer } from '../components/organization/organize-drawer';
import { StickyNotesBoard } from '../components/notes/sticky-notes-board';
import { cn } from '@/utils/cn';

// ─── Constants ────────────────────────────────────────────────────────────────

const LINEA_MAP = { CALZADO: 'Calzado', BOTA: 'Bota', ROPA: 'Ropa', ACCESORIOS: 'Accesorios' };

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MinutaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  // ── Minuta ──
  const [minuta, setMinuta] = useState(null);
  const [loadingMinuta, setLoadingMinuta] = useState(true);

  // ── Tareas ──
  const {
    tareas, loading: loadingTareas, submitting,
    fetchTareas, createTarea, updateTarea, createNotaGeneral,
  } = useTareas();

  // ── UI State ──
  const [meetingMode, setMeetingMode] = useState(false);
  const [filterClasif, setFilterClasif] = useState('TODAS');
  const [showNotes, setShowNotes] = useState(true);

  // ── Organize ──
  const [organizeEntry, setOrganizeEntry] = useState(null);

  // ── Load Minuta ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingMinuta(true);
      try {
        const res = await getMinutaById(id);
        if (!cancelled) setMinuta(res.data);
      } catch {
        notify.error('No se pudo cargar la minuta');
        navigate('/minutas');
      } finally {
        if (!cancelled) setLoadingMinuta(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, navigate]);

  // ── Load Tareas ──
  const loadTareas = useCallback(() => {
    if (!id) return;
    const params = { 
      minutaId: id, 
      page: 1, 
      limit: 100,
      sort: JSON.stringify([{ createdAt: 'asc' }])
    };
    fetchTareas(params);
  }, [id, fetchTareas]);

  useEffect(() => { loadTareas(); }, [loadTareas]);

  // ── Filtrado ──
  const filteredTareas = useMemo(() => {
    if (filterClasif === 'TODAS') return tareas;
    if (filterClasif === 'SIN_CLASIFICAR') return tareas.filter(t => !t.clasificacion);
    if (filterClasif === 'SIN_ORGANIZAR') return tareas.filter(t => !t.formalizada);
    return tareas.filter(t => t.clasificacion === filterClasif);
  }, [tareas, filterClasif]);

  // ── Resumen ──
  const resumen = useMemo(() => {
    const conceptual = {};
    for (const t of tareas) {
      const e = t.estadoConceptual || 'CAPTURADO';
      conceptual[e] = (conceptual[e] || 0) + 1;
    }
    return { totalEntradas: tareas.length, conceptual };
  }, [tareas]);

  // ── Handlers ──
  const handleCapture = async (payload) => {
    await createTarea(payload);
    notify.success('Entrada capturada');
    loadTareas();
  };

  const handleSaveOrganize = async (entryId, payload) => {
    try {
      await updateTarea(entryId, payload);
      notify.success('Entrada organizada');
      setOrganizeEntry(null);
      loadTareas();
    } catch {
      notify.error('Error al organizar');
    }
  };

  const handleCreateNota = async (data) => {
    await createNotaGeneral(data);
    notify.success('Nota agregada');
    // Refetch minuta to get updated notasGenerales
    try {
      const res = await getMinutaById(id);
      setMinuta(res.data);
    } catch (_e) {
      console.warn('Error refreshing minuta:', _e);
    }
  };



  // ── Loading ──
  if (loadingMinuta) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Icon name="progress_activity" className="text-marca-primario animate-spin" size="32px" />
          <p className="text-sm text-slate-500 mt-2">Cargando minuta...</p>
        </div>
      </div>
    );
  }

  if (!minuta) return null;

  // ─────────────────────────────────────────────────────────────────────────────
  // ── DESKTOP LAYOUT — 3-column workspace ──────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="h-full w-full flex overflow-hidden">
        {/* Center: Context Panel + Timeline + Composer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Context Panel */}
          {!meetingMode && <MinutaContextPanel minuta={minuta} resumen={resumen} />}

          {/* Toolbar compact */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border-b border-slate-200/50 shrink-0">
            {/* Meeting mode */}
            <button
              onClick={() => setMeetingMode(m => !m)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95',
                meetingMode
                  ? 'bg-marca-primario text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200'
              )}
            >
              <Icon name={meetingMode ? 'mic' : 'mic_none'} size="14px" />
              {meetingMode ? 'En Junta' : 'Modo Reunión'}
            </button>

            {/* Filters */}
            {!meetingMode && (
              <div className="flex-1 overflow-hidden">
                <TimelineFilters active={filterClasif} onChange={setFilterClasif} />
              </div>
            )}

            {/* Notes toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowNotes(n => !n)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95',
                  showNotes
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200'
                )}
              >
                <Icon name="sticky_note_2" size="14px" />
                <span className="hidden xl:inline">Notas</span>
              </button>
            </div>
          </div>

          {/* Composer Desktop */}
          <QuickComposer
            minutaId={minuta.id}
            lineaDefault={minuta.lineaDefault}
            onSubmit={handleCapture}
            submitting={submitting}
            isDesktop
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 relative bg-slate-50/50">
            <div className="w-full flex gap-4 lg:gap-6 items-start h-full">
              {/* Entradas */}
              <div className="flex-1 min-w-0 w-full">
                <EntryFeed
                  entries={filteredTareas}
                  loading={loadingTareas}
                  meetingMode={meetingMode}
                  filterActive={filterClasif}
                  onOrganize={(entry) => setOrganizeEntry(entry)}
                />
              </div>

              {/* Panel de Notas */}
              {showNotes && !meetingMode && (
                <div className="w-72 shrink-0 sticky top-0 h-full max-h-full">
                  <StickyNotesBoard
                    notas={minuta.notasGenerales || []}
                    minutaId={minuta.id}
                    onCreateNota={handleCreateNota}
                    onClose={() => setShowNotes(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organize Drawer */}
        {organizeEntry && (
          <OrganizeDrawer
            key={organizeEntry.id}
            isOpen={Boolean(organizeEntry)}
            onClose={() => setOrganizeEntry(null)}
            entry={organizeEntry}
            onSave={handleSaveOrganize}
            submitting={submitting}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ── MOBILE LAYOUT — Stacked with fixed bottom composer ───────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full -m-4 relative">
      {/* Mobile Header */}
      <header
        className="sticky top-0 z-40 px-3 py-2.5"
        style={{ ...glassBase('surface'), borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
      >
        <GlassSheen />
        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={() => navigate('/minutas')}
            className="p-1 -ml-1 rounded-lg hover:bg-black/5 active:scale-90 transition-all shrink-0"
          >
            <Icon name="arrow_back" size="20px" className="text-marca-primario" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold text-slate-900 fuente-titulos truncate leading-tight">
              {minuta.titulo}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
              <span className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold',
                minuta.estado === 'ACTIVA' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-slate-500/10 text-slate-600'
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', minuta.estado === 'ACTIVA' ? 'bg-emerald-500' : 'bg-slate-400')} />
                {minuta.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'}
              </span>
              <span className="font-mono">·</span>
              <span>{tareas.length} entradas</span>
              <span className="font-mono">·</span>
              <span>{LINEA_MAP[minuta.lineaDefault] || minuta.lineaDefault}</span>
            </div>
          </div>

          {/* Mobile actions */}
          <button
            onClick={() => setMeetingMode(m => !m)}
            className={cn(
              'p-2 rounded-xl transition-all active:scale-90',
              meetingMode ? 'bg-marca-primario text-white' : 'bg-white/60 text-slate-500 border border-slate-200/80'
            )}
          >
            <Icon name={meetingMode ? 'mic' : 'mic_none'} size="18px" />
          </button>
          <button
            onClick={() => setShowNotes(true)}
            className="p-2 rounded-xl bg-white/60 text-slate-500 border border-slate-200/80 active:scale-90 transition-all"
          >
            <Icon name="sticky_note_2" size="18px" />
          </button>
        </div>
      </header>

      {/* Filters (hidden in meeting mode) */}
      {!meetingMode && (
        <div className="sticky top-[52px] z-30 bg-cuadra-arena/80 backdrop-blur-sm px-2">
          <TimelineFilters active={filterClasif} onChange={setFilterClasif} />
        </div>
      )}

      {/* Feed */}
      <main className={cn('flex-1 px-2', meetingMode ? 'pt-1' : 'pt-2')}>
        <EntryFeed
          entries={filteredTareas}
          loading={loadingTareas}
          meetingMode={meetingMode}
          filterActive={filterClasif}
          onOrganize={(entry) => setOrganizeEntry(entry)}
        />
      </main>

      {/* Composer — fixed bottom */}
      <QuickComposer
        minutaId={minuta.id}
        lineaDefault={minuta.lineaDefault}
        onSubmit={handleCapture}
        submitting={submitting}
      />

      {/* Notes Drawer (mobile) */}
      {showNotes && (
        <StickyNotesBoard
          isDrawer
          notas={minuta.notasGenerales || []}
          minutaId={minuta.id}
          onCreateNota={handleCreateNota}
          onClose={() => setShowNotes(false)}
        />
      )}

      {/* Organize Drawer */}
      {organizeEntry && (
        <OrganizeDrawer
          key={organizeEntry.id}
          isOpen={Boolean(organizeEntry)}
          onClose={() => setOrganizeEntry(null)}
          entry={organizeEntry}
          onSave={handleSaveOrganize}
          submitting={submitting}
        />
      )}
    </div>
  );
}
