import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/z_index';
import { isPastDate } from '@/lib/date';

/**
 * StatusTrafficLight — Semáforo visual de estado para entradas.
 * Verde = en revision/cerrada, rojo = atrasada, gris = pendiente.
 * Diseñado para usuario ejecutivo: un vistazo = entender el estado.
 */
const STATUS_CONFIG = {
  completed: {
    color: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    pulse: false,
    icon: 'check_circle',
    tooltip: 'Completada',
  },
  closed: {
    color: 'bg-emerald-600',
    ring: 'ring-emerald-600/30',
    pulse: false,
    icon: 'verified',
    tooltip: 'Cerrada',
  },
  overdue: {
    color: 'bg-red-500',
    ring: 'ring-red-500/40',
    pulse: true,
    icon: 'warning',
    tooltip: 'Atrasada',
  },
  pending: {
    color: 'bg-slate-300',
    ring: 'ring-slate-300/30',
    pulse: false,
    icon: 'schedule',
    tooltip: 'Pendiente',
  },
};

const getStatus = (entry) => {
  const estado = entry.estado;
  const isClosed = estado === 'CERRADA';
  const isCompleted = estado === 'EN_REVISION';
  
  if (isClosed) return 'closed';
  if (isCompleted) return 'completed';
  
  const isOverdue = entry.fechaVencimiento && 
    !isCompleted && !isClosed && 
    isPastDate(entry.fechaVencimiento);
  
  if (isOverdue) return 'overdue';
  
  return 'pending';
};

export const StatusTrafficLight = ({ 
  entry, 
  size = 'md',
  showIcon = false,
  className 
}) => {
  const status = getStatus(entry);
  const config = STATUS_CONFIG[status];

  const sizeMap = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  };

  const iconSizeMap = {
    xs: '8px',
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '24px',
  };

  if (showIcon) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center rounded-full ring-2',
          sizeMap[size],
          config.color,
          config.ring,
          config.pulse && 'animate-pulse',
          className
        )}
        title={config.tooltip}
      >
        <Icon 
          name={config.icon} 
          size={iconSizeMap[size]} 
          className="text-white drop-shadow-sm" 
        />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'rounded-full ring-2 shadow-sm',
        sizeMap[size],
        config.color,
        config.ring,
        config.pulse && 'animate-pulse',
        className
      )}
      title={config.tooltip}
    />
  );
};

export { getStatus, STATUS_CONFIG };
