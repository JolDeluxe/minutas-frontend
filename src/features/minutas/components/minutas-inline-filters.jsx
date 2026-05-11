import { useState, useEffect } from 'react';
import { Button, Icon } from '@/components/ui/z_index';
import { Input, Label, Select } from '@/components/form/z_index';
import { glassBase } from '@/components/ui/liquid-glass-mobile';

const ESTADO_OPTIONS = [
    { value: 'ACTIVA', label: 'Activa' },
    { value: 'CERRADA', label: 'Cerrada' },
];

const LINEA_OPTIONS = [
    { value: 'CALZADO', label: 'Calzado' },
    { value: 'BOTA', label: 'Bota' },
    { value: 'ROPA', label: 'Ropa' },
    { value: 'ACCESORIOS', label: 'Accesorios' },
];

export const MinutasInlineFilters = ({ 
    isOpen, 
    filters, 
    onApplyFilters, 
    isMobile = false 
}) => {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        // Aplicación inmediata (Auto-Apply)
        onApplyFilters(newFilters);
    };

    const handleClear = () => {
        const cleared = {
            estado: '',
            lineaDefault: '',
            fechaDesde: '',
            fechaHasta: '',
            creadoPorId: '',
        };
        setLocalFilters(cleared);
        onApplyFilters(cleared);
    };

    if (!isOpen) return null;

    const wrapperProps = isMobile 
        ? {
            className: "p-4 rounded-2xl w-full mb-4 overflow-hidden",
            style: glassBase('surface')
        }
        : {
            className: "p-4 md:p-5 bg-white border border-slate-200 rounded-2xl w-full mb-4 shadow-sm"
        };

    return (
        <div {...wrapperProps}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Icon name="tune" size="sm" className="text-marca-secundario" />
                    <h3 className="font-bold text-sm text-slate-800">Filtros Avanzados</h3>
                </div>
                <button 
                    onClick={handleClear}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
                >
                    <Icon name="clear_all" size="xs" />
                    Limpiar Filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                {/* Estado */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800" : ""}>Estado</Label>
                    <Select
                        value={localFilters.estado || ''}
                        onChange={(e) => handleChange('estado', e.target.value)}
                        className={isMobile ? "bg-white/70 backdrop-blur-sm" : ""}
                    >
                        <option value="">Todos los estados</option>
                        {ESTADO_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>

                {/* Línea */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800" : ""}>Línea Default</Label>
                    <Select
                        value={localFilters.lineaDefault || ''}
                        onChange={(e) => handleChange('lineaDefault', e.target.value)}
                        className={isMobile ? "bg-white/70 backdrop-blur-sm" : ""}
                    >
                        <option value="">Todas las líneas</option>
                        {LINEA_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>

                {/* Fecha Desde */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800" : ""}>Desde</Label>
                    <Input
                        type="date"
                        value={localFilters.fechaDesde || ''}
                        onChange={(e) => handleChange('fechaDesde', e.target.value)}
                        className={isMobile ? "bg-white/70 backdrop-blur-sm" : ""}
                    />
                </div>

                {/* Fecha Hasta */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800" : ""}>Hasta</Label>
                    <Input
                        type="date"
                        value={localFilters.fechaHasta || ''}
                        onChange={(e) => handleChange('fechaHasta', e.target.value)}
                        className={isMobile ? "bg-white/70 backdrop-blur-sm" : ""}
                    />
                </div>

                {/* Creado Por ID */}
                <div className="flex flex-col gap-1.5">
                    <Label className={isMobile ? "text-slate-800" : ""}>ID Creador</Label>
                    <Input
                        type="number"
                        placeholder="Ej. 1"
                        value={localFilters.creadoPorId || ''}
                        onChange={(e) => handleChange('creadoPorId', e.target.value)}
                        className={isMobile ? "bg-white/70 backdrop-blur-sm" : ""}
                    />
                </div>
            </div>
        </div>
    );
};
