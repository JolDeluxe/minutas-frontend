// src/features/usuarios/components/user-summary-bar.jsx
import { SummaryBar } from '@/components/ui/summary-bar';
import { Skeleton } from '@/components/ui/spinner';

const SummaryBarSkeleton = ({ count = 5 }) => (
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

    // GERENCIA y ADMIN ven la summary bar completa
    if (rol !== 'GERENCIA' && rol !== 'ADMIN') return null;

    const totalColumns = rol === 'ADMIN' ? 5 : 4;

    if (loading && total === 0 && Object.keys(conteos).length === 0) {
        return <SummaryBarSkeleton count={totalColumns} />;
    }

    const totalReal = total || Object.values(conteos).reduce((acc, v) => acc + (v || 0), 0);

    const items = [
        { 
            id: 'TODOS', 
            label: mostrarInactivos ? 'Total Inactivos' : 'Total', 
            value: totalReal, 
            color: mostrarInactivos ? 'rojo' : 'gris' 
        },
    ];

    if (rol === 'ADMIN') {
        items.push({ id: 'ADMIN', label: 'Administrador', value: conteos['ADMIN'] || 0, color: 'rosa' });
    }

    items.push(
        { id: 'GERENCIA', label: 'Gerencia', value: conteos['GERENCIA'] || 0, color: 'esmeralda' },
        { id: 'JEFE', label: 'Jefatura', value: conteos['JEFE'] || 0, color: 'amarillo' },
        { id: 'COORDINADOR', label: 'Coordinador', value: conteos['COORDINADOR'] || 0, color: 'indigo' }
    );

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