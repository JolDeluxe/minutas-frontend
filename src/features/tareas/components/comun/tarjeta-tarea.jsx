// src/features/tareas/components/hoy/hoy-tarea-card.jsx
import { Icon, ConfirmModal, TableActions, Tooltip } from '@/components/ui/z_index';
import { StickyNote, X, Plus } from 'lucide-react';
import { EtiquetaEstadoTarea } from './etiqueta-estado-tarea';
import { EtiquetaPrioridadTarea } from './etiqueta-prioridad-tarea';
import { ModalEntregarTarea } from './modal-entregar-tarea';
import { isPastDate } from '@/lib/date';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { LINEA_MAP, CLASIFICACION_MAP, AREA_MAP } from '../../../minutas/constants';
import { LineIconSelector, MarketingIcon } from '../../../minutas/components/icons/line-icons';
import { createTareaNota, updateTareaNota, deleteTareaNota } from '../../api/tareas-api';

const ESTADOS_FINALES = ['CERRADA', 'CANCELADA', 'DESCARTADA'];
const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

const isVencida = (tarea) => {
    if (!tarea.fechaVencimiento) return false;
    if (['EN_REVISION', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    return isPastDate(tarea.fechaVencimiento);
};

const CardImageCarousel = ({ images, lineInfo, isMarketing }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHover, setShowHover] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;
  const currentImg = images[currentIndex];

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const previewWidth = window.innerWidth < 640 ? 260 : 380;
    
    let x = rect.right + 20;
    if (x + previewWidth > window.innerWidth) {
      x = rect.left - previewWidth - 20;
    }
    x = Math.max(20, x);
    let y = rect.top + (rect.height / 2);
    
    setCoords({ x, y });
    setShowHover(true);
  };

  return (
    <div className="relative group/img flex flex-col items-center gap-2 w-full" ref={containerRef}>
      <div
        className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-[1.25rem] border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center p-0.5 group-hover/img:border-marca-primario/40 transition-all active:scale-95"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowHover(false)}
      >
        <div className="relative w-full h-full rounded-[1rem] overflow-hidden bg-slate-50">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out",
                i === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
              )}
              alt={`Adjunto ${i + 1}`}
            />
          ))}
        </div>
        
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentIndex ? "bg-white w-3 shadow-sm" : "bg-white/40 w-1")} />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Icon name="zoom_in" size="20px" className="text-white drop-shadow-md" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs animate-in fade-in duration-500 max-w-full">
         {isMarketing ? (
            <MarketingIcon size={14} style={{ color: lineInfo.color }} />
         ) : (
            <LineIconSelector type={lineInfo.value} size={16} style={{ color: lineInfo.color }} />
         )}
         <span className="text-[7px] font-black uppercase tracking-wider truncate" style={{ color: lineInfo.color }}>{lineInfo.label}</span>
      </div>

      {showHover && createPortal(
        <div 
          className="fixed z-[999999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ left: coords.x, top: coords.y, transform: 'translateY(-50%)' }}
        >
          <div className="w-64 h-64 sm:w-[380px] sm:h-[380px] flex items-center justify-center relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-2 shadow-[0_50px_120px_rgba(0,0,0,0.5)] ring-[12px] ring-white/20">
            <img src={currentImg.url} alt="Preview Zoom" className="w-full h-full object-contain rounded-3xl drop-shadow-lg animate-in fade-in duration-500 bg-slate-50" />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-2xl border border-white/10">
               Vista Rápida
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

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
      {note.createdAt && (
        <div className="mt-3 flex items-center justify-between opacity-30">
          <Icon name="push_pin" size="10px" className="text-amber-600 rotate-12" />
          <p className="text-[8px] font-black uppercase tracking-widest text-amber-700">
            {new Date(note.createdAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  );
};

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
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative flex max-h-[82dvh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-amber-200 bg-[#fffbeb] shadow-2xl shadow-slate-950/25 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-amber-200/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20">
              <StickyNote size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-amber-950">Notas de tarea</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">{notes.length} registradas</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-amber-700 transition-colors hover:bg-amber-100 active:scale-95"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-white/45 p-5 text-center">
              <p className="text-xs font-bold text-amber-800/60">Esta tarea todavía no tiene notas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note, idx) => (
                <EditableNote key={note.id || idx} note={note} onUpdate={(id, c) => onUpdateNote(entry.id, id || idx, c)} onDelete={(id) => onDeleteNote(entry.id, id || idx)} readOnly={entry.readOnly} />
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

export const TareaCard = ({
    tarea,
    currentUser,
    onViewDetail,
    onChangeStatus,
    onReview,
    onEdit,
    onDelete,
    isMisTareas = false,
    className,
}) => {

    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
    const [isConfirmAprobarOpen, setIsConfirmAprobarOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showNotesPanel, setShowNotesPanel] = useState(false);
    const [notas, setNotas] = useState(tarea.notas || []);
    const isExpanded = false;

    const handleAddNote = async (tareaId, contenido) => {
        try {
            const res = await createTareaNota({ tareaId, contenido });
            if (res.data?.status === 'success' || res.data?.data) {
                const newNote = res.data.data;
                setNotas((prev) => [newNote, ...prev]);
                return newNote;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const handleUpdateNote = async (tareaId, noteId, contenido) => {
        try {
            const res = await updateTareaNota(noteId, { contenido });
            if (res.data?.status === 'success' || res.data?.data) {
                const updated = res.data.data;
                setNotas((prev) => prev.map((n) => n.id === noteId ? updated : n));
                return updated;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const handleDeleteNote = async (tareaId, noteId) => {
        try {
            const res = await deleteTareaNota(noteId);
            if (res.data?.status === 'success' || res.status === 200) {
                setNotas((prev) => prev.filter((n) => n.id !== noteId));
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const { rol } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;

    const estado = tarea.estado?.toUpperCase() || 'PENDIENTE';
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrado = ESTADOS_FINALES.includes(estado);
    
    const vencida = isVencida(tarea);
    const isMarketing = tarea.departamento === 'MARKETING';

    const getCardStyles = () => {
        if (vencida) return 'bg-red-50/40 hover:bg-red-100/60 ring-1 ring-red-500/20';
        if (isCerrado) return 'opacity-70 grayscale bg-slate-50/50 hover:bg-slate-100/60 border-slate-200/50';
        switch (estado) {
            case 'PENDIENTE': return 'bg-white hover:bg-amber-50/30';
            case 'EN_REVISION': return 'bg-blue-50/30 hover:bg-blue-100/50';
            default: return 'bg-white hover:bg-slate-50/30';
        }
    };

    const imagenesCaptura = tarea.imagenes?.filter(img => img.tipo !== 'EVIDENCIA') || [];
    const hasImages = imagenesCaptura.length > 0;
    const esAsignadoDirecto = tarea.responsables?.some((r) => r.id == currentUser?.id);
    
    const lineInfo = {
        label: isMarketing ? 'Marketing' : (LINEA_MAP[tarea.linea]?.label || tarea.linea || '—'),
        color: isMarketing ? '#8b5cf6' : (LINEA_MAP[tarea.linea]?.color || '#64748b'),
        value: tarea.linea
    };

    const clasif = CLASIFICACION_MAP[tarea.clasificacion] || null;
    const isExternal = (currentUser?.departamento === 'DISEÑO' && tarea.area !== 'DISENO') || (currentUser?.departamento === 'MARKETING' && tarea.area !== 'MARKETING');

    return (
        <>
            <div
                onClick={() => onViewDetail?.(tarea)}
                className={cn(
                    'group relative flex flex-col transition-all duration-300 rounded-[1.5rem] border border-slate-200/80 overflow-hidden cursor-pointer',
                    isExpanded ? 'shadow-xl ring-2 ring-slate-200' : 'shadow-sm hover:shadow-md',
                    getCardStyles(),
                    className
                )}
            >
                <div className="flex flex-row h-full min-h-[140px]">
                    
                    {/* PANEL IZQUIERDO: IMAGEN / IDENTIDAD */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-[105px] sm:w-[135px] bg-slate-50/50 border-r border-slate-100/50 p-2 sm:p-3 relative group/side">
                        {hasImages ? (
                            <CardImageCarousel 
                                images={imagenesCaptura} 
                                lineInfo={lineInfo}
                                isMarketing={isMarketing}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full gap-2">
                                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] transition-all duration-500 group-hover:scale-110 shadow-sm" style={{ backgroundColor: `${lineInfo.color}0f`, border: `1.5px solid ${lineInfo.color}25` }}>
                                   {isMarketing ? (
                                      <MarketingIcon size={32} style={{ color: lineInfo.color }} />
                                   ) : (
                                      <LineIconSelector type={tarea.linea} size={48} style={{ color: lineInfo.color }} />
                                   )}
                                </div>
                                <span className="font-black tracking-[0.1em] text-[7px] sm:text-[8px] uppercase font-mono text-center leading-tight px-1" style={{ color: lineInfo.color }}>
                                    {lineInfo.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* PANEL DERECHO: CONTENIDO */}
                    <div className="flex flex-col flex-1 min-w-0 p-3 sm:p-4">
                        
                        {/* Header: Status + Fechas */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border text-white shadow-sm transition-all",
                                  isExternal ? "bg-purple-600 border-purple-500" : "bg-rose-600 border-rose-500"
                                )}>
                                  <Icon name="task_alt" size="10px" className="shrink-0" />
                                  {isExternal ? `EXTERNA` : 'TAREA'}
                                </span>
                                <EtiquetaEstadoTarea status={estado} className="scale-90 origin-left" />
                                {isExternal && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border bg-purple-100/50 text-purple-700 border-purple-200/50">
                                    <Icon name="output" size="10px" />
                                    {AREA_MAP[tarea.area] || tarea.area}
                                  </span>
                                )}
                                {clasif && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border" style={{ backgroundColor: `${clasif.color}08`, color: clasif.color, borderColor: `${clasif.color}15` }}>
                                    <Icon name={clasif.icon} size="10px" />
                                    {clasif.label}
                                  </span>
                                )}
                                {tarea.prioridad && <EtiquetaPrioridadTarea priority={tarea.prioridad} className="scale-90 origin-left" />}
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                    #{tarea.id}
                                </span>
                                {vencida && <span className="text-[7px] font-black text-rose-500 animate-pulse uppercase">¡Vencida!</span>}
                            </div>
                        </div>

                        {/* Cuerpo: Descripción */}
                        <div className="flex-1 min-h-0">
                            <div className="relative group/text">
                                <p className={cn(
                                    "whitespace-pre-wrap break-words text-[13px] font-semibold leading-relaxed text-slate-800 transition-all duration-300 px-0.5",
                                    isCerrado && "line-through text-slate-400 opacity-60",
                                    !isExpanded && "line-clamp-3"
                                )}>
                                    {tarea.descripcion}
                                </p>
                            </div>
                        </div>

                        {/* Metadatos Rápidos Extra (Opcional, en la expansión o inline) */}
                        <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                                <button onClick={(e) => { e.stopPropagation(); setShowNotesPanel(true); }} className={cn(
                                    "flex h-7 px-2 items-center justify-center gap-1.5 rounded-lg border transition-all active:scale-95 shadow-xs",
                                    notas.length > 0 ? "border-amber-300 bg-amber-400 text-white font-black" : "border-amber-200 bg-amber-50 text-amber-600"
                                )}>
                                    <StickyNote size={14} />
                                    <span className="text-[10px]">{notas.length}</span>
                                </button>

                                {tarea.responsables?.length > 0 && (
                                    <div className="flex -space-x-2 ml-1">
                                        {tarea.responsables.map((r) => (
                                            <Tooltip key={r.id} text={r.nombre} position="top">
                                                <div className="h-6 w-6 rounded-full border border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-xs shrink-0 ring-1 ring-slate-200 transition-all hover:scale-110 hover:z-10 cursor-help">
                                                    {r.imagen ? (
                                                        <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" />
                                                    ) : (
                                                        r.nombre?.charAt(0)
                                                    )}
                                                </div>
                                            </Tooltip>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                {isMisTareas ? (
                                    <>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onViewDetail?.(tarea); }} 
                                            className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all active:scale-90 shadow-xs" 
                                            title="Ver Detalles"
                                        >
                                            <Icon name="visibility" size="14px" />
                                        </button>
                                        {isPendiente && esAsignadoDirecto && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEntregaModalOpen(true);
                                                }}
                                                className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                            >
                                                <Icon name="check" size="12px" /> Entregar
                                            </button>
                                        )}
                                        {isEnRevision && (
                                            <div className="h-7 px-2 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Icon name="fact_check" size="12px" /> En Revisión
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <TableActions 
                                        row={tarea} 
                                        actions={[
                                            { key: 'entregar', enabled: isPendiente && esAsignadoDirecto, onClick: (r) => { setIsEntregaModalOpen(true); } },
                                            { key: 'aprobar', enabled: isEnRevision && esJefe, onClick: (r) => { if (onReview) onReview(r); else setIsConfirmAprobarOpen(true); } },
                                            { key: 'ver_detalle', enabled: true, onClick: (r) => { onViewDetail?.(r); } },
                                            { key: 'editar', enabled: !isCerrado && onEdit, onClick: (r) => { onEdit(r); } },
                                            { key: 'borrar', enabled: !isCerrado && onDelete, onClick: (r) => { setDeleteTarget(r); } }
                                        ]} 
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEntregaModalOpen && (
                <ModalEntregarTarea
                    isOpen={isEntregaModalOpen}
                    onClose={() => setIsEntregaModalOpen(false)}
                    tareaId={tarea.id}
                    onConfirm={async () => {
                        const nextStatus = (rol === 'ADMIN' || rol === 'GERENCIA' || rol === 'JEFE') ? 'CERRADA' : 'EN_REVISION';
                        if (onChangeStatus) await onChangeStatus(tarea.id, nextStatus);
                    }}
                />
            )}

            {isConfirmAprobarOpen && (
                <ConfirmModal
                    isOpen={isConfirmAprobarOpen}
                    onClose={() => setIsConfirmAprobarOpen(false)}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(tarea.id, 'CERRADA');
                        setIsConfirmAprobarOpen(false);
                    }}
                    title="Aprobar Tarea"
                    message="¿Estás seguro de que deseas aprobar y cerrar esta tarea de forma definitiva?"
                    confirmText="Aprobar"
                    cancelText="Cancelar"
                    variant="success"
                />
            )}

            {deleteTarget && (
                <ConfirmModal
                    isOpen={Boolean(deleteTarget)}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={async () => {
                        if (onDelete) await onDelete(deleteTarget.id);
                        setDeleteTarget(null);
                    }}
                    title="Descartar Tarea"
                    message="¿Estás seguro de que deseas descartar esta tarea? Esta acción eliminará permanentemente los datos."
                    confirmText="Descartar"
                    cancelText="Cancelar"
                    variant="danger"
                />
            )}

            {showNotesPanel && (
                <EntryNotesPostIt
                    entry={{ ...tarea, readOnly: isCerrado || rol === 'COORDINADOR' }}
                    notes={notas}
                    onClose={() => setShowNotesPanel(false)}
                    onAddNote={handleAddNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                />
            )}
        </>
    );
};
