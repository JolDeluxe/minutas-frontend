import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * DirectoryKpiBar — Barra de KPIs globales estilo Directory.
 * Muestra de un vistazo: Minutas Activas, Total Entradas, Actualizaciones Recientes.
 */
export const DirectoryKpiBar = ({ minutas = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[0,1].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const activas = minutas.filter(m => m.estado === 'ACTIVA').length;
  
  let totalEntradas = 0;
  
  for (const m of minutas) {
    totalEntradas += m.resumenOperativo?.totalEntradas || m._count?.tareas || 0;
  }

  const kpis = [
    {
      icon: 'radio_button_checked',
      value: activas,
      label: 'Minutas Activas',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
    {
      icon: 'format_list_bulleted',
      value: totalEntradas,
      label: 'Total Entradas',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {kpis.map((kpi) => (
        <div 
          key={kpi.label}
          className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm"
        >
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
            kpi.iconBg
          )}>
            <Icon name={kpi.icon} size="22px" className={kpi.iconColor} />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-900 leading-none">{kpi.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
