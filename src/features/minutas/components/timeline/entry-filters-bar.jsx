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

  // --- DISEÑO DESKTOP (Foto 3 y 4) ---
  return (
    <div className="w-full flex flex-col mb-2">
      {/* Barra Principal Blanca Fina */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
            <Icon name="search" size="18px" className="text-slate-400" />
          </div>
          <input
            type="text"
            value={activeFilter.search || ''}
            onChange={(e) => onChange({ ...activeFilter, search: e.target.value })}
            placeholder="Buscar por ID, Título o Tema..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <span className="w-px h-6 bg-slate-200" />

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          title="Filtros Avanzados"
        >
          <Icon name="tune" size="16px" />
          <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="bg-marca-primario text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold ml-1">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex-1" /> {/* Spacer */}
        
        <GlassViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Panel Expansible de Filtros Avanzados */}
      {isExpanded && (
        <div className="p-4 md:p-5 bg-white border border-slate-200 rounded-2xl w-full mb-4 mt-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Icon name="tune" size="sm" className="text-marca-secundario" />
              <h3 className="font-bold text-sm text-slate-800">Filtros Avanzados</h3>
            </div>
            <button 
              onClick={handleClear}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Icon name="clear_all" size="xs" />
              Limpiar Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Clasificación</Label>
              <Select
                value={activeFilter.clasificacion ?? ''}
                onChange={(e) => onChange({ ...activeFilter, clasificacion: e.target.value || null })}
                onClear={activeFilter.clasificacion ? () => onChange({ ...activeFilter, clasificacion: null }) : undefined}
              >
                <option value="">Todas las clasificaciones</option>
                {catalogos.clasificaciones.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>

            {showLineas && (
              <div className="flex flex-col gap-1.5">
                <Label>Línea</Label>
                <Select
                  value={activeFilter.linea ?? ''}
                  onChange={(e) => onChange({ ...activeFilter, linea: e.target.value || null })}
                  onClear={activeFilter.linea ? () => onChange({ ...activeFilter, linea: null }) : undefined}
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