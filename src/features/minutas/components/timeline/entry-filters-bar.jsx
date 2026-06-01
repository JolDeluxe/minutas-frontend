// minutas-frontend\src\features\minutas\components\timeline\entry-filters-bar.jsx

import { useState, useMemo } from 'react';
import { Icon, GlassViewToggle } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { getCatalogos } from '../../constants';

const DEFAULT_FILTER = { tipo: 'TODAS', estado: null, clasificacion: null, area: null, linea: null, search: '' };

export const EntryFiltersBar = ({ 
  activeFilter, 
  onChange, 
  departamento, 
  viewMode, 
  setViewMode,
  isMobile = false,
  allEntries = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);
  const showLineas = catalogos.lineas.length > 0;

  const activeFiltersCount = useMemo(() => {
    return [activeFilter.clasificacion, activeFilter.linea].filter(Boolean).length;
  }, [activeFilter.clasificacion, activeFilter.linea]);

  const hasExternalEntries = useMemo(() => {
    return allEntries.some(entry => {
      const isDescartada = entry.tipo === 'DESCARTADA' || entry.estado === 'DESCARTADA' || entry.estado === 'CANCELADA';
      if (isDescartada) return false;

      return entry.area && (
        ((departamento === 'DISENO' || departamento === 'DISEÑO') && entry.area !== 'DISENO') ||
        (departamento === 'MARKETING' && entry.area !== 'MARKETING')
      );
    });
  }, [allEntries, departamento]);

  const handleClear = () => {
    onChange({ ...DEFAULT_FILTER, tipo: activeFilter.tipo, search: activeFilter.search });
  };

  // --- DISEÑO MÓVIL (Mirror del Directorio) ---
  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
          </div>
          <input
            type="text"
            value={activeFilter.search || ''}
            onChange={(e) => onChange({ ...activeFilter, search: e.target.value })}
            placeholder="Buscar por descripción..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200/70 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400 shadow-inner"
          />
        </div>

        <div className="flex justify-between items-center w-full px-0.5">
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                ...glassBase(isExpanded || activeFiltersCount > 0 ? 'primary' : 'light'),
                borderRadius: 14,
                padding: '7px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="active:scale-95 transition-all outline-none border border-slate-200/50 shadow-sm"
            >
              {(isExpanded || activeFiltersCount > 0) && <GlassSheen />}
              <Icon 
                name="filter_list" 
                size="sm" 
                className={isExpanded || activeFiltersCount > 0 ? "text-white relative z-10" : "text-slate-700 relative z-10"} 
              />
              <span className={cn("text-xs font-bold relative z-10", isExpanded || activeFiltersCount > 0 ? "text-white" : "text-slate-700")}>
                Filtros
              </span>
              {activeFiltersCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-marca-primario text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold z-20 shadow-sm">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {hasExternalEntries && (
              <button
                onClick={() => onChange({ ...activeFilter, onlyExternal: !activeFilter.onlyExternal })}
                style={{
                  ...glassBase(activeFilter.onlyExternal ? 'secondary' : 'light'),
                  borderRadius: 14,
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className={cn(
                  "active:scale-95 transition-all outline-none border shadow-sm",
                  activeFilter.onlyExternal ? "border-marca-primario bg-marca-primario text-white" : "border-marca-primario/15 bg-marca-primario/5 text-marca-primario"
                )}
                title="Ver solo tareas de otros departamentos"
              >
                {activeFilter.onlyExternal && <GlassSheen />}
                <Icon 
                  name="output" 
                  size="sm" 
                  className={activeFilter.onlyExternal ? "text-white relative z-10" : "text-marca-primario relative z-10"} 
                />
                <span className="text-[10px] font-black uppercase tracking-wider relative z-10">Otros Deptos</span>
              </button>
            )}
          </div>
          
          <GlassViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {isExpanded && (
          <div className="p-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl w-full mt-1 animate-in slide-in-from-top-2 duration-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Icon name="tune" size="sm" className="text-marca-secundario" />
                <h3 className="font-bold text-sm text-slate-800">Filtros Avanzados</h3>
              </div>
              <button onClick={handleClear} className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1"><Icon name="clear_all" size="xs" /> Limpiar</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-slate-800 font-semibold">Clasificación</Label>
                <Select value={activeFilter.clasificacion ?? ''} onChange={(e) => onChange({ ...activeFilter, clasificacion: e.target.value || null })}>
                  <option value="">Todas</option>
                  {catalogos.clasificaciones.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </Select>
              </div>
              {showLineas && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-slate-800 font-semibold">Línea</Label>
                  <Select value={activeFilter.linea ?? ''} onChange={(e) => onChange({ ...activeFilter, linea: e.target.value || null })}>
                    <option value="">Todas</option>
                    {catalogos.lineas.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DISEÑO DESKTOP (Mirror del Directorio) ---
  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm mb-1">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
            <Icon name="search" size="18px" className="text-slate-400" />
          </div>
          <input
            type="text"
            value={activeFilter.search || ''}
            onChange={(e) => onChange({ ...activeFilter, search: e.target.value })}
            placeholder="Buscar por descripción..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400 font-medium text-slate-700"
          />
        </div>

        <span className="w-px h-6 bg-slate-200" />

        {hasExternalEntries && (
          <button
            onClick={() => onChange({ ...activeFilter, onlyExternal: !activeFilter.onlyExternal })}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-95",
              activeFilter.onlyExternal
                ? "bg-marca-primario text-white border-marca-primario shadow-md"
                : "border-marca-primario/20 text-marca-primario bg-marca-primario/5 hover:border-marca-primario/30 hover:bg-marca-primario/10"
            )}
            title="Ver solo tareas de otros departamentos"
          >
            <Icon name="output" size="16px" className={activeFilter.onlyExternal ? "text-white animate-pulse" : "text-marca-primario"} />
            <span className="text-xs font-black uppercase tracking-wider">Otros Departamentos</span>
          </button>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-95",
            isExpanded || activeFiltersCount > 0
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
          )}
          title="Filtros Avanzados"
        >
          <Icon name="tune" size="16px" />
          <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className={cn("text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold ml-1", isExpanded ? "bg-white text-slate-900" : "bg-marca-primario text-white")}>
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex-1" />
        <GlassViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {isExpanded && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 w-full mb-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-4 px-1">
            <div className="flex items-center gap-2">
              <Icon name="tune" size="sm" className="text-marca-secundario" />
              <h3 className="font-bold text-sm text-slate-800">Filtros Avanzados</h3>
            </div>
            <button onClick={handleClear} className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"><Icon name="clear_all" size="xs" /> Limpiar Filtros</button>
          </div>

          <div className="grid grid-cols-2 gap-4 px-1">
            <div className="flex flex-col gap-1.5">
              <Label>Clasificación</Label>
              <Select value={activeFilter.clasificacion ?? ''} onChange={(e) => onChange({ ...activeFilter, clasificacion: e.target.value || null })}>
                <option value="">Todas las clasificaciones</option>
                {catalogos.clasificaciones.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </Select>
            </div>
            {showLineas && (
              <div className="flex flex-col gap-1.5">
                <Label>Línea</Label>
                <Select value={activeFilter.linea ?? ''} onChange={(e) => onChange({ ...activeFilter, linea: e.target.value || null })}>
                  <option value="">Todas las líneas</option>
                  {catalogos.lineas.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
