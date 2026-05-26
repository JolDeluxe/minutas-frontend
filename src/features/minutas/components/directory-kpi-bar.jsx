import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { DisenoIcon, MarketingIcon } from './icons/line-icons';

/**
 * DirectoryKpiBar — Barra de KPIs globales estilo Directory.
 * Muestra de un vistazo: Minutas Activas, Total Entradas, Actualizaciones Recientes.
 */
export const DirectoryKpiBar = ({ minutas = [], loading = false, departamentoGlobal = 'TODAS', isAdmin = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[0,1].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const activas = minutas.filter(m => m.estado === 'ACTIVA');
  const totalActivas = activas.length;
  
  const showSplit = isAdmin && departamentoGlobal === 'TODAS';
  
  const disenoActivas = activas.filter(m => m.creadoPor?.departamento === 'DISENO').length;
  const marketingActivas = activas.filter(m => m.creadoPor?.departamento === 'MARKETING').length;

  return (
    <div className={cn("grid gap-2 md:gap-3 mb-3 md:mb-4", showSplit ? "grid-cols-3" : "grid-cols-1 min-[520px]:grid-cols-2")}>
      
      {/* KPI Principal: Total Activas */}
      <div className="flex flex-col min-[420px]:flex-row items-center justify-center min-[420px]:justify-start text-center min-[420px]:text-left gap-1.5 md:gap-3 px-1.5 md:px-4 py-2 md:py-3.5 rounded-xl md:rounded-2xl border border-white/40 md:border-slate-200 shadow-xs md:shadow-sm backdrop-blur-md bg-white/50 md:bg-white overflow-hidden">
        <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl shrink-0 bg-emerald-100/50 md:bg-emerald-50">
          <Icon name="bolt" size="24px" className="text-emerald-600 md:text-[28px]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-emerald-500 border-2 border-white"></span>
          </span>
        </div>
        <div>
          <div className="text-lg md:text-2xl font-black font-mono text-slate-900 leading-none">{totalActivas}</div>
          <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 leading-tight">ACTIVAS</div>
        </div>
      </div>

      {showSplit && (
        <>
          <div className="flex flex-col min-[420px]:flex-row items-center justify-center min-[420px]:justify-start text-center min-[420px]:text-left gap-1.5 md:gap-3 px-1.5 md:px-4 py-2 md:py-3.5 rounded-xl md:rounded-2xl border border-white/40 md:border-slate-200 shadow-xs md:shadow-sm backdrop-blur-md bg-white/50 md:bg-white overflow-hidden">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl shrink-0 bg-slate-200/50 md:bg-slate-100 p-1 md:p-1.5">
              <DisenoIcon size="100%" className="text-slate-700 opacity-90" />
            </div>
            <div>
              <div className="text-lg md:text-2xl font-black font-mono text-slate-900 leading-none">{disenoActivas}</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 leading-tight">DISEÑO</div>
            </div>
          </div>
          
          <div className="flex flex-col min-[420px]:flex-row items-center justify-center min-[420px]:justify-start text-center min-[420px]:text-left gap-1.5 md:gap-3 px-1.5 md:px-4 py-2 md:py-3.5 rounded-xl md:rounded-2xl border border-white/40 md:border-slate-200 shadow-xs md:shadow-sm backdrop-blur-md bg-white/50 md:bg-white overflow-hidden">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl shrink-0 bg-slate-200/50 md:bg-slate-100 p-1 md:p-1.5">
              <MarketingIcon size="100%" className="text-slate-700 opacity-90" />
            </div>
            <div>
              <div className="text-lg md:text-2xl font-black font-mono text-slate-900 leading-none">{marketingActivas}</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 leading-tight">MKT</div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
