import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarExpanded: true,
      mobileMenuOpen: false,
      departamentoGlobal: 'DISEÑO',

      toggleSidebar: () => set((state) => ({ 
        sidebarExpanded: !state.sidebarExpanded 
      })),

      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

      openMobileMenu: () => set({ mobileMenuOpen: true }),
      
      closeMobileMenu: () => set({ mobileMenuOpen: false }),

      toggleMobileMenu: () => set((state) => ({ 
        mobileMenuOpen: !state.mobileMenuOpen 
      })),

      setDepartamentoGlobal: (dept) => set({ departamentoGlobal: dept }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        departamentoGlobal: state.departamentoGlobal,
      }),
    }
  )
);