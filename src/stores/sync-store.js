// src/stores/sync-store.js
import { create } from 'zustand';

export const useSyncStore = create((set) => ({
    lastUpdate: Date.now(),
    triggerSync: () => set({ lastUpdate: Date.now() }),
}));

/**
 * Procesamiento de cola de sincronización offline.
 * Stub genérico — se implementará cuando se agreguen features con mutaciones offline.
 */
export const processSyncQueue = async () => {
    // TODO: Implementar sincronización offline para minutas/entradas
    console.log('🔄 processSyncQueue: Sin operaciones pendientes.');
};