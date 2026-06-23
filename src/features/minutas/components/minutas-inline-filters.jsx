// minutas-frontend\src\features\minutas\components\minutas-inline-filters.jsx

import { useState, useEffect } from 'react';
import { Button, Icon } from '@/components/ui/z_index';
import { Input, Label, Select } from '@/components/form/z_index';

const ESTADO_OPTIONS = [
    { value: 'PROGRAMADA', label: 'Programada' },
    { value: 'EN_CURSO', label: 'En Curso' },
    { value: 'EN_ORGANIZACION', label: 'En Organización' },
    { value: 'ACTIVA', label: 'Activa' },
    { value: 'CERRADA', label: 'Cerrada' },
    { value: 'CANCELADA', label: 'Cancelada' },
];

const LINEA_OPTIONS = [
    { value: 'CALZADO', label: 'Calzado' },
    { value: 'BOTA', label: 'Bota' },
    { value: 'ROPA', label: 'Ropa' },
    { value: 'ACCESORIOS', label: 'Accesorios' },
    { value: 'TODAS', label: 'Todas' },
];

export const MinutasInlineFilters = ({ 
    isOpen, 
    filters, 
    onApplyFilters, 
    isMobile = false 
}) => {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        onApplyFilters(newFilters);
    };

    const handleClear = () => {
        const cleared = {
            estado: '',
            lineaDefault: '',
        };
        setLocalFilters(cleared);
        onApplyFilters(cleared);
    };

    if (!isOpen) return null;

    // Si es móvil, se acopla transparentemente a la barra sticky contenedora sin crear una "doble caja"
    const wrapperProps = isMobile 
        ? {
            className: "w-full pt-3 pb-1 border-t border-white/20 mt-2 animate-in slide-in-from-top-2 duration-200"
        }
        : {
            className: "p-4 md:p-5 bg-white border border-slate-200 rounded-2xl w-full mb-4 mt-3 shadow-sm animate-in slide-in-from-top-2 duration-200"
          };

    return (
        <div {...wrapperProps}>
            <div className="flex justify-between items-center mb-3 px-0.5">
                <div className="flex items-center gap-2">
                    <Icon name="tune" size="sm" className="text-marca-secundario" />
                    <h3 className="font-bold text-sm text-slate-800">Filtros Avanzados</h3>
                </div>
                <button 
                    onClick={handleClear}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                    <Icon name="clear_all" size="xs" />
                    Limpiar Filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-0.5">
                {/* Estado */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800 font-semibold" : ""}>Estado</Label>
                    <Select
                        value={localFilters.estado || ''}
                        onChange={(e) => handleChange('estado', e.target.value)}
                        className={isMobile ? "bg-white/90 backdrop-blur-sm" : ""}
                    >
                        <option value="">Todos los estados</option>
                        {ESTADO_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>

                {/* Línea */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800 font-semibold" : ""}>Línea Default</Label>
                    <Select
                        value={localFilters.lineaDefault || ''}
                        onChange={(e) => handleChange('lineaDefault', e.target.value)}
                        className={isMobile ? "bg-white/90 backdrop-blur-sm" : ""}
                    >
                        <option value="">Todas las líneas</option>
                        {LINEA_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );
};