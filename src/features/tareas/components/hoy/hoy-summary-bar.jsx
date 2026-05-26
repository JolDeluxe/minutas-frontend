// src/features/tareas/components/hoy/hoy-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const SummaryBarSkeleton = ({ count }) => (
    <>
        <div className={`hidden lg:grid gap-4 mb-4 grid-cols-${Math.min(count, 5)}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col justify-center items-center py-4 px-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                    <Skeleton className="h-2.5 w-16 rounded-full mb-3" />
                    <Skeleton className="h-9 w-12 rounded-md" />
                </div>
            ))}
        </div>

        <div className="lg:hidden flex flex-col px-4 gap-3 mb-5">
            <div className="w-full">
                <div className="flex justify-between items-center w-full px-3 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-4 w-8 rounded-md" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                {Array.from({ length: count - 1 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center w-full px-3 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                        <Skeleton className="h-3 w-12 rounded-full" />
                        <Skeleton className="h-4 w-6 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    </>
);

export const HoySummaryBar = ({
    totalParaSummary,
    conteos = {},
    filtroActual,
    onFilterChange,
    loading,
}) => {
    if (loading && totalParaSummary === 0 && Object.keys(conteos).length === 0) {
        return <SummaryBarSkeleton count={4} />;
    }

    // Calculamos el total de activas (Pendiente + En Revisión)
    const totalActivas = (conteos['PENDIENTE'] || 0) + (conteos['EN_REVISION'] || 0);

    const items = [
        { 
            id: 'TODOS', 
            label: 'Total Activas', 
            color: 'gris', 
            value: totalActivas,
            description: 'Pendientes + En Revisión' 
        },
        { 
            id: 'PENDIENTE', 
            label: 'Pendientes', 
            color: 'asignada', 
            value: conteos['PENDIENTE'] || 0 
        },
        { 
            id: 'EN_REVISION', 
            label: 'En Revisión', 
            color: 'en_progreso', 
            value: conteos['EN_REVISION'] || 0 
        },
        { 
            id: 'CERRADA', 
            label: 'Cerradas', 
            color: 'cerrado', 
            value: conteos['CERRADA'] || 0,
            className: 'opacity-70 scale-90 lg:scale-95 origin-right'
        },
    ];

    return (
        <SummaryBar
            items={items}
            activeId={filtroActual ?? 'TODOS'}
            onSelect={onFilterChange}
            loading={loading}
        />
    );
};

