// src/features/tareas/components/common/tarea-lifecycle-stepper.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const STEPS = [
    { id: 'PENDIENTE',    label: 'Pendiente',  icon: 'assignment',  color: 'bg-amber-500' },
    { id: 'EN_REVISION',  label: 'En Revisión', icon: 'visibility',  color: 'bg-blue-500' },
    { id: 'CERRADA',      label: 'Cerrada',     icon: 'lock',        color: 'bg-slate-700' },
];

const STATE_MAP = {
    PENDIENTE: 0,
    EN_REVISION: 1,
    CERRADA: 2,
    CANCELADA: 2,
    DESCARTADA: 2,
};

export const TareaLifecycleStepper = ({ estado }) => {
    const currentIndex = STATE_MAP[estado] ?? 0;
    const progressWidth = (currentIndex / (STEPS.length - 1)) * 100;

    return (
        <div className="w-full py-6 px-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">
                Ciclo de vida de la tarea
            </h2>
            
            <div className="relative flex items-center justify-between">
                {/* Línea de fondo */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full" />
                
                {/* Línea de progreso activa */}
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 z-0 rounded-full transition-all duration-700 ease-in-out" 
                    style={{ 
                        width: `${progressWidth}%`,
                        backgroundColor: STEPS[currentIndex]?.color.replace('bg-', '') // fallback or dynamic color
                    }}
                />
                
                {STEPS.map((step, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm",
                                isActive ? step.color + " text-white shadow-md scale-110" : "bg-slate-100 text-slate-300",
                                isCurrent && "ring-4 ring-white"
                            )}>
                                <Icon name={step.icon} size="16px" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter transition-colors duration-500",
                                isActive ? "text-slate-800" : "text-slate-300"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
