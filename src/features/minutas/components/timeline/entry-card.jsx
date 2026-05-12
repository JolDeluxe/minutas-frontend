import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import {
  CLASIFICACION_MAP,
  ESTADO_CONCEPTUAL_MAP,
  PRIORIDAD_MAP,
  AREA_MAP,
  LINEA_MAP,
  formatRelative,
  formatTime,
} from '../../constants';
import { useState } from 'react';

/**
 * EntryCard — Tarjeta conversacional ultra-compacta para el timeline.
 *
 * Diseño tipo Linear/Notion: Una sola línea de metadata, descripción resumida,
 * borde lateral por clasificación. Expandible inline para ver detalles.
 * Colores sobrios: solo borde, ícono y badge pequeño.
 */
export const EntryCard = ({ entry, onOrganize, meetingMode = false }) => {
  const [expanded, setExpanded] = useState(false);

  const clasif = CLASIFICACION_MAP[entry.clasificacion] || null;
  const estadoC = ESTADO_CONCEPTUAL_MAP[entry.estadoConceptual] || ESTADO_CONCEPTUAL_MAP.CAPTURADO;
  const prioridad = PRIORIDAD_MAP[entry.prioridad] || null;
  const isOrganized = entry.formalizada;
  const borderColor = clasif?.border || '#e2e8f0';

  const seguimiento = entry.asignaciones?.filter(a => a.tipo === 'SEGUIMIENTO') || [];
  const ejecutores = entry.asignaciones?.filter(a => a.tipo === 'EJECUTOR') || [];

  return (
    <div
      className={cn(
        'bg-white rounded-lg transition-all duration-150 group',
        expanded ? 'shadow-md ring-1 ring-slate-200/80' : 'shadow-sm border border-slate-100 hover:shadow-md'
      )}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* ─── Compact Row ─── */}
      <button
        type="button"
        className="w-full text-left px-3 py-2.5 select-none focus:outline-none"
        onClick={() => setExpanded(prev => !prev)}
      >
        {/* Top: metadata row */}
        <div className="flex items-center gap-1.5 mb-1">
          {clasif && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: clasif.color }}
            >
              <Icon name={clasif.icon} size="11px" />
              {clasif.label}
            </span>
          )}
          <span className="w-px h-3 bg-slate-200" />
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[10px] font-bold',
              isOrganized ? 'text-emerald-600' : 'text-slate-400'
            )}
          >
            <Icon name={isOrganized ? 'check_circle' : 'radio_button_unchecked'} size="10px" />
            {!meetingMode && (isOrganized ? 'Organizado' : 'Pendiente')}
          </span>

          {prioridad && (
            <>
              <span className="w-px h-3 bg-slate-200" />
              <Icon name={prioridad.icon} size="11px" style={{ color: prioridad.color }} />
            </>
          )}

          <span className="ml-auto text-[10px] text-slate-400 font-mono shrink-0">
            {formatRelative(entry.createdAt)} · #{entry.id}
          </span>
        </div>

        {/* Description */}
        <p className={cn(
          'text-[13px] text-slate-800 leading-snug',
          !expanded && 'line-clamp-2'
        )}>
          {entry.descripcion}
        </p>

        {/* Compact footer — area + images + expand */}
        {!expanded && !meetingMode && (
          <div className="flex items-center gap-2 mt-1">
            {entry.area && (
              <span className="text-[10px] text-slate-400">{AREA_MAP[entry.area] || entry.area}</span>
            )}
            {entry.imagenes?.length > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Icon name="image" size="10px" />{entry.imagenes.length}
              </span>
            )}
            <Icon name="expand_more" size="12px" className="text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </button>

      {/* ─── Expanded Details ─── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-slate-100 pt-2.5 animate-in fade-in duration-150">
          {/* Images */}
          {entry.imagenes?.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {entry.imagenes.map((img) => (
                <img key={img.id} src={img.url} alt={`Adjunto ${img.orden}`}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200" loading="lazy" />
              ))}
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-1">
              <Icon name={estadoC.icon} size="12px" style={{ color: estadoC.color }} />
              <span className="text-slate-500">{estadoC.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="flag" size="12px" style={{ color: prioridad?.color || '#cbd5e1' }} />
              <span className="text-slate-500">{prioridad?.label || 'Sin prioridad'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="domain" size="12px" className="text-slate-400" />
              <span className="text-slate-500">{AREA_MAP[entry.area] || entry.area}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="sell" size="12px" className="text-slate-400" />
              <span className="text-slate-500">{LINEA_MAP[entry.linea] || entry.linea || 'Sin línea'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="schedule" size="12px" className="text-slate-400" />
              <span className="text-slate-500">{formatTime(entry.createdAt)}</span>
            </div>
            {entry.creadoPor && (
              <div className="flex items-center gap-1">
                <Icon name="person" size="12px" className="text-slate-400" />
                <span className="text-slate-500">{entry.creadoPor.nombre}</span>
              </div>
            )}
          </div>

          {/* Assignees */}
          {(seguimiento.length > 0 || ejecutores.length > 0) && (
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {seguimiento.map(a => (
                <span key={a.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                  👁 {a.usuario?.nombre}
                </span>
              ))}
              {ejecutores.map(a => (
                <span key={a.id} className="px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded font-medium">
                  ⚡ {a.usuario?.nombre}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {entry.notas?.length > 0 && (
            <div className="space-y-1">
              {entry.notas.slice(0, 2).map((nota) => (
                <div key={nota.id} className="bg-slate-50 rounded-md p-1.5 text-[11px] text-slate-600 leading-snug">
                  {nota.contenido}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5 pt-0.5">
            {onOrganize && (
              <button
                onClick={(e) => { e.stopPropagation(); onOrganize(entry); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-marca-primario bg-marca-primario/8 border border-marca-primario/12 active:scale-95 transition-all"
              >
                <Icon name="tune" size="14px" />Organizar
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 active:scale-95 transition-all ml-auto"
            >
              <Icon name="expand_less" size="14px" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
