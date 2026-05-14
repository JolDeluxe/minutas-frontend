// src/features/tareas/components/historico/tareas-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { TAREA_PRIORIDAD_OPTS, ROLES_ADMIN } from '../../constants';
import { TareaFechas } from './tarea-fechas';
import { cn } from '@/utils/cn';

const SearchInput = ({ localValue, onChange, onClear, className = "w-full" }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar tarea, minuta, ID…"
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                       focus:border-marca-secundario transition-all placeholder:text-slate-400 h-[38px]"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const TareasFilterBar = ({
    currentUser,
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
    // Fechas
    showDates = false,
    year,
    month,
    onYearChange,
    onMonthChange,
    existenciaGlobal = {},
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
        <div className="flex flex-col gap-3 w-full pt-2">
            {showDates && (
                <TareaFechas 
                    year={year}
                    month={month}
                    onYearChange={onYearChange}
                    onMonthChange={onMonthChange}
                    existenciaGlobal={existenciaGlobal}
                />
            )}
            <div className="flex items-center gap-3 w-full">
                <SearchInput localValue={localValue} onChange={setLocalValue} onClear={() => setLocalValue('')} className="flex-1 max-w-md min-w-50" />

                <div className="flex items-center gap-3 flex-none ml-auto">
                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarAtrasadas}
                            icon={mostrarAtrasadas ? 'close' : 'warning'}
                            size="sm"
                            onClick={onToggleAtrasadas}
                            className={cn(
                                "w-34 flex-none justify-center h-[38px]",
                                mostrarAtrasadas && "bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-0"
                            )}
                        >
                            Atrasadas
                        </Button>
                        {totalAtrasadasGlobal > 0 && !mostrarAtrasadas && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalAtrasadasGlobal}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5 w-full flex-wrap">
                <div className="min-w-40 flex-1 lg:flex-none">
                    <SearchableSelect
                        options={TAREA_PRIORIDAD_OPTS}
                        value={filtroPrioridad}
                        onChange={onPrioridadChange}
                        placeholder="PRIORIDAD..."
                        icon="flag"
                        allOptionText="TODAS"
                        className="w-full font-bold text-[11px] uppercase tracking-wide"
                    />
                </div>

                {esAdmin && opcionesResponsables.length > 0 && (
                    <div className="min-w-48 flex-1 lg:flex-none">
                        <SearchableSelect
                            options={opcionesResponsables.map(r => ({ value: String(r.id), label: r.nombre }))}
                            value={filtroResponsable ? String(filtroResponsable) : ''}
                            onChange={onResponsableChange}
                            placeholder="RESPONSABLE..."
                            icon="person"
                            allOptionText="CUALQUIERA"
                            className="w-full font-bold text-[11px] uppercase tracking-wide"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
