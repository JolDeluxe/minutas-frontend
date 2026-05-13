// src/features/tareas/components/tarea-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { TAREA_PRIORIDAD_OPTS } from '../../constants';
import { AREA_MAP, LINEA_MAP } from '../../../minutas/constants';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const AREA_OPTS = Object.entries(AREA_MAP).map(([val, label]) => ({ value: val, label }));
const LINEA_OPTS = Object.entries(LINEA_MAP).map(([val, info]) => ({ value: val, label: info.label }));

export const TareaFilterBar = ({
    filters,
    onFilterChange,
    showViewToggle = true,
    viewMode = 'table',
    onViewModeChange,
    isAdmin = false,
}) => {
    const isDesktop = useIsDesktop();
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const [prevSearch, setPrevSearch] = useState(filters.search);

    // Sincronización síncrona durante el renderizado
    if (filters.search !== prevSearch) {
        setLocalSearch(filters.search || '');
        setPrevSearch(filters.search);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.search) {
                onFilterChange({ search: localSearch });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, filters.search, onFilterChange]);

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Top row: Search and View Toggle */}
            <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon name="search" size="sm" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Buscar por descripción, ID o responsable..."
                        className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-primario/20 focus:border-marca-primario transition-all shadow-sm"
                    />
                    {localSearch && (
                        <button onClick={() => setLocalSearch('')} className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
                            <Icon name="close" size="xs" />
                        </button>
                    )}
                </div>

                {showViewToggle && isDesktop && (
                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button 
                            onClick={() => onViewModeChange('table')}
                            className={`p-1.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Icon name="table_rows" size="20px" />
                        </button>
                        <button 
                            onClick={() => onViewModeChange('grid')}
                            className={`p-1.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-marca-primario shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Icon name="grid_view" size="20px" />
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom row: Selectors */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="w-40">
                    <SearchableSelect 
                        options={TAREA_PRIORIDAD_OPTS}
                        value={filters.prioridad}
                        onChange={(val) => onFilterChange({ prioridad: val })}
                        placeholder="Prioridad..."
                        icon="flag"
                        allOptionText="Todas las prioridades"
                        className="rounded-2xl h-10 shadow-sm"
                    />
                </div>

                {isAdmin && (
                    <>
                        <div className="w-48">
                            <SearchableSelect 
                                options={AREA_OPTS}
                                value={filters.area}
                                onChange={(val) => onFilterChange({ area: val })}
                                placeholder="Área..."
                                icon="business"
                                allOptionText="Todas las áreas"
                                className="rounded-2xl h-10 shadow-sm"
                            />
                        </div>
                        <div className="w-44">
                            <SearchableSelect 
                                options={LINEA_OPTS}
                                value={filters.linea}
                                onChange={(val) => onFilterChange({ linea: val })}
                                placeholder="Línea..."
                                icon="category"
                                allOptionText="Todas las líneas"
                                className="rounded-2xl h-10 shadow-sm"
                            />
                        </div>
                    </>
                )}

                {/* Historico specialized filters could go here (Dates) */}
                {filters.showDates && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-1.5 shadow-sm">
                        <Icon name="calendar_today" size="xs" className="text-slate-400" />
                        <input 
                            type="date" 
                            value={filters.startDate || ''} 
                            onChange={(e) => onFilterChange({ startDate: e.target.value })}
                            className="text-xs font-bold text-slate-600 focus:outline-none"
                        />
                        <span className="text-slate-300">/</span>
                        <input 
                            type="date" 
                            value={filters.endDate || ''} 
                            onChange={(e) => onFilterChange({ endDate: e.target.value })}
                            className="text-xs font-bold text-slate-600 focus:outline-none"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
