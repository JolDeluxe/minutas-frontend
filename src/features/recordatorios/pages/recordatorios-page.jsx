// src/features/recordatorios/pages/recordatorios-page.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCatalogosStore } from '@/stores/catalogos-store';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { TAREA_AREA_OPTS } from '@/features/tareas/constants';
import { notify } from '@/components/notification/adaptive-notify';

const RecordatoriosPage = () => {
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

  // Carga de Recordatorios Generales (Políticas)
  const loadRecordatorios = useCallback(() => {
    const params = {
      tipo: 'POLITICA',
      todo: true
    };

    if (searchQuery) params.q = searchQuery;
    if (selectedLinea !== 'TODOS') params.linea = selectedLinea;
    if (selectedArea !== 'TODOS') params.area = selectedArea;

    fetchTareas(params).catch(() => notify.error('Error al cargar los recordatorios.'));
  }, [selectedLinea, selectedArea, searchQuery, fetchTareas]);

  useEffect(() => {
    loadRecordatorios();
  }, [loadRecordatorios]);

  // Obtener líneas dinámicas del departamento
  const lineasDisponibles = userDepto ? getLineasPorDepartamento(userDepto) : [];

  // Filtrar áreas que correspondan al depto (en Diseño se usan áreas primarias, en Marketing se usan las de Marketing)
  const areasDisponibles = userDepto === 'MARKETING'
    ? [{ value: 'MARKETING', label: 'Marketing' }]
    : TAREA_AREA_OPTS;

  const handleDeleteReminder = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este recordatorio/acuerdo general?')) {
      try {
        await deleteTarea(id);
        notify.success('Recordatorio eliminado correctamente.');
        // Disparar evento global de sincronización
        window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
      } catch {
        notify.error('Error al eliminar el recordatorio.');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="fuente-titulos text-3xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="material-symbols-rounded text-amber-500 text-4xl">push_pin</span>
            Mural de Recordatorios
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Acuerdos y notas de recordatorio general del departamento de{' '}
            <span className="text-amber-400 font-semibold">{userDepto || 'Global'}</span>
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-marca-secundario/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-lg">
        {/* Búsqueda */}
        <div className="flex flex-col">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
            Buscar Recordatorio
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
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 animate-pulse">Cargando recordatorios departamentales...</p>
        </div>
      ) : tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-black/20 rounded-2xl border border-dashed border-white/10 p-6">
          <span className="material-symbols-rounded text-white/20 text-6xl mb-3">push_pin</span>
          <h3 className="text-white font-semibold text-lg">Mural de Recordatorios Vacío</h3>
          <p className="text-white/40 text-sm mt-1 max-w-sm">
            No existen acuerdos o notas de recordatorio registrados que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tareas.map((r) => (
            <div
              key={r.id}
              className="bg-marca-secundario/30 border border-amber-500/10 hover:border-amber-500/40 rounded-xl p-5 shadow-lg relative group transition duration-300 flex flex-col justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(45,35,15,0.4) 0%, rgba(15,15,15,0.5) 100%)',
              }}
            >
              {/* Badge decorativa superior */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Recordatorio General
                </span>
                
                {/* Botón Eliminar en Hover */}
                <button
                  onClick={() => handleDeleteReminder(r.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition duration-200"
                  title="Eliminar recordatorio"
                >
                  <span className="material-symbols-rounded text-sm">delete</span>
                </button>
              </div>

              {/* Contenido principal */}
              <div className="flex-1 space-y-3">
                <p className="text-white text-base leading-relaxed font-medium">
                  "{r.descripcion}"
                </p>
              </div>

              {/* Footer con Metadatos */}
              <div className="border-t border-white/5 pt-4 mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/40">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-rounded text-[10px]">category</span>
                  <span>Área: {TAREA_AREA_OPTS.find(a => a.value === r.area)?.label || r.area}</span>
                </div>
                {r.linea && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-[10px]">navigation</span>
                    <span>Línea: {r.linea}</span>
                  </div>
                )}
                {r.minuta && (
                  <div className="col-span-2 flex items-center gap-1 mt-1 text-white/30">
                    <span className="material-symbols-rounded text-[10px]">event</span>
                    <span>Acordado en: {r.minuta.titulo}</span>
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

export default RecordatoriosPage;
