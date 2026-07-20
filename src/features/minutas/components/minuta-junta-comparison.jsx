import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import api from '@/lib/axios';

/**
 * MinutaJuntaComparison — Comparación visual vs junta anterior.
 * Muestra en 4 bloques grandes: completadas, en progreso, nuevas, atrasadas.
 * Diseño para entenderse sin leer texto.
 */

const CompareBlock = ({ icon, value, label, color, bgColor, subtext }) => (
  <div className={cn(
    'flex flex-col items-center gap-1.5 rounded-2xl p-3 md:p-4 transition-all shadow-sm border',
    bgColor
  )}>
    <div className={cn(
      'flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl shadow-lg',
      color
    )}>
      <Icon name={icon} size="22px" className="text-white" />
    </div>
    <span className="text-xl md:text-2xl font-black font-mono leading-none text-slate-900">
      {value}
    </span>
    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center leading-tight">
      {label}
    </span>
    {subtext && (
      <span className="text-[8px] font-medium text-slate-400 mt-0.5">{subtext}</span>
    )}
  </div>
);

export const MinutaJuntaComparison = ({ minutaId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!minutaId) return;
    const fetchComparison = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/minutas/${minutaId}/compare`);
        setData(res.data?.data || null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [minutaId]);

  if (loading) return null;
  if (!data?.comparacion || !data?.minutaAnterior) return null;

  const { comparacion, minutaAnterior } = data;
  const fechaAnterior = new Date(minutaAnterior.fecha).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short'
  });

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm border border-indigo-100/60 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      
      {/* Header colapsable */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm">
            <Icon name="compare_arrows" size="16px" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
            vs Junta {fechaAnterior}
          </span>
          <span className="text-[9px] text-slate-400 font-medium truncate max-w-[200px]">
            {minutaAnterior.titulo}
          </span>
        </div>
        <Icon 
          name={collapsed ? 'expand_more' : 'expand_less'} 
          size="18px" 
          className="text-slate-400" 
        />
      </button>

      {/* Bloques de comparación */}
      {!collapsed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 pt-0 animate-in slide-in-from-top-2 fade-in duration-300">
          <CompareBlock
            icon="check_circle"
            value={comparacion.completadasDesdeAnterior}
            label="Terminadas"
            color="bg-emerald-500"
            bgColor="bg-emerald-50 border-emerald-100"
            subtext={`de ${comparacion.totalAnterior}`}
          />
          <CompareBlock
            icon="autorenew"
            value={comparacion.sigueEnProgreso}
            label="Siguen en proceso"
            color="bg-amber-500"
            bgColor="bg-amber-50 border-amber-100"
          />
          <CompareBlock
            icon="add_circle"
            value={comparacion.nuevasEnEstaMinuta}
            label="Nuevas esta junta"
            color="bg-blue-500"
            bgColor="bg-blue-50 border-blue-100"
          />
          <CompareBlock
            icon="warning"
            value={comparacion.atrasadasAnterior + comparacion.atrasadasActual}
            label="Atrasadas total"
            color="bg-red-500"
            bgColor={
              (comparacion.atrasadasAnterior + comparacion.atrasadasActual) > 0 
                ? "bg-red-50 border-red-200" 
                : "bg-slate-50 border-slate-100"
            }
          />
        </div>
      )}
    </div>
  );
};
