import { Icon, GlassViewToggle } from '@/components/ui/z_index';

export const PoliticasFiltros = ({
  filters,
  setFilters,
  viewMode,
  onViewChange,
  isMobile = false
}) => {
  const toggleOptions = [
    { id: 'cards', label: 'Tarjetas', icon: 'grid_view' },
    { id: 'table', label: 'Tabla', icon: 'table_rows' }
  ];

  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2 mb-2">
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
        <div className="flex justify-end items-center w-full px-0.5">
          <GlassViewToggle 
            value={viewMode} 
            onChange={onViewChange} 
            options={toggleOptions}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mb-1">
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
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
        <div className="flex-1" />
        <GlassViewToggle 
          value={viewMode} 
          onChange={onViewChange} 
          options={toggleOptions}
        />
      </div>
    </div>
  );
};
