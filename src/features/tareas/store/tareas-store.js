// src/features/tareas/store/tareas-store.js
import { create } from 'zustand';

export const useTareasStore = create((set) => ({
    departamento: localStorage.getItem('tareas-departamento') || 'DISENO',
    viewMode: localStorage.getItem('tareas-global-view-mode') || 'cards',
    
    setDepartamento: (dept) => {
        localStorage.setItem('tareas-departamento', dept);
        set({ departamento: dept });
        // Emitir evento global por si componentes nativos o eventos necesitan sincronización
        window.dispatchEvent(new CustomEvent('tareas-departamento-changed', { detail: dept }));
        // Sincronizar también con la sincronización global del sistema
        window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
    },

    setViewMode: (mode) => {
        localStorage.setItem('tareas-global-view-mode', mode);
        set({ viewMode: mode });
    }
}));
