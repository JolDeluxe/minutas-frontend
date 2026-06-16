// src/features/tareas_generales/components/tabla-generales.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Table, Icon, Tooltip, TableActions, ConfirmModal } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { AREA_MAP, CLASIFICACION_MAP, LINEA_MAP } from '../../minutas/constants';
import { formatFecha, isPastDate, formatFechaRelativa } from '@/lib/date';
import { StickyNote, X, Plus } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { ImageViewer } from '../../tareas/components/comun/tarjeta-tarea';
import { notify } from '@/components/notification/adaptive-notify';

// ── Table Image Preview Component (Exact replication from entry-table.jsx) ──
const TableImagePreview = ({ images, remoteImageCount, onClick }) => {
    const isDesktop = useIsDesktop();
    const [showHover, setShowHover] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);
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
                {images.length > 1 && (
                    <div className="absolute top-1.5 right-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 text-[9px] font-black text-white rounded-lg z-20 shadow-lg border border-white/20">
                        {currentIndex + 1}/{images.length} FOTOS
                    </div>
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Icon name="zoom_in" size="24px" className="text-white drop-shadow-md" />
                </div>
            </div>

            {showHover && isDesktop && createPortal(
                <div
                    className="fixed z-[99999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
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

// ── Notas PostIt ─────────────────────────────────────────────────────────────
const EditableNote = ({ note, onUpdate, onDelete }) => {
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
        if (content.trim() !== note.contenido) {
            onUpdate?.(note.id, content.trim());
        }
    };

    return (
        <div className="group relative rounded-xl border border-amber-100/50 border-l-4 border-l-amber-400 bg-[#fffdf0] p-4 shadow-md shadow-amber-500/5 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:rotate-0 odd:rotate-[0.5deg] even:rotate-[-0.5deg] hover:bg-[#fffdf6]">
            {onDelete ? (
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
                onChange={e => setContent(e.target.value)}
                onBlur={handleBlur}
                className="w-full bg-transparent resize-none text-[13px] font-semibold leading-relaxed text-amber-950 focus:outline-none p-0 border-none overflow-hidden placeholder:text-amber-200"
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

const NotasPostIt = ({ tarea, notes, onClose, onAddNote, onUpdateNote, onDeleteNote }) => {
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!content.trim() || saving) return;
        setSaving(true);
        try {
            await onAddNote(tarea.id, content.trim());
            setContent('');
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <button className="absolute inset-0 cursor-default" onClick={onClose} />
            <div className="relative flex max-h-[82dvh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-amber-200 bg-[#fffbeb] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="flex shrink-0 items-center justify-between border-b border-amber-200/70 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-lg">
                            <StickyNote size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-amber-950">Notas de tarea</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">{notes.length} registradas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-xl text-amber-700 hover:bg-amber-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {notes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-amber-200 bg-white/45 p-5 text-center">
                            <p className="text-xs font-bold text-amber-800/60">Sin notas todavía.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((note, idx) => (
                                <EditableNote
                                    key={note.id || idx}
                                    note={note}
                                    onUpdate={(id, c) => onUpdateNote(tarea.id, id, c)}
                                    onDelete={(id) => onDeleteNote(tarea.id, id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="shrink-0 border-t border-amber-200/70 bg-amber-50/70 p-4">
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
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
                                content.trim() ? "bg-amber-500 text-white shadow-lg" : "bg-white text-amber-200"
                            )}
                        >
                            {saving ? <Icon name="progress_activity" size="16px" className="animate-spin" /> : <Plus size={16} />}
                            Agregar nota
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ── Tabla Principal ──────────────────────────────────────────────────────────
export const TablaGenerales = ({
    tareas,
    loading,
    currentUser,
    onEdit,
    onRemove,
    onCreateNota,
    onUpdateNota,
    onDeleteNota,
    onDownloadPdf,
    isGeneratingPdf,
    onToggleNotificado,
    onViewDetail,
}) => {
    const [activeNotesId, setActiveNotesId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewerIndex, setViewerIndex] = useState(null);
    const [activeEntryImages, setActiveEntryImages] = useState([]);

    const activeNotasTarea = useMemo(
        () => tareas.find(t => t.id === activeNotesId) || null,
        [activeNotesId, tareas]
    );

    const openViewer = (images) => {
        setActiveEntryImages(images);
        setViewerIndex(0);
    };

    const handleAddNota = async (tareaId, contenido) => {
        try {
            await onCreateNota({ tareaId, contenido });
            notify.success('Nota agregada.');
        } catch {
            notify.error('Error al agregar nota.');
        }
    };

    const handleUpdateNota = async (tareaId, notaId, contenido) => {
        try {
            await onUpdateNota(notaId, { contenido });
        } catch {
            notify.error('Error al actualizar nota.');
        }
    };

    const handleDeleteNota = async (tareaId, notaId) => {
        try {
            await onDeleteNota(notaId);
            notify.success('Nota eliminada.');
        } catch {
            notify.error('Error al eliminar nota.');
        }
    };

    const columns = [
        {
            header: '#',
            accessorKey: 'index',
            headerClassName: 'w-[4%] min-w-[50px]',
            cell: (row) => {
                const idx = tareas.findIndex(t => t.id === row.id);
                return <span className="text-slate-400 font-mono text-xs">#{idx + 1}</span>;
            }
        },
        {
            header: 'Adjuntos',
            accessorKey: 'adjuntos',
            align: 'center',
            headerClassName: 'w-[10%] min-w-[150px]',
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
            header: 'Descripción',
            accessorKey: 'descripcion',
            headerClassName: 'w-[30%] min-w-[220px]',
            cell: (row) => {
                const tipo = row.tipo || 'SIN_ORGANIZAR';
                const userDept = currentUser?.departamento === 'DISEÑO' ? 'DISENO' : currentUser?.departamento;
                const isExternal = (userDept && row.area !== userDept) || row._isExternal === true || ['ADMIN', 'GERENCIA'].includes(currentUser?.rol);
                return (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {tipo === 'TAREA' && (row.area === 'DISENO' || row.area === 'MARKETING') && (
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

                            {isExternal && row.createdAt && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600 border border-slate-200 shadow-xs whitespace-nowrap">
                                    <Icon name="event" size="10px" className="shrink-0 text-slate-500" /> Creada: {formatFecha(row.createdAt)}
                                </span>
                            )}
                        </div>
                        <span 
                            onClick={(e) => { e.stopPropagation(); onViewDetail?.(row); }}
                            className={cn(
                                "block text-[13px] font-semibold leading-relaxed line-clamp-3 transition-colors cursor-pointer text-slate-800 hover:text-marca-primario"
                            )}
                            title="Hacer clic para ver detalles de la tarea"
                        >
                            {row.descripcion || 'Sin descripción'}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Área',
            accessorKey: 'area',
            headerClassName: 'w-[12%] min-w-[130px]',
            align: 'center',
            cell: (row) => {
                const label = AREA_MAP[row.area] || row.area || '—';
                if (row.area !== 'DISENO' && row.area !== 'MARKETING') {
                    return (
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                            {label}{row.linea ? ` - ${row.linea}` : ''}
                        </span>
                    );
                }
                const lineInfo = LINEA_MAP[row.linea];
                return (
                    <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700 whitespace-nowrap">
                            <Icon name="business" size="12px" className="text-slate-500 shrink-0" />
                            {label}
                        </span>
                        {row.linea && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                {lineInfo?.label || row.linea}
                            </span>
                        )}
                    </div>
                );
            }
        },

        {
            header: 'Fecha Límite',
            accessorKey: 'fechaVencimiento',
            align: 'center',
            headerClassName: 'w-[12%] min-w-[130px]',
            cell: (row) => {
                if (!row.fechaVencimiento) return <span className="text-[11px] text-slate-300">—</span>;
                const overdue = isPastDate(row.fechaVencimiento);
                const textoRelativo = formatFechaRelativa(row.fechaVencimiento);
                const textoAbsoluto = formatFecha(row.fechaVencimiento);
                return (
                    <div className="flex flex-col gap-0.5 text-xs text-center items-center">
                        <span className={cn('font-medium', overdue ? 'text-red-600 font-semibold' : 'text-slate-600')}>
                            {textoRelativo}
                        </span>
                        <span className="text-[10px] text-slate-400">{textoAbsoluto}</span>
                    </div>
                );
            }
        },
        {
            header: 'Acciones',
            accessorKey: 'acciones',
            align: 'center',
            headerClassName: 'w-[18%] min-w-[200px]',
            cell: (row) => {
                const entryNotes = row.notas || [];
                const isClosed = row.estado === 'CERRADA';
                return (
                    <div className="flex items-center gap-2 justify-center">
                        {/* Notas */}
                        <button
                            onClick={e => { e.stopPropagation(); setActiveNotesId(row.id); }}
                            className={cn(
                                'h-9 flex items-center gap-1.5 px-2.5 rounded-xl border transition-all active:scale-95 shadow-sm bg-white',
                                entryNotes.length > 0 ? 'border-amber-300 text-amber-700 bg-amber-200' : 'border-yellow-400 text-yellow-500 hover:text-amber-600 bg-amber-50'
                            )}
                            title="Notas"
                        >
                            <StickyNote size={16} />
                            <span className="text-[11px] font-black">{entryNotes.length}</span>
                        </button>

                        {/* PDF */}
                        {onDownloadPdf && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDownloadPdf(row.id); }}
                                disabled={isGeneratingPdf === row.id || isGeneratingPdf === row.area}
                                className="h-9 px-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-1.5 transition-all active:scale-90 shadow-sm font-black uppercase text-[10px] tracking-widest"
                                title="Descargar PDF de Tarea"
                            >
                                <Icon name={(isGeneratingPdf === row.id || isGeneratingPdf === row.area) ? "hourglass_empty" : "picture_as_pdf"} size="16px" className={(isGeneratingPdf === row.id || isGeneratingPdf === row.area) ? "animate-spin" : ""} />
                                PDF
                            </button>
                        )}

                        {/* Checkbox Notificado */}
                        {onToggleNotificado && (
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

                        {/* Editar & Eliminar */}
                        <TableActions
                            row={row}
                            actions={[
                                {
                                    key: 'ver_detalle',
                                    enabled: Boolean(onViewDetail),
                                    onClick: (r) => {
                                        onViewDetail?.(r);
                                    }
                                },
                                {
                                    key: 'editar',
                                    enabled: !isClosed,
                                    onClick: (r) => {
                                        onEdit?.(r);
                                    }
                                },
                                {
                                    key: 'borrar',
                                    enabled: !isClosed,
                                    onClick: (r) => setDeleteTarget(r)
                                },
                            ]}
                        />
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
                    data={tareas}
                    keyField="id"
                    loading={loading}
                    emptyMessage="No hay tareas generales registradas."
                    rowClassName={(row) => {
                        const isClosed = row.estado === 'CERRADA';
                        if (isClosed) return 'opacity-60 grayscale bg-slate-50/50';
                        return 'hover:bg-slate-50 transition-colors';
                    }}
                />
            </div>

            {/* Notas Modal */}
            {activeNotasTarea && (
                <NotasPostIt
                    tarea={activeNotasTarea}
                    notes={activeNotasTarea.notes || activeNotasTarea.notas || []}
                    onClose={() => setActiveNotesId(null)}
                    onAddNote={handleAddNota}
                    onUpdateNote={handleUpdateNota}
                    onDeleteNote={handleDeleteNota}
                />
            )}

            {/* Borrar */}
            {deleteTarget && (
                <ConfirmModal
                    isOpen={Boolean(deleteTarget)}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={async () => {
                        if (onRemove) await onRemove(deleteTarget.id);
                        setDeleteTarget(null);
                    }}
                    title="Descartar Tarea"
                    message="¿Estás seguro de que deseas descartar esta tarea? Esta acción es permanente."
                    confirmText="Descartar"
                    cancelText="Cancelar"
                    variant="danger"
                />
            )}

            {/* Image Viewer */}
            {viewerIndex !== null && (
                <ImageViewer
                    images={activeEntryImages}
                    currentIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                    onNavigate={setViewerIndex}
                />
            )}
        </>
    );
};
