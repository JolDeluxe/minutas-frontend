import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { AREA_MAP, CLASIFICACION_MAP, ESTADO_TAREA_MAP, PRIORIDAD_MAP, LINEA_MAP } from '../../constants';
import { formatFecha, isPastDate } from '@/lib/date';
import { Pencil, Settings2, Trash2, StickyNote, Plus, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LineIconSelector } from '../icons/line-icons';
import { ImageViewer } from './entry-card';

const ESTADO_STYLES = {
  PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
  CERRADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADA: 'bg-red-50 text-red-700 border-red-200',
};

// Componente de Nota Editable (Reutilizado de EntryCard logic)
const EditableNote = ({ note, onUpdate, onDelete, readOnly }) => {
  const [content, setContent] = useState(note.contenido || '');
  const [prevContenido, setPrevContenido] = useState(note.contenido);
  const textareaRef = useRef(null);

  if (note.contenido !== prevContenido) {
    setPrevContenido(note.contenido);
    setContent(note.contenido || '');
  }

  const handleBlur = () => {
    if (!readOnly && content.trim() !== note.contenido) {
      onUpdate?.(note.id, content.trim());
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="group relative rounded-2xl border-l-4 border-amber-400 bg-white/70 p-4 shadow-sm transition-all hover:bg-white">
      {!readOnly && onDelete && (
        <button
          onClick={() => onDelete(note.id)}
          className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white z-10 border border-slate-100"
        >
          <X size={12} />
        </button>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        className="w-full bg-transparent resize-none text-[13px] font-medium leading-relaxed text-amber-950 focus:outline-none p-0 border-none placeholder:text-amber-200 overflow-hidden"
      />
    </div>
  );
};

// Modal de Notas (Reutilizado de EntryCard logic)
const EntryNotesPostIt = ({ entry, notes, onClose, onAddNote, onUpdateNote, onDeleteNote }) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!content.trim() || saving || !onAddNote || entry.readOnly) return;
    setSaving(true);
    try {
      const created = await onAddNote(entry.id, content.trim());
      if (created !== false) setContent('');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Cerrar notas" />
      <div className="relative flex max-h-[82dvh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-amber-200 bg-[#fffbeb] shadow-2xl shadow-slate-950/25 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-amber-200/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20">
              <StickyNote size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-amber-950">Notas de entrada</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">{notes.length} registradas</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-amber-700 transition-colors hover:bg-amber-100 active:scale-95"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-white/45 p-5 text-center">
              <p className="text-xs font-bold text-amber-800/60">Esta entrada todavía no tiene notas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <EditableNote key={note.id} note={note} onUpdate={onUpdateNote} onDelete={onDeleteNote} readOnly={entry.readOnly} />
              ))}
            </div>
          )}
        </div>
        {!entry.readOnly && (
          <div className="shrink-0 border-t border-amber-200/70 bg-amber-50/70 p-4">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Agregar nota..." rows={2} className="w-full resize-none rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-amber-950 placeholder:text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-300/20" />
            <div className="mt-3 flex justify-end">
              <button onClick={handleAdd} disabled={!content.trim() || saving} className={cn("flex items-center gap-2 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95", content.trim() ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white text-amber-200")}>
                {saving ? <Icon name="progress_activity" size="16px" className="animate-spin" /> : <Plus size={16} />}
                Agregar nota
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// Componente para previsualización en hover en la tabla usando PORTAL para no quedar atrapado
const TableImagePreview = ({ images, onClick }) => {
  const [showHover, setShowHover] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  if (!images || images.length === 0) return <span className="text-[11px] text-slate-300">—</span>;
  const mainImg = images[0].preview || images[0].url;

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Posicionamiento inteligente: Detectar si hay espacio a la derecha, si no, ponerlo a la izquierda
      const spaceRight = window.innerWidth - rect.right;
      const xPos = spaceRight > 350 ? rect.right + 20 : rect.left - 340;
      
      setCoords({
        x: xPos,
        y: rect.top + (rect.height / 2)
      });
      setShowHover(true);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowHover(false)}
    >
      <div 
        className="h-24 w-24 min-w-[6rem] shrink-0 rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100/80 relative z-10 cursor-pointer flex items-center justify-center p-1.5 hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <img src={mainImg} alt="Preview" className="h-full w-full object-contain rounded-xl drop-shadow-sm" />
        {images.length > 1 && (
          <div className="absolute bottom-0 right-0 bg-slate-900/85 px-2 py-1 text-[8px] font-black text-white rounded-tl-xl z-20 shadow-md">
            +{images.length - 1}
          </div>
        )}
      </div>
      
      {/* Hover Card con PORTAL - Evita recortes por overflow */}
      {showHover && createPortal(
        <div 
          className="fixed z-[99999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: coords.x, 
            top: coords.y, 
            transform: 'translateY(-50%)' 
          }}
        >
          <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.45)] border border-slate-200 w-80 h-80 flex items-center justify-center relative overflow-hidden">
            <img src={mainImg} alt="Preview Zoom" className="w-full h-full object-contain rounded-2xl" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const EntryTable = ({ 
  entries, departamento, onOrganize, onRemoveDraft, onUpdateDraft, 
  onUpdateSaved, onCreateNote, onUpdateNote, onDeleteNote, onChangeStatus, users 
}) => {
  const [viewerIndex, setViewerIndex] = useState(null);
  const [activeEntryImages, setActiveEntryImages] = useState([]);
  const [activeNotesEntry, setActiveNotesEntry] = useState(null);

  const openViewer = (images) => {
    setActiveEntryImages(images);
    setViewerIndex(0);
  };

  return (
    <>
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm max-h-[70vh] scrollbar-thin relative">
        <table className="w-full min-w-[85rem] border-collapse relative table-fixed">
          <thead className="sticky top-0 z-40 shadow-sm">
            <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 text-center">
              <th className="px-3 py-4 text-left w-14 bg-slate-50 border-b border-slate-200">#</th>
              <th className="px-3 py-4 w-40 bg-slate-50 border-b border-slate-200 text-center">Adjuntos</th>
              <th className="px-3 py-4 text-left w-auto bg-slate-50 border-b border-slate-200">Descripción</th>
              <th className="px-3 py-4 w-28 bg-slate-50 border-b border-slate-200 text-center">Línea</th>
              <th className="px-3 py-4 w-32 bg-slate-50 border-b border-slate-200 text-center">Clasif.</th>
              <th className="px-3 py-4 w-28 bg-slate-50 border-b border-slate-200 text-center">Estado</th>
              <th className="px-3 py-4 w-28 bg-slate-50 border-b border-slate-200 text-center">Prioridad</th>
              <th className="px-3 py-4 w-32 bg-slate-50 border-b border-slate-200 text-center">Vence</th>
              <th className="px-3 py-4 w-20 bg-slate-50 border-b border-slate-200 text-center">Resp.</th>
              <th className="px-3 py-4 w-44 bg-slate-50 border-b border-slate-200 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((entry, idx) => {
              const isDraft = Boolean(entry.tempId);
              const overdue = !isDraft && entry.fechaVencimiento && entry.estado !== 'CERRADA' && entry.estado !== 'EN_REVISION' && isPastDate(entry.fechaVencimiento);
              const clasif = CLASIFICACION_MAP[entry.clasificacion];
              const estadoActual = entry.estado || (entry.tipo === 'TAREA' || entry.tipo === 'RECORDATORIO' ? 'PENDIENTE' : null);
              const estado = estadoActual ? ESTADO_TAREA_MAP[estadoActual] : null;
              const prioridad = PRIORIDAD_MAP[entry.prioridad];
              const assignee = entry.asignaciones?.[0]?.usuario;
              const allImages = [...(entry._localImagenes || []), ...(entry.imagenes || [])];
              const entryNotes = entry.notas || [];

              const isMarketing = departamento === 'MARKETING';
              const lineInfo = isMarketing
                  ? { label: 'Campaña', color: '#8b5cf6' }
                  : (LINEA_MAP[entry.linea] || {
                      label: entry.linea || '—',
                      color: '#64748b'
                  });

              const getRowStyles = () => {
                if (isDraft) return 'bg-emerald-50/40 hover:bg-emerald-100/60 ring-1 ring-emerald-500/5';
                if (overdue) return 'bg-red-50/40 hover:bg-red-100/60 ring-1 ring-red-500/10';
                
                switch (estadoActual) {
                  case 'PENDIENTE': return 'bg-amber-50/30 hover:bg-amber-100/50';
                  case 'EN_REVISION': return 'bg-blue-50/30 hover:bg-blue-100/50';
                  case 'CERRADA': return 'bg-emerald-50/10 hover:bg-emerald-100/20 opacity-80';
                  case 'CANCELADA': return 'bg-red-50/10 hover:bg-red-100/20 opacity-80';
                  default: return 'bg-white hover:bg-slate-50/80';
                }
              };

              return (
                <tr
                  key={entry.id || entry.tempId}
                  className={cn(
                    'transition-all duration-200 border-b border-slate-100 last:border-b-0',
                    getRowStyles()
                  )}
                >
                  {/* # */}
                  <td className="px-4 py-4 text-[12px] font-medium text-slate-700 align-middle">
                    {isDraft ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700 shadow-xs">
                        Borrador
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-xs">#{idx + 1}</span>
                    )}
                  </td>

                  {/* Img Preview */}
                  <td className="px-3 py-3 text-center relative align-middle">
                    <TableImagePreview images={allImages} onClick={() => openViewer(allImages)} />
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-4 align-middle text-left">
                    <span className="block text-[13px] font-semibold text-slate-800 leading-relaxed line-clamp-3" title={entry.descripcion}>
                      {entry.descripcion || 'Sin descripción'}
                    </span>
                  </td>

                  {/* Línea (ICONOS GRANDES RECUPERADOS) */}
                  <td className="px-3 py-3 align-middle text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center">
                            {isMarketing ? (
                                <Icon name="campaign" size="32px" style={{ color: lineInfo.color }} />
                            ) : (
                                <LineIconSelector type={entry.linea} size={70} style={{ color: lineInfo.color }} />
                            )}
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] font-mono text-center leading-none" style={{ color: lineInfo.color }}>
                            {lineInfo.label}
                        </span>
                    </div>
                  </td>

                  {/* Clasificación */}
                  <td className="px-3 py-3 align-middle text-center">
                    {clasif ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-xs"
                        style={{ backgroundColor: `${clasif.color}10`, color: clasif.color, border: `1px solid ${clasif.color}20` }}
                      >
                        <Icon name={clasif.icon} size="12px" className="shrink-0" />
                        {clasif.label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-3 py-3 text-center align-middle">
                    {estado ? (
                      <span className={cn('inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-xs', ESTADO_STYLES[estadoActual] || 'bg-slate-50 text-slate-600 border-slate-200')}>
                        {estado.label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Prioridad */}
                  <td className="px-3 py-3 align-middle text-center">
                    {prioridad ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wide whitespace-nowrap" style={{ color: prioridad.color }}>
                        <Icon name={prioridad.icon} size="14px" />
                        {prioridad.label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Vence */}
                  <td className="px-3 py-3 whitespace-nowrap align-middle text-center">
                    {entry.fechaVencimiento ? (
                      <span className={cn('text-[11px] font-bold font-mono', overdue ? 'text-red-600' : 'text-slate-500')}>
                        {formatFecha(entry.fechaVencimiento)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Encargado (Avatar Circular) */}
                  <td className="px-3 py-3 text-center align-middle">
                    {assignee ? (
                      <div className="relative group/tooltip inline-block cursor-help">
                        <div className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px] shadow-md mx-auto">
                          {assignee.imagen ? (
                            <img src={assignee.imagen} alt={assignee.nombre} className="h-full w-full object-cover" />
                          ) : (
                            assignee.nombre.charAt(0)
                          )}
                        </div>
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
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2 justify-center">
                      {!isDraft && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveNotesEntry(entry); }}
                          className={cn(
                            "h-8 flex items-center gap-1 px-2 rounded-xl border transition-all active:scale-95 shadow-xs bg-white",
                            entryNotes.length > 0 ? "border-amber-300 text-amber-700 bg-amber-50" : "border-slate-200 text-slate-400 hover:text-amber-600"
                          )}
                          title="Notas de la tarea"
                        >
                          <StickyNote size={15} />
                          <span className="text-[10px] font-black">{entryNotes.length}</span>
                        </button>
                      )}
                      
                      <button onClick={() => isDraft ? onUpdateDraft?.(entry) : onUpdateSaved?.(entry.id, entry)} className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 bg-white shadow-xs active:scale-90 transition-all" title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => onOrganize?.(entry)} className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 bg-white shadow-xs active:scale-90 transition-all" title="Organizar">
                        <Settings2 size={15} />
                      </button>
                      {isDraft && (
                        <button onClick={() => onRemoveDraft?.(entry.tempId)} className="h-8 w-8 flex items-center justify-center rounded-xl border border-rose-100 text-rose-400 hover:bg-rose-500 hover:text-white bg-white active:scale-90 transition-all shadow-xs" title="Eliminar borrador">
                          <Trash2 size={15} />
                        </button>
                      )}
                      {!isDraft && entry.tipo === 'TAREA' && onChangeStatus && (
                        <button onClick={() => onChangeStatus(entry.id, entry)} className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 bg-white shadow-xs active:scale-90 transition-all" title="Cambiar estado">
                          <Icon name="swap_horiz" size="18px" />
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

      {activeNotesEntry && (
        <EntryNotesPostIt
          entry={{ ...activeNotesEntry, readOnly: activeNotesEntry.estado === 'CERRADA' }}
          notes={activeNotesEntry.notas || []}
          onClose={() => setActiveNotesEntry(null)}
          onAddNote={onCreateNote}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      )}

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
