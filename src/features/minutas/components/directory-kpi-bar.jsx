import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { DisenoIcon, MarketingIcon } from './icons/line-icons';

/**
 * DirectoryKpiBar — Barra de KPIs globales estilo Directory.
 * Muestra de un vistazo: Minutas Activas para el departamento seleccionado.
 */
export const DirectoryKpiBar = ({ minutas = [], loading = false, departamentoGlobal = 'DISEÑO', isAdmin = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-slate-200 rounded-2xl h-20 animate-pulse" />
      </div>
    );
  }

  const activas = minutas.filter(m => m.estado === 'ACTIVA');
  const totalActivas = activas.length;
  
  const isMarketing = departamentoGlobal === 'MARKETING';

  return (
    <div className="grid gap-2 md:gap-3 mb-3 md:mb-4 grid-cols-1 min-[520px]:grid-cols-2">
      
      {/* KPI Principal: Total Activas del Depto */}
      <div className="flex flex-col min-[420px]:flex-row items-center justify-center min-[420px]:justify-start text-center min-[420px]:text-left gap-1.5 md:gap-3 px-1.5 md:px-4 py-2 md:py-3.5 rounded-xl md:rounded-2xl border border-white/40 md:border-slate-200 shadow-xs md:shadow-sm backdrop-blur-md bg-white/50 md:bg-white overflow-hidden">
        <div className={cn(
          "relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl shrink-0 p-1 md:p-1.5",
          isMarketing ? "bg-purple-100/50 md:bg-purple-50" : "bg-blue-100/50 md:bg-blue-50"
        )}>
          {isMarketing ? (
             <MarketingIcon size="100%" className="text-purple-600 opacity-90" />
          ) : (
             <DisenoIcon size="100%" className="text-blue-600 opacity-90" />
          )}
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 md:h-3 md:w-3">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isMarketing ? "bg-purple-400" : "bg-blue-400")}></span>
            <span className={cn("relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 border-2 border-white", isMarketing ? "bg-purple-500" : "bg-blue-500")}></span>
          </span>
        </div>
        <div>
          <div className="text-lg md:text-2xl font-black font-mono text-slate-900 leading-none">{totalActivas}</div>
          <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 leading-tight">ACTIVAS</div>
        </div>
      </div>

    </div>
  );
};
