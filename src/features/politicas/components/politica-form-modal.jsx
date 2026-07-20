import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/utils/cn';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Camera, X, Plus, Pencil, ShieldAlert } from 'lucide-react';
import { validateImageFile } from '@/utils/validators';
import { notify } from '@/components/notification/adaptive-notify';
import { AREA_MAP, LINEAS_POR_AREA, computeDerivedLines } from '@/features/minutas/constants';

/**
 * PoliticaFormModal — Modal de creación/edición de Políticas Institucionales.
 *
 * LOTE 2A — Cambios vs versión anterior:
 *   ✅ form state ampliado: { descripcion, area, linea }
 *   ✅ Select grid de Área + Línea dependiente sobre la textarea
 *   ✅ handleSubmit envía area y linea en ambas ramas (FormData y JSON)
 *   ✅ Importa computeDerivedLines, AREA_MAP, LINEAS_POR_AREA de constants
 */
export const PoliticaFormModal = ({
  isOpen,
  onClose,
  politica,
  onSave,
  submitting = false,
}) => {
  const isDesktop = useIsDesktop();
  const fileInputRef = useRef(null);

  // ── Estado del formulario ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    descripcion: '',
    area:        null,  // null = "Institucional General" (sin área específica)
    linea:       null,  // null = "General" dentro del área
  });

  const [localImages,    setLocalImages]    = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error,          setError]          = useState('');

  // ── Líneas disponibles para el área seleccionada ────────────────────────────
  // Memo: solo recalcula cuando cambia form.area. MARKETING → [] → no muestra selector.
  const lineasDisponibles = useMemo(
    () => (form.area ? LINEAS_POR_AREA[form.area] ?? [] : []),
    [form.area]
  );

  // ── Inicializar / resetear al abrir ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (politica) {
      // Edición: restaurar valores existentes
      setForm({
        descripcion: politica.descripcion || '',
        area:        politica.area  || null,
        linea:       politica.linea || null,
      });
      setExistingImages(politica.imagenes || []);
      setLocalImages([]);
    } else {
      // Alta: limpiar todo
      setForm({ descripcion: '', area: null, linea: null });
      setLocalImages([]);
      setExistingImages([]);
    }
    setError('');
  }, [isOpen, politica]);

  // ── Manejadores de imagen ───────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        notify.error(validation.error);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const currentTotal    = localImages.length + existingImages.length;
    const availableSlots  = 3 - currentTotal;

    if (availableSlots <= 0) {
      notify.warning('Límite de 3 imágenes alcanzado.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToAdd = validFiles.slice(0, availableSlots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setLocalImages((prev) => [...prev, ...filesToAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeLocalImage = (previewUrl) => {
    URL.revokeObjectURL(previewUrl);
    setLocalImages((prev) => prev.filter((img) => img.preview !== previewUrl));
  };

  const removeExistingImage = (id) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    if (localImages.length > 0) {
      // ── Rama FormData (hay imágenes nuevas) ───────────────────────────────
      const fd = new FormData();
      fd.append('tareas[0][descripcion]', form.descripcion.trim());

      // area y linea: solo se appendan si tienen valor (backend usa default si ausentes)
      if (form.area)  fd.append('tareas[0][area]',  form.area);
      if (form.linea) fd.append('tareas[0][linea]', form.linea);

      localImages.forEach((img, idx) => {
        fd.append(`files_0_${idx}`, img.file);
      });

      await onSave(fd);
    } else {
      // ── Rama JSON (sin imágenes nuevas) ───────────────────────────────────
      const payload = {
        descripcion: form.descripcion.trim(),
        area:        form.area  ?? null,  // null = Institucional General
        linea:       form.linea ?? null,  // null = General dentro del área
      };
      await onSave(payload);
    }
  };

  if (!isOpen) return null;

  // ── Contenido del formulario ────────────────────────────────────────────────
  const renderFormContent = () => (
    <div className="space-y-5">

      {/* ── ÁREA / LÍNEA ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          'grid gap-3',
          lineasDisponibles.length > 0 ? 'grid-cols-2' : 'grid-cols-1'
        )}
      >
        {/* Select de Área */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Área Institucional
          </label>
          <div className="relative">
            <select
              value={form.area || ''}
              onChange={(e) => {
                const newArea = e.target.value || null;
                // Al cambiar área en Políticas, default a General (null) de forma automática
                setForm((f) => ({ ...f, area: newArea, linea: null }));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl
                pl-3 pr-7 py-2.5 text-[11px] font-bold text-slate-700
                focus:outline-none focus:ring-4 focus:ring-marca-primario/10
                transition-all appearance-none shadow-sm h-11 truncate"
            >
              <option value="">— General (Sin área específica) —</option>
              {Object.entries(AREA_MAP).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Icon name="expand_more" size="14px" />
            </div>
          </div>
        </div>

        {/* Select de Línea — solo visible si el área tiene líneas */}
        {lineasDisponibles.length > 0 && (
          <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Línea de Producto
            </label>
            <div className="relative">
              <select
                value={form.linea || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linea: e.target.value || null }))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl
                  pl-3 pr-7 py-2.5 text-[11px] font-bold text-slate-700
                  focus:outline-none focus:ring-4 focus:ring-marca-primario/10
                  transition-all appearance-none shadow-sm h-11 truncate"
              >
                <option value="">— General —</option>
                {lineasDisponibles.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="expand_more" size="14px" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DESCRIPCIÓN ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Descripción de la Política
        </label>
        <textarea
          value={form.descripcion}
          onChange={(e) => {
            setForm((f) => ({ ...f, descripcion: e.target.value }));
            setError('');
          }}
          className={cn(
            'w-full h-40 p-4 bg-slate-50 border rounded-2xl text-sm sm:text-base font-semibold',
            'focus:outline-none focus:ring-4 focus:ring-marca-primario/5 resize-none shadow-inner',
            error ? 'border-rose-300 focus:ring-rose-50 animate-shake' : 'border-slate-200'
          )}
          placeholder="Escribe la política institucional aquí..."
        />
        {error && (
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1
            flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
            <ShieldAlert size={14} className="text-rose-500" /> {error}
          </p>
        )}
      </div>

      {/* ── IMÁGENES ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Camera size={14} className="text-slate-400" />
            Imágenes de Referencia ({localImages.length + existingImages.length}/3)
          </label>
          {(localImages.length + existingImages.length) < 3 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600
                rounded-lg text-[10px] font-black uppercase tracking-wider
                transition-all hover:bg-emerald-100 active:scale-95"
            >
              <Plus size={14} /> Añadir Foto
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Imágenes existentes (edición) */}
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden
                border-2 border-slate-100 group shadow-sm"
            >
              <img src={img.url} className="w-full h-full object-cover" alt="Adjunto" />
              <button
                onClick={() => removeExistingImage(img.id)}
                className="absolute inset-0 bg-rose-600/60 text-white flex items-center
                  justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
          ))}

          {/* Imágenes nuevas (preview local) */}
          {localImages.map((img) => {
            const isHeic = img.file && /\.(heic|heif)$/i.test(img.file.name);
            return (
              <div
                key={img.preview}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden
                  border-2 border-emerald-200 group shadow-md animate-in zoom-in-90
                  bg-slate-50 flex items-center justify-center text-slate-400"
              >
                {isHeic ? (
                  <div className="flex flex-col items-center justify-center h-full w-full p-2
                    text-center bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <Camera size={24} className="text-amber-500 mb-1" />
                    <span>HEIC</span>
                  </div>
                ) : (
                  <img src={img.preview} className="w-full h-full object-cover" alt="Nuevo" />
                )}
                <button
                  onClick={() => removeLocalImage(img.preview)}
                  className="absolute inset-0 bg-slate-900/60 text-white flex items-center
                    justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={20} />
                </button>
              </div>
            );
          })}

          {/* Botón de subida (placeholder visual) */}
          {(localImages.length + existingImages.length) < 3 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32
                border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400
                hover:bg-slate-100 hover:text-slate-500 hover:border-slate-300 transition-colors"
            >
              <Plus size={24} className="mb-1" />
              <span className="text-[10px] font-black mt-1 uppercase tracking-widest">Subir</span>
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/jpeg, image/png, image/webp, image/heic, image/heif"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );

  // ── Acciones del footer ─────────────────────────────────────────────────────
  const footerActions = (
    <div className="flex gap-4 w-full">
      <Button
        variant="neutro"
        onClick={onClose}
        disabled={submitting}
        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest
          text-[10px] border-2 border-slate-100 text-slate-400"
      >
        Cancelar
      </Button>
      <Button
        variant="guardar"
        icon="check_circle"
        onClick={handleSubmit}
        isLoading={submitting}
        className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-[0.2em]
          text-[11px] shadow-2xl shadow-emerald-500/20"
      >
        Guardar Política
      </Button>
    </div>
  );

  // ── Render: Desktop (Modal centrado) ───────────────────────────────────────
  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" className="max-w-2xl rounded-[2.5rem] overflow-hidden">
        <ModalHeader
          title={politica ? 'Editar Política' : 'Nueva Política General'}
          onClose={onClose}
        />
        <ModalBody className="p-8 bg-slate-50/30">
          {renderFormContent()}
        </ModalBody>
        <ModalFooter className="p-6 bg-white border-t border-slate-100">
          {footerActions}
        </ModalFooter>
      </Modal>
    );
  }

  // ── Render: Mobile (Bottom Sheet) ─────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white w-full rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)]
        animate-in slide-in-from-bottom duration-300 ease-out max-h-[90vh] flex flex-col overflow-hidden">

        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-100" />
        </div>

        {/* Header del sheet */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center">
              <Pencil size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {politica ? 'Editar' : 'Nueva'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
          {renderFormContent()}
        </div>

        {/* Footer fijo */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          {footerActions}
        </div>
      </div>
    </div>,
    document.body
  );
};
