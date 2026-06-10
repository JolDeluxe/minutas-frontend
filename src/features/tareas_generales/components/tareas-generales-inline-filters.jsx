// src/features/tareas_generales/components/tareas-generales-inline-filters.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { AREA_MAP } from '../../minutas/constants';

const AREA_OPTIONS = Object.entries(AREA_MAP).map(([value, label]) => ({ value, label }));

export const TareasGeneralesInlineFilters = ({ 
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
            ...localFilters,
            area: '',
        };
        setLocalFilters(cleared);
        onApplyFilters(cleared);
    };

    if (!isOpen) return null;

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

            <div className="grid grid-cols-1 gap-3 px-0.5">
                {/* Área */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800 font-semibold" : ""}>Área Destino</Label>
                    <Select
                        value={localFilters.area || ''}
                        onChange={(e) => handleChange('area', e.target.value)}
                        className={isMobile ? "bg-white/90 backdrop-blur-sm" : ""}
                    >
                        <option value="">Todas las áreas</option>
                        {AREA_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );
};
