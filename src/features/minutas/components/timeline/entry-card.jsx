import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import {
  CLASIFICACION_MAP,
  AREA_MAP,
  LINEA_MAP,
  formatTime,
} from '../../constants';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Settings2,
  ChevronDown,
  Pencil,
  Plus,
  StickyNote,
  Save,
  Camera
} from 'lucide-react';
import { LineIconSelector } from '../icons/line-icons';
import { TareaStatusBadge } from '../../../tareas/components/common/tarea-status-badge';
import { formatFecha, isPastDate } from '@/lib/date';
import { useAuthStore } from '@/stores/auth-store';
import { StatusTrafficLight } from '../status-traffic-light';


/**
 * ImageViewer — Modal premium para ver imágenes con navegación y zoom.
 * SE USA PORTAL PARA RENDERIZAR FUERA DE LA JERARQUÍA DEL DOM (Encima de Sidebar).
 */
const ImageViewer = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Bloquear el scroll del body cuando el visor está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!images || images.length === 0) return null;
  const currentImg = images[currentIndex];

  // El portal renderiza esto al final del <body> para que nada (sidebar, etc) quede por encima
  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
      
      {/* Botón de Cerrar con z-index superior */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-600 transition-all z-[100001] shadow-2xl"
      >
        <X size={36} />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-8 md:p-12">
        {images.length > 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
            className="absolute left-8 w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-md"
          >
            <ChevronLeft size={48} />
          </button>
        )}

        <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center group pointer-events-auto">
           <img 
            src={currentImg.preview || currentImg.url} 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 select-none" 
            alt="Vista ampliada"
          />
        </div>

        {images.length > 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
            className="absolute right-8 w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-md"
          >
            <ChevronRight size={48} />
          </button>
        )}
      </div>

      {/* Indicadores de página */}
      <div className="absolute bottom-10 flex gap-3 z-[100001]">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300", 
              i === currentIndex ? "bg-white w-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-white/20 w-2.5 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

const EditableNote = ({ note, onUpdate, onDelete, readOnly }) => {
  const [content, setContent] = useState(note.contenido || '');
  const [prevContenido, setPrevContenido] = useState(note.contenido);
  const textareaRef = useRef(null);

  // Sincronización directa durante el render (evita renders en cascada)
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
            {new Date(note.createdAt).toLocaleString('es-MX', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
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
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Cerrar notas" />
      <div className="relative flex max-h-[82dvh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-amber-200 bg-[#fffbeb] shadow-2xl shadow-slate-950/25 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-amber-200/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20">
              <StickyNote size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-amber-950">Notas de entrada</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">
                {notes.length} registradas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-amber-700 transition-colors hover:bg-amber-100 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-white/45 p-5 text-center">
              <p className="text-xs font-bold text-amber-800/60">Esta entrada todavía no tiene notas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <EditableNote 
                  key={note.id} 
                  note={note} 
                  onUpdate={onUpdateNote} 
                  onDelete={onDeleteNote}
                  readOnly={entry.readOnly}
                />
              ))}
            </div>
          )}
        </div>

        {!entry.readOnly && (
          <div className="shrink-0 border-t border-amber-200/70 bg-amber-50/70 p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Agregar nota..."
              rows={2}
              className="w-full resize-none rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-amber-950 placeholder:text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-300/20"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAdd}
                disabled={!content.trim() || saving}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                  content.trim()
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "bg-white text-amber-200"
                )}
              >
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

/**
 * EntryCard — Tarjeta estable para timeline.
 * Mantiene la misma composición en mobile, tablet y desktop.
 */
export const EntryCard = ({ 
  entry, 
  onOrganize, 
  onRemove,
  onUpdate,
  onUpdateSaved,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onAddImage,
  onDeleteImage,
  onChangeStatus,
  users = []
}) => {
  const isDraft = Boolean(entry.tempId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedEditing, setIsSavedEditing] = useState(false);
  const [editValue, setEditValue] = useState(entry.descripcion);
  const [editForm, setEditForm] = useState({
    descripcion: entry.descripcion || '',
    area: entry.area || 'DISENO',
    linea: entry.linea || 'CALZADO',
    clasificacion: entry.clasificacion || 'OTROS',
    responsables: [],
    fechaVencimiento: '',
    fechaSeguimiento: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const currentUserId = currentUser?.id;
  const userRole = currentUser?.rol || 'GERENCIA';
  const isJefe = userRole === 'JEFE' || userRole === 'GERENCIA';

  const estadoActual = entry.estado || entry.estadoOperativo || 'PENDIENTE';
  const isAsignado = entry.asignaciones?.some(asig => asig.usuarioId === currentUserId);
  const isFormalizada = entry.formalizada;

  const handleUpdateStatus = async (newStatus) => {
    if (isUpdatingStatus || !onUpdateSaved) return;
    setIsUpdatingStatus(true);
    try {
      if (onChangeStatus) {
        await onChangeStatus(entry.id, { estado: newStatus });
      } else {
        await onUpdateSaved(entry.id, { estado: newStatus });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const textareaRef = useRef(null);

  const clasif = CLASIFICACION_MAP[entry.clasificacion] || null;
  const clasifLabel = clasif?.label || entry.clasificacion || 'Tipo';
  const clasifShortLabel =
    clasifLabel.length > 10
      ? `${clasifLabel.slice(0, 8)}.`
      : clasifLabel;
  const lineaLabel = LINEA_MAP[entry.linea]?.label || entry.linea || 'N/A';
  
  const allImages = [
    ...(entry._localImagenes || []),
    ...(entry.imagenes || [])
  ];
  const hasImages = allImages.length > 0;
  const entryNotes = entry.notas || [];
  const isClosed = (entry.estado || entry.estadoOperativo) === 'CERRADO';
  const isCompletado = (entry.estado || entry.estadoOperativo) === 'COMPLETADO';
  const vencida = entry.fechaVencimiento && !isCompletado && !isClosed && isPastDate(entry.fechaVencimiento);
  const isOrganized = entry.formalizada || entry.requiereSeguimiento;

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (isDraft && editValue.trim() !== entry.descripcion && onUpdate) {
      onUpdate(entry.tempId, { descripcion: editValue.trim() });
    }
  };

  const handleUpdateField = (field, value) => {
    if (isDraft && onUpdate) {
      onUpdate(entry.tempId, { [field]: value });
    }
  };

  const handleStartDraftEdit = () => {
    setEditValue(entry.descripcion || '');
    setIsEditing(true);
  };

  const handleStartSavedEdit = () => {
    setEditForm({
      descripcion: entry.descripcion || '',
      area: entry.area || 'DISENO',
      linea: entry.linea || 'CALZADO',
      clasificacion: entry.clasificacion || 'OTROS',
      responsables: entry.asignaciones?.map(a => a.usuarioId) || [],
      fechaVencimiento: entry.fechaVencimiento ? new Date(entry.fechaVencimiento).toISOString().split('T')[0] : '',
      fechaSeguimiento: entry.fechaSeguimiento ? new Date(entry.fechaSeguimiento).toISOString().split('T')[0] : '',
    });
    setIsSavedEditing(true);
  };

  const handleSavedField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelSavedEdit = () => {
    setEditForm({
      descripcion: entry.descripcion || '',
      area: entry.area || 'DISENO',
      linea: entry.linea || 'CALZADO',
      clasificacion: entry.clasificacion || 'OTROS',
      responsables: entry.asignaciones?.map(a => a.usuarioId) || [],
      fechaVencimiento: entry.fechaVencimiento ? new Date(entry.fechaVencimiento).toISOString().split('T')[0] : '',
      fechaSeguimiento: entry.fechaSeguimiento ? new Date(entry.fechaSeguimiento).toISOString().split('T')[0] : '',
    });
    setIsSavedEditing(false);
  };

  const handleSaveSavedEdit = async () => {
    if (!onUpdateSaved || !editForm.descripcion.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const payload = {
        descripcion: editForm.descripcion.trim(),
        area: editForm.area,
        linea: editForm.linea,
        clasificacion: editForm.clasificacion,
      };

      // Solo mandamos fechas y responsables si la entrada ya fue organizada
      if (isOrganized) {
        payload.responsables = editForm.responsables;
        payload.fechaVencimiento = editForm.fechaVencimiento || null;
        payload.fechaSeguimiento = editForm.fechaSeguimiento || null;
      }

      const updated = await onUpdateSaved(entry.id, payload);
      if (updated !== false) setIsSavedEditing(false);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col bg-white transition-all duration-500 rounded-[1.35rem] border border-slate-100',
          isExpanded ? 'shadow-xl ring-2 ring-slate-200' : 'shadow-sm hover:shadow-md',
          isDraft ? 'shadow-lg ring-1 ring-emerald-500/10' : '',
          isEditing && 'ring-2 ring-marca-primario/10',
          isClosed && 'opacity-75 grayscale bg-slate-50/50'
        )}
      >
        {/* Etiqueta superior de tipo (Tarea/Seguimiento) - FULL WIDTH HEADER */}
        {!isDraft && (entry.formalizada || entry.requiereSeguimiento) && (
          <div className={cn(
            "w-full py-0.5 text-center text-[6px] font-black uppercase tracking-[0.2em] text-white shadow-inner rounded-t-[1.35rem]",
            entry.formalizada ? "bg-rose-400" : "bg-indigo-400"
          )}>
            {entry.formalizada ? "TAREA" : "SEGUIMIENTO"}
          </div>
        )}

        <div className={cn(
          "grid flex-1",
          isExpanded ? "" : "min-h-[6.75rem] sm:min-h-[7.5rem]",
          hasImages
            ? '[grid-template-columns:clamp(4.5rem,24%,6.5rem)_minmax(0,1fr)] sm:[grid-template-columns:clamp(5.25rem,22%,7.5rem)_minmax(0,1fr)]'
            : 'grid-cols-1'
        )}>


        {/* LADO IZQUIERDO: Preview cuadrado fijo */}
        {hasImages && (
        <div className="min-w-0 p-2.5 pr-0 sm:p-3 sm:pr-0">
          <div
            className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
            onClick={() => setViewerIndex(0)}
          >
            <img
              src={allImages[0].preview || allImages[0].url}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Preview de entrada"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {allImages.length > 1 && (
              <div className="absolute bottom-2 right-2 rounded-lg bg-slate-950/85 px-2 py-1 text-[9px] font-black text-white shadow-lg">
                +{allImages.length - 1}
              </div>
            )}
          </div>
        </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex min-w-0 flex-col p-2.5 sm:p-3.5">
          
          {/* Header Row: Linea Icon + Info + Badges */}
          <div className="mb-2 flex flex-col gap-1.5 sm:mb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            
            {/* Seccion 1: Identificación y Clasificación Principal */}
            <div className="flex items-center justify-between gap-2 sm:flex-1 sm:justify-start sm:gap-2.5">
              <div className="flex min-w-0 items-center gap-2">
                {/* Semáforo Visual */}
                {!isDraft && (
                  <StatusTrafficLight entry={entry} size="md" className="shrink-0" />
                )}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-900 shadow-sm sm:h-9 sm:w-9">
                  <LineIconSelector type={entry.linea} size={16} />
                </div>
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-[8px] font-black uppercase tracking-tighter text-slate-400 sm:text-[9px]">
                    {AREA_MAP[entry.area] || entry.area}
                  </span>
                  <span className="truncate text-[8px] font-bold text-slate-500 sm:text-[9px]">
                    {lineaLabel}
                  </span>
                </div>
              </div>

              {/* Badges de Estado y Clasif (En móvil se alinean a la derecha de la identificación) */}
              <div className="flex shrink-0 items-center gap-1 sm:hidden">
                {!isDraft && (entry.formalizada || entry.requiereSeguimiento) && (
                  <TareaStatusBadge 
                    status={entry.estado || entry.estadoOperativo || 'PENDIENTE'} 
                    className="scale-[0.75] origin-right" 
                  />
                )}
                {clasif && !isDraft && (
                  <span
                    className="inline-flex max-w-[4rem] items-center gap-0.5 overflow-hidden rounded-lg px-1 py-1 text-[7px] font-black uppercase tracking-widest shadow-sm"
                    style={{ backgroundColor: `${clasif.color}10`, color: clasif.color, border: `1px solid ${clasif.color}20` }}
                  >
                    <Icon name={clasif.icon} size="9px" className="shrink-0" />
                    <span className="truncate">{clasif.label}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Seccion 2: Tiempos y Alertas (En móvil en su propia fila para evitar colisión) */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl bg-slate-50/50 p-1.5 sm:flex-col sm:items-end sm:justify-start sm:gap-1 sm:bg-transparent sm:p-0">
               <div className="flex flex-col gap-0.5 text-[7px] font-bold uppercase tracking-tighter text-slate-400 sm:flex-row sm:items-center sm:gap-2 sm:text-[8px]">
                 <div className="flex items-center gap-1.5">
                   <span className="whitespace-nowrap">{formatTime(entry.createdAt)}</span>
                   <span className="opacity-30">·</span>
                   <span className="whitespace-nowrap">{new Date(entry.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                 </div>
                 
                 {!isDraft && (entry.fechaVencimiento || entry.fechaSeguimiento) && (
                   <div className="flex items-center gap-1.5">
                     <span className="hidden sm:inline opacity-30">·</span>
                     {entry.fechaVencimiento && (
                       <span className="font-black text-rose-600">VENCE: {formatFecha(entry.fechaVencimiento)}</span>
                     )}
                     {entry.fechaSeguimiento && (
                       <span className="font-black text-indigo-600">REV: {formatFecha(entry.fechaSeguimiento)}</span>
                     )}
                   </div>
                 )}
               </div>

               <div className="flex items-center gap-1.5">
                 {vencida && (
                   <span className="animate-pulse rounded-lg bg-red-500 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-white shadow-sm sm:px-2 sm:py-1 sm:text-[8px]">
                     Atrasada
                   </span>
                 )}
                 {/* En Desktop volvemos a mostrar los badges aquí para mantener el flujo horizontal */}
                 <div className="hidden sm:flex sm:items-center sm:gap-1.5">
                   {!isDraft && (entry.formalizada || entry.requiereSeguimiento) && (
                     <TareaStatusBadge 
                       status={entry.estado || entry.estadoOperativo || 'PENDIENTE'} 
                       className="scale-90 sm:scale-100" 
                     />
                   )}
                   {clasif && !isDraft && (
                     <span
                       className="inline-flex max-w-[7.5rem] items-center gap-1 overflow-hidden rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest shadow-sm"
                       style={{ backgroundColor: `${clasif.color}10`, color: clasif.color, border: `1px solid ${clasif.color}20` }}
                     >
                       <Icon name={clasif.icon} size="11px" className="shrink-0" />
                       <span className="truncate">{clasif.label}</span>
                     </span>
                   )}
                 </div>
               </div>
            </div>
          </div>
              {isDraft && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Selector de Área */}
                  <label className="relative inline-flex h-6 sm:h-7 max-w-[5.5rem] cursor-pointer items-center gap-1 rounded-lg border border-slate-100 bg-white px-1.5 pr-4 text-[6.5px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all active:scale-95">
                    <span className="truncate text-[7px] sm:text-[8px]">{AREA_MAP[entry.area] || entry.area}</span>
                    <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-40" />
                    <select
                      value={entry.area}
                      onChange={(e) => handleUpdateField('area', e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label="Cambiar área"
                    >
                      {Object.entries(AREA_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </label>

                  {/* Selector de Línea */}
                  <label className="relative inline-flex h-6 sm:h-7 max-w-[5.5rem] cursor-pointer items-center gap-1 rounded-lg border border-slate-100 bg-white px-1.5 pr-4 text-[6.5px] sm:text-[8px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all active:scale-95">
                    <span className="truncate text-[7px] sm:text-[8px]">{lineaLabel}</span>
                    <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-40" />
                    <select
                      value={entry.linea}
                      onChange={(e) => handleUpdateField('linea', e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label="Cambiar línea"
                    >
                      {Object.entries(LINEA_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </label>

                  <label
                    className="relative inline-flex h-6 sm:h-7 max-w-[5.5rem] sm:max-w-[7.5rem] cursor-pointer items-center gap-1 rounded-lg border px-1.5 sm:px-2 pr-4 sm:pr-5 text-[6.5px] sm:text-[8px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
                    style={{
                      color: clasif?.color,
                      backgroundColor: `${clasif?.color || '#64748b'}10`,
                      borderColor: `${clasif?.color || '#64748b'}20`,
                    }}
                    title="Cambiar clasificación"
                  >
                    <Icon name={clasif?.icon || 'more_horiz'} size="11px" className="shrink-0" />
                    <span className="min-w-0 truncate">{clasifShortLabel}</span>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60" />
                    <select
                      value={entry.clasificacion}
                      onChange={(e) => handleUpdateField('clasificacion', e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label="Cambiar clasificación"
                    >
                      {Object.entries(CLASIFICACION_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(entry.tempId); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white active:scale-90 ml-auto"
                    title="Eliminar borrador"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Body: Texto */}
              <div className="flex-1 mt-1">
            {isSavedEditing ? (
              <div className="space-y-1.5 sm:space-y-2">
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => handleSavedField('descripcion', e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 p-2 text-[11px] sm:p-2.5 sm:text-[13px] font-semibold leading-relaxed text-slate-900 placeholder:text-slate-200 focus:border-marca-primario/30 focus:outline-none focus:ring-4 focus:ring-marca-primario/10"
                />
                <div className="grid gap-1.5 grid-cols-3">
                  <label className="relative flex h-6 sm:h-8 items-center justify-center rounded-lg border border-slate-100 bg-white px-1 pr-3 text-[6.5px] sm:text-[9px] font-black uppercase text-slate-600 shadow-sm transition-all active:scale-95">
                    <span className="truncate">{AREA_MAP[editForm.area] || editForm.area}</span>
                    <ChevronDown size={10} className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-40" />
                    <select
                      value={editForm.area}
                      onChange={(e) => handleSavedField('area', e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    >
                      {Object.entries(AREA_MAP).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="relative flex h-6 sm:h-8 items-center justify-center rounded-lg border border-slate-100 bg-white px-1 pr-3 text-[6.5px] sm:text-[9px] font-black uppercase text-slate-600 shadow-sm transition-all active:scale-95">
                    <span className="truncate">{LINEA_MAP[editForm.linea]?.label || editForm.linea}</span>
                    <ChevronDown size={10} className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-40" />
                    <select
                      value={editForm.linea}
                      onChange={(e) => handleSavedField('linea', e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    >
                      {Object.entries(LINEA_MAP).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="relative flex h-6 sm:h-8 items-center justify-center rounded-lg border border-slate-100 bg-white px-1 pr-3 text-[6.5px] sm:text-[9px] font-black uppercase text-slate-600 shadow-sm transition-all active:scale-95">
                    <span className="truncate">{CLASIFICACION_MAP[editForm.clasificacion]?.label || editForm.clasificacion}</span>
                    <ChevronDown size={10} className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-40" />
                    <select
                      value={editForm.clasificacion}
                      onChange={(e) => handleSavedField('clasificacion', e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    >
                      {Object.entries(CLASIFICACION_MAP).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Edición de Fechas y Responsables (Solo si está organizada) */}
                {isOrganized && (
                  <div className="grid gap-2 sm:grid-cols-2 mt-2 border-t border-slate-100 pt-2">
                    <div className="space-y-1">
                      <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        {entry.formalizada ? 'Fecha de Vencimiento' : 'Fecha de Seguimiento'}
                      </label>
                      {entry.formalizada ? (
                        <input 
                          type="date"
                          value={editForm.fechaVencimiento}
                          onChange={(e) => handleSavedField('fechaVencimiento', e.target.value)}
                          className="w-full rounded-lg border border-slate-100 bg-white px-1.5 h-6 sm:h-8 sm:px-2 text-[9px] sm:text-[10px] font-bold text-slate-600 outline-none focus:border-marca-primario/30 transition-all"
                        />
                      ) : (
                        <input 
                          type="date"
                          value={editForm.fechaSeguimiento}
                          onChange={(e) => handleSavedField('fechaSeguimiento', e.target.value)}
                          className="w-full rounded-lg border border-slate-100 bg-white px-1.5 h-6 sm:h-8 sm:px-2 text-[9px] sm:text-[10px] font-bold text-slate-600 outline-none focus:border-marca-primario/30 transition-all"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Responsable
                      </label>
                      <label className="relative flex h-6 sm:h-8 items-center rounded-lg border border-slate-100 bg-white px-2 pr-6 text-[9px] sm:text-[10px] font-bold uppercase text-slate-600 shadow-sm transition-all active:scale-95">
                        <span className="truncate">
                          {users.find(u => u.id === Number(editForm.responsables[0]))?.nombre || 'Sin responsable'}
                        </span>
                        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-40" />
                        <select
                          value={editForm.responsables[0] || ''}
                          onChange={(e) => handleSavedField('responsables', e.target.value ? [Number(e.target.value)] : [])}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        >
                          <option value="">Sin responsable</option>
                          {users.filter(u => u.estado === 'ACTIVO').map(user => (
                            <option key={user.id} value={user.id}>{user.nombre}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                )}

                {/* Gestión de Imágenes */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Imágenes ({allImages.length}/3)</label>
                  <div className="flex gap-2 flex-wrap">
                    {allImages.map((img, idx) => (
                      <div key={img.id || idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                        <img src={img.preview || img.url} className="w-full h-full object-cover" alt="Task" />
                        <button 
                          onClick={() => onDeleteImage?.(entry.id, img.id)}
                          className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    {allImages.length < 3 && (
                      <button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) onAddImage?.(entry.id, file);
                          };
                          input.click();
                        }}
                        className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-slate-400 hover:text-slate-400 transition-all hover:bg-slate-50"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelSavedEdit}
                    className="rounded-xl border border-slate-100 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveSavedEdit}
                    disabled={!editForm.descripcion.trim() || savingEdit}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-widest active:scale-95",
                      editForm.descripcion.trim()
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        : "bg-slate-50 text-slate-200"
                    )}
                  >
                    {savingEdit ? <Icon name="progress_activity" size="14px" className="animate-spin" /> : <Save size={14} />}
                    Guardar
                  </button>
                </div>
              </div>
            ) : isEditing ? (
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={handleBlur}
                className="w-full resize-none overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-[13px] font-semibold leading-relaxed text-slate-900 placeholder:text-slate-200 focus:ring-0 sm:text-[15px]"
                rows={1}
              />
            ) : (
              <div className="relative group/text">
                <p
                  className={cn(
                    "whitespace-pre-wrap break-words text-[13px] font-semibold leading-relaxed text-slate-800 transition-all duration-300 sm:text-[15px]",
                    isDraft ? "cursor-text bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 sm:p-2.5" : "px-0.5 sm:px-1",
                    isClosed && "line-through text-slate-400 opacity-70",
                    !isExpanded && !isDraft && "max-h-[4.5rem] overflow-hidden sm:max-h-[5.5rem]"
                  )}
                  onClick={() => isDraft && handleStartDraftEdit()}
                >
                  {entry.descripcion || "Sin descripción..."}
                </p>
                
                {/* Gradiente de "ver más" — Solo si no está expandido y no es borrador */}
                {!isExpanded && !isDraft && (entry.descripcion?.length > 100) && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none transition-opacity duration-300 group-hover/text:from-white/40" 
                  />
                )}
              </div>
            )}
          </div>

            {/* Gestión de Imágenes para Borradores */}
            {isDraft && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-50 pt-3">
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mr-1">Imágenes</span>
                 <div className="flex flex-wrap gap-2">
                    {entry._localImagenes?.map((img, idx) => (
                      <div key={img.id || idx} className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                        <img src={img.preview} className="w-full h-full object-cover" alt="Preview borrador" />
                        <button 
                          onClick={() => {
                            const newImgs = entry._localImagenes.filter((_, i) => i !== idx);
                            handleUpdateField('_localImagenes', newImgs);
                          }}
                          className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    {(entry._localImagenes?.length || 0) < 3 && (
                      <button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = Array.from(e.target.files);
                            const currentCount = entry._localImagenes?.length || 0;
                            const remaining = 3 - currentCount;
                            if (remaining <= 0) return;
                            
                            const newImgs = files.slice(0, remaining).map(f => ({
                              file: f,
                              preview: URL.createObjectURL(f),
                              id: Math.random().toString(36).substr(2, 9)
                            }));
                            handleUpdateField('_localImagenes', [...(entry._localImagenes || []), ...newImgs]);
                          };
                          input.click();
                        }}
                        className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-slate-400 hover:text-slate-400 transition-all hover:bg-slate-50 active:scale-95"
                        title="Agregar imágenes"
                      >
                        <Camera size={16} />
                      </button>
                    )}
                 </div>
              </div>
            )}

            {/* Información adicional cuando está expandido */}
            {isExpanded && !isDraft && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-50 pt-3">
                {entry.asignaciones && entry.asignaciones.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Responsable</span>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.asignaciones.map((asig) => (
                        <div key={asig.id} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                            {asig.usuario?.nombre?.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 truncate max-w-[100px]">{asig.usuario?.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
          </div>
        )}
      {/* Footer se queda adentro del contenedor con padding para que no se corte */}
          {!isDraft && (
             <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-slate-50 pt-1.5 sm:mt-2 sm:pt-2 pb-1">
                <div className="flex items-center gap-1.5">
                  {!isClosed && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowNotesPanel(true); }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition-all hover:bg-amber-400 hover:text-white active:scale-95"
                      title="Agregar nota"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  {entryNotes.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowNotesPanel(true); }}
                      className="flex h-7 min-w-7 items-center justify-center gap-1 rounded-lg border border-amber-300 bg-amber-300 px-2 text-[9px] font-black text-amber-950 shadow-sm transition-all hover:bg-amber-400 active:scale-95"
                      title="Ver notas"
                    >
                      <StickyNote size={13} />
                      {entryNotes.length}
                    </button>
                  )}
                </div>

                {/* ACCIÓN PRIMARIA (Botón Azul en el centro del Footer) */}
                {isFormalizada && !isDraft && (
                  <div className="flex flex-1 justify-center px-2">
                    {estadoActual === 'PENDIENTE' && isAsignado && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus('EN_PROGRESO'); }}
                        disabled={isUpdatingStatus}
                        className="flex h-8 items-center gap-2 rounded-xl bg-blue-600 px-6 text-[9px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                      >
                        <Icon name="play_circle" size="16px" />
                        Iniciar
                      </button>
                    )}
                    {estadoActual === 'EN_PROGRESO' && isAsignado && (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleUpdateStatus((isJefe && isAsignado) ? 'CERRADO' : 'COMPLETADO'); 
                        }}
                        disabled={isUpdatingStatus}
                        className="flex h-8 items-center gap-2 rounded-xl bg-blue-600 px-6 text-[9px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                      >
                        <Icon name={(isJefe && isAsignado) ? "verified" : "check_circle"} size="16px" />
                        {(isJefe && isAsignado) ? "Terminar" : "Completar"}
                      </button>
                    )}
                    {estadoActual === 'COMPLETADO' && isJefe && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus('CERRADO'); }}
                        disabled={isUpdatingStatus}
                        className="flex h-8 items-center gap-2 rounded-xl bg-slate-900 px-6 text-[9px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-slate-900/30 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                      >
                        <Icon name="verified" size="16px" className="text-emerald-400" />
                        Aprobar
                      </button>
                    )}
                    {estadoActual === 'CERRADO' && (
                       <div className="flex items-center gap-1.5 text-emerald-600">
                         <Icon name="check_circle" size="14px" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Cerrado</span>
                       </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-95 border shadow-sm",
                    isExpanded ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:text-slate-900 hover:border-slate-900"
                  )}
                  title={isExpanded ? "Ver menos" : "Ver detalles"}
                >
                  <Icon name={isExpanded ? "visibility_off" : "visibility"} size="14px" />
                </button>

                {!isClosed && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartSavedEdit(); }}
                      className="flex items-center gap-1 rounded-lg border border-slate-100 px-2.5 py-1.5 text-[7px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-slate-900 hover:text-slate-900 active:scale-95 sm:px-3 sm:text-[8px] shadow-sm"
                    >
                      <Pencil size={12} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); onOrganize(entry); }}
                      className={cn(
                        "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[7px] font-black uppercase tracking-widest transition-all active:scale-95 sm:px-3 sm:text-[8px] border shadow-sm",
                        (entry.formalizada || entry.requiereSeguimiento)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                          : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-900 hover:text-slate-900"
                      )}
                    >
                     <Settings2 size={12} /> 
                      <span className="hidden sm:inline">{(entry.formalizada || entry.requiereSeguimiento) ? "ORGANIZADO" : "ORGANIZAR"}</span>
                    </button>
                  </>
                )}
                </div>
              </div>
            )}
            
          </div> {/* CIERRA: Columna Principal (Textos y Footer) */}
        </div>   {/* CIERRA: Grid de la Tarjeta */}
      </div>     {/* CIERRA: Tarjeta Blanca (Fondo general) */}

      {/* Modal de Notas */}
      {showNotesPanel && !isDraft && (
        <EntryNotesPostIt
          entry={{ ...entry, readOnly: isClosed }}
          notes={entryNotes}
          onClose={() => setShowNotesPanel(false)}
          onAddNote={onCreateNote}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      )}

      {/* Modal de Visor */}
      {viewerIndex !== null && (
        <ImageViewer 
          images={allImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerIndex(null)} 
        />
      )}
    </>
  );
};