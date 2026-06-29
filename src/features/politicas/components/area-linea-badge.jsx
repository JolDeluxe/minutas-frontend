import { AREA_MAP, LINEAS_POR_AREA } from '@/features/minutas/constants';

/**
 * AreaLineaBadge — Badge institucional de jerarquía Área / Línea.
 *
 * Variantes visuales:
 *   área + línea  →  [ Dirección MBC • Producción ]
 *   área + null   →  [ Marketing • General ]
 *   null + null   →  [ Institucional General ]
 *
 * @param {string|null} area     - Valor del enum Area del backend (ej. 'DIRECCION_MBC')
 * @param {string|null} linea    - Valor de línea (ej. 'PRODUCCION') o null para General
 * @param {string}      className - Clases CSS adicionales opcionales
 */
export const AreaLineaBadge = ({ area, linea, className = '' }) => {
  // ── Variante: sin área ──────────────────────────────────────────────────────
  if (!area) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
          bg-slate-100 border border-slate-200
          text-[9px] font-black uppercase tracking-wider text-slate-500
          ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
        Institucional General
      </span>
    );
  }

  // ── Resolver labels ─────────────────────────────────────────────────────────
  const areaLabel = AREA_MAP?.[area] ?? area;

  const lineaLabel = linea
    ? (LINEAS_POR_AREA[area]?.find((l) => l.value === linea)?.label ?? linea)
    : 'General';

  // ── Color del indicador según tipo de área ──────────────────────────────────
  const dotColor =
    area === 'DISENO'              ? 'bg-orange-500'  :
    area === 'MARKETING'           ? 'bg-emerald-500' :
    area?.startsWith('DIRECCION_') ? 'bg-indigo-500'  :
                                     'bg-slate-400';

  // ── Variante: con área (+ línea o General) ──────────────────────────────────
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        bg-slate-50 border border-slate-200
        text-[9px] font-black uppercase tracking-wider text-slate-600
        ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      {areaLabel}
      <span className="text-slate-300 font-normal mx-0.5">•</span>
      <span className="text-slate-500">{lineaLabel}</span>
    </span>
  );
};
