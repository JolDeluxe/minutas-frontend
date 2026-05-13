// src/features/tareas/views/tareas-desktop-view.jsx
import { TareaSummaryBar } from '../components/common/tarea-summary-bar';
import { TareaFilterBar } from '../components/common/tarea-filter-bar';
import { TareaTableView } from '../components/historico/tarea-table-view';
import { TareaCardGrid } from '../components/hoy/tarea-card-grid';
import { Pagination } from '@/components/ui/z_index';
import { ROLES_ADMIN } from '../constants';
import { TareasLayoutDesktop } from './tareas-layout-desktop';

export const TareasDesktopView = ({
    tareas,
    loading,
    page,
    totalPages,
    totalItems,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    onDetail,
    submodule,
    user,
}) => {
    const isAdmin = ROLES_ADMIN.has(user?.rol);
    
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Local Layout / Navigation */}
            <TareasLayoutDesktop />

            {/* Metrics */}
            <TareaSummaryBar 
                total={totalItems}
                activeStatus={filters.status}
                onStatusChange={(status) => onFilterChange({ status })}
                loading={loading}
            />

            {/* Search & Filters */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
                <TareaFilterBar 
                    filters={{ ...filters, showDates: submodule === 'historico' }}
                    onFilterChange={onFilterChange}
                    viewMode={viewMode}
                    onViewModeChange={onViewModeChange}
                    isAdmin={isAdmin}
                />
            </div>

            {/* Content View */}
            <div className="min-h-[400px]">
                {viewMode === 'table' ? (
                    <TareaTableView 
                        tareas={tareas} 
                        onDetail={onDetail} 
                    />
                ) : (
                    <TareaCardGrid 
                        tareas={tareas} 
                        onDetail={onDetail} 
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center pb-12">
                <Pagination 
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => onFilterChange({ page: p })}
                />
            </div>
        </div>
    );
};
