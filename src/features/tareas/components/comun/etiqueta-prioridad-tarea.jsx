// src/features/tareas/components/common/tarea-priority-badge.jsx
import { cn } from '@/utils/cn';

const PRIORIDAD_CONFIG = {
    BAJA: { label: 'Baja', cls: 'text-prioridad-baja   bg-prioridad-baja/10   border-prioridad-baja/30' },
    MEDIA: { label: 'Media', cls: 'text-prioridad-media  bg-prioridad-media/10  border-prioridad-media/30' },
    ALTA: { label: 'Alta', cls: 'text-prioridad-alta   bg-prioridad-alta/10   border-prioridad-alta/30' },
    CRITICA: { label: 'Crítica', cls: 'text-prioridad-critica bg-prioridad-critica/10 border-prioridad-critica/30' },
};

export const EtiquetaPrioridadTarea = ({ priority, className }) => {
    const cfg = PRIORIDAD_CONFIG[priority] ?? { label: priority, cls: 'text-slate-600 bg-slate-100 border-slate-200' };
    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap',
              cfg.cls, className
        )}>
            {cfg.label}
        </span>
    );
};
