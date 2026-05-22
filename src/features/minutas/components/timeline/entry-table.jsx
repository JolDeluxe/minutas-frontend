import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { AREA_MAP, CLASIFICACION_MAP, ESTADO_TAREA_MAP, PRIORIDAD_MAP } from '../../constants';
import { formatFecha, isPastDate } from '@/lib/date';
import { Pencil, Settings2, Trash2 } from 'lucide-react';

const ESTADO_STYLES = {
  PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
  CERRADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADA: 'bg-red-50 text-red-700 border-red-200',
};

export const EntryTable = ({ entries, departamento, onOrganize, onRemoveDraft, onUpdateDraft, onUpdateSaved, onChangeStatus, users }) => {
  const showLinea = departamento === 'DISENO';

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[56rem] border-collapse">
        <thead>
          <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <th className="px-3 py-3 text-left whitespace-nowrap w-12">#</th>
            <th className="px-3 py-3 text-left whitespace-nowrap">Descripción</th>
            <th className="px-3 py-3 text-left whitespace-nowrap">Área</th>
            {showLinea && <th className="px-3 py-3 text-left whitespace-nowrap">Línea</th>}
            <th className="px-3 py-3 text-left whitespace-nowrap">Clasif.</th>
            <th className="px-3 py-3 text-left whitespace-nowrap">Estado</th>
            <th className="px-3 py-3 text-left whitespace-nowrap">Prioridad</th>
            <th className="px-3 py-3 text-left whitespace-nowrap">Vence</th>
            <th className="px-3 py-3 text-left whitespace-nowrap">Responsable</th>
            <th className="px-3 py-3 text-left whitespace-nowrap">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const isDraft = Boolean(entry.tempId);
            const overdue = !isDraft && entry.fechaVencimiento && entry.estado !== 'CERRADA' && entry.estado !== 'EN_REVISION' && isPastDate(entry.fechaVencimiento);
            const clasif = CLASIFICACION_MAP[entry.clasificacion];
            const estado = ESTADO_TAREA_MAP[entry.estado];
            const prioridad = PRIORIDAD_MAP[entry.prioridad];
            const firstAssignee = entry.asignaciones?.[0]?.usuario?.nombre;

            return (
              <tr
                key={entry.id || entry.tempId}
                className={cn(
                  'hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0',
                  isDraft && 'bg-emerald-50/30',
                  overdue && !isDraft && 'bg-red-50/30'
                )}
              >
                {/* # */}
                <td className="px-3 py-3 text-[12px] font-medium text-slate-700">
                  {isDraft ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                      🟢 Borrador
                    </span>
                  ) : (
                    <span className="text-slate-400 font-bold">{idx + 1}</span>
                  )}
                </td>

                {/* Descripción */}
                <td className="px-3 py-3 text-[12px] font-medium text-slate-700">
                  <span
                    className="block truncate max-w-[20rem]"
                    title={entry.descripcion}
                  >
                    {entry.descripcion || 'Sin descripción'}
                  </span>
                </td>

                {/* Área */}
                <td className="px-3 py-3 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                  {AREA_MAP[entry.area] || entry.area || '—'}
                </td>

                {/* Línea */}
                {showLinea && (
                  <td className="px-3 py-3 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    {entry.linea || '—'}
                  </td>
                )}

                {/* Clasificación */}
                <td className="px-3 py-3">
                  {clasif ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                      style={{
                        backgroundColor: `${clasif.color}10`,
                        color: clasif.color,
                        border: `1px solid ${clasif.color}20`,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: clasif.color }}
                      />
                      {clasif.label}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300">—</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-3 py-3">
                  {estado ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap',
                        ESTADO_STYLES[entry.estado] || 'bg-slate-50 text-slate-400 border-slate-200'
                      )}
                    >
                      {estado.label}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300">—</span>
                  )}
                </td>

                {/* Prioridad */}
                <td className="px-3 py-3">
                  {prioridad ? (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap"
                      style={{ color: prioridad.color }}
                    >
                      <Icon name={prioridad.icon} size="13px" />
                      {prioridad.label}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300">—</span>
                  )}
                </td>

                {/* Vence */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {entry.fechaVencimiento ? (
                    <span
                      className={cn(
                        'text-[11px] font-medium',
                        overdue ? 'font-bold text-red-600' : 'text-slate-500'
                      )}
                    >
                      {formatFecha(entry.fechaVencimiento)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300">—</span>
                  )}
                </td>

                {/* Responsable */}
                <td className="px-3 py-3">
                  {firstAssignee ? (
                    <span className="block truncate max-w-[7rem] text-[11px] font-medium text-slate-600">
                      {firstAssignee}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300">—</span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => isDraft ? onUpdateDraft?.(entry) : onUpdateSaved?.(entry.id, entry)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 text-slate-400 transition-all hover:border-slate-300 hover:text-slate-700 active:scale-95"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={() => onOrganize?.(entry)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 text-slate-400 transition-all hover:border-slate-300 hover:text-slate-700 active:scale-95"
                      title="Organizar"
                    >
                      <Settings2 size={13} />
                    </button>

                    {isDraft && (
                      <button
                        onClick={() => onRemoveDraft?.(entry.tempId)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 text-rose-400 transition-all hover:bg-rose-500 hover:text-white active:scale-95"
                        title="Eliminar borrador"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    {!isDraft && entry.tipo === 'TAREA' && onChangeStatus && (
                      <button
                        onClick={() => onChangeStatus(entry.id, entry)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 text-slate-400 transition-all hover:border-slate-300 hover:text-slate-700 active:scale-95"
                        title="Cambiar estado"
                      >
                        <Icon name="swap_horiz" size="14px" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
