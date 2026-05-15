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
  Save
} from 'lucide-react';
import { LineIconSelector } from '../icons/line-icons';

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

const EntryNotesPostIt = ({ entry, notes, onClose, onAddNote }) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!content.trim() || saving || !onAddNote) return;
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
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-2xl border-l-4 border-amber-400 bg-white/70 p-4 shadow-sm">
                  <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-amber-950">
                    {note.contenido}
                  </p>
                  {note.createdAt && (
                    <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-amber-700/45">
                      {new Date(note.createdAt).toLocaleString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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
  onCreateNote
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
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
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
    });
    setIsSavedEditing(false);
  };

  const handleSaveSavedEdit = async () => {
    if (!onUpdateSaved || !editForm.descripcion.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const updated = await onUpdateSaved(entry.id, {
        descripcion: editForm.descripcion.trim(),
        area: editForm.area,
        linea: editForm.linea,
        clasificacion: editForm.clasificacion,
      });
      if (updated !== false) setIsSavedEditing(false);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative grid bg-white transition-all duration-300 rounded-[1.35rem] border border-slate-100 overflow-hidden min-h-[6.75rem] sm:min-h-[7.5rem]',
          hasImages
            ? '[grid-template-columns:clamp(4.5rem,24%,6.5rem)_minmax(0,1fr)] sm:[grid-template-columns:clamp(5.25rem,22%,7.5rem)_minmax(0,1fr)]'
            : 'grid-cols-1',
          isDraft ? 'shadow-lg ring-1 ring-emerald-500/10' : 'shadow-sm hover:shadow-md',
          isEditing && 'ring-2 ring-marca-primario/10'
        )}
      >
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
          
          {/* Header Row: Linea Icon + Info + Clasif */}
          <div className="mb-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5 sm:mb-2 sm:gap-2">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-900 shadow-sm sm:h-9 sm:w-9">
                <LineIconSelector type={entry.linea} size={16} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap">
                  <span className="truncate text-[8px] font-black uppercase tracking-tighter text-slate-400 sm:text-[9px]">
                    {AREA_MAP[entry.area] || entry.area}
                  </span>
                  <span className="mx-0.5 text-[8px] text-slate-200">/</span>
                  <span className="truncate text-[8px] font-bold text-slate-500 sm:text-[9px]">
                    {lineaLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1 whitespace-nowrap text-[7px] font-bold uppercase tracking-tighter text-slate-400 sm:text-[8px]">
                   <span>{formatTime(entry.createdAt)}</span>
                   <span className="opacity-30">·</span>
                   <span>{new Date(entry.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {isDraft ? (
                <>
                  <label
                    className="relative inline-flex h-7 max-w-[5.75rem] cursor-pointer items-center gap-1 rounded-lg border px-2 pr-5 text-[7px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 sm:max-w-[7.5rem] sm:text-[8px]"
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
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white active:scale-90"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                clasif && (
                  <span
                    className="inline-flex max-w-[5.5rem] items-center gap-1 overflow-hidden rounded-lg px-1.5 py-1.5 text-[7px] font-black uppercase tracking-widest shadow-sm sm:max-w-[7.5rem] sm:px-2.5 sm:text-[8px]"
                    style={{ backgroundColor: `${clasif.color}10`, color: clasif.color, border: `1px solid ${clasif.color}20` }}
                  >
                    <Icon name={clasif.icon} size="11px" className="shrink-0" />
                    <span className="truncate">{clasif.label}</span>
                  </span>
                )
              )}
            </div>
          </div>

          {/* Body: Texto */}
          <div className="flex-1 mt-1">
            {isSavedEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => handleSavedField('descripcion', e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-[13px] font-semibold leading-relaxed text-slate-900 placeholder:text-slate-200 focus:border-marca-primario/30 focus:outline-none focus:ring-4 focus:ring-marca-primario/10 sm:text-[15px]"
                />
                <div className="grid gap-2 min-[420px]:grid-cols-3">
                  <select
                    value={editForm.area}
                    onChange={(e) => handleSavedField('area', e.target.value)}
                    className="min-w-0 rounded-xl border border-slate-100 bg-white px-2 py-2 text-[10px] font-black uppercase text-slate-600 outline-none"
                  >
                    {Object.entries(AREA_MAP).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={editForm.linea}
                    onChange={(e) => handleSavedField('linea', e.target.value)}
                    className="min-w-0 rounded-xl border border-slate-100 bg-white px-2 py-2 text-[10px] font-black uppercase text-slate-600 outline-none"
                  >
                    {Object.entries(LINEA_MAP).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                  <select
                    value={editForm.clasificacion}
                    onChange={(e) => handleSavedField('clasificacion', e.target.value)}
                    className="min-w-0 rounded-xl border border-slate-100 bg-white px-2 py-2 text-[10px] font-black uppercase text-slate-600 outline-none"
                  >
                    {Object.entries(CLASIFICACION_MAP).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
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
              <p
                className={cn(
                  "whitespace-pre-wrap break-words text-[13px] font-semibold leading-relaxed text-slate-800 transition-all sm:text-[15px]",
                  isDraft ? "cursor-text bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 sm:p-2.5" : "px-0.5 sm:px-1"
                )}
                onClick={() => isDraft && handleStartDraftEdit()}
              >
                {entry.descripcion || "Sin descripción..."}
              </p>
            )}
          </div>

          {/* Footer */}
          {!isDraft && (
             <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-slate-50 pt-1.5 sm:mt-2 sm:pt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowNotesPanel(true); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition-all hover:bg-amber-400 hover:text-white active:scale-95"
                    title="Agregar nota"
                  >
                    <Plus size={14} />
                  </button>
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
                <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartSavedEdit(); }}
                  className="flex items-center gap-1 rounded-lg border border-slate-100 px-2.5 py-1.5 text-[7px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-slate-900 hover:text-slate-900 active:scale-95 sm:px-3 sm:text-[8px]"
                >
                  <Pencil size={12} />
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onOrganize(entry); }}
                  className="flex items-center gap-1 rounded-lg border border-slate-100 px-2.5 py-1.5 text-[7px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-slate-900 hover:text-slate-900 active:scale-95 sm:px-3 sm:text-[8px]"
                >
                  <Settings2 size={12} /> 
                  Organizar
                </button>
                </div>
             </div>
          )}
        </div>
      </div>

      {showNotesPanel && !isDraft && (
        <EntryNotesPostIt
          entry={entry}
          notes={entryNotes}
          onClose={() => setShowNotesPanel(false)}
          onAddNote={onCreateNote}
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
