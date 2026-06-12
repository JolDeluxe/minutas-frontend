// src/features/tareas_generales/components/modal-nueva-general.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Paperclip, Trash2, StickyNote, Camera } from 'lucide-react';
import { Icon } from '@/components/ui/z_index';
import { notify } from '@/components/notification/adaptive-notify';
import { AREA_MAP, CLASIFICACION_MAP, PRIORIDAD_MAP, LINEAS_POR_AREA } from '../../minutas/constants';

const AREAS_OPTIONS = Object.entries(AREA_MAP)
    .filter(([value]) => value !== 'DISENO' && value !== 'MARKETING')
    .map(([value, label]) => ({ value, label }));

const CLASIFICACIONES_GENERAL = [
    { value: 'ADMINISTRATIVO', label: 'Administrativo' },
    { value: 'OPERATIVO', label: 'Operativo' },
    { value: 'FINANCIERO', label: 'Financiero' },
    { value: 'LEGAL', label: 'Legal' },
    { value: 'ESTRATEGICO', label: 'Estratégico' },
    { value: 'SUPERVISION', label: 'Supervisión' },
    { value: 'EVALUACION', label: 'Evaluación' },
    { value: 'CAPACITACION', label: 'Capacitación' },
    { value: 'SISTEMAS', label: 'Sistemas' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'PROCESOS', label: 'Procesos' },
    { value: 'VENTAS', label: 'Ventas' },
    { value: 'OTROS', label: 'Otros' },
];

const emptyForm = () => ({
    descripcion: '',
    area: 'DIRECCION_ADJUNTA',
    linea: '',
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
    const fileInputRef = useRef(null);

    // Cuando abre con datos de edición, rellenar el formulario
    useEffect(() => {
        if (isOpen && editData) {
            setForm({
                descripcion: editData.descripcion || '',
                area: editData.area || 'DIRECCION_ADJUNTA',
                linea: editData.linea || '',
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

    if (!isOpen) return null;

    const lineasDeArea = LINEAS_POR_AREA[form.area] || [];

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
        const withPreviews = files.slice(0, 3 - form._localImages.length).map(file => ({
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
        if (!form.descripcion.trim()) {
            notify.error('La descripción es requerida.');
            return;
        }

        const payload = {
            descripcion: form.descripcion.trim(),
            area: form.area,
            linea: form.linea || null,
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
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Descripción *</label>
                        <textarea
                            value={form.descripcion}
                            onChange={e => set('descripcion', e.target.value)}
                            rows={3}
                            placeholder="¿Qué necesita hacerse?"
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200/50 transition-all"
                        />
                    </div>

                    {/* Área + Línea */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Área Destino</label>
                            <select
                                value={form.area}
                                onChange={e => { set('area', e.target.value); set('linea', ''); }}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/50 transition-all"
                            >
                                {AREAS_OPTIONS.map(a => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                        </div>
                        {lineasDeArea.length > 0 && (
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Línea</label>
                                <select
                                    value={form.linea}
                                    onChange={e => set('linea', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/50 transition-all"
                                >
                                    <option value="">— Sin línea —</option>
                                    {lineasDeArea.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Clasificación */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Clasificación</label>
                        <select
                            value={form.clasificacion}
                            onChange={e => set('clasificacion', e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/50 transition-all"
                        >
                            {CLASIFICACIONES_GENERAL.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
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
                                {form._localImages.map((img, idx) => (
                                    <div key={idx} className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-200 group shadow-md animate-in zoom-in-90">
                                        <img src={img.preview} className="w-full h-full object-cover" alt="Nuevo" />
                                        <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={20} /></button>
                                    </div>
                                ))}
                                {form._localImages.length < 3 && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-500 hover:border-slate-300 transition-colors">
                                        <Plus size={24} className="mb-1" />
                                        <span className="text-[10px] font-black mt-1 uppercase tracking-widest">Subir</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
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
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg hover:from-slate-700 hover:to-slate-600 transition-all active:scale-95 disabled:opacity-60"
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
