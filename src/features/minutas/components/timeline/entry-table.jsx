import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { AREA_MAP, CLASIFICACION_MAP, ESTADO_TAREA_MAP, PRIORIDAD_MAP, LINEA_MAP } from '../../constants';
import { formatFecha, isPastDate } from '@/lib/date';
import { Pencil, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { LineIconSelector } from '../icons/line-icons';
import { ImageViewer } from './entry-card';

const ESTADO_STYLES = {
  PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
  CERRADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADA: 'bg-red-50 text-red-700 border-red-200',
};

// Componente para previsualización en hover en la tabla
const TableImagePreview = ({ images, onClick }) => {
  if (!images || images.length === 0) return <span className="text-[11px] text-slate-300">—</span>;
  const mainImg = images[0].preview || images[0].url;

  return (
    <div className="relative group/img flex items-center justify-center">
      <div 
        className="h-40 w-40 min-w-[10rem] shrink-0 rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100/80 relative z-10 cursor-pointer flex items-center justify-center p-1.5"
        onClick={onClick}
      >
        <img src={mainImg} alt="Preview" className="h-full w-full object-contain rounded-xl drop-shadow-sm" />
        {images.length > 1 && (
          <div className="absolute bottom-0 right-0 bg-slate-900/85 px-2 py-1 text-[8px] font-black text-white rounded-tl-xl z-20 shadow-md">
            +{images.length - 1}
          </div>
        )}
      </div>

      {/* Hover Card con imagen más grande (No pantalla completa, solo preview flotante) */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 z-50 opacity-0 invisible group-hover/img:opacity-100 group-hover/img:visible transition-all duration-200 ml-2 pointer-events-none drop-shadow-2xl">
        <div className="bg-white p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 w-80 h-80 flex items-center justify-center relative overflow-hidden">
          <img src={mainImg} alt="Preview Zoom" className="w-full h-full object-contain rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const EntryTable = ({ entries, departamento, onOrganize, onRemoveDraft, onUpdateDraft, onUpdateSaved, onChangeStatus, users }) => {
  const [viewerIndex, setViewerIndex] = useState(null);
  const [activeEntryImages, setActiveEntryImages] = useState([]);

  const openViewer = (images) => {
    setActiveEntryImages(images);
    setViewerIndex(0);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm pb-16">
        <table className="w-full min-w-[56rem] border-collapse relative">
          <thead>
            <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200">
              <th className="px-3 py-3 text-left whitespace-nowrap w-12">#</th>
              <th className="px-3 py-3 text-center whitespace-nowrap w-16">Adjuntos</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Descripción</th>
              <th className="px-3 py-3 text-center whitespace-nowrap w-24">Línea</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Clasif.</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Estado</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Prioridad</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Vence</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Encargado</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const isDraft = Boolean(entry.tempId);
              const overdue = !isDraft && entry.fechaVencimiento && entry.estado !== 'CERRADA' && entry.estado !== 'EN_REVISION' && isPastDate(entry.fechaVencimiento);
              const clasif = CLASIFICACION_MAP[entry.clasificacion];
              const estadoActual = entry.estado || (entry.tipo === 'TAREA' || entry.tipo === 'RECORDATORIO' ? 'PENDIENTE' : null);
              const estado = estadoActual ? ESTADO_TAREA_MAP[estadoActual] : null;
              const prioridad = PRIORIDAD_MAP[entry.prioridad];
              const assignee = entry.asignaciones?.[0]?.usuario;
              const allImages = [...(entry._localImagenes || []), ...(entry.imagenes || [])];

              const isMarketing = departamento === 'MARKETING';
              const lineInfo = isMarketing
                  ? { label: 'Campaña', color: '#8b5cf6' }
                  : (LINEA_MAP[entry.linea] || {
                      label: entry.linea || '—',
                      color: '#64748b'
                  });

              const getRowStyles = () => {
                if (isDraft) return 'bg-emerald-50/40 hover:bg-emerald-100/60';
                if (overdue) return 'bg-red-50/40 hover:bg-red-100/60';
                
                switch (estadoActual) {
                  case 'PENDIENTE': return 'bg-amber-50/30 hover:bg-amber-100/50';
                  case 'EN_REVISION': return 'bg-blue-50/30 hover:bg-blue-100/50';
                  case 'CERRADA': return 'bg-emerald-50/20 hover:bg-emerald-100/40 opacity-80';
                  case 'CANCELADA': return 'bg-red-50/20 hover:bg-red-100/40 opacity-80';
                  default: return 'bg-white hover:bg-slate-50/80';
                }
              };

              return (
                <tr
                  key={entry.id || entry.tempId}
                  className={cn(
                    'transition-colors border-b border-slate-100 last:border-b-0',
                    getRowStyles()
                  )}
                >
                  {/* # */}
                  <td className="px-3 py-3 text-[12px] font-medium text-slate-700 align-middle">
                    {isDraft ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                        Borrador
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-xs">{idx + 1}</span>
                    )}
                  </td>

                  {/* Img Preview */}
                  <td className="px-3 py-2 text-center relative align-middle">
                    <TableImagePreview images={allImages} onClick={() => openViewer(allImages)} />
                  </td>

                  {/* Descripción */}
                  <td className="px-3 py-3 text-[12px] font-medium text-slate-700 align-middle">
                    <span
                      className="block truncate max-w-[18rem]"
                      title={entry.descripcion}
                    >
                      {entry.descripcion || 'Sin descripción'}
                    </span>
                  </td>

                  {/* Línea */}
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center">
                            {isMarketing ? (
                                <Icon
                                    name="campaign"
                                    size="32px"
                                    style={{ color: lineInfo.color }}
                                />
                            ) : (
                                <LineIconSelector
                                    type={entry.linea}
                                    size={70}
                                    style={{ color: lineInfo.color }}
                                />
                            )}
                        </div>

                        <span
                            className="text-[7px] font-black uppercase tracking-widest font-mono leading-none text-center"
                            style={{ color: lineInfo.color }}
                        >
                            {lineInfo.label}
                        </span>
                    </div>
                  </td>

                  {/* Clasificación */}
                  <td className="px-3 py-3 align-middle text-center">
                    {clasif ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[6px] font-black uppercase tracking-widest whitespace-nowrap"
                        style={{
                          backgroundColor: `${clasif.color}10`,
                          color: clasif.color,
                          border: `1px solid ${clasif.color}20`,
                        }}
                      >
                        <Icon name={clasif.icon} size="20px" className="shrink-0" />
                        {clasif.label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-3 py-3 text-center">
                    {estado ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap',
                          ESTADO_STYLES[estadoActual] || 'bg-slate-50 text-slate-400 border-slate-200'
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
                  <td className="px-3 py-3 text-center whitespace-nowrap">
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

                  {/* Encargado (Avatar Circular) */}
                  <td className="px-3 py-3 text-center">
                    {assignee ? (
                      <div className="relative group/tooltip inline-flex items-center justify-center cursor-help">
                        <div className="h-8 w-8 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm">
                          {assignee.imagen ? (
                            <img src={assignee.imagen} alt={assignee.nombre} className="h-full w-full object-cover" />
                          ) : (
                            assignee.nombre.charAt(0)
                          )}
                        </div>
                        {/* Tooltip de Usuario */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-50">
                          {assignee.nombre}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </div>
                      </div>
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

      {viewerIndex !== null && (
        <ImageViewer 
          images={activeEntryImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerIndex(null)} 
        />
      )}
    </>
  );
};
