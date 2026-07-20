import { Table } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Tooltip } from '@/components/ui/tooltip';
import { TableActions } from '@/components/ui/table-actions';
import { ConfirmModal } from '@/components/ui/modal';
import { cn } from "@/utils/cn";
import { AREA_MAP, CLASIFICACION_MAP, ESTADO_TAREA_MAP, PRIORIDAD_MAP, LINEA_MAP } from '../../constants';
import { formatFecha, isPastDate, formatFechaRelativa } from '@/lib/date';
import { Settings2, StickyNote, Plus, X } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { LineIconSelector, MarketingIcon } from '../icons/line-icons';
import { ImageViewer } from '../../../tareas/components/comun/tarjeta-tarea';
import { useAuthStore } from '@/stores/auth-store';
import { ModalEntregarTarea } from '../../../tareas/components/comun/modal-entregar-tarea';
import { ModalRevisionTarea } from '../../../tareas/components/comun/modal-revision-tarea';
import { EtiquetaEstadoTarea } from "../../../tareas/components/comun/etiqueta-estado-tarea";
import { EtiquetaPrioridadTarea } from "../../../tareas/components/comun/etiqueta-prioridad-tarea";
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';

const ESTADO_STYLES = {
  PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
  CERRADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADA: 'bg-red-50 text-red-700 border-red-200',
};

// Componente de Nota Editable
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

// Modal de Notas
const EntryNotesPostIt = ({ entry, notes, onClose, onAddNote, onUpdateNote, onDeleteNote }) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!content.trim() || saving || !onAddNote || entry.readOnly) return;
    setSaving(true);
    try {
      const created = await onAddNote(entry.id || entry.tempId, content.trim());
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
                <EditableNote 
                  key={note.id || idx} 
                  note={note} 
                  onUpdate={(id, c) => onUpdateNote(entry.id || entry.tempId, id || idx, c)} 
                  onDelete={(id) => onDeleteNote(entry.id || entry.tempId, id || idx)} 
                  readOnly={entry.readOnly} 
                />
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

// Componente para previsualización en hover en la tabla usando PORTAL de alta visibilidad
const TableImagePreview = ({ images, remoteImageCount, onClick }) => {
  const isDesktop = useIsDesktop();
  const [showHover, setShowHover] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Efecto de carrusel automático si hay más de una imagen
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, [images]);

  if ((!images || images.length === 0) && remoteImageCount > 0) {
    return (
      <div className="h-28 w-28 min-w-[7rem] shrink-0 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-1.5 p-2 text-slate-400 select-none shadow-xs mx-auto">
        <Icon name="photo_camera" size="20px" className="text-slate-400/80 animate-pulse" />
        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase text-center leading-tight">
          {remoteImageCount} {remoteImageCount === 1 ? 'Foto' : 'Fotos'}
        </span>
        <span className="text-[8px] font-black uppercase text-slate-400/80 tracking-wider">
          En borrador
        </span>
      </div>
    );
  }

  if (!images || images.length === 0) return <span className="text-[11px] text-slate-300">—</span>;
  
  const currentImg = images[currentIndex]?.preview || images[currentIndex]?.url || images[currentIndex]?.base64Thumb;

  const handleMouseEnter = () => {
    if (!isDesktop) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const xPos = spaceRight > 420 ? rect.right + 25 : rect.left - 410;
      
      setCoords({
        x: xPos,
        y: Math.max(200, Math.min(window.innerHeight - 200, rect.top + (rect.height / 2)))
      });
      setShowHover(true);
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="relative flex items-center justify-center p-1" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={() => setShowHover(false)}
    >
      <div 
        className="h-28 w-28 min-w-[7rem] shrink-0 rounded-2xl border-2 border-slate-100 bg-white relative z-10 cursor-pointer p-1 hover:border-marca-primario/30 transition-all group" 
        onClick={(e) => { 
          e.stopPropagation(); 
          setShowHover(false); 
          onClick?.(e); 
        }}
      >
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm">
          {images.map((img, i) => (
            <img 
              key={i}
              src={img.preview || img.url || img.base64Thumb} 
              alt={`Preview ${i}`} 
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out group-hover:scale-110",
                i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            />
          ))}
        </div>
        
        {/* Overlay indicador de cantidad */}
        {images.length > 1 && (
          <div className="absolute top-1.5 right-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 text-[9px] font-black text-white rounded-lg z-20 shadow-lg border border-white/20">
            {currentIndex + 1}/{images.length} FOTOS
          </div>
        )}

        {/* Lupa sutil central */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
           <Icon name="zoom_in" size="24px" className="text-white drop-shadow-md" />
        </div>
      </div>

      {/* SUPER PREVIEW (Portal) — Renderiza una versión mucho más grande en hover */}
      {showHover && isDesktop && createPortal(
        <div 
          className="fixed z-99999 pointer-events-none animate-in fade-in zoom-in-95 duration-200" 
          style={{ 
            left: coords.x, 
            top: coords.y, 
            transform: 'translateY(-50%)' 
          }}
        >
          <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.35)] border border-slate-200 w-[380px] h-[380px] flex flex-col items-center justify-center relative overflow-hidden ring-4 ring-slate-100/50">
            <img src={currentImg} alt="Preview Zoom" className="w-full h-full object-contain rounded-3xl drop-shadow-xl animate-in fade-in duration-500" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl">
               Previsualización Rápida
            </div>
          </div>
        </div>, 
        document.body
      )}
    </div>
  );
};

export const EntryTable = ({ 
  entries, departamento, onOrganize, onRemove, onEdit, 
  onCreateNote, onUpdateNote, onDeleteNote, onChangeStatus, users,
  onDownloadPdf, isGeneratingPdf, onViewDetail, onToggleNotificado
}) => {
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const currentUserId = currentUser?.id;
  const userRole = currentUser?.rol || 'GERENCIA';
  const isJefe = userRole === 'JEFE' || userRole === 'GERENCIA' || userRole === 'ADMIN';

  const [viewerIndex, setViewerIndex] = useState(null);
  const [activeEntryImages, setActiveEntryImages] = useState([]);
  const [activeNotesEntryId, setActiveNotesEntryId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [forceCloseTarget, setForceCloseTarget] = useState(null);
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [selectedTareaForEntrega, setSelectedTareaForEntrega] = useState(null);
  const [expandedGroupIds, setExpandedGroupIds] = useState(new Set());

  const toggleGroup = (groupId) => {
    setExpandedGroupIds(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const tableData = useMemo(() => {
    const result = [];
    for (const entry of entries) {
      result.push({
        ...entry,
        key: entry.id || entry.tempId
      });
      if (entry.isGrouped && expandedGroupIds.has(entry.id)) {
        for (const sub of entry.subTareas) {
          result.push({
            ...sub,
            key: `sub_${sub.id}`,
            _isSubTask: true,
            parentGroupId: entry.id
          });
        }
      }
    }
    return result;
  }, [entries, expandedGroupIds]);

  const openViewer = (images) => {
    setActiveEntryImages(images);
    setViewerIndex(0);
  };

  const activeEntryForNotes = useMemo(() => {
    if (!activeNotesEntryId) return null;
    const found = entries.find(e => (e.id || e.tempId) === activeNotesEntryId);
    if (found) return found;
    for (const entry of entries) {
      if (entry.subTareas) {
        const subFound = entry.subTareas.find(sub => sub.id === activeNotesEntryId);
        if (subFound) return subFound;
      }
    }
    return null;
  }, [activeNotesEntryId, entries]);

  const hasOrganizedEntries = useMemo(() => entries.some(e => {
    const isDraft = Boolean(e.tempId);
    const tipo = e.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
    return tipo !== 'SIN_ORGANIZAR';
  }), [entries]);

  const hasResponsibles = useMemo(() => entries.some(e => 
    (e.asignaciones && e.asignaciones.length > 0) || 
    (e.responsables && e.responsables.length > 0)
  ), [entries]);
  const hasPriority = useMemo(() => entries.some(e => e.prioridad), [entries]);
  const hasDueDate = useMemo(() => entries.some(e => e.fechaVencimiento), [entries]);

  // Verificar si todas las entradas de la tabla actual son externas
  const isAllExternal = useMemo(() => {
    if (!entries || entries.length === 0) return false;
    return entries.every(row => {
      return (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
    });
  }, [entries, departamento]);

  const columns = [
    {
      header: "#",
      accessorKey: "index",
      headerClassName: "w-[4%] min-w-[50px]",
      cell: (row) => {
        if (row._isSubTask) {
          return (
            <div className="flex justify-end pr-2 text-slate-400">
              <Icon name="subdirectory_arrow_right" size="16px" />
            </div>
          );
        }
        if (row.isGrouped) {
          const isExpanded = expandedGroupIds.has(row.id);
          return (
            <button
              onClick={(e) => { e.stopPropagation(); toggleGroup(row.id); }}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 transition-all hover:bg-slate-100 shadow-xs"
            >
              <Icon name={isExpanded ? 'remove' : 'add'} size="14px" />
            </button>
          );
        }
        const isDraft = Boolean(row.tempId);
        const isRemoteDraft = Boolean(row._isRemoteDraft);
        const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
        if (isRemoteDraft) return <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-700 whitespace-nowrap">En vivo</span>;
        if (isDraft) return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-700 whitespace-nowrap">Borrador</span>
            {isExternal && (
              <span className="inline-flex items-center rounded-md bg-marca-primario/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-marca-primario whitespace-nowrap">
                {AREA_MAP[row.area] || row.area}
              </span>
            )}
          </div>
        );
        if (isExternal) return <span className="inline-flex items-center gap-1 rounded-lg bg-marca-primario/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-marca-primario whitespace-nowrap">EXT</span>;
        const entryIdx = entries.findIndex(e => (e.id && e.id === row.id) || (e.tempId && e.tempId === row.tempId));
        return <span className="text-slate-400 font-mono text-xs">#{entryIdx !== -1 ? entryIdx + 1 : 1}</span>;
      }
    },
    {
      header: "Adjuntos",
      accessorKey: "adjuntos",
      align: "center",
      headerClassName: "w-[10%] min-w-[150px]",
      cell: (row) => {
        if (row._isSubTask) {
          const evidenceImages = (row.imagenes || []).filter(img => img.tipo === 'EVIDENCIA');
          return <TableImagePreview images={evidenceImages} onClick={() => openViewer(evidenceImages)} />;
        }
        const allImages = [
          ...(row._localImages || []),
          ...(row._remoteImageThumbnails || []).map((b64, idx) => ({
            id: `remote_thumb_${idx}`,
            preview: b64,
            url: b64,
            _isRemote: true
          })),
          ...(row.imagenes || row.images || [])
        ].filter(img => img.tipo !== 'EVIDENCIA');
        return <TableImagePreview images={allImages} remoteImageCount={row._remoteImageCount} onClick={() => openViewer(allImages)} />;
      }
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
      headerClassName: "w-[25%] min-w-[200px]",
      cell: (row) => {
        if (row._isSubTask) {
          return (
            <div className="pl-4 text-[12px] text-slate-500 font-medium italic">
              Tarea individual asignada
            </div>
          );
        }
        const isDraft = Boolean(row.tempId);
        const isRemoteDraft = Boolean(row._isRemoteDraft);
        const tipo = row.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
        const isOrganized = tipo !== 'SIN_ORGANIZAR';
        const isTarea = tipo === 'TAREA';
        const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');

        const overdue = !isDraft && !isRemoteDraft && isOrganized && isTarea && row.fechaVencimiento && !['CERRADA', 'CANCELADA', 'DESCARTADA', 'EN_REVISION'].includes(row.estado) && isPastDate(row.fechaVencimiento);
        
        const handleClick = (e) => {
          e.stopPropagation();
          if (isRemoteDraft) {
            return;
          }
          if (isExternal && !isDraft) {
            if (row.isGrouped) {
              toggleGroup(row.id);
            } else {
              onViewDetail?.(row);
            }
            return;
          }
          if (isDraft || !isOrganized) {
            onOrganize?.(row);
          } else if (isTarea) {
            if (row.isGrouped) {
              toggleGroup(row.id);
            } else {
              onViewDetail?.(row);
            }
          }
        };

        const isClickable = !isRemoteDraft && (isDraft || !isOrganized || isTarea || (isExternal && !isDraft));

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {tipo === 'TAREA' && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-600 border border-rose-100">
                  <Icon name="task_alt" size="10px" className="shrink-0 text-rose-500" /> Tarea
                </span>
              )}
              {tipo === 'RECORDATORIO' && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-600 border border-indigo-100">
                  <Icon name="notifications" size="10px" className="shrink-0 text-indigo-500" /> Recordatorio
                </span>
              )}
              {tipo === 'POLITICA' && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700 border border-slate-200">
                  <Icon name="policy" size="10px" className="shrink-0 text-slate-500" /> Política
                </span>
              )}
              {tipo === 'SIN_ORGANIZAR' && !isExternal && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-900 border border-amber-300 shadow-sm animate-pulse">
                  <Icon name="warning" size="10px" className="shrink-0 text-amber-600" /> Falta Clasificar
                </span>
              )}
              {overdue && (
                <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/20 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                  <Icon name="warning" size="10px" className="shrink-0" /> ATRASADA
                </span>
              )}
              {isExternal && row.createdAt && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600 border border-slate-200 shadow-xs whitespace-nowrap">
                  <Icon name="event" size="10px" className="shrink-0 text-slate-500" /> Creada: {formatFecha(row.createdAt)}
                </span>
              )}
            </div>
            <span 
              onClick={handleClick}
              className={cn(
                "block text-[13px] font-semibold leading-relaxed line-clamp-3 transition-colors",
                isClickable ? "cursor-pointer text-slate-800 hover:text-marca-primario" : "text-slate-600"
              )}
              title={
                isRemoteDraft ? `Borrador en vivo de ${row.author?.nombre || 'otro usuario'}` :
                isExternal && !isDraft ? "Hacer clic para ver detalles de la tarea" :
                isDraft || !isOrganized ? "Hacer clic para organizar esta entrada" :
                isTarea ? "Hacer clic para ver detalles de la tarea" :
                row.descripcion
              }
            >
              {row.descripcion || 'Sin descripción'}
            </span>
          </div>
        );
      }
    },
    ...(!(hasOrganizedEntries || hasResponsibles) ? [] : [
      {
        header: "Responsables",
        accessorKey: "asignaciones",
        align: "center",
        headerClassName: "w-[10%] min-w-[120px]",
        cell: (row) => {
          if (row._isSubTask) {
            const asig = row.asignaciones?.[0];
            const r = asig?.usuario || users?.find(u => u.id === asig?.usuarioId) || { nombre: 'Cargando...' };
            return (
              <div className="flex items-center gap-2 pl-4 justify-center">
                <div className="h-7 w-7 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                  {r.imagen ? <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" /> : r.nombre?.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-700">{r.nombre}</span>
              </div>
            );
          }
          const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
          if (isExternal) return <span className="text-[10px] font-black text-marca-primario uppercase bg-marca-primario/5 px-2 py-1 rounded-md">{AREA_MAP[row.area] || row.area}</span>;

          const responsablesRaw = row.responsables || (row.asignaciones?.map(a => ({ ...a.usuario, id: a.usuarioId ?? a.usuario?.id })) || []);
          const responsables = responsablesRaw.map(r => {
            const isObj = typeof r === 'object' && r !== null;
            const id = isObj ? r.id : r;
            const fullUser = users?.find(u => u.id === id);
            if (fullUser) return { ...fullUser, ...(isObj ? r : {}) };
            return isObj ? r : { id: r, nombre: 'Cargando...' };
          });

          if (responsables.length === 0) return <span className="text-[11px] text-slate-300">—</span>;
          
          const tooltipText = responsables.map(r => r.nombre).join('\n');

          return (
            <div className="flex justify-center">
              <Tooltip text={tooltipText} position="top" className="whitespace-pre-line text-left">
                <div className="flex -space-x-3 cursor-help py-1">
                  {responsables.map((r) => (
                    <div key={r.id} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-md shrink-0 ring-1 ring-slate-200 transition-all hover:scale-110 hover:z-30">
                      {r.imagen ? (
                        <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" />
                      ) : (
                        r.nombre?.charAt(0)
                      )}
                    </div>
                  ))}
                </div>
              </Tooltip>
            </div>
          );
        }
      }
    ]),
    ...(departamento === 'MARKETING' ? [] : [
      {
        header: isAllExternal ? "ÁREA" : "Línea",
        accessorKey: "linea",
        align: "center",
        headerClassName: "w-[10%] min-w-[100px]",
        cell: (row) => {
          if (row._isSubTask) return <span className="text-slate-300">—</span>;

          if (row.area && row.area !== 'DISENO' && row.area !== 'MARKETING') {
            const areaLabel = AREA_MAP[row.area] || row.area;
            const lineaLabel = row.linea || '';
            return (
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                {areaLabel}{lineaLabel ? ` - ${lineaLabel}` : ''}
              </span>
            );
          }

          const isMarketing = departamento === 'MARKETING';
          const lineInfo = isMarketing ? { label: 'Marketing', color: '#7c3aed' } : (LINEA_MAP[row.linea] || { label: row.linea || '—', color: '#64748b' });

          if (isAllExternal) {
            return (
              <div className="flex items-center justify-center gap-1.5 font-semibold">
                {isMarketing ? (
                  <MarketingIcon size={18} style={{ color: lineInfo.color }} />
                ) : (
                  <LineIconSelector type={row.linea} size={18} style={{ color: lineInfo.color }} />
                )}
                <span className="text-[10px] uppercase font-bold text-slate-700 whitespace-nowrap" style={{ color: lineInfo.color }}>
                  {lineInfo.label}
                </span>
              </div>
            );
          }
          return (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <div className="flex items-center justify-center">
                {isMarketing ? <MarketingIcon size={60} style={{ color: lineInfo.color }} /> : <LineIconSelector type={row.linea} size={60} style={{ color: lineInfo.color }} />}
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest font-mono leading-none text-center" style={{ color: lineInfo.color }}>{lineInfo.label}</span>
            </div>
          );
        }
      }
    ]),
    ...(isAllExternal ? [] : [
      {
        header: "Clasificación",
        accessorKey: "clasificacion",
        align: "center",
        headerClassName: "w-[10%] min-w-[120px]",
        cell: (row) => {
          if (row._isSubTask) return <span className="text-slate-300">—</span>;
          const isExternal = row.area && row.area !== 'DISENO' && row.area !== 'MARKETING';
          if (isExternal) return <span className="text-[11px] text-slate-300">—</span>;
          const clasif = CLASIFICACION_MAP[row.clasificacion];
          if (!clasif) return <span className="text-[11px] text-slate-300">—</span>;
          return (
            <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap border" style={{ backgroundColor: `${clasif.color}08`, color: clasif.color, borderColor: `${clasif.color}20` }}>
              <Icon name={clasif.icon} size="12px" />
              {clasif.label}
            </span>
          );
        }
      }
    ]),

    ...(isAllExternal ? [] : [
      {
        header: "Estado",
        accessorKey: "estado",
        align: "center",
        headerClassName: "w-[12%] min-w-[110px]",
        cell: (row) => {
          if (row._isSubTask) {
            return <EtiquetaEstadoTarea status={row.estado} />;
          }
          const isDraft = Boolean(row.tempId);
          const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
          const isOtherArea = row.area !== 'DISENO' && row.area !== 'MARKETING';
          
          if (isOtherArea) {
            return <span className="text-slate-300">—</span>;
          }
          const tipo = row.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
          const isOrganized = tipo !== 'SIN_ORGANIZAR';
          if (!isOrganized && !isExternal) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-300 uppercase tracking-wide whitespace-nowrap bg-amber-100 text-amber-800 animate-pulse shadow-sm">
                Sin Clasificar
              </span>
            );
          }
          const estadoActual = row.estado || (tipo === 'TAREA' || tipo === 'RECORDATORIO' || isExternal ? 'PENDIENTE' : null);
          if (!estadoActual) return <span className="text-[11px] text-slate-300">—</span>;

          const overdue = !isDraft && row.fechaVencimiento && !['CERRADA', 'CANCELADA', 'DESCARTADA', 'EN_REVISION'].includes(estadoActual) && isPastDate(row.fechaVencimiento);
          if (overdue) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border border-estado-rechazado/20 uppercase tracking-wide whitespace-nowrap bg-estado-rechazado/10 text-estado-rechazado">
                Atrasada
              </span>
            );
          }

          return <EtiquetaEstadoTarea status={estadoActual} />;
        }
      }
    ]),
    ...(!(hasOrganizedEntries || hasPriority || hasDueDate) || isAllExternal ? [] : [
      {
        header: "Prioridad",
        accessorKey: "prioridad",
        align: "center",
        headerClassName: "w-[10%] min-w-[90px]",
        cell: (row) => {
          if (row._isSubTask) return <span className="text-slate-300">—</span>;
          const isDraft = Boolean(row.tempId);
          const tipo = row.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
          if (tipo !== 'TAREA' || !row.prioridad) return <span className="text-[11px] text-slate-300">—</span>;
          return <EtiquetaPrioridadTarea priority={row.prioridad} />;
        }
      },
      {
        header: "Vencimiento / Conclusión",
        accessorKey: "fechaVencimiento",
        align: "center",
        headerClassName: "w-[15%] min-w-[150px]",
        cell: (row) => {
          const isDraft = Boolean(row.tempId);
          const isRemoteDraft = Boolean(row._isRemoteDraft);
          const tipo = row.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
          const isOrganized = tipo !== 'SIN_ORGANIZAR';
          
          if (!row.fechaVencimiento && (isDraft || isRemoteDraft || !isOrganized)) return <span className="text-[11px] text-slate-300">—</span>;

          const isResolvedOrClosed = row.estado === 'EN_REVISION' || row.estado === 'CERRADA';

          if (isResolvedOrClosed) {
            const fechaFin = row.completadoAt || row.cerradoAt || row.updatedAt;
            const isLate = row.isLate ?? (row.fechaVencimiento && fechaFin && new Date(fechaFin) > new Date(row.fechaVencimiento));
            return (
              <div className="flex flex-col gap-0.5 text-[10px] w-full text-center items-center">
                {row.fechaVencimiento ? (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-bold uppercase">Venc:</span>
                    <span className="text-slate-600 font-medium">{formatFecha(row.fechaVencimiento)}</span>
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Sin fecha límite</div>
                )}
                {fechaFin && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-bold uppercase">Concl:</span>
                    <span className={cn("font-bold", isLate ? "text-red-600" : "text-emerald-600")}>
                      {formatFecha(fechaFin)}
                    </span>
                  </div>
                )}
              </div>
            );
          }

          const overdue = !isDraft && row.fechaVencimiento && isPastDate(row.fechaVencimiento);

          const textoRelativo = row.fechaVencimiento ? formatFechaRelativa(row.fechaVencimiento) : 'Sin fecha límite';
          const textoAbsoluto = row.fechaVencimiento ? formatFecha(row.fechaVencimiento) : '';
          const mostrarAbsoluto = row.fechaVencimiento && (textoRelativo.toLowerCase() !== textoAbsoluto.toLowerCase());

          return (
            <div className="flex flex-col gap-0.5 text-xs text-center items-center">
              <span className={cn('font-medium', overdue ? 'text-red-600 font-semibold' : 'text-slate-600')}>
                {textoRelativo}
              </span>
              {mostrarAbsoluto && <span className="text-[10px] text-slate-400">{textoAbsoluto}</span>}
            </div>
          );
        }
      }
    ]),
    {
      header: "Acciones",
      accessorKey: "acciones",
      align: "center",
      headerClassName: "w-[15%] min-w-[180px]",
      cell: (row) => {
        const isClosed = row.estado === 'CERRADA';
        const isDraft = Boolean(row.tempId);
        const isRemoteDraft = Boolean(row._isRemoteDraft);
        const tipo = row.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
        const isOrganized = tipo !== 'SIN_ORGANIZAR';
        const entryNotes = (row.notas || []).filter(n => !n.esEntrega);
        const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
        const isFormalizada = tipo === 'TAREA';
        const isAsignado = row.asignaciones?.some(asig => asig.usuarioId === currentUserId);
        const estadoActual = row.estado || 'PENDIENTE';
        
        const tieneJefeAsignado = row.asignaciones?.some(a => a.usuario?.rol === 'JEFE');
        const puedeAprobar = userRole === 'ADMIN' || userRole === 'GERENCIA' || (userRole === 'JEFE' && !tieneJefeAsignado);
        
        let mySubTask = row;
        if (row.isGrouped && row.subTareas) {
            const found = row.subTareas.find(sub => sub.asignaciones?.some(asig => asig.usuarioId === currentUserId));
            if (found) mySubTask = found;
        }
        const myTaskIsPendiente = mySubTask.estado?.toUpperCase() === 'PENDIENTE';
        
        const canForceClose = isJefe && (!isAsignado || !myTaskIsPendiente) && estadoActual === 'PENDIENTE' && row.tipo === 'TAREA' && !isDraft && !isRemoteDraft;
        
        if (row._isSubTask) {
          const subNotes = (row.notas || []).filter(n => !n.esEntrega);
          return (
            <div className="flex items-center gap-2 justify-center">
              {/* Notas para sub-tarea */}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveNotesEntryId(row.id); }} 
                className={cn(
                  "h-9 flex items-center gap-1.5 px-2.5 rounded-xl border transition-all active:scale-95 shadow-sm bg-white", 
                  subNotes.length > 0 ? "border-amber-300 text-amber-700 bg-amber-200" : "border-yellow-400 text-yellow-500 hover:text-amber-600 bg-amber-50"
                )} 
                title="Notas de la tarea individual"
              >
                <StickyNote size={16} />
                <span className="text-[11px] font-black">{subNotes.length}</span>
              </button>
              <TableActions 
                row={row} 
                actions={[
                  { key: 'entregar', enabled: !isClosed && estadoActual === 'PENDIENTE' && isAsignado, onClick: (r) => { setSelectedTareaForEntrega(r); setIsEntregaModalOpen(true); } },
                  { key: 'aprobar', enabled: !isClosed && estadoActual === 'EN_REVISION' && puedeAprobar, onClick: (r) => { setApproveTarget(r); } },
                  { key: 'ver_detalle', enabled: true, onClick: (r) => { onViewDetail?.(r); } }
                ]} 
              />
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 justify-center">
            {/* Notas: Solo si no es un grupo consolidado */}
            {!row.isGrouped && (
              <button onClick={(e) => { e.stopPropagation(); setActiveNotesEntryId(row.id || row.tempId); }} className={cn("h-9 flex items-center gap-1.5 px-2.5 rounded-xl border transition-all active:scale-95 shadow-sm bg-white", entryNotes.length > 0 ? "border-amber-300 text-amber-700 bg-amber-200" : "border-yellow-400 text-yellow-500 hover:text-amber-600 bg-amber-50")} title="Notas de la tarea">
                <StickyNote size={16} />
                <span className="text-[11px] font-black">{entryNotes.length}</span>
              </button>
            )}
            
            {/* PDF Button for External */}
            {!isClosed && isExternal && !isDraft && onDownloadPdf && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDownloadPdf(row.area); }} 
                disabled={isGeneratingPdf === row.area}
                className="h-9 px-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-1.5 transition-all active:scale-90 shadow-sm font-black uppercase text-[10px] tracking-widest" 
                title="Generar y compartir PDF"
              >
                <Icon name={isGeneratingPdf === row.area ? "hourglass_empty" : "picture_as_pdf"} size="16px" className={isGeneratingPdf === row.area ? "animate-spin" : ""} />
                PDF
              </button>
            )}

            {/* Checkbox Notificado — solo ADMIN, solo externa, solo guardada */}
            {userRole === 'ADMIN' && isExternal && !isDraft && !isRemoteDraft && onToggleNotificado && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleNotificado(row.id); }}
                title={row.notificadoAt ? `Notificado el ${new Date(row.notificadoAt).toLocaleDateString('es-MX')}` : 'Marcar como notificado'}
                className={cn(
                  "h-9 w-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                  row.notificadoAt
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-500"
                )}
              >
                <Icon name={row.notificadoAt ? "check_circle" : "radio_button_unchecked"} size="16px" />
              </button>
            )}
 
            <TableActions 
                row={row} 
                actions={[
                    { key: 'entregar', enabled: isFormalizada && !isDraft && !isClosed && !isExternal && myTaskIsPendiente && isAsignado, onClick: (r) => { setSelectedTareaForEntrega(row.isGrouped ? mySubTask : r); setIsEntregaModalOpen(true); } },
                    { key: 'aprobar', enabled: isFormalizada && !isDraft && !isClosed && !isExternal && estadoActual === 'EN_REVISION' && puedeAprobar, onClick: (r) => { setApproveTarget(r); } },
                    { key: 'forzar_cierre_tarea', enabled: canForceClose && !isClosed && !isRemoteDraft, onClick: (r) => { setForceCloseTarget(r); } },
                    { key: 'ver_detalle', enabled: (row.tipo === 'TAREA' || isExternal) && !isRemoteDraft && !isDraft && !row.isGrouped, onClick: (r) => { onViewDetail?.(r); } },
                    { key: 'editar', enabled: !isClosed && !isRemoteDraft, onClick: (r) => { 
                        const tareaToEdit = { ...r };
                        if (r.isGrouped && r.subTareas) {
                            const ids = r.subTareas.flatMap(s => s.responsables?.map(u => typeof u === 'object' ? u.id : u) || s.asignaciones?.map(a => a.usuarioId) || []);
                            tareaToEdit.responsables = [...new Set(ids)].filter(Boolean);
                        } else if (r.responsables) {
                            tareaToEdit.responsables = r.responsables.map(x => typeof x === 'object' ? x.id : x).filter(Boolean);
                        }
                        onEdit(tareaToEdit); 
                    } },
                    { key: 'borrar', enabled: !isClosed && !isRemoteDraft, onClick: (r) => { 
                        if (r.isGrouped) {
                            setDeleteTarget({ ...r, _deleteAll: true }); 
                        } else {
                            setDeleteTarget(r);
                        }
                    } }
                ]} 
            />

            {/* Organizar: Solo si NO está cerrada, NO está organizada (es SIN_ORGANIZAR), NO es externa y NO es borrador */}
            {!isClosed && !isOrganized && !isExternal && !isRemoteDraft && !isDraft && (
              <button onClick={() => onOrganize(row)} className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 bg-white shadow-sm active:scale-90 transition-all" title="Organizar">
                <Settings2 size={18} />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={tableData}
          keyField="key"
          loading={false}
          emptyMessage="No hay tareas registradas aún."
          onRowClick={(row) => {
            if (row._isSubTask) return;
            if (row.isGrouped) {
              toggleGroup(row.id);
            }
          }}
          rowClassName={(row) => {
            if (row._isSubTask) return 'bg-slate-50/50 hover:bg-slate-100/50 border-l-4 border-l-slate-300';
            const isDraft = Boolean(row.tempId);
            const isRemoteDraft = Boolean(row._isRemoteDraft);
            const isClosed = row.estado === 'CERRADA';
            const tipo = row.tipo || (isDraft ? 'SIN_ORGANIZAR' : 'TAREA');
            const isOrganized = tipo !== 'SIN_ORGANIZAR';
            const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
            const isOtherArea = row.area !== 'DISENO' && row.area !== 'MARKETING';
            if (isRemoteDraft) return 'bg-cyan-50/30 hover:bg-cyan-50/50 border-l-4 border-l-cyan-400';
            if (isDraft) return 'bg-emerald-50/20 hover:bg-emerald-50/40 border-l-4 border-l-emerald-400';
            if (isClosed) return 'opacity-70 grayscale bg-slate-50/50';
            if (isOtherArea) return 'hover:bg-slate-50 transition-colors';
            if (!isOrganized && !isExternal) return 'bg-amber-50/35 hover:bg-amber-100/50 border-l-4 border-l-amber-500 border-dashed';
            if (isExternal) return 'bg-marca-primario/5 border-l-4 border-l-marca-primario';
            return 'hover:bg-slate-50 transition-colors';
          }}
        />
      </div>

      {activeEntryForNotes && (
        <EntryNotesPostIt
          entry={{ ...activeEntryForNotes, readOnly: activeEntryForNotes.estado === 'CERRADA' || activeEntryForNotes._isRemoteDraft }}
          notes={(activeEntryForNotes.notas || []).filter(n => !n.esEntrega)}
          onClose={() => setActiveNotesEntryId(null)}
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

      {isEntregaModalOpen && selectedTareaForEntrega && (
        <ModalEntregarTarea
          isOpen={isEntregaModalOpen}
          onClose={() => {
            setIsEntregaModalOpen(false);
            setSelectedTareaForEntrega(null);
          }}
          tareaId={selectedTareaForEntrega.id}
          onConfirm={async () => {
            const isAsignado = selectedTareaForEntrega.asignaciones?.some(asig => asig.usuarioId === currentUserId);
            const nextStatus = (userRole === 'ADMIN' || userRole === 'GERENCIA' || (userRole === 'JEFE' && !isAsignado)) ? 'CERRADA' : 'EN_REVISION';
            if (onChangeStatus) await onChangeStatus(selectedTareaForEntrega.id, { estado: nextStatus }, true);
            setIsEntregaModalOpen(false);
            setSelectedTareaForEntrega(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (onRemove) await onRemove(deleteTarget.id || deleteTarget.tempId, deleteTarget._deleteAll);
            setDeleteTarget(null);
          }}
          title="Descartar Tarea"
          message={deleteTarget._deleteAll ? "¿Confirmas que deseas descartar este grupo de tareas por completo? Esta acción es irreversible." : "¿Estás seguro de que deseas descartar esta tarea? Esta acción eliminará permanentemente los datos."}
          confirmText="Descartar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}

      {approveTarget && (
        <ModalRevisionTarea
          isOpen={Boolean(approveTarget)}
          onClose={() => setApproveTarget(null)}
          tarea={approveTarget}
          onConfirm={async () => {
            if (onChangeStatus) {
                if (approveTarget.isGrouped && approveTarget.subTareas) {
                    await Promise.all(approveTarget.subTareas.map(sub => onChangeStatus(sub.id, { estado: 'CERRADA' }, true)));
                    notify.success('Tareas aprobadas correctamente.');
                } else {
                    await onChangeStatus(approveTarget.id, { estado: 'CERRADA' }, true);
                    notify.success('Tarea aprobada correctamente.');
                }
            }
            setApproveTarget(null);
          }}
          submitting={false}
        />
      )}

      {forceCloseTarget && (
        <ConfirmModal
          isOpen={Boolean(forceCloseTarget)}
          onClose={() => setForceCloseTarget(null)}
          onConfirm={async () => {
            if (onChangeStatus) {
                if (forceCloseTarget.isGrouped && forceCloseTarget.subTareas) {
                    await Promise.all(forceCloseTarget.subTareas.map(sub => onChangeStatus(sub.id, { estado: 'CERRADA' }, true)));
                    notify.success('Tareas cerradas correctamente.');
                } else {
                    await onChangeStatus(forceCloseTarget.id, { estado: 'CERRADA' }, true);
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
    </>
  );
};
