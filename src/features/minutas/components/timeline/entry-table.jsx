import { Table, Skeleton, Icon, Tooltip, TableActions, ConfirmModal } from "@/components/ui/z_index";
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
import { EtiquetaEstadoTarea } from "../../../tareas/components/comun/etiqueta-estado-tarea";
import { EtiquetaPrioridadTarea } from "../../../tareas/components/comun/etiqueta-prioridad-tarea";
import { useIsDesktop } from '@/hooks/useMediaQuery';

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
  entries, departamento, isDraftSection, onOrganize, onRemove, onEdit, 
  onCreateNote, onUpdateNote, onDeleteNote, onChangeStatus, users,
  onDownloadPdf, isGeneratingPdf, onViewDetail
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

  const openViewer = (images) => {
    setActiveEntryImages(images);
    setViewerIndex(0);
  };

  const activeEntryForNotes = useMemo(() => {
    if (!activeNotesEntryId) return null;
    return entries.find(e => (e.id || e.tempId) === activeNotesEntryId);
  }, [activeNotesEntryId, entries]);

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
        const isDraft = Boolean(row.tempId);
        const isRemoteDraft = Boolean(row._isRemoteDraft);
        const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
        if (isRemoteDraft) return <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-700 whitespace-nowrap">En vivo</span>;
        if (isDraft) return <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-700 whitespace-nowrap">Borrador</span>;
        if (isExternal) return <span className="inline-flex items-center gap-1 rounded-lg bg-marca-primario/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-marca-primario whitespace-nowrap">EXT</span>;
        return <span className="text-slate-400 font-mono text-xs">#{entries.indexOf(row) + 1}</span>;
      }
    },
    {
      header: "Adjuntos",
      accessorKey: "adjuntos",
      align: "center",
      headerClassName: "w-[10%] min-w-[150px]",
      cell: (row) => {
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
        const isDraft = Boolean(row.tempId);
        const isRemoteDraft = Boolean(row._isRemoteDraft);
        const isOrganized = row.tipo !== 'SIN_ORGANIZAR';
        const isTarea = row.tipo === 'TAREA';
        
        const handleClick = () => {
          if (isRemoteDraft) {
            return;
          }
          if (isDraft || !isOrganized) {
            onOrganize?.(row);
          } else if (isTarea) {
            onViewDetail?.(row);
          }
        };

        const isClickable = !isRemoteDraft && (isDraft || !isOrganized || isTarea);

        return (
          <span 
            onClick={handleClick}
            className={cn(
              "block text-[13px] font-semibold leading-relaxed line-clamp-3 transition-colors",
              isClickable ? "cursor-pointer text-slate-800 hover:text-marca-primario" : "text-slate-600"
            )}
            title={
              isRemoteDraft ? `Borrador en vivo de ${row.author?.nombre || 'otro usuario'}` :
              isDraft || !isOrganized ? "Hacer clic para organizar esta entrada" :
              isTarea ? "Hacer clic para ver detalles de la tarea" :
              row.descripcion
            }
          >
            {row.descripcion || 'Sin descripción'}
          </span>
        );
      }
    },
    ...(isDraftSection ? [] : [
      {
        header: "Responsables",
        accessorKey: "asignaciones",
        align: "center",
        headerClassName: "w-[10%] min-w-[120px]",
        cell: (row) => {
          const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
          if (isExternal) return <span className="text-[10px] font-black text-marca-primario uppercase bg-marca-primario/5 px-2 py-1 rounded-md">{AREA_MAP[row.area] || row.area}</span>;
          
          const isDraft = Boolean(row.tempId);
          const isRemoteDraft = Boolean(row._isRemoteDraft);
          const isOrganized = row.tipo !== 'SIN_ORGANIZAR';
          if (isDraft || isRemoteDraft || !isOrganized) return <span className="text-[11px] text-slate-300">—</span>;

          if (!row.asignaciones || row.asignaciones.length === 0) return <span className="text-[11px] text-slate-300">—</span>;
          
          const tooltipText = row.asignaciones.map(a => a.usuario?.nombre).join('\n');

          return (
            <div className="flex justify-center">
              <Tooltip text={tooltipText} position="top" className="whitespace-pre-line text-left">
                <div className="flex -space-x-3 cursor-help py-1">
                  {row.asignaciones.map((asig) => (
                    <div key={asig.id} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-md shrink-0 ring-1 ring-slate-200 transition-all hover:scale-110 hover:z-30">
                      {asig.usuario?.imagen ? (
                        <img src={asig.usuario.imagen} alt={asig.usuario.nombre} className="h-full w-full object-cover" />
                      ) : (
                        asig.usuario?.nombre?.charAt(0)
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
        header: "Línea",
        accessorKey: "linea",
        align: "center",
        headerClassName: "w-[10%] min-w-[100px]",
        cell: (row) => {
          const isMarketing = departamento === 'MARKETING';
          const lineInfo = isMarketing ? { label: 'Marketing', color: '#7c3aed' } : (LINEA_MAP[row.linea] || { label: row.linea || '—', color: '#64748b' });
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
    {
      header: "Clasificación",
      accessorKey: "clasificacion",
      align: "center",
      headerClassName: "w-[10%] min-w-[120px]",
      cell: (row) => {
        const clasif = CLASIFICACION_MAP[row.clasificacion];
        if (!clasif) return <span className="text-[11px] text-slate-300">—</span>;
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap border" style={{ backgroundColor: `${clasif.color}08`, color: clasif.color, borderColor: `${clasif.color}20` }}>
            <Icon name={clasif.icon} size="12px" />
            {clasif.label}
          </span>
        );
      }
    },
    ...(isAllExternal ? [] : [
      {
        header: "Estado",
        accessorKey: "estado",
        align: "center",
        headerClassName: "w-[12%] min-w-[110px]",
        cell: (row) => {
          const isDraft = Boolean(row.tempId);
          const isRemoteDraft = Boolean(row._isRemoteDraft);
          
          if (row.tipo === 'SIN_ORGANIZAR' || isDraft || isRemoteDraft) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide whitespace-nowrap bg-amber-50 text-amber-600 border-amber-200">
                Sin Clasificar
              </span>
            );
          }
          const estadoActual = row.estado || (row.tipo === 'TAREA' || row.tipo === 'RECORDATORIO' ? 'PENDIENTE' : null);
          if (!estadoActual) return <span className="text-[11px] text-slate-300">—</span>;
          return <EtiquetaEstadoTarea status={estadoActual} />;
        }
      }
    ]),
    ...(isDraftSection ? [] : [
      {
        header: "Prioridad",
        accessorKey: "prioridad",
        align: "center",
        headerClassName: "w-[10%] min-w-[90px]",
        cell: (row) => {
          const isDraft = Boolean(row.tempId);
          const isRemoteDraft = Boolean(row._isRemoteDraft);
          const isOrganized = row.tipo !== 'SIN_ORGANIZAR';

          if (!row.prioridad || isDraft || isRemoteDraft || !isOrganized) return <span className="text-[11px] text-slate-300">—</span>;
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
          const isOrganized = row.tipo !== 'SIN_ORGANIZAR';
          
          if (isDraft || isRemoteDraft || !isOrganized) return <span className="text-[11px] text-slate-300">—</span>;

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
        const isOrganized = row.tipo !== 'SIN_ORGANIZAR';
        const entryNotes = row.notas || [];
        const isDraft = Boolean(row.tempId);
        const isRemoteDraft = Boolean(row._isRemoteDraft);
        const isExternal = (departamento === 'DISENO' && row.area !== 'DISENO') || (departamento === 'MARKETING' && row.area !== 'MARKETING');
        const isFormalizada = row.tipo === 'TAREA';
        const isAsignado = row.asignaciones?.some(asig => asig.usuarioId === currentUserId);
        const estadoActual = row.estado || 'PENDIENTE';
        
        const tieneJefeAsignado = row.asignaciones?.some(a => a.usuario?.rol === 'JEFE');
        const puedeAprobar = userRole === 'ADMIN' || userRole === 'GERENCIA' || (userRole === 'JEFE' && !tieneJefeAsignado);
        
        const canForceClose = isJefe && !isAsignado && estadoActual === 'PENDIENTE' && row.tipo === 'TAREA' && !isDraft && !isRemoteDraft;
        
        return (
          <div className="flex items-center gap-2 justify-center">
            {/* Notas: Siempre visible */}
            <button onClick={(e) => { e.stopPropagation(); setActiveNotesEntryId(row.id || row.tempId); }} className={cn("h-9 flex items-center gap-1.5 px-2.5 rounded-xl border transition-all active:scale-95 shadow-sm bg-white", entryNotes.length > 0 ? "border-amber-300 text-amber-700 bg-amber-200" : "border-yellow-400 text-yellow-500 hover:text-amber-600 bg-amber-50")} title="Notas de la tarea">
              <StickyNote size={16} />
              <span className="text-[11px] font-black">{entryNotes.length}</span>
            </button>
            
            {/* PDF Button for External */}
            {!isClosed && isExternal && !isDraft && onDownloadPdf && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDownloadPdf(row.area); }} 
                disabled={isGeneratingPdf === row.area}
                className="h-9 px-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-1.5 transition-all active:scale-90 shadow-sm font-black uppercase text-[10px] tracking-widest" 
                title="Generar PDF"
              >
                <Icon name={isGeneratingPdf === row.area ? "hourglass_empty" : "picture_as_pdf"} size="16px" className={isGeneratingPdf === row.area ? "animate-spin" : ""} />
                PDF
              </button>
            )}
 
            <TableActions 
                row={row} 
                actions={[
                    { key: 'entregar', enabled: isFormalizada && !isDraft && !isClosed && !isExternal && estadoActual === 'PENDIENTE' && isAsignado, onClick: (r) => { setSelectedTareaForEntrega(r); setIsEntregaModalOpen(true); } },
                    { key: 'aprobar', enabled: isFormalizada && !isDraft && !isClosed && !isExternal && estadoActual === 'EN_REVISION' && puedeAprobar, onClick: (r) => { setApproveTarget(r); } },
                    { key: 'forzar_cierre_tarea', enabled: canForceClose && !isClosed && !isRemoteDraft, onClick: (r) => { setForceCloseTarget(r); } },
                    { key: 'ver_detalle', enabled: row.tipo === 'TAREA' && !isRemoteDraft, onClick: (r) => { onViewDetail?.(r); } },
                    { key: 'editar', enabled: !isClosed && !isRemoteDraft && (isOrganized || isExternal), onClick: (r) => { onEdit(r); } },
                    { key: 'borrar', enabled: !isClosed && !isRemoteDraft, onClick: (r) => { setDeleteTarget(r); } }
                ]} 
            />

            {/* Organizar: Solo si NO está cerrada, NO está organizada (es SIN_ORGANIZAR) y NO es externa */}
            {!isClosed && !isOrganized && !isExternal && !isRemoteDraft && (
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
          data={entries}
          keyField={(row) => row.id || row.tempId}
          loading={false}
          emptyMessage="No hay tareas registradas aún."
          rowClassName={(row) => {
            const isDraft = Boolean(row.tempId);
            const isRemoteDraft = Boolean(row._isRemoteDraft);
            const isClosed = row.estado === 'CERRADA';
            if (isRemoteDraft) return 'bg-cyan-50/30 hover:bg-cyan-50/50 border-l-4 border-l-cyan-400';
            if (isDraft) return 'bg-emerald-50/20 hover:bg-emerald-50/40 border-l-4 border-l-emerald-400';
            if (isClosed) return 'opacity-70 grayscale bg-slate-50/50';
            return 'hover:bg-slate-50 transition-colors';
          }}
        />
      </div>

      {activeEntryForNotes && (
        <EntryNotesPostIt
          entry={{ ...activeEntryForNotes, readOnly: activeEntryForNotes.estado === 'CERRADA' || activeEntryForNotes._isRemoteDraft }}
          notes={activeEntryForNotes.notas || []}
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
            if (onChangeStatus) await onChangeStatus(selectedTareaForEntrega.id, { estado: nextStatus });
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
            if (onChangeStatus) await onChangeStatus(approveTarget.id, { estado: 'CERRADA' });
            setApproveTarget(null);
          }}
          title="Aprobar Tarea"
          message="¿Estás seguro de que deseas aprobar y cerrar esta tarea de forma definitiva?"
          confirmText="Aprobar"
          cancelText="Cancelar"
          variant="success"
        />
      )}

      {forceCloseTarget && (
        <ConfirmModal
          isOpen={Boolean(forceCloseTarget)}
          onClose={() => setForceCloseTarget(null)}
          onConfirm={async () => {
            if (onChangeStatus) await onChangeStatus(forceCloseTarget.id, { estado: 'CERRADA' });
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
