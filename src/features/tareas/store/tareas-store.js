// src/features/tareas/store/tareas-store.js
import { create } from 'zustand';
import { useUIStore } from '../../../stores/ui-store';

export const useTareasStore = create((set) => ({
    departamento: (() => {
        try {
            const savedUi = localStorage.getItem('ui-storage');
            if (savedUi) {
                const parsed = JSON.parse(savedUi);
                if (parsed?.state?.departamentoGlobal === 'MARKETING') return 'MARKETING';
            }
        } catch (e) {
            console.error(e);
        }
        return 'DISENO';
    })(),
    viewMode: localStorage.getItem('tareas-global-view-mode') || (window.innerWidth >= 1024 ? 'table' : 'cards'),
    
    setDepartamento: (dept) => {
        const mappedGlobal = dept === 'DISENO' ? 'DISEÑO' : 'MARKETING';
        // Sincronizar con el UI store global
        useUIStore.getState().setDepartamentoGlobal(mappedGlobal);
        
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

// Suscribirse a cambios en el UI Store global para mantener en sincronía el departamento local de tareas
useUIStore.subscribe((state) => {
    const deptGlobal = state.departamentoGlobal;
    const mapped = deptGlobal === 'DISEÑO' ? 'DISENO' : 'MARKETING';
    if (useTareasStore.getState().departamento !== mapped) {
        useTareasStore.setState({ departamento: mapped });
        window.dispatchEvent(new CustomEvent('tareas-departamento-changed', { detail: mapped }));
    }
});
