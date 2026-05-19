import { create } from 'zustand';
import api from '@/lib/axios';

export const useCatalogosStore = create((set, get) => ({
  catalogos: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  fetchCatalogos: async () => {
    // Si ya los tenemos o estamos cargando, evitamos llamados dobles
    if (get().isInitialized || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/configuracion/catalogos');
      if (response.status === 'success') {
        set({ 
          catalogos: response.data, 
          isLoading: false, 
          isInitialized: true 
        });
      } else {
        throw new Error('Error en formato de respuesta');
      }
    } catch (error) {
      console.error('Error fetching catalogos:', error);
      set({ 
        error: error.message || 'Error al obtener catálogos', 
        isLoading: false 
      });
    }
  },

  // Helper para obtener las lineas disponibles para un departamento
  getLineasPorDepartamento: (departamento) => {
    const { catalogos } = get();
    if (!catalogos || !departamento) return [];
    // Si no está el depto en el catálogo, devolvemos vacío
    return catalogos[departamento]?.lineas || [];
  },

  // Helper para obtener las clasificaciones disponibles para un departamento
  getClasificacionesPorDepartamento: (departamento) => {
    const { catalogos } = get();
    if (!catalogos || !departamento) return [];
    return catalogos[departamento]?.clasificaciones || [];
  }
}));
