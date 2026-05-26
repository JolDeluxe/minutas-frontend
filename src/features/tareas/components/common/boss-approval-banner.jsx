// src/features/tareas/components/common/boss-approval-banner.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const BossApprovalBanner = ({ count, isActive, onClick }) => {
    if (count <= 0) return null;

    return (
        <div 
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden p-4 sm:p-5 rounded-3xl border transition-all duration-500 cursor-pointer mb-4 animate-in fade-in slide-in-from-top-4",
                isActive 
                    ? "bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-600/20 scale-[1.02]" 
                    : "bg-white border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md"
            )}
        >
            {/* Fondo decorativo */}
            <div className={cn(
                "absolute -right-8 -top-8 w-32 h-32 rounded-full transition-all duration-700",
                isActive ? "bg-white/10" : "bg-emerald-50"
            )} />

            <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                        isActive ? "bg-white text-emerald-600" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    )}>
                        <Icon name={isActive ? "filter_list" : "fact_check"} size="24px" />
                    </div>
                    
                    <div>
                        <h3 className={cn(
                            "text-sm sm:text-base font-black leading-none tracking-tight transition-colors",
                            isActive ? "text-white" : "text-slate-800"
                        )}>
                            Validación de Entregas
                        </h3>
                        <p className={cn(
                            "text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] mt-1.5 transition-colors",
                            isActive ? "text-emerald-100" : "text-emerald-600"
                        )}>
                            {count} {count === 1 ? 'entrada espera' : 'entradas esperan'} tu aprobación
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={cn(
                        "hidden sm:flex px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isActive 
                            ? "bg-emerald-500 text-white border border-white/20" 
                            : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
                    )}>
                        {isActive ? 'Viendo todas' : 'Revisar Ahora'}
                    </div>
                    <Icon 
                        name={isActive ? "close" : "chevron_right"} 
                        size="20px" 
                        className={cn(
                            "transition-all duration-300",
                            isActive ? "text-white" : "text-emerald-300 group-hover:translate-x-1"
                        )} 
                    />
                </div>
            </div>
        </div>
    );
};
