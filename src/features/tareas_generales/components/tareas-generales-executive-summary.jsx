// src/features/tareas_generales/components/tareas-generales-executive-summary.jsx
import { SummaryBar } from '@/components/ui/summary-bar';

export const TareasGeneralesExecutiveSummary = ({
    resumen,
    onFilterByNotificado,
    onResetFilter,
    activeFilter,
    loading = false
}) => {
    if (!resumen) return null;

    const {
        notificados = 0,
        sinNotificar = 0,
    } = resumen;

    const notificado = activeFilter?.notificado; // 'true', 'false', or ''
    const totalReal = notificados + sinNotificar;

    const items = [
        { 
            id: 'TODOS', 
            label: 'Total Tareas', 
            color: 'gris', 
            value: totalReal,
        },
        { 
            id: 'PENDIENTE', 
            label: 'Pendientes', 
            color: 'pendiente', 
            value: sinNotificar,
        },
        { 
            id: 'COMPLETADA', 
            label: 'Completadas', 
            color: 'resuelto', 
            value: notificados,
        },
    ];

    const activeId = notificado === 'true' 
        ? 'COMPLETADA' 
        : notificado === 'false' 
            ? 'PENDIENTE' 
            : 'TODOS';

    const handleSelect = (id) => {
        if (id === 'COMPLETADA') {
            onFilterByNotificado?.('true');
        } else if (id === 'PENDIENTE') {
            onFilterByNotificado?.('false');
        } else {
            onResetFilter?.();
        }
    };

    return (
        <SummaryBar
            items={items}
            activeId={activeId}
            onSelect={handleSelect}
            loading={loading}
        />
    );
};
