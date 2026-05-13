import { useState } from 'react';
import { GlassPaginationPill, GlassViewToggle, ScrollToTopButton, Icon } from '@/components/ui/z_index';
import { TareasTable } from '../components/historico/tareas-table';
import { TareaCard } from '../components/common/tarea-card';
import { TareaSummaryBar } from '../components/common/tarea-summary-bar';
import { TareaFilterBar } from '../components/common/tarea-filter-bar';

export const TareasMobile = ({
    tareas,
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
    onEdit,
    onOrganize,
}) => {
    const [viewMode, setViewMode] = useState('cards');
    const hasContent = !loading && tareas.length > 0;
    const hasPaginator = hasContent && totalPages > 1;

    return (
        <>
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    Todas las Entradas
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    Vista global de entradas.
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
                        placeholder="Buscar entrada..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex justify-end">
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {viewMode === 'cards' ? (
                <div className={cn('flex flex-col gap-3 pb-24', hasPaginator && 'pb-36')}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl h-32 animate-pulse" />
                        ))
                    ) : !hasContent ? (
                        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 mt-4 shadow-sm">
                            <Icon name="assignment" className="text-slate-200 text-5xl mb-3" />
                            <p className="text-slate-500 text-sm font-medium">No se encontraron entradas.</p>
                        </div>
                    ) : (
                        tareas.map(tarea => (
                            <TareaCard 
                                key={tarea.id} 
                                tarea={tarea} 
                                onViewDetail={onViewDetail}
                                onOrganize={onOrganize}
                                onEdit={onEdit} 
                            />
                        ))
                    )}
                </div>
            ) : (
                <div className={cn('pb-24', hasPaginator && 'pb-36')}>
                    <TareasTable
                        tareas={tareas}
                        loading={loading}
                        page={page}
                        limit={limit}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        sortConfig={sortConfig}
                        onPageChange={onPageChange}
                        onSortChange={onSortChange}
                        onViewDetail={onViewDetail}
                        onOrganize={onOrganize}
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
            
            <ScrollToTopButton bottom={hasPaginator ? '104px' : '84px'} left="20px" />
        </>
    );
};