import { useState } from 'react';
import { Button, GlassFab, GlassPaginationPill, GlassViewToggle, ScrollToTopButton, Icon } from '@/components/ui/z_index';
import { MinutasTable } from '../components/minutas-table';
import { MinutaCard } from '../components/minuta-card';
import { MinutasInlineFilters } from '../components/minutas-inline-filters';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

export const MinutasMobile = ({
    minutas,
    loading,
    page,
    limit,
    totalPages,
    totalItems,
    query,
    sortConfig,
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
    const hasPaginator = hasContent && totalPages > 1;

    return (
        <>
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    Minutas
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    Listado y administración de las minutas.
                </p>
            </div>

            <div className="mb-4 flex flex-col gap-3">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon name="search" size="sm" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar minuta..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex justify-between items-center w-full">
                    <button
                        onClick={onToggleFilters}
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
            </div>

            <MinutasInlineFilters 
                isOpen={showFilters} 
                filters={filters} 
                onApplyFilters={onApplyFilters} 
                isMobile={true} 
            />

            {viewMode === 'cards' ? (
                <div className={cn('flex flex-col gap-3 pb-24', hasPaginator && 'pb-36')}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl h-32 animate-pulse" />
                        ))
                    ) : !hasContent ? (
                        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 mt-4 shadow-sm">
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
                <div className={cn('pb-24', hasPaginator && 'pb-36')}>
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
                </div>
            )}

            {hasPaginator && (
                <GlassPaginationPill
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={onPageChange}
                    loading={loading}
                    bottom="80px"
                />
            )}

            <GlassFab
                icon="add"
                onClick={onOpenCreate}
                variant="primary"
                size={56}
                bottom={hasPaginator ? '104px' : '84px'}
                right="20px"
            />
            
            <ScrollToTopButton bottom={hasPaginator ? '104px' : '84px'} left="20px" />
        </>
    );
};
