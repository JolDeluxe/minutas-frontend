import { Icon } from '@/components/ui/icon';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { AREA_MAP, LINEAS_POR_AREA } from '@/features/minutas/constants';

/**
 * PoliticasFiltros — Filtros para buscar políticas por texto, área y línea dependiente.
 * Soporta layouts responsive (Desktop y Mobile).
 */
export const PoliticasFiltros = ({
  filters,
  setFilters,
  viewMode,
  onViewChange,
  isMobile = false,
}) => {
  const toggleOptions = [
    { id: 'cards', label: 'Tarjetas', icon: 'grid_view' },
    { id: 'table', label: 'Tabla', icon: 'table_rows' },
  ];

  // Líneas del área actualmente seleccionada en el filtro
  const lineasDelArea = filters.area ? LINEAS_POR_AREA[filters.area] ?? [] : [];

  // ── RENDER MÓVIL ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2 mb-2">
        {/* Barra de búsqueda */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            placeholder="Buscar política..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200/70 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400 shadow-inner"
          />
        </div>

        {/* Select de Área (Mobile) */}
        <div className="relative w-full">
          <select
            value={filters.area || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                area: e.target.value || undefined,
                linea: undefined, // Resetear línea dependiente al cambiar área
                page: 1,
              })
            }
            className="w-full bg-white border border-slate-200/70 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold text-slate-600 focus:outline-none appearance-none h-11"
          >
            <option value="">Todas las Áreas</option>
            {Object.entries(AREA_MAP).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Icon name="expand_more" size="14px" />
          </div>
        </div>

        {/* Select de Línea — Solo visible si el área tiene líneas (Mobile) */}
        {lineasDelArea.length > 0 && (
          <div className="relative w-full animate-in fade-in slide-in-from-top-1 duration-200">
            <select
              value={filters.linea || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  linea: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-full bg-white border border-slate-200/70 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold text-slate-600 focus:outline-none appearance-none h-11"
            >
              <option value="">Todas las Líneas</option>
              {lineasDelArea.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Icon name="expand_more" size="14px" />
            </div>
          </div>
        )}

        {/* Toggle de Vista */}
        <div className="flex justify-end items-center w-full px-0.5 mt-1">
          <GlassViewToggle value={viewMode} onChange={onViewChange} options={toggleOptions} />
        </div>
      </div>
    );
  }

  // ── RENDER ESCRITORIO ────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col mb-1">
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
            <Icon name="search" size="18px" className="text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            placeholder="Buscar política por descripción o ID..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400 font-medium text-slate-700"
          />
        </div>

        {/* Separador visual */}
        <div className="h-6 w-px bg-slate-200 my-auto mx-1" />

        {/* Controles de Filtrado en Cascada (Desktop) */}
        <div className="flex items-center gap-2">
          {/* Select de Área */}
          <div className="relative">
            <select
              value={filters.area || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  area: e.target.value || undefined,
                  linea: undefined, // Resetear línea al cambiar área
                  page: 1,
                })
              }
              className="text-[11px] font-bold border border-slate-200 rounded-xl pl-3 pr-7 py-1.5
                bg-slate-50 hover:bg-slate-100 focus:outline-none text-slate-600 cursor-pointer
                appearance-none transition-all h-8 min-w-[130px]"
            >
              <option value="">Todas las Áreas</option>
              {Object.entries(AREA_MAP).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Icon name="expand_more" size="12px" />
            </div>
          </div>

          {/* Select de Línea */}
          {lineasDelArea.length > 0 && (
            <div className="relative animate-in fade-in slide-in-from-left-2 duration-200">
              <select
                value={filters.linea || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    linea: e.target.value || undefined,
                    page: 1,
                  })
                }
                className="text-[11px] font-bold border border-slate-200 rounded-xl pl-3 pr-7 py-1.5
                  bg-slate-50 hover:bg-slate-100 focus:outline-none text-slate-600 cursor-pointer
                  appearance-none transition-all h-8 min-w-[130px]"
              >
                <option value="">Todas las Líneas</option>
                {lineasDelArea.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="expand_more" size="12px" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Vista Toggle */}
        <GlassViewToggle value={viewMode} onChange={onViewChange} options={toggleOptions} />
      </div>
    </div>
  );
};
