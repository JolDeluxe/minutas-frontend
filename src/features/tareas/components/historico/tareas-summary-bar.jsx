// src/features/tareas/components/historico/tareas-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const ESTADOS_HISTORICO = [
    { id: 'TODOS', label: 'Total Historial', color: 'gris' },
    { id: 'PENDIENTE', label: 'Pendientes', color: 'pendiente' },
    { id: 'EN_PROGRESO', label: 'En Progreso', color: 'en_progreso' },
    { id: 'COMPLETADO', label: 'Completadas', color: 'resuelto' },
    { id: 'CANCELADO', label: 'Canceladas', color: 'rechazado' },
];

export const TareasSummaryBar = ({
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
