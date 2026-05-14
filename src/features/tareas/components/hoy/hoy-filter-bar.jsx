// src/features/tareas/components/hoy/hoy-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { 
    TAREA_PRIORIDAD_OPTS, 
    TAREA_LINEA_OPTS, 
    TAREA_CLASIFICACION_OPTS,
    ROLES_ADMIN 
} from '../../constants';
import { cn } from '@/utils/cn';

const SearchInput = ({ localValue, onChange, onClear, className = 'w-full' }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar tarea, minuta, ID…"
            className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded-xl bg-white
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                       focus:border-marca-secundario transition-all placeholder:text-slate-400 h-[32px]"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer hover:text-slate-600"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const HoyFilterBar = ({
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
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const [prevQuery, setPrevQuery] = useState(query);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    // Sincronización síncrona durante el renderizado
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

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 w-full">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="flex-1 max-w-md min-w-[180px]"
                />

                <div className="flex items-center gap-2 flex-none ml-auto">
                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarAtrasadas}
                            icon={mostrarAtrasadas ? 'close' : 'warning'}
                            size="sm"
                            onClick={onToggleAtrasadas}
                            className={cn(
                                "w-34 flex-none justify-center h-[32px] text-[11px]",
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
            </div>

            <div className="flex items-center gap-2 w-full flex-wrap">
                <div className="min-w-40 w-auto max-w-full flex-none">
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
                    <div className="min-w-48 w-auto max-w-full flex-none">
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
                <div className="min-w-40 w-auto max-w-full flex-none">
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
                <div className="min-w-48 w-auto max-w-full flex-none">
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
    );
};
