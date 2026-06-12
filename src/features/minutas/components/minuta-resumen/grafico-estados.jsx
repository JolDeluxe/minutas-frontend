// minutas-frontend/src/features/minutas/components/minuta-resumen/grafico-estados.jsx
/**
 * GraficoEstados — Gráfico de dona SVG puro para visualizar
 * la distribución de estados de las tareas de la minuta.
 * Sin dependencias externas, 100% compatible con offline/PWA.
 */
import { useMemo } from 'react';
import { cn } from '@/utils/cn';

const ESTADO_CONFIG = {
  PENDIENTE:   { label: 'Pendiente',   color: '#f59e0b', bg: 'bg-amber-100',   text: 'text-amber-700' },
  EN_REVISION: { label: 'En Revisión', color: '#3b82f6', bg: 'bg-blue-100',    text: 'text-blue-700'  },
  CERRADA:     { label: 'Cerrada',     color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  CANCELADA:   { label: 'Cancelada',   color: '#ef4444', bg: 'bg-red-100',     text: 'text-red-700'   },
};

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const dibujarSegmento = (cx, cy, rExt, rInt, startAngle, endAngle) => {
  const startExt = polarToCartesian(cx, cy, rExt, startAngle);
  const endExt   = polarToCartesian(cx, cy, rExt, endAngle);
  const startInt = polarToCartesian(cx, cy, rInt, startAngle);
  const endInt   = polarToCartesian(cx, cy, rInt, endAngle);
  
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startExt.x} ${startExt.y}`, // Ir al inicio del arco exterior
    `A ${rExt} ${rExt} 0 ${largeArc} 1 ${endExt.x} ${endExt.y}`, // Dibujar arco exterior
    `L ${endInt.x} ${endInt.y}`, // Línea hacia el arco interior
    `A ${rInt} ${rInt} 0 ${largeArc} 0 ${startInt.x} ${startInt.y}`, // Dibujar arco interior (de regreso)
    'Z' // Cerrar la figura
  ].join(' ');
};

export const GraficoEstados = ({ tareas = [], onVerDetalle, className }) => {
  const { segmentos, total, sinTareas } = useMemo(() => {
    const soloTareas = tareas.filter(t => 
      t.tipo === 'TAREA' && 
      t.estado && 
      t.estado !== 'CANCELADA' && 
      t.estado !== 'DESCARTADA'
    );
    const total = soloTareas.length;
    if (total === 0) return { segmentos: [], total: 0, sinTareas: true };

    const conteo = {};
    for (const t of soloTareas) {
      conteo[t.estado] = (conteo[t.estado] || 0) + 1;
    }

    let angle = 0;
    const segs = Object.entries(conteo).map(([estado, count]) => {
      const pct = (count / total) * 360;
      const seg = {
        estado,
        count,
        color: ESTADO_CONFIG[estado]?.color ?? '#94a3b8',
        startAngle: angle,
        endAngle: angle + pct,
        porcentaje: Math.round((count / total) * 100),
      };
      angle += pct;
      return seg;
    });

    return { segmentos: segs, total, sinTareas: false };
  }, [tareas]);

  const cx = 60, cy = 60, rExt = 50, rInt = 32;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Dona */}
      <div className="relative w-[120px] h-[120px] shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-0">
          {sinTareas ? (
            <circle cx={cx} cy={cy} r={rExt} fill="none" stroke="#e2e8f0" strokeWidth={rExt - rInt} />
          ) : (
            segmentos.map((seg, i) => {
              const isDominant = seg.endAngle - seg.startAngle >= 359.9;
              if (isDominant) {
                return (
                  <circle
                    key={i}
                    cx={cx} cy={cy} r={(rExt + rInt) / 2}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={rExt - rInt}
                    strokeDasharray={`${Math.PI * (rExt + rInt)} 0`}
                  />
                );
              }
              return (
                <path
                  key={i}
                  d={dibujarSegmento(cx, cy, rExt, rInt, seg.startAngle, seg.endAngle)}
                  fill={seg.color}
                  opacity={0.9}
                />
              );
            })
          )}
          {/* Centro */}
          <circle cx={cx} cy={cy} r={rInt - 2} fill="white" />
          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-900" style={{ fontSize: 18, fontWeight: 900, fontFamily: 'inherit' }}>
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, fontFamily: 'inherit', textTransform: 'uppercase' }}>
            tareas
          </text>
        </svg>
      </div>

      {/* Leyenda */}
      {!sinTareas && (
        <div className="flex flex-col gap-1.5 w-full">
          {segmentos.map((seg) => {
            const cfg = ESTADO_CONFIG[seg.estado];
            return (
              <div key={seg.estado} className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-[11px] font-bold text-slate-600">{cfg?.label ?? seg.estado}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-black text-slate-700">{seg.count}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold', cfg?.bg, cfg?.text)}>
                    {seg.porcentaje}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sinTareas && (
        <p className="text-[11px] text-slate-400 text-center italic">
          No hay tareas formalizadas aún.
        </p>
      )}

      {/* Botón ver detalle */}
      {onVerDetalle && (
        <button
          onClick={onVerDetalle}
          className="mt-1 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-marca-primario hover:text-marca-secundario transition-colors group"
        >
          <span>Ver Tareas en Detalle</span>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-marca-primario/10 group-hover:bg-marca-primario/20 transition-colors">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4h6M4 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
      )}
    </div>
  );
};