// src/features/usuarios/components/user-summary-bar.jsx
import { SummaryBar, Skeleton } from '@/components/ui/z_index';

const SummaryBarSkeleton = ({ count = 4 }) => (
    <div className={`hidden lg:grid gap-4 mb-4 grid-cols-${count}`}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex flex-col justify-center items-center py-4 px-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <Skeleton className="h-2.75 w-16 rounded-full mb-3" />
                <Skeleton className="h-9 w-12 rounded-md" />
            </div>
        ))}
    </div>
);

export const UserSummaryBar = ({
    currentUser,
    total,
    conteos = {},
    filtroActual,
    onFilterChange,
    loading,
    mostrarInactivos,
}) => {
    const rol = currentUser?.rol;

    // Solo GERENCIA ve la summary bar completa
    if (rol !== 'GERENCIA') return null;

    if (loading && total === 0 && Object.keys(conteos).length === 0) {
        return <SummaryBarSkeleton count={mostrarInactivos ? 1 : 4} />;
    }

    const totalReal = total || Object.values(conteos).reduce((acc, v) => acc + (v || 0), 0);

    if (mostrarInactivos) {
        return (
            <SummaryBar
                items={[{ id: 'INACTIVOS', label: 'Total Inactivos', value: totalReal, color: 'rojo' }]}
                activeId="INACTIVOS"
                onSelect={() => { }}
                loading={loading}
                separateFirstMobile={true}
            />
        );
    }

    const items = [
        { id: 'TODOS', label: 'Total', value: totalReal, color: 'gris' },
        { id: 'GERENCIA', label: 'Gerencia', value: conteos['GERENCIA'] || 0, color: 'esmeralda' },
        { id: 'JEFE', label: 'Jefatura', value: conteos['JEFE'] || 0, color: 'amarillo' },
        { id: 'COORDINADOR', label: 'Coordinador', value: conteos['COORDINADOR'] || 0, color: 'indigo' },
    ];

    const visibleIds = new Set(items.map(i => i.id));
    const activeId = visibleIds.has(filtroActual) ? filtroActual : 'TODOS';

    return (
        <SummaryBar
            items={items}
            activeId={activeId}
            onSelect={onFilterChange}
            loading={loading}
            separateFirstMobile={true}
        />
    );
};