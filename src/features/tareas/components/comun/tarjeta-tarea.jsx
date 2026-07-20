// src/features/tareas/components/comun/tarjeta-tarea.jsx
// Componente unificado de tarjeta de tarea — compartido entre módulo Tareas y módulo Minutas (EntryCard)
import { Icon } from '@/components/ui/icon';
import { ConfirmModal } from '@/components/ui/modal';
import { TableActions } from '@/components/ui/table-actions';
import { Tooltip } from '@/components/ui/tooltip';
import { StickyNote, X, Plus, Settings2 } from 'lucide-react';
import { EtiquetaEstadoTarea } from './etiqueta-estado-tarea';
import { EtiquetaPrioridadTarea } from './etiqueta-prioridad-tarea';
import { ModalEntregarTarea } from './modal-entregar-tarea';
import { ModalRevisionTarea } from './modal-revision-tarea';
import { isPastDate, formatFecha } from '@/lib/date';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { LINEA_MAP, CLASIFICACION_MAP, AREA_MAP } from '../../../minutas/constants';
import { LineIconSelector, MarketingIcon } from '../../../minutas/components/icons/line-icons';
import { createTareaNota, updateTareaNota, deleteTareaNota } from '../../api/tareas-api';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';

const ESTADOS_FINALES = ['CERRADA', 'CANCELADA', 'DESCARTADA'];
const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

const isVencida = (tarea) => {
    if (!tarea.fechaVencimiento) return false;
    if (['EN_REVISION', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    return isPastDate(tarea.fechaVencimiento);
};

// ─────────────────────────────────────────────────────────────────────────────
// ImageViewer — Modal premium para ver imágenes a pantalla completa.
// Exportado para que entry-table.jsx y tabla-tareas.jsx puedan importarlo desde aquí.
// ─────────────────────────────────────────────────────────────────────────────
import { ImageViewer } from './image-viewer';
export { ImageViewer };

// ─────────────────────────────────────────────────────────────────────────────
// getGroupColorConfig — Configuración determinista de colores para tareas clonadas
// ─────────────────────────────────────────────────────────────────────────────
export const getGroupColorConfig = (minutaId, organizadoAt) => {
  if (!organizadoAt) return null;
  const time = new Date(organizadoAt).getTime();
  if (isNaN(time)) return null;
  
  const hash = (minutaId ? (minutaId * 13) : 0) + Math.floor(time / 1000);
  
  const palettes = [
    {
      // Violet/Purple
      cardBg: 'bg-violet-50/40 hover:bg-violet-100/30',
      cardBorder: 'border-violet-200/80',
      leftBorder: 'border-l-4 border-l-violet-500',
      badge: 'bg-violet-100 text-violet-700 border-violet-200',
      tableRow: 'bg-violet-50/30 hover:bg-violet-100/50 text-slate-800 border-b border-violet-100/70',
      tableBorder: '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-violet-500',
    },
    {
      // Sky/Light Blue
      cardBg: 'bg-sky-50/40 hover:bg-sky-100/30',
      cardBorder: 'border-sky-200/80',
      leftBorder: 'border-l-4 border-l-sky-500',
      badge: 'bg-sky-100 text-sky-700 border-sky-200',
      tableRow: 'bg-sky-50/30 hover:bg-sky-100/50 text-slate-800 border-b border-sky-100/70',
      tableBorder: '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-sky-500',
    },
    {
      // Emerald/Mint
      cardBg: 'bg-emerald-50/30 hover:bg-emerald-100/20',
      cardBorder: 'border-emerald-200/80',
      leftBorder: 'border-l-4 border-l-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      tableRow: 'bg-emerald-50/20 hover:bg-emerald-100/40 text-slate-800 border-b border-emerald-100/70',
      tableBorder: '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-emerald-500',
    },
    {
      // Rose/Pink
      cardBg: 'bg-rose-50/40 hover:bg-rose-100/30',
      cardBorder: 'border-rose-200/80',
      leftBorder: 'border-l-4 border-l-rose-400',
      badge: 'bg-rose-100 text-rose-700 border-rose-200',
      tableRow: 'bg-rose-50/30 hover:bg-rose-100/50 text-slate-800 border-b border-rose-100/70',
      tableBorder: '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-rose-400',
    },
    {
      // Amber/Honey
      cardBg: 'bg-amber-50/35 hover:bg-amber-100/25',
      cardBorder: 'border-amber-200/80',
      leftBorder: 'border-l-4 border-l-amber-500',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      tableRow: 'bg-amber-50/25 hover:bg-amber-100/45 text-slate-800 border-b border-amber-100/70',
      tableBorder: '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-amber-500',
    },
    {
      // Indigo/Deep Blue
      cardBg: 'bg-indigo-50/40 hover:bg-indigo-100/30',
      cardBorder: 'border-indigo-200/80',
      leftBorder: 'border-l-4 border-l-indigo-500',
      badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      tableRow: 'bg-indigo-50/30 hover:bg-indigo-100/50 text-slate-800 border-b border-indigo-100/70',
      tableBorder: '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-indigo-500',
    },
    {
      // Teal/Cyan-Green
      cardBg: 'bg-teal-50/30 hover:bg-teal-100/20',
      cardBorder: 'border-teal-200/80',
      leftBorder: 'border-l-4 border-l-teal-500',
      badge: 'bg-teal-100 text-teal-700 border-teal-200',
      tableRow: 'bg-teal-50/20 hover:bg-teal-100/40 text-slate-800 border-b border-teal-100/70',
      tableBorder: '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-teal-500',
    }
  ];
  
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
};

// ─────────────────────────────────────────────────────────────────────────────
// CardImageCarousel — Carrusel de miniaturas con previsualización hover (Portal)
// ─────────────────────────────────────────────────────────────────────────────
const CardImageCarousel = ({ images, lineInfo, isMarketing, onImageClick }) => {
  const isDesktop = useIsDesktop();
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
    if (!isDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const previewWidth = window.innerWidth < 640 ? 260 : 380;
    let x = rect.right + 20;
    if (x + previewWidth > window.innerWidth) x = rect.left - previewWidth - 20;
    x = Math.max(20, x);
    let y = rect.top + (rect.height / 2);
    setCoords({ x, y });
    setShowHover(true);
  };

  return (
    <div className="relative group/img flex flex-col items-center gap-2 w-full" ref={containerRef}>
      <div
        className="relative h-11 w-11 min-[360px]:h-16 min-[360px]:w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl min-[360px]:rounded-[1rem] border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center p-0.5 group-hover/img:border-marca-primario/40 transition-all active:scale-95 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowHover(false)}
        onClick={(e) => { 
          e.stopPropagation(); 
          setShowHover(false); 
          onImageClick?.(currentIndex); 
        }}
      >
        <div className="relative w-full h-full rounded-[0.75rem] overflow-hidden bg-slate-50">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.preview || img.url || img.base64Thumb}
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

      {!isMarketing && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs animate-in fade-in duration-500 max-w-full">
          <LineIconSelector type={lineInfo.value} size={16} style={{ color: lineInfo.color }} />
          <span className="text-[7px] font-black uppercase tracking-wider truncate" style={{ color: lineInfo.color }}>{lineInfo.label}</span>
        </div>
      )}

      {showHover && isDesktop && createPortal(
        <div
          className="fixed z-[999999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ left: coords.x, top: coords.y, transform: 'translateY(-50%)' }}
        >
          <div className="w-64 h-64 sm:w-[380px] sm:h-[380px] flex items-center justify-center relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-2 shadow-[0_50px_120px_rgba(0,0,0,0.5)] ring-[12px] ring-white/20">
            <img src={currentImg.preview || currentImg.url || currentImg.base64Thumb} alt="Preview Zoom" className="w-full h-full object-contain rounded-3xl drop-shadow-lg animate-in fade-in duration-500 bg-slate-50" />
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

// ─────────────────────────────────────────────────────────────────────────────
// EditableNote — Nota editable dentro del panel de notas
// ─────────────────────────────────────────────────────────────────────────────
const EditableNote = ({ note, onUpdate, onDelete, readOnly }) => {
  const [content, setContent] = useState(note.contenido || '');
  const [prevContenido, setPrevContenido] = useState(note.contenido);
  const textareaRef = useRef(null);

  if (note.contenido !== prevContenido) {
    setPrevContenido(note.contenido);
    setContent(note.contenido || '');
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleBlur = () => {
    if (!readOnly && content.trim() !== note.contenido) {
      onUpdate?.(note.id, content.trim());
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <div className="group relative rounded-xl border border-amber-100/50 border-l-4 border-l-amber-400 bg-[#fffdf0] p-4 shadow-md shadow-amber-500/5 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:rotate-0 odd:rotate-[0.5deg] even:rotate-[-0.5deg] hover:bg-[#fffdf6]">
      {!readOnly && onDelete ? (
        <div className="absolute right-2 top-2 flex items-center justify-center z-10">
          <button
            onClick={() => onDelete(note.id)}
            className="h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white border border-slate-100 cursor-pointer"
          >
            <X size={12} />
          </button>
          <Icon name="push_pin" size="12px" className="text-amber-600/30 rotate-45 group-hover:opacity-0 transition-opacity shrink-0" />
        </div>
      ) : (
        <div className="absolute right-2 top-2 z-10">
          <Icon name="push_pin" size="12px" className="text-amber-600/30 rotate-45 shrink-0" />
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        className="w-full bg-transparent resize-none text-[13px] font-semibold leading-relaxed text-amber-950 focus:outline-none p-0 border-none placeholder:text-amber-200 overflow-hidden"
      />
      {note.createdAt && (
        <div className="mt-2 flex items-center justify-end opacity-40">
          <p className="text-[8px] font-black uppercase tracking-widest text-amber-700">
            {new Date(note.createdAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EntryNotesPostIt — Panel flotante de notas (Post-It premium)
// ─────────────────────────────────────────────────────────────────────────────
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
                <EditableNote key={note.id || idx} note={note} onUpdate={(id, c) => onUpdateNote(entry.id || entry.tempId, id || idx, c)} onDelete={(id) => onDeleteNote(entry.id || entry.tempId, id || idx)} readOnly={entry.readOnly} />
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

// ─────────────────────────────────────────────────────────────────────────────
// TareaCard — Tarjeta unificada para Tareas y Entradas de Minuta
//
// Props específicos de Tareas:
//   tarea, currentUser, onViewDetail, onChangeStatus, onReview, onEdit, onDelete,
//   isMisTareas, className
//
// Props adicionales para Minutas (EntryCard):
//   isDraft         — Entrada en borrador (verde punteado)
//   onOrganize      — Callback para organizar entradas SIN_ORGANIZAR
//   onDownloadPdf   — Callback para generar PDF de entradas externas
//   isGeneratingPdf — Estado de carga del PDF (string con el area)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// GrupoSubTareasPanel — Panel expandible de sub-tareas individuales
// ─────────────────────────────────────────────────────────────────────────────
const EstadoBadgeInline = ({ estado }) => {
  const cfg = {
    PENDIENTE:   { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    EN_REVISION: { label: 'En Revisión', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    CERRADA:     { label: 'Cerrada',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELADA:   { label: 'Cancelada',   cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  };
  const e = estado?.toUpperCase() || 'PENDIENTE';
  const { label, cls } = cfg[e] || cfg.PENDIENTE;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cls}`}>
      {label}
    </span>
  );
};

const GrupoSubTareasPanel = ({ subTareas, currentUser, onChangeStatus, onViewDetail }) => {
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const { rol, id: currentUserId } = currentUser || {};
  const puedeAprobar = rol === 'ADMIN' || rol === 'GERENCIA' || rol === 'JEFE';

  const [localSubTareas, setLocalSubTareas] = useState(subTareas);
  const [activeNotesSub, setActiveNotesSub] = useState(null);

  useEffect(() => {
    setLocalSubTareas(subTareas);
  }, [subTareas]);

  const handleAddNote = async (subId, contenido) => {
    try {
      const res = await createTareaNota({ tareaId: subId, contenido });
      if (res.data?.status === 'success' || res.data?.data) {
        const newNote = res.data.data;
        setLocalSubTareas(prev => prev.map(s => s.id === subId ? { ...s, notas: [newNote, ...(s.notas || [])] } : s));
        return newNote;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleUpdateNote = async (subId, noteId, contenido) => {
    try {
      const res = await updateTareaNota(noteId, { contenido });
      if (res.data?.status === 'success' || res.data?.data) {
        const updated = res.data.data;
        setLocalSubTareas(prev => prev.map(s => s.id === subId ? { ...s, notas: (s.notas || []).map(n => n.id === noteId ? updated : n) } : s));
        return updated;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleDeleteNote = async (subId, noteId) => {
    try {
      const res = await deleteTareaNota(noteId);
      if (res.data?.status === 'success' || res.status === 200) {
        setLocalSubTareas(prev => prev.map(s => s.id === subId ? { ...s, notas: (s.notas || []).filter(n => n.id !== noteId) } : s));
        return true;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-3 pb-3 pt-2 space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 pb-1">
        Responsables individuales
      </p>
      {localSubTareas.map((sub) => {
        const asig = sub.asignaciones?.[0];
        const usuario = asig?.usuario;
        const esMio = asig?.usuarioId === currentUserId || usuario?.id === currentUserId;
        const estado = sub.estado?.toUpperCase() || 'PENDIENTE';
        const isPendiente = estado === 'PENDIENTE';
        const isEnRevision = estado === 'EN_REVISION';
        const isCerrada = estado === 'CERRADA' || estado === 'CANCELADA';
        const evidencias = (sub.imagenes || []).filter(img => img.tipo === 'EVIDENCIA');
        const subNotesCount = sub.notas?.length || 0;

        return (
          <div key={sub.id} className="flex items-center gap-2 bg-white rounded-xl border border-slate-100 p-2 shadow-xs">
            {/* Avatar */}
            <div className="h-7 w-7 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
              {usuario?.imagen
                ? <img src={usuario.imagen} alt={usuario.nombre} className="h-full w-full object-cover" />
                : <span>{usuario?.nombre?.charAt(0) || '?'}</span>
              }
            </div>

            {/* Nombre + estado */}
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-[10px] font-bold text-slate-700 truncate">{usuario?.nombre || `Tarea #${sub.id}`}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <EstadoBadgeInline estado={sub.estado} />
                {isCerrada || isEnRevision ? (
                  (() => {
                    const fechaFin = sub.completadoAt || sub.cerradoAt || sub.updatedAt;
                    if (!fechaFin) return null;
                    const isLate = sub.isLate ?? (sub.fechaVencimiento && new Date(fechaFin) > new Date(sub.fechaVencimiento));
                    return (
                      <span className={cn("text-[9px] font-bold", isLate ? "text-red-500" : "text-emerald-600")}>
                        Concl: {new Date(fechaFin).toLocaleDateString('es-MX')}
                      </span>
                    );
                  })()
                ) : (
                  sub.fechaVencimiento && (
                    <span className={cn("text-[9px] font-medium", isPastDate(sub.fechaVencimiento) ? "text-red-500 font-bold" : "text-slate-500")}>
                      Vence: {new Date(sub.fechaVencimiento).toLocaleDateString('es-MX')}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Evidencias (miniatura) */}
            {evidencias.length > 0 && (
              <div className="flex -space-x-1.5 shrink-0">
                {evidencias.slice(0, 3).map((img, i) => (
                  <img key={i} src={img.url} alt="evidencia" className="h-6 w-6 rounded-md border border-white object-cover shadow-sm" />
                ))}
                {evidencias.length > 3 && (
                  <div className="h-6 w-6 rounded-md border border-white bg-slate-200 flex items-center justify-center text-[7px] font-black text-slate-500">
                    +{evidencias.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Acciones contextuales */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              {/* Botón de ver detalle */}
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onViewDetail?.(sub); }}
                className="h-6 w-6 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all active:scale-90 shadow-xs cursor-pointer"
                title="Ver Detalles"
              >
                <Icon name="visibility" className="!text-[12px]" />
              </button>

              {/* Botón de notas */}
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveNotesSub(sub); }}
                className={cn(
                  "flex h-6 px-1.5 items-center justify-center gap-1 rounded-lg border transition-all active:scale-95 shadow-xs cursor-pointer",
                  subNotesCount > 0 ? "border-amber-300 bg-amber-400 text-white font-black" : "border-amber-200 bg-amber-50 text-amber-600"
                )}
                title="Notas de la tarea"
              >
                <StickyNote size={12} />
                <span className="text-[9px]">{subNotesCount}</span>
              </button>

              {esMio && isPendiente && (
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setConfirmTarget(sub); setConfirmAction('entregar'); }}
                  className="h-6 px-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all flex items-center gap-1"
                >
                  <Icon name="check" className="!text-[10px]" /> Entregar
                </button>
              )}
              {!esMio && puedeAprobar && isEnRevision && (
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setConfirmTarget(sub); setConfirmAction('aprobar'); }}
                  className="h-6 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all flex items-center gap-1"
                >
                  <Icon name="thumb_up" className="!text-[10px]" /> Aprobar
                </button>
              )}
              {isCerrada && (
                <Icon name="check_circle" size="16px" className="text-emerald-500" />
              )}
            </div>
          </div>
        );
      })}

      {/* Confirm modal for deliver/approve */}
      <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        {confirmTarget && confirmAction === 'entregar' && (
          <ConfirmModal
            isOpen={true}
            onClose={() => setConfirmTarget(null)}
            onConfirm={async () => {
              const nextStatus = (rol === 'ADMIN' || rol === 'GERENCIA') ? 'CERRADA' : 'EN_REVISION';
              if (onChangeStatus) await onChangeStatus(confirmTarget.id, nextStatus);
              setConfirmTarget(null);
            }}
            title="Entregar Tarea"
            message="¿Confirmas que deseas marcar esta tarea como entregada?"
            confirmText="Entregar"
            cancelText="Cancelar"
            variant="success"
          />
        )}
        {confirmTarget && confirmAction === 'aprobar' && (
          <ModalRevisionTarea
            isOpen={true}
            onClose={() => setConfirmTarget(null)}
            tarea={confirmTarget}
            onConfirm={async () => {
              if (onChangeStatus) await onChangeStatus(confirmTarget.id, 'CERRADA');
              setConfirmTarget(null);
            }}
            submitting={false}
          />
        )}
      </div>

      {activeNotesSub && (
        <EntryNotesPostIt
          entry={{ ...activeNotesSub, readOnly: activeNotesSub.estado === 'CERRADA' || rol === 'COORDINADOR' }}
          notes={(activeNotesSub.notas || []).filter(n => !n.esEntrega)}
          onClose={() => setActiveNotesSub(null)}
          onAddNote={async (subId, content) => {
            const added = await handleAddNote(subId, content);
            if (added) {
              setActiveNotesSub(prev => ({ ...prev, notas: [added, ...(prev.notas || [])] }));
            }
            return added;
          }}
          onUpdateNote={async (subId, noteId, content) => {
            const updated = await handleUpdateNote(subId, noteId, content);
            if (updated) {
              setActiveNotesSub(prev => ({ ...prev, notas: (prev.notas || []).map(n => n.id === noteId ? updated : n) }));
            }
            return updated;
          }}
          onDeleteNote={async (subId, noteId) => {
            const deleted = await handleDeleteNote(subId, noteId);
            if (deleted) {
              setActiveNotesSub(prev => ({ ...prev, notas: (prev.notas || []).filter(n => n.id !== noteId) }));
            }
            return deleted;
          }}
        />
      )}
    </div>
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
    // Props de Minutas (opcionales)
    isDraft = false,
    onOrganize,
    onDownloadPdf,
    isGeneratingPdf,
    isPorAprobar = false,
    onToggleNotificado,
    users = [],
    hideStatus = false,
    onCreateNote,
    onUpdateNote,
    onDeleteNote,
}) => {

    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
    const [isConfirmAprobarOpen, setIsConfirmAprobarOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showNotesPanel, setShowNotesPanel] = useState(false);
    const [notas, setNotas] = useState(() => (tarea.notas || []).filter(n => !n.esEntrega));
    
    useEffect(() => {
        setNotas((tarea.notas || []).filter(n => !n.esEntrega));
    }, [tarea.notas]);
    
    const [viewerIndex, setViewerIndex] = useState(null);
    const [forceCloseTarget, setForceCloseTarget] = useState(null);
    const [grupoExpanded, setGrupoExpanded] = useState(false);
    const isExpanded = false;
    const isRemoteDraft = Boolean(tarea._isRemoteDraft);

    // ── Datos de grupo (multi-responsable) ──────────────────────────────────
    const isGrouped = Boolean(tarea.isGrouped);
    const subTareas = tarea.subTareas || [];
    const grupoStats = tarea._grupoStats || null;

    // ── Normalización de datos ──────────────────────────────────────────────
    // Soporta tanto tarea.responsables (módulo Tareas) como tarea.asignaciones (módulo Minutas)
    const responsablesRaw = tarea.responsables || (tarea.asignaciones?.map(a => ({ ...a.usuario, id: a.usuarioId ?? a.usuario?.id })) || []);
    const responsables = responsablesRaw.map(r => typeof r === 'object' && r !== null ? r : (users.find(u => u.id === r) || { id: r, nombre: 'Cargando...' }));

    // Soporta tanto tarea.imagenes (Tareas) como tarea.images (Minutas)
    const imagenesRaw = [
        ...(tarea._localImages || []),
        ...(tarea._remoteImageThumbnails || []).map((b64, idx) => ({
            id: `remote_thumb_${idx}`,
            preview: b64,
            url: b64,
            _isRemote: true
        })),
        ...(tarea.imagenes || tarea.images || [])
    ];
    const imagenesCaptura = imagenesRaw.filter(img => img.tipo !== 'EVIDENCIA');
    const hasImages = imagenesCaptura.length > 0;
    const hasRemoteImages = !hasImages && (Number(tarea._remoteImageCount) > 0);

    // ── Flags de estado ─────────────────────────────────────────────────────
    const { rol } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;
    const currentUserId = currentUser?.id;

    const tieneJefeAsignado = responsables.some(r => r.rol === 'JEFE');
    const puedeAprobar = rol === 'ADMIN' || rol === 'GERENCIA' || (rol === 'JEFE' && !tieneJefeAsignado);

    const estado = tarea.estado?.toUpperCase() || 'PENDIENTE';
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrado = ESTADOS_FINALES.includes(estado);

    // Soporte para entradas de Minutas: tipo y organización
    const tipo = tarea.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
    const isOrganized = tipo !== 'SIN_ORGANIZAR';
    const isFormalizada = tipo === 'TAREA';
    const isExternal = (currentUser?.departamento === 'DISEÑO' && tarea.area !== 'DISENO')
        || (currentUser?.departamento === 'MARKETING' && tarea.area !== 'MARKETING')
        || (tarea._isExternal === true);
    const isOtherArea = tarea.area !== 'DISENO' && tarea.area !== 'MARKETING';
    const vencida = isVencida(tarea);

    const isMarketing = tarea.departamento === 'MARKETING';

    const esAsignadoDirecto = responsables.some(r => r.id == currentUserId)
        || tarea.asignaciones?.some(a => a.usuarioId == currentUserId);

    // Contexto de grupo para mostrar avatares extra o badges (Fase 2)
    const grupoContext = tarea._grupoContext || null;
    const esCompartida = Boolean(grupoContext && grupoContext.total > 1);
    const colorCfg = esCompartida ? getGroupColorConfig(tarea.minutaId, tarea.organizadoAt) : null;

    let mySubTask = tarea;
    if (isGrouped && subTareas) {
        const found = subTareas.find(sub => 
            sub.responsables?.some(r => r.id == currentUserId) || 
            sub.asignaciones?.some(a => a.usuarioId == currentUserId)
        );
        if (found) mySubTask = found;
    }
    const myTaskIsPendiente = mySubTask.estado?.toUpperCase() === 'PENDIENTE';

    const canForceClose = esJefe && (!esAsignadoDirecto || !myTaskIsPendiente) && isPendiente && !isPorAprobar && tipo === 'TAREA' && !isDraft && !isRemoteDraft && !isExternal;

    // ── Handlers de notas ───────────────────────────────────────────────────
    const handleAddNote = async (tareaId, contenido) => {
        try {
            if (onCreateNote) {
                const res = await onCreateNote(tareaId, contenido);
                if (res) {
                    const newNote = res.data?.data || res.data || res;
                    setNotas((prev) => [newNote, ...prev]);
                    return newNote;
                }
                return false;
            }
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
            if (onUpdateNote) {
                const res = await onUpdateNote(tareaId, noteId, contenido);
                if (res) {
                    const updated = res.data?.data || res.data || res;
                    setNotas((prev) => prev.map((n) => n.id === noteId ? updated : n));
                    return updated;
                }
                return false;
            }
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
            if (onDeleteNote) {
                const ok = await onDeleteNote(tareaId, noteId);
                if (ok) {
                    setNotas((prev) => prev.filter((n) => n.id !== noteId));
                    return true;
                }
                return false;
            }
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

    // ── Estilos de tarjeta ──────────────────────────────────────────────────
    const getCardStyles = () => {
        if (isRemoteDraft) return 'bg-cyan-50/40 hover:bg-cyan-100/60 ring-1 ring-cyan-500/10';
        if (isDraft) return 'bg-emerald-50/40 hover:bg-emerald-100/60 ring-1 ring-emerald-500/10';
        if (isCerrado) {
            if (esCompartida && colorCfg) {
                return cn('opacity-70 grayscale bg-slate-50/50 hover:bg-slate-100/60 border-slate-200/50', colorCfg.leftBorder);
            }
            return 'opacity-70 grayscale bg-slate-50/50 hover:bg-slate-100/60 border-slate-200/50';
        }
        if (esCompartida && colorCfg) {
            return cn(colorCfg.cardBg, colorCfg.cardBorder, colorCfg.leftBorder);
        }
        if (isOtherArea) return 'bg-white hover:bg-slate-50/30 border-slate-200'; // Clean and neutral for other areas
        if (vencida) return 'bg-red-50/40 hover:bg-red-100/60 ring-1 ring-red-500/20';
        if (!isOrganized && !isExternal) return 'bg-amber-50/20 hover:bg-amber-100/30 border-l-4 border-l-amber-500 border-dashed';
        if (isExternal) return 'bg-white hover:bg-slate-50/30 border-slate-200';
        switch (estado) {
            case 'PENDIENTE': return 'bg-white hover:bg-amber-50/30';
            case 'EN_REVISION': return 'bg-blue-50/30 hover:bg-blue-100/50';
            default: return 'bg-white hover:bg-slate-50/30';
        }
    };

    const isMarketingArea = tarea.area === 'MARKETING';
    const isExternoArea = tarea.area !== 'DISENO' && tarea.area !== 'MARKETING';

    const lineInfo = {
        label: isExternoArea ? (AREA_MAP[tarea.area] || tarea.area) : (isMarketing ? 'Marketing' : (LINEA_MAP[tarea.linea]?.label || tarea.linea || '—')),
        color: isExternoArea ? '#0f766e' : (isMarketing ? '#7c3aed' : (LINEA_MAP[tarea.linea]?.color || '#64748b')),
        value: isExternoArea ? tarea.area : tarea.linea
    };

    const clasif = CLASIFICACION_MAP[tarea.clasificacion] || null;

    // ── Click principal de la tarjeta ────────────────────────────────────────
    const handleCardClick = () => {
        if (isRemoteDraft) return;
        if (isExternal && !isDraft) {
            if (isGrouped) {
                setGrupoExpanded(prev => !prev);
            } else {
                onViewDetail?.(tarea);
            }
            return;
        }
        if (isDraft || !isOrganized) {
            onOrganize?.(tarea);
        } else if (isFormalizada) {
            if (isGrouped) {
                setGrupoExpanded(prev => !prev);
            } else {
                onViewDetail?.(tarea);
            }
        }
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className={cn(
                    'group relative flex flex-col transition-all duration-300 rounded-[1.5rem] border border-slate-200/80 overflow-hidden cursor-pointer',
                    isExpanded ? 'shadow-xl ring-2 ring-slate-200' : 'shadow-sm hover:shadow-md',
                    getCardStyles(),
                    className
                )}
            >
                <div className="flex flex-row h-full min-h-[140px]">

      {/* PANEL IZQUIERDO: IMAGEN / IDENTIDAD */}
      {(!isMarketing || hasImages || hasRemoteImages) && (
        <div className={cn(
          "flex flex-col items-center shrink-0 w-[58px] min-[360px]:w-[78px] sm:w-[98px] bg-slate-50/50 border-r border-slate-100/50 p-1 min-[360px]:p-1.5 sm:p-2 relative group/side",
          (hasImages || hasRemoteImages) ? "justify-start pt-3" : "justify-center"
        )}>
          {hasImages ? (
            <CardImageCarousel
              images={imagenesCaptura}
              lineInfo={lineInfo}
              isMarketing={isMarketing}
              onImageClick={(idx) => setViewerIndex(idx)}
            />
          ) : hasRemoteImages ? (
            <div className="relative h-11 w-11 min-[360px]:h-16 min-[360px]:w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl min-[360px]:rounded-[1rem] border-2 border-dashed border-slate-200 bg-slate-100/30 flex flex-col items-center justify-center gap-1 p-1 text-slate-400 shadow-xs mt-2">
              <Icon name="photo_camera" size="18px" className="text-slate-400/80 animate-pulse shrink-0" />
              <span className="text-[7px] min-[360px]:text-[8px] font-black uppercase tracking-wider text-slate-500 leading-none text-center">
                {tarea._remoteImageCount} {tarea._remoteImageCount === 1 ? 'Foto' : 'Fotos'}
              </span>
              <span className="text-[5.5px] min-[360px]:text-[6px] font-bold uppercase text-slate-400/70 leading-none tracking-widest text-center mt-0.5 whitespace-nowrap">
                Borrador
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-1 min-[360px]:gap-1.5">
              <div
                className="flex flex-col items-center justify-center w-9 h-9 min-[360px]:w-12 min-[360px]:h-12 sm:w-16 sm:h-16 rounded-xl min-[360px]:rounded-[1.25rem] transition-all duration-500 group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: `${lineInfo.color}0f`, border: `1.5px solid ${lineInfo.color}25` }}
              >
                <div className="scale-[0.55] min-[360px]:scale-[0.75] sm:scale-100 origin-center transition-transform">
                  <LineIconSelector type={tarea.linea} size={32} style={{ color: lineInfo.color }} />
                </div>
              </div>
              <span
                className="font-black tracking-[0.05em] min-[360px]:tracking-[0.1em] text-[5.5px] min-[360px]:text-[7px] sm:text-[8px] uppercase font-mono text-center leading-tight px-1"
                style={{ color: lineInfo.color }}
              >
                {lineInfo.label}
              </span>
            </div>
          )}
        </div>
      )}

      {/* PANEL DERECHO: CONTENIDO */}
                    <div className="flex flex-col flex-1 min-w-0 p-2 min-[360px]:p-3 sm:p-4">

                        {/* Header: Status + Fechas */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 min-[360px]:gap-2 flex-wrap scale-[0.82] min-[360px]:scale-90 sm:scale-100 origin-left transition-transform">
                                {/* Badge de Borrador */}
                                {isDraft && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-200/60 shadow-xs">
                                        Borrador
                                    </span>
                                )}
                                {/* Badge de grupo multi-responsable */}
                                {isGrouped && grupoStats && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border bg-violet-50 text-violet-700 border-violet-200 shadow-xs">
                                        <Icon name="group" size="10px" />
                                        {grupoStats.total} Responsables
                                    </span>
                                )}
                                {/* Badge de Tarea Compartida en Vistas Planas */}
                                {!isGrouped && esCompartida && colorCfg && (
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border shadow-xs transition-all",
                                        colorCfg.badge
                                    )}>
                                        <Icon name="group" size="10px" className="shrink-0" />
                                        Instrucción Compartida
                                    </span>
                                )}
                                {/* Badge de tipo */}
                                {tipo && tipo !== 'DESCARTADA' && !((isOtherArea || hideStatus) && tipo === 'SIN_ORGANIZAR') && !(isExternal && tarea.area !== 'DISENO' && tarea.area !== 'MARKETING') && (
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border text-white shadow-sm transition-all",
                                        tipo === 'TAREA'
                                            ? (isExternal ? "bg-marca-primario border-marca-primario-hover" : "bg-rose-600 border-rose-500")
                                            : tipo === 'RECORDATORIO' ? "bg-indigo-600 border-indigo-500" :
                                              tipo === 'POLITICA' ? "bg-slate-600 border-slate-500" :
                                              (isExternal ? "bg-amber-500 border-amber-400" : "bg-amber-600 border-amber-500 animate-pulse")
                                    )}>
                                        <Icon name={tipo === 'TAREA' ? "task_alt" : tipo === 'RECORDATORIO' ? "notifications" : tipo === 'POLITICA' ? "policy" : (isExternal ? "pending_actions" : "warning")} size="10px" className="shrink-0" />
                                        {tipo === 'SIN_ORGANIZAR' ? (isExternal ? 'Sin Organizar' : 'Falta Clasificar') : (isExternal && tipo === 'TAREA' ? 'EXTERNA' : tipo)}
                                    </span>
                                )}
                                {clasif && !isOtherArea && (tarea.area === 'DISENO' || tarea.area === 'MARKETING') && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border" style={{ backgroundColor: `${clasif.color}08`, color: clasif.color, borderColor: `${clasif.color}15` }}>
                                        <Icon name={clasif.icon} size="10px" />
                                        {clasif.label}
                                    </span>
                                )}
                                {!isOtherArea && (
                                    (!isOrganized && !isExternal) ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[7px] sm:text-[8px] font-black border uppercase tracking-wider whitespace-nowrap bg-amber-100 text-amber-800 border-amber-300 shadow-sm animate-pulse">
                                            <Icon name="warning" size="9px" className="shrink-0 text-amber-600 mr-0.5" /> Sin Clasificar
                                        </span>
                                    ) : (
                                        (isFormalizada || tipo === 'RECORDATORIO' || isExternal) && !hideStatus && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <EtiquetaEstadoTarea status={estado} className="scale-90 origin-left" />
                                                {vencida && !isDraft && !isRemoteDraft && isOrganized && (
                                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/20 px-1.5 py-0.5 rounded-md uppercase shrink-0 scale-90 origin-left">
                                                        <Icon name="warning" size="xs" /> ATRASADA
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    )
                                )}
                                {isExternal && !isDraft && !isRemoteDraft && (
                                    <>

                                        {tarea.createdAt && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border bg-slate-100 text-slate-600 border-slate-200">
                                                <Icon name="event" size="10px" />
                                                Creada: {formatFecha(tarea.createdAt)}
                                            </span>
                                        )}
                                    </>
                                )}
                                {isFormalizada && tarea.prioridad && !isExternal && <EtiquetaPrioridadTarea priority={tarea.prioridad} className="scale-90 origin-left" />}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {!isCerrado && !isRemoteDraft && !!onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTarget({ ...tarea, _deleteAll: isGrouped });
                                        }}
                                        className="h-6 w-6 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all active:scale-90"
                                        title="Eliminar Tarea"
                                    >
                                        <Icon name="delete" className="!text-[14px]" />
                                    </button>
                                )}
                                {isRemoteDraft && (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-cyan-700">
                                        <Icon name="group" size="10px" />
                                        {tarea.author?.nombre || 'En vivo'}
                                    </span>
                                )}
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                        #{tarea.id}
                                    </span>
                                    {vencida && !isDraft && !isRemoteDraft && isOrganized && <span className="text-[7px] font-black text-rose-500 animate-pulse uppercase">¡Vencida!</span>}
                                </div>
                            </div>
                        </div>

                        {/* Cuerpo: Descripción */}
                        <div className="flex-1 min-h-0">
                            <div className="relative group/text">
                                <p className={cn(
                                    "whitespace-pre-wrap break-words text-[11.5px] min-[360px]:text-[13px] font-semibold leading-relaxed text-slate-800 transition-all duration-300",
                                    isDraft ? "bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200" : "px-0.5",
                                    isCerrado && "line-through text-slate-400 opacity-60",
                                    !isExpanded && "line-clamp-3"
                                )}>
                                    {tarea.descripcion || 'Sin descripción...'}
                                </p>
                            </div>
                        </div>

                        {/* Footer: Notas + Avatares + Acciones */}
                        <div className="mt-2 min-[360px]:mt-3 pt-2 min-[360px]:pt-2.5 border-t border-slate-50 flex items-center justify-between gap-1.5 min-[360px]:gap-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 min-[360px]:gap-1.5">
                                {!isGrouped && (
                                    <button onClick={(e) => { e.stopPropagation(); setShowNotesPanel(true); }} className={cn(
                                        "flex h-6 min-[360px]:h-7 px-1.5 min-[360px]:px-2 items-center justify-center gap-1 min-[360px]:gap-1.5 rounded-lg border transition-all active:scale-95 shadow-xs",
                                        notas.length > 0 ? "border-amber-300 bg-amber-400 text-white font-black" : "border-amber-200 bg-amber-50 text-amber-600"
                                    )}>
                                        <StickyNote size={14} />
                                        <span className="text-[10px]">{notas.length}</span>
                                    </button>
                                )}

                                {responsables.length > 0 && (
                                    <div className="flex -space-x-2 ml-1 items-center">
                                        {responsables.slice(0, 4).map((r) => (
                                            <Tooltip key={r.id} text={r.nombre} position="top">
                                                <div className="h-5 w-5 min-[360px]:h-6 min-[360px]:w-6 rounded-full border border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[7px] min-[360px]:text-[8px] font-bold text-slate-500 shadow-xs shrink-0 ring-1 ring-slate-200 transition-all hover:scale-110 hover:z-10 cursor-help">
                                                    {r.imagen ? (
                                                        <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" />
                                                    ) : (
                                                        r.nombre?.charAt(0)
                                                    )}
                                                </div>
                                            </Tooltip>
                                        ))}
                                        {responsables.length > 4 && (
                                            <Tooltip text={responsables.slice(4).map(r => r.nombre).join('\n')} position="top" className="whitespace-pre-line text-left">
                                                <div className="h-5 w-5 min-[360px]:h-6 min-[360px]:w-6 rounded-full border border-white bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-bold shadow-xs shrink-0 ring-1 ring-slate-200 cursor-help z-10">
                                                    +{responsables.length - 4}
                                                </div>
                                            </Tooltip>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                {isMisTareas ? (
                                    <>
                                        {!isGrouped && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onViewDetail?.(tarea); }}
                                                className="h-6 w-6 min-[360px]:h-7 min-[360px]:w-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all active:scale-90 shadow-xs"
                                                title="Ver Detalles"
                                            >
                                                <Icon name="visibility" className="!text-[12px] min-[360px]:!text-[14px]" />
                                            </button>
                                        )}
                                        {myTaskIsPendiente && esAsignadoDirecto && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEntregaModalOpen(true);
                                                }}
                                                className="h-6 min-[360px]:h-7 px-2 min-[360px]:px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[8.5px] min-[360px]:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                                title="Entregar"
                                            >
                                                <Icon name="check" className="!text-[10px] min-[360px]:!text-[12px]" /> Entregar
                                            </button>
                                        )}
                                        {isEnRevision && (
                                            <div className="h-6 min-[360px]:h-7 px-1.5 min-[360px]:px-2 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[8.5px] min-[360px]:text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Icon name="fact_check" className="!text-[10px] min-[360px]:!text-[12px]" /> En Revisión
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Botón PDF para externas (Minutas) */}
                                        {isExternal && !isDraft && onDownloadPdf && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDownloadPdf(tarea.area); }}
                                                disabled={isGeneratingPdf === tarea.area}
                                                className="h-6 min-[360px]:h-7 px-1.5 min-[360px]:px-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-1 transition-all active:scale-90 shadow-xs font-black uppercase text-[9px] tracking-widest"
                                                title="Generar PDF"
                                            >
                                                <Icon name={isGeneratingPdf === tarea.area ? "hourglass_empty" : "picture_as_pdf"} className={cn("!text-[12px]", isGeneratingPdf === tarea.area && "animate-spin")} />
                                                PDF
                                            </button>
                                        )}

                                        {/* Checkbox Notificado — solo externa, solo guardada */}
                                        {isExternal && !isDraft && !isRemoteDraft && onToggleNotificado && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleNotificado(tarea.id); }}
                                                title={tarea.notificadoAt ? `Notificado el ${new Date(tarea.notificadoAt).toLocaleDateString('es-MX')}` : 'Marcar como notificado'}
                                                className={cn(
                                                    "h-6 min-[360px]:h-7 w-6 min-[360px]:w-7 rounded-lg border flex items-center justify-center transition-all active:scale-90 shadow-xs",
                                                    tarea.notificadoAt
                                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                                        : "bg-white border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-500"
                                                )}
                                            >
                                                <Icon name={tarea.notificadoAt ? "check_circle" : "radio_button_unchecked"} className="!text-[12px]" />
                                            </button>
                                        )}

                                        {/* Botón de organizar para entradas SIN_ORGANIZAR (Minutas) */}
                                        {!isCerrado && !isOrganized && !isExternal && !isRemoteDraft && !isDraft && onOrganize && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onOrganize(tarea); }}
                                                className="h-6 min-[360px]:h-7 w-6 min-[360px]:w-7 rounded-lg border border-marca-primario/20 bg-marca-primario/5 text-marca-primario flex items-center justify-center transition-all active:scale-90 shadow-xs"
                                                title="Organizar Entrada"
                                            >
                                                <Settings2 size={13} />
                                            </button>
                                        )}


                                        <div className="scale-[0.8] min-[360px]:scale-100 origin-right transition-transform">
                                            <TableActions
                                                row={tarea}
                                                actions={[
                                                    { key: 'entregar', enabled: isFormalizada && !isDraft && !isCerrado && !isExternal && myTaskIsPendiente && esAsignadoDirecto, onClick: () => { setIsEntregaModalOpen(true); } },
                                                    { key: 'aprobar', enabled: isFormalizada && !isDraft && !isCerrado && !isExternal && isEnRevision && puedeAprobar, onClick: (r) => { if (onReview) onReview(r); else setIsConfirmAprobarOpen(true); } },
                                                    { key: 'forzar_cierre_tarea', enabled: canForceClose && !isCerrado && !isRemoteDraft, onClick: (r) => { setForceCloseTarget(r); } },
                                                    { key: 'ver_detalle', enabled: isFormalizada && !isRemoteDraft && !isDraft && !isGrouped && Boolean(onViewDetail), onClick: (r) => { onViewDetail?.(r); } },
                                                    { key: 'editar', enabled: !isCerrado && !isRemoteDraft && !!onEdit, onClick: (r) => { 
                                                        const tareaToEdit = { ...r };
                                                        if (r.responsables) {
                                                            tareaToEdit.responsables = r.responsables.map(x => typeof x === 'object' ? x.id : x).filter(Boolean);
                                                        }
                                                        onEdit(tareaToEdit); 
                                                    } },
                                                 ]}
                                             />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de acordeón para grupos */}
                {isGrouped && !isDraft && !isRemoteDraft && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setGrupoExpanded(prev => !prev); }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all text-[9px] font-black uppercase tracking-widest active:scale-[0.98]"
                    >
                        <Icon name={grupoExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size="14px" />
                        {grupoExpanded ? 'Ocultar responsables' : `Ver ${subTareas.length} responsables`}
                    </button>
                )}

                {/* Panel de sub-tareas expandible */}
                {isGrouped && grupoExpanded && (
                    <GrupoSubTareasPanel
                        subTareas={subTareas}
                        currentUser={currentUser}
                        onChangeStatus={onChangeStatus}
                        onViewDetail={onViewDetail}
                    />
                )}
            </div>

            {/* Visor de imágenes a pantalla completa */}
            {viewerIndex !== null && (
                <ImageViewer images={imagenesCaptura} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
            )}

            {(isEntregaModalOpen || isConfirmAprobarOpen || deleteTarget || showNotesPanel || forceCloseTarget) && (
                <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    {isEntregaModalOpen && (
                        <ModalEntregarTarea
                            isOpen={isEntregaModalOpen}
                            onClose={() => setIsEntregaModalOpen(false)}
                            tareaId={isGrouped ? mySubTask.id : tarea.id}
                            onConfirm={async () => {
                                const targetId = isGrouped ? mySubTask.id : tarea.id;
                                const nextStatus = (rol === 'ADMIN' || rol === 'GERENCIA' || (rol === 'JEFE' && !esAsignadoDirecto)) ? 'CERRADA' : 'EN_REVISION';
                                if (onChangeStatus) await onChangeStatus(targetId, nextStatus, true);
                            }}
                        />
                    )}

                    {isConfirmAprobarOpen && (
                        <ModalRevisionTarea
                            isOpen={isConfirmAprobarOpen}
                            onClose={() => setIsConfirmAprobarOpen(false)}
                            tarea={tarea}
                            onConfirm={async () => {
                                if (onChangeStatus) {
                                    if (isGrouped && subTareas) {
                                        await Promise.all(subTareas.map(sub => onChangeStatus(sub.id, 'CERRADA', true)));
                                        notify.success('Tareas aprobadas correctamente.');
                                    } else {
                                        await onChangeStatus(tarea.id, 'CERRADA', true);
                                        notify.success('Tarea aprobada correctamente.');
                                    }
                                }
                                setIsConfirmAprobarOpen(false);
                            }}
                            submitting={false}
                        />
                    )}

                    {deleteTarget && (
                        <ConfirmModal
                            isOpen={Boolean(deleteTarget)}
                            onClose={() => setDeleteTarget(null)}
                            onConfirm={async () => {
                                if (onDelete) await onDelete(deleteTarget.id || deleteTarget.tempId, deleteTarget._deleteAll);
                                setDeleteTarget(null);
                            }}
                            title="Descartar Tarea"
                            message={deleteTarget._deleteAll ? "¿Confirmas que deseas descartar este grupo de tareas por completo? Esta acción eliminará permanentemente los datos del grupo." : "¿Estás seguro de que deseas descartar esta tarea? Esta acción eliminará permanentemente los datos."}
                            confirmText="Descartar"
                            cancelText="Cancelar"
                            variant="danger"
                        />
                    )}

                    {showNotesPanel && (
                        <EntryNotesPostIt
                            entry={{ ...tarea, readOnly: isCerrado || rol === 'COORDINADOR' || isRemoteDraft }}
                            notes={notas}
                            onClose={() => setShowNotesPanel(false)}
                            onAddNote={handleAddNote}
                            onUpdateNote={handleUpdateNote}
                            onDeleteNote={handleDeleteNote}
                        />
                    )}

                    {forceCloseTarget && (
                        <ConfirmModal
                            isOpen={Boolean(forceCloseTarget)}
                            onClose={() => setForceCloseTarget(null)}
                            onConfirm={async () => {
                                if (onChangeStatus) {
                                    if (forceCloseTarget.isGrouped && forceCloseTarget.subTareas) {
                                        await Promise.all(forceCloseTarget.subTareas.map(sub => onChangeStatus(sub.id, 'CERRADA', true)));
                                        notify.success('Tareas cerradas correctamente.');
                                    } else {
                                        await onChangeStatus(forceCloseTarget.id, 'CERRADA', true);
                                        notify.success('Tarea cerrada correctamente.');
                                    }
                                }
                                setForceCloseTarget(null);
                            }}
                            title="Forzar Cierre de Tarea"
                            message="¿Estás seguro de que deseas cerrar esta tarea sin pasar por revisión? Advertencia: no hubo entrega registrada para esta tarea."
                            confirmText="Cerrar Tarea"
                            cancelText="Cancelar"
                            variant="danger"
                        />
                    )}
                </div>
            )}
        </>
    );
};
