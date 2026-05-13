// src/features/tareas/components/tarea-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';
import { TAREA_STATUS_MAP } from '../../constants';

const STATUS_ITEMS = [
    { id: 'TODOS', label: 'Total', color: 'gris' },
    { id: 'PENDIENTE', label: 'Pendientes', color: 'asignada' }, // Reutilizando colores de SummaryBar
    { id: 'EN_PROGRESO', label: 'En Progreso', color: 'en_progreso' },
    { id: 'COMPLETADO', label: 'Completadas', color: 'resuelto' },
];

const SummarySkeleton = ({ count = 4 }) => (
    <div className="hidden lg:grid gap-4 mb-6 grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex flex-col justify-center items-center py-5 px-4 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse">
                <Skeleton className="h-2.5 w-16 rounded-full mb-3" />
                <Skeleton className="h-9 w-12 rounded-lg" />
            </div>
        ))}
    </div>
);

export const TareaSummaryBar = ({
    total = 0,
    conteos = {},
    activeStatus,
    onStatusChange,
    loading
}) => {
    if (loading && total === 0) return <SummarySkeleton />;

    const items = STATUS_ITEMS.map(item => ({
        ...item,
        value: item.id === 'TODOS' ? total : (conteos[item.id] ?? 0)
    }));

    return (
        <div className="mb-6">
            <SummaryBar
                items={items}
                activeId={activeStatus || 'TODOS'}
                onSelect={onStatusChange}
                loading={loading}
            />
        </div>
    );
};
