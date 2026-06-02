import { create } from 'zustand';
import { idbGet, idbSet, idbDelete } from '@/lib/idb';

/**
 * useMinutaDraftStore — Store central para el "Modo Ráfaga" de una junta.
 * Gestiona borradores de entradas y notas de forma local con persistencia en IndexedDB.
 */
export const useMinutaDraftStore = create((set, get) => ({
  minutaId: null,
  draftEntries: [],
  remoteDraftEntries: [],
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
          remoteDraftEntries: [],
          draftNotes: record.data.draftNotes || [],
          initialized: true,
        });
      } else {
        set({
          minutaId: id,
          draftEntries: [],
          remoteDraftEntries: [],
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
      draftEntries: [...state.draftEntries, newEntry],
    }));
    get().persist();
    return newEntry;
  },

  updateDraftEntry: (tempId, updates) => {
    let updatedEntry = null;
    set((state) => ({
      draftEntries: state.draftEntries.map((e) => {
        if (e.tempId !== tempId) return e;
        updatedEntry = { ...e, ...updates, updatedAt: new Date().toISOString() };
        return updatedEntry;
      }),
    }));
    get().persist();
    return updatedEntry;
  },

  removeDraftEntry: (tempId) => {
    const removedEntry = get().draftEntries.find((e) => e.tempId === tempId) || null;
    set((state) => ({
      draftEntries: state.draftEntries.filter((e) => e.tempId !== tempId),
    }));
    get().persist();
    return removedEntry;
  },

  // ── Entradas remotas en vivo (no se guardan localmente ni en BD) ─────────

  setRemoteDraftEntries: (entries = []) => {
    set({
      remoteDraftEntries: entries
        .filter((entry) => entry?.tempId)
        .map((entry) => ({ ...entry, _isRemoteDraft: true, readOnly: true })),
    });
  },

  upsertRemoteDraftEntry: (entry) => {
    if (!entry?.tempId) return;
    const normalized = { ...entry, _isRemoteDraft: true, readOnly: true };
    set((state) => {
      const exists = state.remoteDraftEntries.some((e) => e.tempId === normalized.tempId);
      return {
        remoteDraftEntries: exists
          ? state.remoteDraftEntries.map((e) => (e.tempId === normalized.tempId ? normalized : e))
          : [...state.remoteDraftEntries, normalized],
      };
    });
  },

  removeRemoteDraftEntry: (tempId) => {
    set((state) => ({
      remoteDraftEntries: state.remoteDraftEntries.filter((e) => e.tempId !== tempId),
    }));
  },

  removeRemoteDraftEntries: (tempIds = []) => {
    const ids = new Set(tempIds);
    set((state) => ({
      remoteDraftEntries: state.remoteDraftEntries.filter((e) => !ids.has(e.tempId)),
    }));
  },

  clearRemoteDrafts: () => {
    set({ remoteDraftEntries: [] });
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
