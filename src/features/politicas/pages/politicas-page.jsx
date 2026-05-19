// src/features/politicas/pages/politicas-page.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCatalogosStore } from '@/stores/catalogos-store';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { TAREA_AREA_OPTS } from '@/features/tareas/constants';
import { notify } from '@/components/notification/adaptive-notify';

const PoliticasPage = () => {
  const { user } = useAuthStore();
  const currentUser = user?.data ?? user;
  const userDepto = currentUser?.departamento;

  const { catalogos, fetchCatalogos, getLineasPorDepartamento } = useCatalogosStore();

  const {
    tareas,
    loading,
    fetchTareas,
    deleteTarea
  } = useTareas();

  // ── Filtros locales ──
  const [selectedLinea, setSelectedLinea] = useState('TODOS');
  const [selectedArea, setSelectedArea] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar catálogos al inicio
  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  // Carga de Políticas (Tareas con clasificacion = 'POLITICAS')
  const loadPoliticas = useCallback(() => {
    const params = {
      clasificacion: 'POLITICAS',
      todo: true
    };

    if (searchQuery) params.q = searchQuery;
    if (selectedLinea !== 'TODOS') params.linea = selectedLinea;
    if (selectedArea !== 'TODOS') params.area = selectedArea;

    fetchTareas(params).catch(() => notify.error('Error al cargar las políticas.'));
  }, [selectedLinea, selectedArea, searchQuery, fetchTareas]);

  useEffect(() => {
    loadPoliticas();
  }, [loadPoliticas]);

  // Obtener líneas dinámicas del departamento
  const lineasDisponibles = userDepto ? getLineasPorDepartamento(userDepto) : [];

  // Filtrar áreas que correspondan al depto (en Diseño se usan áreas primarias, en Marketing se usan las de Marketing)
  const areasDisponibles = userDepto === 'MARKETING'
    ? [{ value: 'MARKETING', label: 'Marketing' }]
    : TAREA_AREA_OPTS;

  const handleDeletePolicy = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta política permanente?')) {
      try {
        await deleteTarea(id);
        notify.success('Política eliminada correctamente.');
        // Disparar evento global de sincronización
        window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
      } catch {
        notify.error('Error al eliminar la política.');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="fuente-titulos text-3xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="material-symbols-rounded text-brand text-4xl">gavel</span>
            Políticas y Lineamientos
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Políticas y lineamientos permanentes del departamento de{' '}
            <span className="text-brand font-semibold">{userDepto || 'Global'}</span>
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-marca-secundario/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-lg">
        {/* Búsqueda */}
        <div className="flex flex-col">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
            Buscar Lineamiento
          </label>
          <div className="relative">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-brand/50 transition"
            />
          </div>
        </div>

        {/* Filtrar por Línea */}
        {lineasDisponibles.length > 0 && (
          <div className="flex flex-col">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
              Filtrar por Línea
            </label>
            <select
              value={selectedLinea}
              onChange={(e) => setSelectedLinea(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand/50 transition appearance-none cursor-pointer"
            >
              <option value="TODOS">Todas las Líneas</option>
              {lineasDisponibles.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtrar por Área */}
        <div className="flex flex-col">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
            Filtrar por Área
          </label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand/50 transition appearance-none cursor-pointer"
          >
            <option value="TODOS">Todas las Áreas</option>
            {areasDisponibles.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenido / Listado */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 animate-pulse">Cargando políticas departamentales...</p>
        </div>
      ) : tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-black/20 rounded-2xl border border-dashed border-white/10 p-6">
          <span className="material-symbols-rounded text-white/20 text-6xl mb-3">gavel</span>
          <h3 className="text-white font-semibold text-lg">No se encontraron políticas</h3>
          <p className="text-white/40 text-sm mt-1 max-w-sm">
            No existen políticas o lineamientos registrados que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tareas.map((p) => (
            <div
              key={p.id}
              className="bg-marca-secundario/30 border border-white/10 hover:border-brand/35 rounded-xl p-5 shadow-lg relative group transition duration-300 flex flex-col justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(30,41,59,0.3) 0%, rgba(15,23,42,0.5) 100%)',
              }}
            >
              {/* Badge decorativa superior */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-brand/10 text-brand px-2.5 py-1 rounded-full border border-brand/20">
                  Política Activa
                </span>
                
                {/* Botón Eliminar en Hover */}
                <button
                  onClick={() => handleDeletePolicy(p.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition duration-200"
                  title="Eliminar política"
                >
                  <span className="material-symbols-rounded text-sm">delete</span>
                </button>
              </div>

              {/* Contenido principal */}
              <div className="flex-1 space-y-3">
                <p className="text-white text-base leading-relaxed font-medium">
                  "{p.descripcion}"
                </p>
              </div>

              {/* Footer con Metadatos */}
              <div className="border-t border-white/5 pt-4 mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/40">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-rounded text-xs">category</span>
                  <span>Área: {TAREA_AREA_OPTS.find(a => a.value === p.area)?.label || p.area}</span>
                </div>
                {p.linea && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-xs">navigation</span>
                    <span>Línea: {p.linea}</span>
                  </div>
                )}
                {p.minuta && (
                  <div className="col-span-2 flex items-center gap-1 mt-1 text-white/30">
                    <span className="material-symbols-rounded text-xs">event</span>
                    <span>Acordada en: {p.minuta.titulo}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoliticasPage;
