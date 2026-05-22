// minutas-frontend\src\features\minutas\components\timeline\entry-filters-bar.jsx

import { useState, useMemo } from 'react';
import { Icon, GlassViewToggle } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { getCatalogos } from '../../constants';

const DEFAULT_FILTER = { tipo: 'TAREA', estado: null, clasificacion: null, area: null, linea: null, search: '' };

export const EntryFiltersBar = ({ 
  activeFilter, 
  onChange, 
  departamento, 
  viewMode, 
  setViewMode,
  isMobile = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);
  const showLineas = catalogos.lineas.length > 0;

  // Contador real de filtros avanzados activos
  const activeFiltersCount = useMemo(() => {
    return [activeFilter.clasificacion, activeFilter.linea].filter(Boolean).length;
  }, [activeFilter.clasificacion, activeFilter.linea]);

  const handleClear = () => {
    onChange({ ...DEFAULT_FILTER, tipo: activeFilter.tipo, search: activeFilter.search });
  };

  // --- DISEÑO MÓVIL (Foto 1 y 2) ---
  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2 mb-3">
        {/* Buscador Mobile Idéntico a Minutas */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
          </div>
          <input
            type="text"
            value={activeFilter.search || ''}
            onChange={(e) => onChange({ ...activeFilter, search: e.target.value })}
            placeholder="Buscar por ID, Título o Tema..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Fila de Botones Acciones */}
        <div className="flex justify-between items-center w-full">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              ...glassBase(activeFiltersCount > 0 ? 'primary' : 'light'),
              borderRadius: 14,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="active:scale-95 transition-all outline-none"
          >
            {activeFiltersCount > 0 && <GlassSheen />}
            <Icon 
              name="filter_list" 
              size="sm" 
              className={activeFiltersCount > 0 ? "text-white relative z-10" : "text-slate-700 relative z-10"} 
            />
            <span className={cn("text-xs font-bold relative z-10", activeFiltersCount > 0 ? "text-white" : "text-slate-700")}>
              Filtros
            </span>
            {activeFiltersCount > 0 && (
              <span className="absolute top-1 right-1 bg-white text-marca-primario text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold z-20 shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <GlassViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* Panel Expansible en Mobile (Liquid Glass Surface) */}
        {isExpanded && (
          <div 
            className="p-4 rounded-2xl w-full mb-4 overflow-hidden mt-1 animate-in slide-in-from-top-2 duration-200"
            style={glassBase('surface')}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Icon name="tune" size="sm" className="text-marca-secundario" />
                <h3 className="font-bold text-sm text-slate-800">Filtros Avanzados</h3>
              </div>
              <button 
                onClick={handleClear}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <Icon name="clear_all" size="xs" />
                Limpiar Filtros
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-slate-800">Clasificación</Label>
                <Select
                  value={activeFilter.clasificacion ?? ''}
                  onChange={(e) => onChange({ ...activeFilter, clasificacion: e.target.value || null })}
                  className="bg-white/70 backdrop-blur-sm"
                >
                  <option value="">Todas las clasificaciones</option>
                  {catalogos.clasificaciones.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>

              {showLineas && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-slate-800">Línea</Label>
                  <Select
                    value={activeFilter.linea ?? ''}
                    onChange={(e) => onChange({ ...activeFilter, linea: e.target.value || null })}
                    className="bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">Todas las líneas</option>
                    {catalogos.lineas.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DISEÑO DESKTOP (>= 768px) ---
  return (
    <div className="w-full flex flex-col">
      {/* Barra Principal Minimalista y Compacta */}
      <div className="flex items-center gap-2 lg:gap-4 px-1 py-1">
        {/* Buscador de estilo limpio - Ancho dinámico */}
        <div className="relative flex-1 min-w-[140px] max-w-[180px] lg:max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
            <Icon name="search" size="18px" className="text-slate-400 group-focus-within:text-marca-primario transition-colors" />
          </div>
          <input
            type="text"
            value={activeFilter.search || ''}
            onChange={(e) => onChange({ ...activeFilter, search: e.target.value })}
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-slate-100/50 hover:bg-slate-100 border border-transparent focus:border-marca-primario/20 focus:bg-white rounded-xl transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Botón Filtros Avanzados Compacto */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 border shrink-0",
            isExpanded || activeFiltersCount > 0
              ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
              : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700"
          )}
        >
          <Icon name="tune" size="14px" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="ml-0.5 bg-marca-primario text-white w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px]">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex-1" />
        
        <div className="flex-none shrink-0">
          <GlassViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Panel Expansible de Filtros Avanzados - Estilo Premium */}
      {isExpanded && (
        <div className="p-6 bg-white rounded-3xl border border-slate-100 w-full mt-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] animate-in slide-in-from-top-3 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-marca-secundario/10 flex items-center justify-center text-marca-secundario">
                <Icon name="filter_alt" size="20px" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Filtros Avanzados</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Segmenta los temas de la junta</p>
              </div>
            </div>
            <button 
              onClick={handleClear}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2"
            >
              <Icon name="backspace" size="14px" />
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Clasificación del Tema</Label>
              <Select
                value={activeFilter.clasificacion ?? ''}
                onChange={(e) => onChange({ ...activeFilter, clasificacion: e.target.value || null })}
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:bg-white"
              >
                <option value="">Todas las clasificaciones</option>
                {catalogos.clasificaciones.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>

            {showLineas && (
              <div className="flex flex-col gap-2">
                <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Línea de Producto</Label>
                <Select
                  value={activeFilter.linea ?? ''}
                  onChange={(e) => onChange({ ...activeFilter, linea: e.target.value || null })}
                  className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 focus:bg-white"
                >
                  <option value="">Todas las líneas</option>
                  {catalogos.lineas.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};