import { useState } from 'react';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { Button, Icon, GlassViewToggle } from '@/components/ui/z_index';

export const MinutasDesktop = ({
    minutas,
    loading,
    page,
    limit,
    totalPages,
    totalItems,
    sortConfig,
    query,
    onPageChange,
    onSortChange,
    onSearchChange,
    onViewDetail,
    onOpenCreate,
    onEdit,
    filters,
    showFilters,
    onToggleFilters,
    onApplyFilters,
    activeFiltersCount,
}) => {
    const [viewMode, setViewMode] = useState('cards');
    const hasContent = !loading && minutas.length > 0;

    return (
        <div className="flex flex-col gap-4 relative">
            
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                        Minutas
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Listado y administración de las minutas y reuniones.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                    
                    <div className="relative w-64">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Icon name="search" size="sm" className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar minuta..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <Button
                        variant={activeFiltersCount > 0 ? "marca" : "neutro"}
                        icon="filter_list"
                        onClick={onToggleFilters}
                        className="relative"
                    >
                        Filtros
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-marca-primario text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>

                    <Button
                        variant="guardar"
                        icon="add"
                        onClick={onOpenCreate}
                    >
                        Nueva Minuta
                    </Button>
                </div>
            </div>

            <MinutasInlineFilters 
                isOpen={showFilters} 
                filters={filters} 
                onApplyFilters={onApplyFilters} 
                isMobile={false} 
            />

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl h-32 animate-pulse" />
                        ))
                    ) : !hasContent ? (
                        <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200 mt-4 shadow-sm">
                            <Icon name="event_note" className="text-slate-200 text-5xl mb-3" />
                            <p className="text-slate-500 text-sm font-medium">No se encontraron minutas.</p>
                        </div>
                    ) : (
                        minutas.map(minuta => (
                            <MinutaCard 
                                key={minuta.id} 
                                minuta={minuta} 
                                onViewDetail={onViewDetail}
                                onEdit={onEdit} 
                            />
                        ))
                    )}
                </div>
            ) : (
                <MinutasTable
                    minutas={minutas}
                    loading={loading}
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    sortConfig={sortConfig}
                    onPageChange={onPageChange}
                    onSortChange={onSortChange}
                    onViewDetail={onViewDetail}
                    onEdit={onEdit}
                />
            )}
        </div>
    );
};
