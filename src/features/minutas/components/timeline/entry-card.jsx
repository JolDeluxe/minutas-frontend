import { Icon, TableActions, ConfirmModal, Tooltip } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import {
  CLASIFICACION_MAP,
  AREA_MAP,
  LINEA_MAP,
  formatTime,
  getCatalogos,
} from '../../constants';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import { LineIconSelector, MarketingIcon } from '../icons/line-icons';
import { EtiquetaEstadoTarea } from '../../../tareas/components/comun/etiqueta-estado-tarea';
import { formatFecha, isPastDate } from '@/lib/date';
import { useAuthStore } from '@/stores/auth-store';
import { ModalEntregarTarea } from '../../../tareas/components/comun/modal-entregar-tarea';
import { StatusTrafficLight } from '../status-traffic-light';


/**
 * ImageViewer — Modal premium para ver imágenes con navegación y zoom.
 */
export const ImageViewer = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!images || images.length === 0) return null;
  const currentImg = images[currentIndex];

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
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
           <img src={currentImg.preview || currentImg.url} className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 select-none" alt="Vista ampliada" />
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

      <div className="absolute bottom-10 flex gap-3 z-[100001]">
        {images.map((_, i) => (
          <button key={i} onClick={() => setCurrentIndex(i)} className={cn("h-2.5 rounded-full transition-all duration-300", i === currentIndex ? "bg-white w-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-white/20 w-2.5 hover:bg-white/40")} />
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
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Cerrar notas" />
      <div className="relative flex max-h-[82dvh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-amber-200 bg-[#fffbeb] shadow-2xl shadow-slate-950/25 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
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

/**
 * CardImageCarousel — Componente interno para manejar la rotación automática de imágenes en la tarjeta.
 * Implementa un Portal para la previsualización en hover para evitar clipping por overflow:hidden.
 */
const CardImageCarousel = ({ images, onImageClick, lineInfo, isMarketing }) => {
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
    const previewHeight = window.innerWidth < 640 ? 260 : 380;
    
    // Calcular posición X: intentar derecha, si no, izquierda
    let x = rect.right + 20;
    if (x + previewWidth > window.innerWidth) {
      x = rect.left - previewWidth - 20;
    }
    
    // Asegurar que no se salga por la izquierda
    x = Math.max(20, x);
    
    // Calcular posición Y: centrado relativo al mouse o rect
    let y = rect.top + (rect.height / 2);
    
    setCoords({ x, y });
    setShowHover(true);
  };

  return (
    <div className="relative group/img flex flex-col items-center gap-2 w-full" ref={containerRef}>
      <div
        className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 cursor-pointer overflow-hidden rounded-[1.25rem] border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center p-0.5 group-hover/img:border-marca-primario/40 transition-all active:scale-95"
        onClick={() => onImageClick(currentIndex)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowHover(false)}
      >
        <div className="relative w-full h-full rounded-[1rem] overflow-hidden bg-slate-50">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.preview || img.url}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out",
                i === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
              )}
              alt={`Adjunto ${i + 1}`}
            />
          ))}
        </div>
        
        {/* Pills de paginación de imagen */}
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentIndex ? "bg-white w-3 shadow-sm" : "bg-white/40 w-1")} />
            ))}
          </div>
        )}

        {/* Lupa central sutil */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Icon name="zoom_in" size="20px" className="text-white drop-shadow-md" />
        </div>
      </div>

      {/* Badge de Identidad (SIEMPRE VISIBLE) */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs animate-in fade-in duration-500 max-w-full">
         {isMarketing ? (
            <MarketingIcon size={14} style={{ color: lineInfo.color }} />
         ) : (
            <LineIconSelector type={lineInfo.value} size={16} style={{ color: lineInfo.color }} />
         )}
         <span className="text-[7px] font-black uppercase tracking-wider truncate" style={{ color: lineInfo.color }}>{lineInfo.label}</span>
      </div>

      {/* Hover flotante Ultra-Priority vía Portal */}
      {showHover && createPortal(
        <div 
          className="fixed z-[999999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: coords.x, 
            top: coords.y, 
            transform: 'translateY(-50%)' 
          }}
        >
          <div className="w-64 h-64 sm:w-[380px] sm:h-[380px] flex items-center justify-center relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-2 shadow-[0_50px_120px_rgba(0,0,0,0.5)] ring-[12px] ring-white/20">
            <img 
              src={currentImg.preview || currentImg.url} 
              alt="Preview Zoom" 
              className="w-full h-full object-contain rounded-3xl drop-shadow-lg animate-in fade-in duration-500 bg-slate-50" 
            />
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

export const EntryCard = ({ 
  entry, departamento = 'DISENO', onOrganize, onRemove, onUpdate, onEdit,
  onCreateNote, onUpdateNote, onDeleteNote, onAddImage, onDeleteImage, onChangeStatus, users = [],
  onDownloadPdf, isGeneratingPdf, onViewDetail
}) => {
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const currentUserId = currentUser?.id;
  const userRole = currentUser?.rol || 'GERENCIA';
  const isJefe = userRole === 'JEFE' || userRole === 'GERENCIA';

  const [isExpanded, setIsExpanded] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);

  const isDraft = Boolean(entry.tempId);
  const isClosed = entry.estado === 'CERRADA';
  const isCompletado = entry.estado === 'EN_REVISION';
  const isFormalizada = entry.tipo === 'TAREA';
  const isAsignado = entry.asignaciones?.some(asig => asig.usuarioId === currentUserId);
  const estadoActual = entry.estado || 'PENDIENTE';
  const isOrganized = entry.tipo !== 'SIN_ORGANIZAR';
  
  // Lógica de Entrada Externa
  const isExternal = (departamento === 'DISENO' && entry.area !== 'DISENO') || 
                     (departamento === 'MARKETING' && entry.area !== 'MARKETING');

  const allImagesRaw = [...(entry._localImages || []), ...(entry.images || entry.imagenes || [])];
  const allImages = allImagesRaw.filter(img => img.tipo !== 'EVIDENCIA'); // Thumbnail preferente CAPTURA
  const hasImages = allImages.length > 0;
  const entryNotes = entry.notas || [];
  const vencida = entry.fechaVencimiento && !isCompletado && !isClosed && isPastDate(entry.fechaVencimiento);

  // Determinar si hay algo que mostrar en el detalle
  const hasExtraInfo = useMemo(() => {
    return (entry.asignaciones?.length > 0) || 
           (entry.fechaVencimiento) || 
           (entry.organizadoPor);
  }, [entry]);

  const handleUpdateStatus = async (newStatus) => {
    if (isUpdatingStatus || !onChangeStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onChangeStatus(entry.id, { estado: newStatus });
    } finally { setIsUpdatingStatus(false); }
  };

  const clasif = CLASIFICACION_MAP[entry.clasificacion] || null;
  const isMarketing = departamento === 'MARKETING';
  const lineInfo = {
    label: isMarketing ? 'Marketing' : (LINEA_MAP[entry.linea]?.label || entry.linea || '—'),
    color: isMarketing ? '#8b5cf6' : (LINEA_MAP[entry.linea]?.color || '#64748b'),
    value: entry.linea
  };

  const getCardStyles = () => {
    if (isDraft) return 'bg-emerald-50/40 hover:bg-emerald-100/60 ring-1 ring-emerald-500/10';
    if (vencida) return 'bg-red-50/40 hover:bg-red-100/60 ring-1 ring-red-500/20';
    if (isClosed) return 'opacity-70 grayscale bg-slate-50/50 hover:bg-slate-100/60 border-slate-200/50';
    if (isExternal) return 'bg-purple-50/30 border-l-4 border-l-purple-400';
    
    switch (estadoActual) {
      case 'PENDIENTE': return 'bg-white hover:bg-amber-50/30';
      case 'EN_REVISION': return 'bg-blue-50/30 hover:bg-blue-100/50';
      default: return 'bg-white hover:bg-slate-50/30';
    }
  };

  return (
    <>
      <div 
        onClick={() => {
          if (isDraft || !isOrganized) {
            onOrganize?.(entry);
          } else if (entry.tipo === 'TAREA') {
            onViewDetail?.(entry);
          } else if (hasExtraInfo) {
            setIsExpanded(!isExpanded);
          }
        }}
        className={cn(
          'group relative flex flex-col transition-all duration-300 rounded-[1.5rem] border border-slate-200/80 overflow-hidden cursor-pointer',
          isExpanded ? 'shadow-xl ring-2 ring-slate-200' : 'shadow-sm hover:shadow-md',
          getCardStyles()
        )}
      >
        <div className="flex flex-row h-full min-h-[140px]">
          
          {/* PANEL IZQUIERDO: IMAGEN / IDENTIDAD */}
          <div className="flex flex-col items-center justify-center shrink-0 w-[105px] sm:w-[135px] bg-slate-50/50 border-r border-slate-100/50 p-2 sm:p-3 relative group/side">
            
            {hasImages ? (
              <CardImageCarousel 
                images={allImages} 
                onImageClick={(idx) => setViewerIndex(idx)}
                lineInfo={lineInfo}
                isMarketing={isMarketing}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full gap-2">
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] transition-all duration-500 group-hover:scale-110 shadow-sm" style={{ backgroundColor: `${lineInfo.color}0f`, border: `1.5px solid ${lineInfo.color}25` }}>
                   {isMarketing ? (
                      <MarketingIcon size={32} style={{ color: lineInfo.color }} />
                   ) : (
                      <LineIconSelector type={entry.linea} size={48} style={{ color: lineInfo.color }} />
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
            
            {/* Header: Status + Badge + Fechas */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {!isDraft && isOrganized && entry.tipo !== 'DESCARTADA' && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border text-white shadow-sm transition-all",
                    entry.tipo === 'TAREA' ? (isExternal ? "bg-purple-600 border-purple-500" : "bg-rose-600 border-rose-500") : 
                    entry.tipo === 'RECORDATORIO' ? "bg-indigo-600 border-indigo-500" : "bg-slate-600 border-slate-500"
                  )}>
                    <Icon name={entry.tipo === 'TAREA' ? "task_alt" : "notifications"} size="10px" className="shrink-0" />
                    {isExternal ? `EXTERNA` : entry.tipo}
                  </span>
                )}
                {!isDraft && (entry.tipo === 'TAREA' || entry.tipo === 'RECORDATORIO') && !isExternal && (
                  <EtiquetaEstadoTarea status={estadoActual} className="scale-90 origin-left" />
                )}
                {isExternal && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border bg-purple-100/50 text-purple-700 border-purple-200/50">
                    <Icon name="output" size="10px" />
                    Área: {AREA_MAP[entry.area] || entry.area}
                  </span>
                )}
                {clasif && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border" style={{ backgroundColor: `${clasif.color}08`, color: clasif.color, borderColor: `${clasif.color}15` }}>
                    <Icon name={clasif.icon} size="10px" />
                    {clasif.label}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  {formatTime(entry.createdAt)} · {new Date(entry.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </span>
                {vencida && <span className="text-[7px] font-black text-rose-500 animate-pulse uppercase">¡Vencida!</span>}
              </div>
            </div>

            {/* Cuerpo: Descripción */}
            <div className="flex-1 min-h-0">
               <div className="relative group/text">
                  <p className={cn(
                    "whitespace-pre-wrap break-words text-[13px] font-semibold leading-relaxed text-slate-800 transition-all duration-300",
                    isDraft ? "bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200" : "px-0.5",
                    isClosed && "line-through text-slate-400 opacity-60",
                    !isExpanded && "line-clamp-3"
                  )}>
                    {entry.descripcion || "Sin descripción..."}
                  </p>
                </div>
            </div>

            {/* Extra Info: Oculto por defecto */}
            {/* {isExpanded && !isDraft && !isExternal && (
              <div className="mt-4 pt-3 border-t border-slate-50 space-y-3 animate-in slide-in-from-top-1 duration-300">
                 {entry.asignaciones?.length > 0 && (
                   <div className="flex flex-col gap-1.5">
                     <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Responsables</span>
                     <div className="flex flex-wrap gap-1.5">
                        {entry.asignaciones.map((asig) => (
                           <div key={asig.id} className="flex items-center gap-2 px-2 py-1 bg-white rounded-xl border border-slate-100 shadow-xs">
                             <div className="h-5 w-5 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200">
                               {asig.usuario?.imagen ? <img src={asig.usuario.imagen} className="h-full w-full object-cover" /> : asig.usuario?.nombre?.charAt(0)}
                             </div>
                             <span className="text-[10px] font-bold text-slate-700">{asig.usuario?.nombre}</span>
                           </div>
                        ))}
                     </div>
                   </div>
                 )} */}
                 
                 {/* Fechas importantes
                 {entry.fechaVencimiento && (
                   <div className="pt-2">
                      <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100 w-full sm:w-1/2">
                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-0.5">Vencimiento</p>
                        <p className="text-[11px] font-black text-rose-700 font-mono">{formatFecha(entry.fechaVencimiento)}</p>
                      </div>
                   </div>
                 )}
              </div>
            )} */}

            {/* Footer Actions: Compactos */}
            <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); setShowNotesPanel(true); }} className={cn(
                  "flex h-7 px-2 items-center justify-center gap-1.5 rounded-lg border transition-all active:scale-95 shadow-xs",
                  entryNotes.length > 0 ? "border-amber-300 bg-amber-400 text-white font-black" : "border-amber-200 bg-amber-50 text-amber-600"
                )}>
                  <StickyNote size={14} />
                  <span className="text-[10px]">{entryNotes.length || '+'}</span>
                </button>

                {entry.asignaciones?.length > 0 && (
                  <div className="flex -space-x-2 ml-1">
                    {entry.asignaciones.map((asig) => {
                      const nombre = asig.usuario?.nombre || 'Responsable';
                      return (
                        <Tooltip key={asig.id} text={nombre} position="top">
                          <div className="h-6 w-6 rounded-full border border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-xs shrink-0 ring-1 ring-slate-200 transition-all hover:scale-110 hover:z-10 cursor-help">
                            {asig.usuario?.imagen ? (
                              <img src={asig.usuario.imagen} alt={nombre} className="h-full w-full object-cover" />
                            ) : (
                              nombre.charAt(0)
                            )}
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botones de acción inteligentes */}
              <div className="flex items-center gap-1.5">
                {/* {hasExtraInfo && !isExternal && (
                  <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className={cn("h-7 w-7 rounded-lg border transition-all active:scale-90 flex items-center justify-center shadow-xs", isExpanded ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-400 hover:text-slate-800")}>
                    <Icon name={isExpanded ? "visibility_off" : "visibility"} size="14px" />
                  </button>
                )} */}

                {/* PDF Button for External */}
                {isExternal && !isDraft && onDownloadPdf && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDownloadPdf(entry.area); }} 
                    disabled={isGeneratingPdf === entry.area}
                    className="h-7 px-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-1.5 transition-all active:scale-90 shadow-xs font-black uppercase text-[9px] tracking-widest" 
                    title="Generar y Compartir PDF"
                  >
                    <Icon name={isGeneratingPdf === entry.area ? "hourglass_empty" : "picture_as_pdf"} size="14px" className={isGeneratingPdf === entry.area ? "animate-spin" : ""} />
                    PDF
                  </button>
                )}
                
                {!isClosed && !isOrganized && !isExternal && (
                  <button onClick={(e) => { e.stopPropagation(); onOrganize(entry); }} className="h-7 w-7 rounded-lg border border-marca-primario/20 bg-marca-primario/5 text-marca-primario flex items-center justify-center transition-all active:scale-90 shadow-xs" title="Organizar Entrada">
                    <Settings2 size={13} />
                  </button>
                )}
                
                <TableActions 
                    row={entry} 
                    actions={[
                        { key: 'entregar', enabled: isFormalizada && !isDraft && !isClosed && !isExternal && estadoActual === 'PENDIENTE' && isAsignado, onClick: (r) => { setIsEntregaModalOpen(true); } },
                        { key: 'aprobar', enabled: isFormalizada && !isDraft && !isClosed && !isExternal && estadoActual === 'EN_REVISION' && isJefe, onClick: (r) => { setApproveTarget(r); } },
                        { key: 'ver_detalle', enabled: entry.tipo === 'TAREA', onClick: (r) => { onViewDetail?.(r); } },
                        { key: 'editar', enabled: !isClosed && (isOrganized || isExternal), onClick: (r) => { onEdit(r); } },
                        { key: 'borrar', enabled: !isClosed, onClick: (r) => { setDeleteTarget(r); } }
                    ]} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showNotesPanel && (
        <EntryNotesPostIt 
          entry={{ ...entry, readOnly: isClosed || userRole === 'COORDINADOR' }}
          notes={entryNotes} 
          onClose={() => setShowNotesPanel(false)} 
          onAddNote={onCreateNote} 
          onUpdateNote={onUpdateNote} 
          onDeleteNote={onDeleteNote} 
        />
      )}
      {viewerIndex !== null && <ImageViewer images={allImages} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}
      {isEntregaModalOpen && (
        <ModalEntregarTarea
          isOpen={isEntregaModalOpen}
          onClose={() => setIsEntregaModalOpen(false)}
          tareaId={entry.id}
          onConfirm={async () => {
            const nextStatus = (userRole === 'ADMIN' || userRole === 'GERENCIA' || userRole === 'JEFE') ? 'CERRADA' : 'EN_REVISION';
            await handleUpdateStatus(nextStatus);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (onRemove) await onRemove(deleteTarget.id || deleteTarget.tempId);
            setDeleteTarget(null);
          }}
          title="Descartar Tarea"
          message="¿Estás seguro de que deseas descartar esta tarea? Esta acción eliminará permanentemente los datos."
          confirmText="Descartar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}

      {approveTarget && (
        <ConfirmModal
          isOpen={Boolean(approveTarget)}
          onClose={() => setApproveTarget(null)}
          onConfirm={async () => {
            await handleUpdateStatus('CERRADA');
            setApproveTarget(null);
          }}
          title="Aprobar Tarea"
          message="¿Estás seguro de que deseas aprobar y cerrar esta tarea de forma definitiva?"
          confirmText="Aprobar"
          cancelText="Cancelar"
          variant="success"
        />
      )}
    </>
  );
};