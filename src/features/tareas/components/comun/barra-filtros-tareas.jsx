// src/features/tareas/components/hoy/hoy-filter-bar.jsx
import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { 
    TAREA_PRIORIDAD_OPTS, 
    TAREA_LINEA_OPTS, 
    TAREA_CLASIFICACION_OPTS,
    ROLES_ADMIN 
} from '../../constants';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

export const BarraFiltrosTareas = ({
    query,
    onSearchChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroResponsable,
    onResponsableChange,
    opcionesResponsables = [],
    mostrarAtrasadas,
    onToggleAtrasadas,
    totalAtrasadasGlobal = 0,
    currentUser,
    filtroLinea,
    onLineaChange,
    filtroClasificacion,
    onClasificacionChange,
    isMobile = false,
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const [prevQuery, setPrevQuery] = useState(query);
    const [isExpanded, setIsExpanded] = useState(false);

    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    // Sincronización síncrona del query
    if (query !== prevQuery) {
        setLocalValue(query || '');
        setPrevQuery(query);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onSearchChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, query, onSearchChange]);

    const activeFiltersCount = useMemo(() => {
        return [
            filtroPrioridad,
            filtroResponsable,
            filtroLinea,
            filtroClasificacion
        ].filter(Boolean).length;
    }, [filtroPrioridad, filtroResponsable, filtroLinea, filtroClasificacion]);

    const handleClear = () => {
        if (onPrioridadChange) onPrioridadChange('');
        if (onResponsableChange) onResponsableChange('');
        if (onLineaChange) onLineaChange('');
        if (onClasificacionChange) onClasificacionChange('');
    };

    // --- RENDER MÓVIL ---
    if (isMobile) {
        return (
            <div className="w-full flex flex-col gap-2">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon name="search" size="sm" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        placeholder="Buscar por descripción, ID, minuta..."
                        className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200/70 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 focus:border-marca-secundario transition-all placeholder:text-slate-400 shadow-inner h-[38px]"
                    />
                    {localValue && (
                        <button
                            onClick={() => setLocalValue('')}
                            className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer hover:text-slate-600 z-10"
                        >
                            <Icon name="close" size="xs" />
                        </button>
                    )}
                </div>

                <div className="flex justify-between items-center w-full px-0.5 gap-2">
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
                            height: '32px',
                        }}
                        className="active:scale-95 transition-all outline-none border border-slate-200/50 shadow-sm cursor-pointer shrink-0"
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
                            <span className="absolute -top-1.5 -right-1.5 bg-marca-primario text-white border border-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold z-20 shadow-sm">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarAtrasadas}
                            icon={mostrarAtrasadas ? 'close' : 'warning'}
                            size="sm"
                            onClick={onToggleAtrasadas}
                            className={cn(
                                "w-32 justify-center h-[32px] text-[11px] font-bold uppercase shrink-0 border border-slate-200/50",
                                mostrarAtrasadas && "bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-0"
                            )}
                        >
                            Atrasadas
                        </Button>
                        {totalAtrasadasGlobal > 0 && !mostrarAtrasadas && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalAtrasadasGlobal}
                            </span>
                        )}
                    </div>
                </div>

                {isExpanded && (
                    <div className="p-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl w-full mt-1 animate-in slide-in-from-top-2 duration-200 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <Icon name="tune" size="sm" className="text-marca-secundario" />
                                <h3 className="font-bold text-sm text-slate-800">Filtros Avanzados</h3>
                            </div>
                            <button 
                                onClick={handleClear} 
                                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                            >
                                <Icon name="clear_all" size="xs" />
                                Limpiar
                            </button>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Prioridad</label>
                                <SearchableSelect
                                    options={TAREA_PRIORIDAD_OPTS}
                                    value={filtroPrioridad}
                                    onChange={onPrioridadChange}
                                    placeholder="Prioridad..."
                                    icon="flag"
                                    allOptionText="Todas las prioridades"
                                    className="w-full"
                                />
                            </div>
                            {esAdmin && opcionesResponsables.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Responsable</label>
                                    <SearchableSelect
                                        options={opcionesResponsables.map(r => ({ value: String(r.id), label: r.nombre }))}
                                        value={filtroResponsable ? String(filtroResponsable) : ''}
                                        onChange={onResponsableChange}
                                        placeholder="Responsable..."
                                        icon="person"
                                        allOptionText="Cualquier responsable"
                                        className="w-full"
                                    />
                                </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Línea</label>
                                <SearchableSelect
                                    options={TAREA_LINEA_OPTS}
                                    value={filtroLinea}
                                    onChange={onLineaChange}
                                    placeholder="Línea..."
                                    icon="category"
                                    allOptionText="Todas las líneas"
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Clasificación</label>
                                <SearchableSelect
                                    options={TAREA_CLASIFICACION_OPTS}
                                    value={filtroClasificacion}
                                    onChange={onClasificacionChange}
                                    placeholder="Clasificación..."
                                    icon="label"
                                    allOptionText="Todas las clasificaciones"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER ESCRITORIO ---
    return (
        <div className="w-full flex flex-col">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm mb-1">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                        <Icon name="search" size="18px" className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        placeholder="Buscar tarea, minuta, ID…"
                        className="w-full pl-9 pr-8 py-1.5 text-sm bg-transparent focus:outline-none placeholder:text-slate-400 font-medium text-slate-700"
                    />
                    {localValue && (
                        <button
                            onClick={() => setLocalValue('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 cursor-pointer hover:text-slate-600 z-10"
                        >
                            <Icon name="close" size="xs" />
                        </button>
                    )}
                </div>

                <span className="w-px h-6 bg-slate-200" />

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer",
                        isExpanded || activeFiltersCount > 0
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                    )}
                    title="Filtros Avanzados"
                >
                    <Icon name="tune" size="16px" />
                    <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
                    {activeFiltersCount > 0 && (
                        <span className={cn(
                            "text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold ml-1 border",
                            isExpanded ? "bg-white text-slate-900 border-white" : "bg-marca-primario text-white border-transparent"
                        )}>
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                <div className="flex-1" />

                <div className="relative">
                    <Button
                        variant="filtro_gris"
                        isActive={mostrarAtrasadas}
                        icon={mostrarAtrasadas ? 'close' : 'warning'}
                        size="sm"
                        onClick={onToggleAtrasadas}
                        className={cn(
                            "w-34 flex-none justify-center h-[34px] text-[11px] font-bold uppercase border border-slate-200/50",
                            mostrarAtrasadas && "bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-0"
                        )}
                    >
                        Atrasadas
                    </Button>
                    {totalAtrasadasGlobal > 0 && !mostrarAtrasadas && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                            {totalAtrasadasGlobal}
                        </span>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="p-5 bg-white rounded-2xl border border-slate-200 w-full mb-3 mt-2 shadow-sm animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <Icon name="tune" size="sm" className="text-marca-secundario" />
                            <h3 className="font-bold text-sm text-slate-800 tracking-wider">Filtros Avanzados</h3>
                        </div>
                        <button 
                            onClick={handleClear} 
                            className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                        >
                            <Icon name="clear_all" size="xs" /> 
                            Limpiar Filtros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                        {/* Prioridad */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Prioridad</label>
                            <SearchableSelect
                                options={TAREA_PRIORIDAD_OPTS}
                                value={filtroPrioridad}
                                onChange={onPrioridadChange}
                                placeholder="Prioridad..."
                                icon="flag"
                                allOptionText="Todas las prioridades"
                                className="w-full"
                            />
                        </div>

                        {/* Responsable */}
                        {esAdmin && opcionesResponsables.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Responsable</label>
                                <SearchableSelect
                                    options={opcionesResponsables.map(r => ({ value: String(r.id), label: r.nombre }))}
                                    value={filtroResponsable ? String(filtroResponsable) : ''}
                                    onChange={onResponsableChange}
                                    placeholder="Responsable..."
                                    icon="person"
                                    allOptionText="Cualquier responsable"
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Línea */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Línea</label>
                            <SearchableSelect
                                options={TAREA_LINEA_OPTS}
                                value={filtroLinea}
                                onChange={onLineaChange}
                                placeholder="Línea..."
                                icon="category"
                                allOptionText="Todas las líneas"
                                className="w-full"
                            />
                        </div>

                        {/* Clasificación */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Clasificación</label>
                            <SearchableSelect
                                options={TAREA_CLASIFICACION_OPTS}
                                value={filtroClasificacion}
                                onChange={onClasificacionChange}
                                placeholder="Clasificación..."
                                icon="label"
                                allOptionText="Todas las clasificaciones"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
