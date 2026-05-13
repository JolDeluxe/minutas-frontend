// src/features/tareas/views/tareas-mobile-view.jsx
import { TareaSummaryBar } from '../components/common/tarea-summary-bar';
import { TareaFilterBar } from '../components/common/tarea-filter-bar';
import { TareaCardGrid } from '../components/hoy/tarea-card-grid';
import { Icon, Button } from '@/components/ui/z_index';
import { ROLES_ADMIN } from '../constants';
import { TareasLayoutMobile } from './tareas-layout-mobile';

export const TareasMobileView = ({
    tareas,
    loading,
    page,
    totalPages,
    totalItems,
    filters,
    onFilterChange,
    onDetail,
    submodule,
    user,
}) => {
    const isAdmin = ROLES_ADMIN.has(user?.rol);

    return (
        <div className="flex flex-col gap-4 pb-24">
            <TareasLayoutMobile />

            {/* Metrics - Scrollable */}
            <div className="px-4">
                <TareaSummaryBar 
                    total={totalItems}
                    activeStatus={filters.status}
                    onStatusChange={(status) => onFilterChange({ status })}
                    loading={loading}
                />
            </div>

            {/* Simple Search for Mobile */}
            <div className="px-4">
                 <TareaFilterBar 
                    filters={{ ...filters, showDates: submodule === 'historico' }}
                    onFilterChange={onFilterChange}
                    showViewToggle={false}
                    isAdmin={isAdmin}
                />
            </div>

            {/* Cards - Mobile always uses grid/list */}
            <div className="px-4">
                {loading && tareas.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <TareaCardGrid 
                        tareas={tareas} 
                        onDetail={onDetail} 
                    />
                )}
            </div>

            {/* Load More instead of pagination for better mobile feel */}
            {page < totalPages && (
                <div className="px-4 pt-4">
                    <Button 
                        variant="outline" 
                        className="w-full py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest border-2"
                        onClick={() => onFilterChange({ page: page + 1 })}
                        isLoading={loading}
                    >
                        Cargar más entradas
                    </Button>
                </div>
            )}
        </div>
    );
};
