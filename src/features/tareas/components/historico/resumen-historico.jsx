// src/features/tareas/components/historico/tareas-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const ESTADOS_HISTORICO = [
    { id: 'TODOS', label: 'Total Historial', color: 'gris' },
    { id: 'PENDIENTE', label: 'Pendientes', color: 'pendiente' },
    { id: 'EN_REVISION', label: 'En Revisión', color: 'azul' },
    { id: 'CERRADA', label: 'Cerradas', color: 'gris' },
    { id: 'CANCELADA', label: 'Canceladas', color: 'rojo' },
    { id: 'DESCARTADA', label: 'Descartadas', color: 'rojo' },
];

export const ResumenHistorico = ({
    totalParaSummary,
    conteos = {},
    filtroActual,
    onFilterChange,
    loading,
}) => {
    const items = ESTADOS_HISTORICO.map((e) => ({
        ...e,
        value: e.id === 'TODOS' ? totalParaSummary : (conteos[e.id] ?? 0),
    }));

    return (
        <SummaryBar
            items={items}
            activeId={filtroActual ?? 'TODOS'}
            onSelect={onFilterChange}
            loading={loading}
        />
    );
};
