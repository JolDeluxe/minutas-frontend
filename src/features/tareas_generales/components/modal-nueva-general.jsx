// src/features/tareas_generales/components/modal-nueva-general.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Paperclip, Trash2, StickyNote, Camera } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { notify } from '@/components/notification/adaptive-notify';
import { AREA_MAP, CLASIFICACION_MAP, PRIORIDAD_MAP, LINEAS_POR_AREA } from '../../minutas/constants';
import { validateImageFile } from '@/utils/validators';

const AREAS_OPTIONS = Object.entries(AREA_MAP)
    .filter(([value]) => value !== 'DISENO' && value !== 'MARKETING')
    .map(([value, label]) => ({ value, label }));

const CLASIFICACIONES_POR_AREA = {
    DIRECCION_MBC: [
        { value: 'PRODUCCION_MUESTRAS', label: 'Desarrollo de Muestras' },
        { value: 'ORDEN_COMPRA', label: 'Órdenes de Compra' },
        { value: 'MEJORA_PROCESO', label: 'Optimización de Producción' },
        { value: 'CONTROL_CALIDAD', label: 'Control de Calidad' },
        { value: 'LOGISTICA_DISTRIBUCION', label: 'Logística y Distribución' },
        { value: 'OTROS', label: 'Otros Asuntos' },
    ],
    DIRECCION_CFI: [
        { value: 'PRODUCCION_MUESTRAS', label: 'Desarrollo de Muestras' },
        { value: 'ORDEN_COMPRA', label: 'Órdenes de Compra' },
        { value: 'MEJORA_PROCESO', label: 'Optimización de Producción' },
        { value: 'CONTROL_CALIDAD', label: 'Control de Calidad' },
        { value: 'LOGISTICA_DISTRIBUCION', label: 'Logística y Distribución' },
        { value: 'OTROS', label: 'Otros Asuntos' },
    ],
    DIRECCION_TIENDAS: [
        { value: 'EXHIBICION_VISUAL', label: 'Exhibición y Visual Merchandising' },
        { value: 'KPI_VENTAS', label: 'Análisis e Indicadores de Ventas' },
        { value: 'INVENTARIOS', label: 'Control de Inventarios' },
        { value: 'ATENCION_CLIENTE', label: 'Atención y Servicio al Cliente' },
        { value: 'OTROS', label: 'Otros Asuntos' },
    ],
    DIRECCION_MKT: [
        { value: 'REDES_SOCIALES', label: 'Redes Sociales y Contenido' },
        { value: 'PAGINA_WEB', label: 'Página Web y E-commerce' },
        { value: 'EVENTOS_PROMOS', label: 'Eventos y Activaciones' },
        { value: 'DISENO_INSUMOS', label: 'Diseño de Insumos' },
        { value: 'OTROS', label: 'Otros Asuntos' },
    ],
    DIRECCION_ALTA_CALIDAD: [
        { value: 'AUDITORIA_CALIDAD', label: 'Auditoría y Certificación de Calidad' },
        { value: 'RECHAZOS_DEVOLUCIONES', label: 'Gestión de Rechazos y Devoluciones' },
        { value: 'MEJORA_TECNICA', label: 'Optimización de Fichas Técnicas' },
        { value: 'OTROS', label: 'Otros Asuntos' },
    ],
    DIRECCION_ADJUNTA: [
        { value: 'ACUERDO_DIRECCION', label: 'Acuerdo de Dirección Adjunta' },
        { value: 'PLANEACION_ESTRATEGICA', label: 'Planeación Estratégica' },
        { value: 'PRESUPUESTOS', label: 'Presupuestos y Costos' },
        { value: 'OTROS', label: 'Otros Asuntos' },
    ],
};

const emptyForm = () => ({
    descripcion: '',
    area: 'DIRECCION_ADJUNTA',
    linea: '',
    lineaCustom: '',
    clasificacion: 'OTROS',
    tipo: 'SIN_ORGANIZAR',
    estado: null,
    prioridad: null,
    fechaVencimiento: '',
    alcanceRecordatorio: null,
    notas: [],
    _localImages: [],
    responsables: [],
});

export function ModalNuevaGeneral({ isOpen, onClose, onSave, users = [], editData = null, submitting = false }) {
    const [form, setForm] = useState(emptyForm());
    const [notaText, setNotaText] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef(null);

    // Cuando abre con datos de edición, rellenar el formulario
    useEffect(() => {
        if (isOpen && editData) {
            const area = editData.area || 'DIRECCION_ADJUNTA';
            const linea = editData.linea || '';
            const isCustom = linea && !(LINEAS_POR_AREA[area] || []).some(o => o.value === linea || o.label === linea);

            setForm({
                descripcion: editData.descripcion || '',
                area: area,
                linea: isCustom ? 'OTROS' : linea,
                lineaCustom: isCustom ? linea : '',
                clasificacion: editData.clasificacion || 'OTROS',
                tipo: editData.tipo || 'SIN_ORGANIZAR',
                estado: editData.estado || null,
                prioridad: editData.prioridad || null,
                fechaVencimiento: editData.fechaVencimiento
                    ? new Date(editData.fechaVencimiento).toISOString().split('T')[0]
                    : '',
                alcanceRecordatorio: editData.alcanceRecordatorio || null,
                notas: [],
                _localImages: [],
                responsables: [],
            });
        } else if (isOpen && !editData) {
            setForm(emptyForm());
        }
        setNotaText('');
    }, [isOpen, editData]);

    const lineasDeArea = LINEAS_POR_AREA[form.area] || [];
    const clasificacionesDeArea = CLASIFICACIONES_POR_AREA[form.area] || CLASIFICACIONES_POR_AREA.DIRECCION_ADJUNTA;

    const getErrors = () => {
        const e = {};
        if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida.';
        if (!form.area) e.area = 'El área es requerida.';
        if (lineasDeArea.length > 0) {
            if (!form.linea) {
                e.linea = 'La línea es requerida.';
            } else if (form.linea === 'OTROS' && !form.lineaCustom?.trim()) {
                e.linea = 'Especifica el nombre de la línea.';
            }
        }
        return e;
    };

    if (!isOpen) return null;

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleAddNota = () => {
        if (!notaText.trim()) return;
        setForm(prev => ({
            ...prev,
            notas: [...prev.notas, { contenido: notaText.trim() }]
        }));
        setNotaText('');
    };

    const handleRemoveNota = (idx) => {
        setForm(prev => ({ ...prev, notas: prev.notas.filter((_, i) => i !== idx) }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        
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
            e.target.value = '';
            return;
        }

        const withPreviews = validFiles.slice(0, 3 - form._localImages.length).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
        }));
        setForm(prev => ({ ...prev, _localImages: [...prev._localImages, ...withPreviews].slice(0, 3) }));
        e.target.value = '';
    };

    const handleRemoveImage = (idx) => {
        setForm(prev => {
            const next = [...prev._localImages];
            if (next[idx]?.preview) URL.revokeObjectURL(next[idx].preview);
            next.splice(idx, 1);
            return { ...prev, _localImages: next };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = getErrors();
        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            notify.error('Completa los campos obligatorios.');
            return;
        }
        setFormErrors({});

        const payload = {
            descripcion: form.descripcion.trim(),
            area: form.area,
            linea: (form.linea === 'OTROS' ? form.lineaCustom?.trim() : form.linea) || null,
            clasificacion: form.clasificacion,
            tipo: 'SIN_ORGANIZAR',
            estado: null,
            prioridad: null,
            fechaVencimiento: form.fechaVencimiento || null,
            alcanceRecordatorio: null,
            notas: form.notas,
            responsables: [],
            minutaId: null,
            _localImages: form._localImages,
        };

        try {
            await onSave(payload, editData?.id);
        } catch {
            // error manejado por el padre
        }
    };

    const isValid = Object.keys(getErrors()).length === 0;

    return createPortal(
        <div className="fixed inset-0 z-[99990] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <button className="absolute inset-0 cursor-default" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-[2rem] bg-white shadow-2xl shadow-slate-950/25 border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center shadow-lg">
                            <Icon name="assignment" size="22px" className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black text-slate-900">
                                {editData ? 'Editar Tarea General' : 'Nueva Tarea General'}
                            </h2>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Sin minuta — Admin
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-7 pb-24 md:pb-7 space-y-6 custom-scrollbar">

                    {/* Descripción */}
                    <div>
                        <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ${formErrors.descripcion ? 'text-rose-500' : 'text-slate-500'}`}>
                            Descripción *
                        </label>
                        <textarea
                            value={form.descripcion}
                            onChange={e => {
                                set('descripcion', e.target.value);
                                if (formErrors.descripcion) setFormErrors(prev => ({ ...prev, descripcion: null }));
                            }}
                            rows={3}
                            placeholder="¿Qué necesita hacerse?"
                            className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all ${
                                formErrors.descripcion 
                                    ? 'border-rose-300 bg-rose-50 text-rose-900 placeholder:text-rose-300 focus:border-rose-400 focus:ring-rose-200/50' 
                                    : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:border-slate-400 focus:bg-white focus:ring-slate-200/50'
                            }`}
                        />
                        {formErrors.descripcion && (
                            <p className="mt-1.5 text-[11px] font-bold text-rose-500">{formErrors.descripcion}</p>
                        )}
                    </div>

                    {/* Área + Línea */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ${formErrors.area ? 'text-rose-500' : 'text-slate-500'}`}>
                                Área Destino *
                            </label>
                            <select
                                value={form.area}
                                onChange={e => {
                                    const a = e.target.value;
                                    setForm(prev => ({
                                        ...prev,
                                        area: a,
                                        linea: '',
                                        lineaCustom: '',
                                        clasificacion: CLASIFICACIONES_POR_AREA[a]?.[0]?.value || 'OTROS'
                                    }));
                                    if (formErrors.area || formErrors.linea) {
                                        setFormErrors(prev => ({ ...prev, area: null, linea: null }));
                                    }
                                }}
                                className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-4 transition-all ${
                                    formErrors.area
                                        ? 'border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-400 focus:ring-rose-200/50'
                                        : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-400 focus:ring-slate-200/50'
                                }`}
                            >
                                {AREAS_OPTIONS.map(a => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                            {formErrors.area && (
                                <p className="mt-1.5 text-[11px] font-bold text-rose-500">{formErrors.area}</p>
                            )}
                        </div>
                        {lineasDeArea.length > 0 && (
                            <div>
                                <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ${formErrors.linea ? 'text-rose-500' : 'text-slate-500'}`}>
                                    Línea / Depto *
                                </label>
                                <select
                                    value={form.linea}
                                    onChange={e => {
                                        set('linea', e.target.value);
                                        if (e.target.value !== 'OTROS') set('lineaCustom', '');
                                        if (formErrors.linea) setFormErrors(prev => ({ ...prev, linea: null }));
                                    }}
                                    className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-4 transition-all ${
                                        formErrors.linea
                                            ? 'border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-400 focus:ring-rose-200/50'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-400 focus:ring-slate-200/50'
                                    }`}
                                >
                                    <option value="" disabled>Seleccione línea</option>
                                    {lineasDeArea.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                                {form.linea === 'OTROS' && (
                                    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                        <input
                                            type="text"
                                            value={form.lineaCustom || ''}
                                            onChange={e => {
                                                set('lineaCustom', e.target.value);
                                                if (formErrors.linea) setFormErrors(prev => ({ ...prev, linea: null }));
                                            }}
                                            placeholder="Escribe la línea..."
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/50 transition-all"
                                        />
                                    </div>
                                )}
                                {formErrors.linea && (
                                    <p className="mt-1.5 text-[11px] font-bold text-rose-500">{formErrors.linea}</p>
                                )}
                            </div>
                        )}
                    </div>



                    {/* Fecha Límite */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Fecha Límite (Opcional)</label>
                        <input
                            type="date"
                            value={form.fechaVencimiento}
                            onChange={e => set('fechaVencimiento', e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/50 transition-all"
                        />
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                            <StickyNote size={13} />
                            Notas ({form.notas.length})
                        </label>
                        {form.notas.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {form.notas.map((n, idx) => (
                                    <div key={idx} className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                                        <span className="text-xs font-medium text-amber-900 flex-1 leading-relaxed">{n.contenido}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNota(idx)}
                                            className="h-5 w-5 flex items-center justify-center rounded-md text-amber-600 hover:bg-amber-200 transition-all shrink-0"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={notaText}
                                onChange={e => setNotaText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNota(); } }}
                                placeholder="Escribe una nota y presiona Enter..."
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleAddNota}
                                disabled={!notaText.trim()}
                                className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md disabled:opacity-40 hover:bg-amber-600 active:scale-95 transition-all"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Imágenes */}
                    {!editData && (
                        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Camera size={14} className="text-slate-400" /> Imágenes de Referencia ({form._localImages.length}/3)
                                </label>
                                {form._localImages.length < 3 && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all hover:bg-emerald-100 active:scale-95">
                                        <Plus size={14} /> Añadir Foto
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {form._localImages.map((img, idx) => {
                                    const isHeic = img.file && /\.(heic|heif)$/i.test(img.file.name);
                                    return (
                                        <div key={idx} className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-200 group shadow-md animate-in zoom-in-90 bg-slate-50 flex items-center justify-center text-slate-400">
                                            {isHeic ? (
                                                <div className="flex flex-col items-center justify-center h-full w-full p-2 text-center bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                    <Camera size={24} className="text-amber-500 mb-1" />
                                                    <span>HEIC</span>
                                                </div>
                                            ) : (
                                                <img src={img.preview} className="w-full h-full object-cover" alt="Nuevo" />
                                            )}
                                            <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={20} /></button>
                                        </div>
                                    );
                                })}
                                {form._localImages.length < 3 && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-500 hover:border-slate-300 transition-colors">
                                        <Plus size={24} className="mb-1" />
                                        <span className="text-[10px] font-black mt-1 uppercase tracking-widest">Subir</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" accept="image/jpeg, image/png, image/webp, image/heic, image/heif" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-end gap-3 px-7 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="form-nueva-general"
                        onClick={handleSubmit}
                        disabled={submitting || !isValid}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg hover:from-slate-700 hover:to-slate-600 transition-all active:scale-95 disabled:opacity-40"
                    >
                        {submitting ? (
                            <Icon name="progress_activity" size="16px" className="animate-spin" />
                        ) : (
                            <Icon name={editData ? 'save' : 'add'} size="16px" />
                        )}
                        {editData ? 'Guardar Cambios' : 'Crear Tarea'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
