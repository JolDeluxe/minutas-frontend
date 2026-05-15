import { create } from 'zustand';
import { idbGet, idbSet, idbDelete } from '@/lib/idb';

/**
 * useMinutaDraftStore — Store central para el "Modo Ráfaga" de una junta.
 * Gestiona borradores de entradas y notas de forma local con persistencia en IndexedDB.
 */
export const useMinutaDraftStore = create((set, get) => ({
  minutaId: null,
  draftEntries: [],
  draftNotes: [],
  initialized: false,

  /**
   * Inicializa el store cargando datos persistidos de IDB para la minuta actual.
   */
  initStore: async (id) => {
    const currentId = get().minutaId;
    if (String(currentId) === String(id) && get().initialized) return;

    try {
      const record = await idbGet('minuta_drafts', String(id));
      if (record) {
        set({
          minutaId: id,
          draftEntries: record.data.draftEntries || [],
          draftNotes: record.data.draftNotes || [],
          initialized: true,
        });
      } else {
        set({
          minutaId: id,
          draftEntries: [],
          draftNotes: [],
          initialized: true,
        });
      }
    } catch (error) {
      console.error('[DraftStore] Error initializing:', error);
      set({ minutaId: id, initialized: true });
    }
  },

  /**
   * Persiste el estado actual en IndexedDB de forma asíncrona.
   */
  persist: async () => {
    const { minutaId, draftEntries, draftNotes } = get();
    if (!minutaId) return;
    await idbSet('minuta_drafts', String(minutaId), { draftEntries, draftNotes });
  },

  // ── Gestión de Entradas (Borradores de Tareas) ──────────────────────────

  addDraftEntry: (entryData) => {
    // Fallback para crypto.randomUUID en contextos no seguros (móvil sin HTTPS)
    const tempId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);

    const newEntry = {
      ...entryData,
      tempId,
      createdAt: new Date().toISOString(),
      estadoConceptual: 'CAPTURADO',
      formalizada: false,
    };

    set((state) => ({
      draftEntries: [newEntry, ...state.draftEntries],
    }));
    get().persist();
  },

  updateDraftEntry: (tempId, updates) => {
    set((state) => ({
      draftEntries: state.draftEntries.map((e) =>
        e.tempId === tempId ? { ...e, ...updates } : e
      ),
    }));
    get().persist();
  },

  removeDraftEntry: (tempId) => {
    set((state) => ({
      draftEntries: state.draftEntries.filter((e) => e.tempId !== tempId),
    }));
    get().persist();
  },

  // ── Gestión de Notas (Post-its de Junta) ───────────────────────────────

  addDraftNote: (contenido) => {
    if (!contenido.trim()) return;
    
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);

    const newNote = {
      id,
      contenido: contenido.trim(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      draftNotes: [newNote, ...state.draftNotes],
    }));
    get().persist();
  },

  updateDraftNote: (id, contenido) => {
    set((state) => ({
      draftNotes: state.draftNotes.map((n) =>
        n.id === id ? { ...n, contenido } : n
      ),
    }));
    get().persist();
  },

  removeDraftNote: (id) => {
    set((state) => ({
      draftNotes: state.draftNotes.filter((n) => n.id !== id),
    }));
    get().persist();
  },

  // ── Finalización y Limpieza ────────────────────────────────────────────

  clearDrafts: async () => {
    const { minutaId } = get();
    if (minutaId) {
      await idbDelete('minuta_drafts', String(minutaId));
    }
    set({ draftEntries: [], draftNotes: [], initialized: false });
  },
}));
