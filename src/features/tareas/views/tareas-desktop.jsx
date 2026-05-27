import { useState } from 'react';
import { TareasTable } from '../components/tareas-table';
import { TareaCard } from '../components/tarea-card';
import { Button, Icon, GlassViewToggle } from '@/components/ui/z_index';

export const TareasDesktop = ({
    tareas,
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
    onEdit,
    onOrganize,
}) => {
    const [viewMode, setViewMode] = useState('cards');
    const hasContent = !loading && tareas.length > 0;

    return (
        <div className="flex flex-col gap-4 relative">
            
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                        Todas las Tareas
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Vista global de todas las tareas y acuerdos del sistema.
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
                            placeholder="Buscar tarea..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl h-32 animate-pulse" />
                        ))
                    ) : !hasContent ? (
                        <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200 mt-4 shadow-sm">
                            <Icon name="assignment" className="text-slate-200 text-5xl mb-3" />
                            <p className="text-slate-500 text-sm font-medium">No se encontraron tareas.</p>
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
                    onEdit={onEdit}
                    onOrganize={onOrganize}
                />
            )}
        </div>
    );
};