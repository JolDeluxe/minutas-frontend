import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getCatalogos, TIPO_ENTRADA_MAP, PRIORIDAD_MAP, AREA_MAP, LINEA_MAP, CLASIFICACION_MAP, LINEAS_POR_AREA } from '../../constants';
import { useIsDesktop, useIsMobile } from '@/hooks/useMediaQuery';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Camera, X, Plus, Save, Trash2, Calendar, UserPlus, Info, Pencil, Check } from 'lucide-react';

const generateCompressedThumbnail = (file, maxWidth = 300, maxHeight = 300, quality = 0.5) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

/**
 * EntryFormModal — Sistema de edición integral de entradas organizacionales.
 * Estructura refinada: La configuración operativa sigue directamente a la naturaleza de la entrada.
 */
export const EntryFormModal = ({
  isOpen,
  onClose,
  entry,
  onSave,
  submitting = false,
  departamento = 'DISENO',
}) => {
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();
  const { users, fetchUsers } = useUsers();
  const fileInputRef = useRef(null);

  const [form, setEditForm] = useState({
    descripcion: '',
    area: 'DISENO',
    linea: 'CALZADO',
    clasificacion: 'OTROS',
    tipo: 'TAREA',
    prioridad: '',
    responsables: [],
    fechaVencimiento: '',
    alcanceRecordatorio: 'DEPARTAMENTO',
  });

  const [localImages, setLocalImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 
  const [imagesToDelete, setExistingImagesToDelete] = useState([]); 
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (entry) {
        setEditForm({
          descripcion: entry.descripcion || '',
          area: entry.area || 'DISENO',
          linea: entry.linea || 'CALZADO',
          clasificacion: entry.clasificacion || 'OTROS',
          tipo: entry.tipo || 'TAREA', 
          prioridad: entry.prioridad || 'MEDIA',
          responsables: entry.asignaciones?.map(a => a.usuarioId) || [],
          fechaVencimiento: entry.fechaVencimiento ? new Date(entry.fechaVencimiento).toISOString().split('T')[0] : '',
          alcanceRecordatorio: entry.alcanceRecordatorio || 'DEPARTAMENTO',
        });
        const isDraft = typeof entry.id === 'string' || entry.tempId;
        if (isDraft) {
          setExistingImages([]);
          setLocalImages(entry._localImages || []);
        } else {
          setExistingImages(entry.imagenes || entry.images || []);
          setLocalImages([]);
        }
        setExistingImagesToDelete([]);
        setError('');
      }
    }
  }, [isOpen, entry, fetchUsers]);

  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);
  const lineasDisponibles = useMemo(() => LINEAS_POR_AREA[form.area] || [], [form.area]);
  const hasLineas = lineasDisponibles.length > 0;
  const totalImagesCount = existingImages.length + localImages.length - imagesToDelete.length;

  const minDate = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const originalDateStr = entry && entry.fechaVencimiento 
      ? new Date(entry.fechaVencimiento).toISOString().split('T')[0] 
      : '';
    if (originalDateStr && originalDateStr < todayStr) {
      return originalDateStr;
    }
    return todayStr;
  }, [entry]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.estado === 'ACTIVO' && (u.rol === 'ADMIN' || u.departamento === departamento));
  }, [users, departamento]);

  const handleFieldChange = (field, value) => {
    if (field === 'area') {
      const newLineas = LINEAS_POR_AREA[value] || [];
      setEditForm(prev => ({ ...prev, area: value, linea: newLineas.length > 0 ? newLineas[0].value : null }));
    } else {
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleResponsable = (userId) => {
    setEditForm(prev => ({
      ...prev,
      responsables: prev.responsables.includes(userId) 
        ? prev.responsables.filter(id => id !== userId) 
        : [...prev.responsables, userId]
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 3 - totalImagesCount;
    if (availableSlots <= 0) return;
    
    const sliced = files.slice(0, availableSlots);
    const newImgs = [];
    for (const file of sliced) {
      const base64Thumb = await generateCompressedThumbnail(file);
      newImgs.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        base64Thumb
      });
    }
    
    setLocalImages(prev => [...prev, ...newImgs]);
    e.target.value = '';
  };

  const removeLocalImage = (id) => {
    setLocalImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const markExistingForDeletion = (id) => {
    setExistingImagesToDelete(prev => [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    if (form.tipo === 'TAREA' && form.fechaVencimiento) {
      const todayStr = new Date().toLocaleDateString('sv-SE');
      const originalDateStr = entry && entry.fechaVencimiento 
        ? new Date(entry.fechaVencimiento).toISOString().split('T')[0] 
        : '';
      
      if (form.fechaVencimiento < todayStr) {
        if (originalDateStr) {
          if (form.fechaVencimiento < originalDateStr) {
            setError('La fecha límite no puede ser menor a la fecha original de la tarea.');
            return;
          }
        } else {
          setError('La fecha límite no puede ser menor a hoy.');
          return;
        }
      }
    }

    const payload = {
      ...form,
      ...(form.tipo !== 'TAREA' && { prioridad: null, fechaVencimiento: null, responsables: form.tipo === 'RECORDATORIO' && form.alcanceRecordatorio === 'PERSONAL' ? form.responsables : [] }),
    };
    const isDraft = typeof entry.id === 'string' || entry.tempId;
    if (isDraft) {
      await onSave(entry.id || entry.tempId, payload, {
        isDraft: true,
        localImages: localImages
      });
    } else {
      await onSave(entry.id || entry.tempId, payload, {
        newImages: localImages.map(img => img.file),
        deleteImageIds: imagesToDelete
      });
    }
  };

  if (!isOpen || !entry) return null;

  const renderImagePanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Camera size={14} className="text-slate-400" /> Evidencia Visual ({totalImagesCount}/3)
        </label>
        {totalImagesCount < 3 && (
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
            <Plus size={14} /> Añadir Foto
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {existingImages.filter(img => !imagesToDelete.includes(img.id)).map((img) => (
          <div key={img.id} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-slate-100 group shadow-sm">
            <img src={img.url} className="w-full h-full object-cover" alt="Adjunto" />
            <button onClick={() => markExistingForDeletion(img.id)} className="absolute inset-0 bg-rose-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
          </div>
        ))}
        {localImages.map((img) => (
          <div key={img.id} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-emerald-200 group shadow-md animate-in zoom-in-90">
            <img src={img.preview || img.base64Thumb} className="w-full h-full object-cover" alt="Nuevo" />
            <button onClick={() => removeLocalImage(img.id)} className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
          </div>
        ))}
        {totalImagesCount < 3 && (
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-24 h-24 shrink-0 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"><Plus size={20} /></button>
        )}
      </div>
      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );

  const isExternal = entry ? ((departamento === 'DISENO' && entry.area !== 'DISENO') || (departamento === 'MARKETING' && entry.area !== 'MARKETING')) : false;

  const renderOperativePanel = () => {
    if (isExternal) return null; // No operative panel for external tasks
    const showOperative = form.tipo === 'TAREA' || (form.tipo === 'RECORDATORIO' && form.alcanceRecordatorio === 'PERSONAL');
    if (!showOperative) return null;

    return (
      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 space-y-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserPlus size={18} />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Configuración Operativa</h4>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsables Asignados</label>
          {!isMobile ? (
            <SearchableSelect options={filteredUsers.map(u => ({ label: u.nombre, value: u.id }))} onChange={(val) => val && toggleResponsable(Number(val))} placeholder="Añadir responsable..." className="w-full h-11" />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
              {filteredUsers.map(u => (
                <button key={u.id} onClick={() => toggleResponsable(u.id)} className={cn("flex flex-col items-center gap-1.5 shrink-0 transition-all", form.responsables.includes(u.id) ? "scale-105 opacity-100" : "opacity-40 grayscale")}>
                  <div className={cn("w-14 h-14 rounded-full border-4 flex items-center justify-center overflow-hidden bg-slate-100", form.responsables.includes(u.id) ? "border-marca-primario shadow-lg" : "border-transparent")}>
                    {u.imagen ? <img src={u.imagen} className="h-full w-full object-cover" /> : <Icon name="person" size="24px" className="text-slate-400" />}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600 truncate w-14 text-center">{u.nombre.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 min-h-[44px]">
            {form.responsables.length === 0 && <p className="text-[10px] text-slate-400 italic px-2 py-1">Sin responsables asignados</p>}
            {form.responsables.map(uid => {
              const u = users.find(x => x.id === uid);
              if (!u) return null;
              return (
                <div key={uid} className="flex items-center gap-2 pl-1 pr-2 py-1 bg-white shadow-xs border border-slate-100 rounded-xl animate-in zoom-in-95">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-100">
                    {u.imagen ? <img src={u.imagen} className="h-full w-full object-cover" /> : <Icon name="person" size="14px" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{u.nombre.split(' ')[0]}</span>
                  <button onClick={() => toggleResponsable(uid)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={12} /></button>
                </div>
              )
            })}
          </div>
        </div>
        {form.tipo === 'TAREA' && (
          <div className="pt-2">
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Calendar size={12} /> Fecha de Vencimiento</label>
              <input 
                type="date" 
                value={form.fechaVencimiento} 
                min={minDate}
                onChange={(e) => {
                  handleFieldChange('fechaVencimiento', e.target.value);
                  setError('');
                }} 
                className={cn(
                  "w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-marca-primario/5",
                  error && error.includes('fecha') ? "border-rose-300 text-rose-950 focus:ring-rose-100 animate-shake" : "border-slate-200 text-slate-700"
                )} 
              />
              {error && error.includes('fecha') && (
                <p className="mt-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1 ml-1 animate-in fade-in slide-in-from-top-1">
                  <Icon name="error" size="14px" className="text-rose-500" /> {error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormContent = () => {
    const isDraft = typeof entry.id === 'string' || entry.tempId;

    if (isDraft) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => {
                handleFieldChange('descripcion', e.target.value);
                setError('');
              }}
              className={cn(
                "w-full h-32 sm:h-40 p-4 bg-slate-50 border rounded-2xl text-sm sm:text-base font-semibold focus:outline-none focus:ring-4 focus:ring-marca-primario/5 resize-none shadow-inner",
                error && error.includes('descripción') ? "border-rose-300 focus:ring-rose-50 animate-shake" : "border-slate-200"
              )}
              placeholder="Escribe el detalle aquí..."
            />
            {error && error.includes('descripción') && (
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <Icon name="error" size="14px" className="text-rose-500" /> {error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {hasLineas && (
               <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Línea</label>
                  <select
                    value={form.linea || ''}
                    onChange={(e) => handleFieldChange('linea', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm"
                  >
                    {lineasDisponibles.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
               </div>
             )}
             <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Clasificación</label>
                <select
                  value={form.clasificacion}
                  onChange={(e) => handleFieldChange('clasificacion', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm"
                >
                  {catalogos.clasificaciones.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
             </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm">
             {renderImagePanel()}
          </div>
        </div>
      );
    }

    return (
      <div className={cn("grid gap-8", isDesktop ? "grid-cols-[1fr_1fr]" : "grid-cols-1")}>
        {/* SECCIÓN 1: DATOS, NATURALEZA Y CONFIG OPERATIVA */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea 
              value={form.descripcion} 
              onChange={(e) => {
                handleFieldChange('descripcion', e.target.value);
                setError('');
              }} 
              className={cn(
                "w-full h-32 sm:h-40 p-4 bg-slate-50 border rounded-2xl text-sm sm:text-base font-semibold focus:outline-none focus:ring-4 focus:ring-marca-primario/5 resize-none shadow-inner",
                error && error.includes('descripción') ? "border-rose-300 focus:ring-rose-50 animate-shake" : "border-slate-200"
              )} 
              placeholder="Escribe el detalle aquí..." 
            />
            {error && error.includes('descripción') && (
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <Icon name="error" size="14px" className="text-rose-500" /> {error}
              </p>
            )}
          </div>

          {!isExternal && (
            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info size={14} className="text-marca-primario" /> Tipo de Tarea</label>
               <select
                 value={form.tipo}
                 onChange={(e) => handleFieldChange('tipo', e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-marca-primario/5"
               >
                 <option value="TAREA">Tarea</option>
                 <option value="RECORDATORIO">Recordatorio</option>
                 <option value="POLITICA">Política</option>
               </select>
               {form.tipo === 'RECORDATORIO' && (
                  <div className="pt-2 animate-in slide-in-from-top-1 duration-200">
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => handleFieldChange('alcanceRecordatorio', 'DEPARTAMENTO')} className={cn("flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", form.alcanceRecordatorio === 'DEPARTAMENTO' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>General</button>
                        <button onClick={() => handleFieldChange('alcanceRecordatorio', 'PERSONAL')} className={cn("flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", form.alcanceRecordatorio === 'PERSONAL' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Personal</button>
                     </div>
                  </div>
               )}
            </div>
          )}

          {/* Panel Operativo (Aparece inmediatamente después de la naturaleza) */}
          {renderOperativePanel()}
        </div>

        {/* SECCIÓN 2: DETALLES EXTRA Y MULTIMEDIA */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Área</label>
                <select value={form.area} onChange={(e) => handleFieldChange('area', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm">{catalogos.areas.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select>
             </div>
             {hasLineas && (
               <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Línea</label>
                  <select value={form.linea || ''} onChange={(e) => handleFieldChange('linea', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm">{lineasDisponibles.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}</select>
               </div>
             )}
             <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                <select value={form.clasificacion} onChange={(e) => handleFieldChange('clasificacion', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm">{catalogos.clasificaciones.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
             </div>
          </div>

          {form.tipo === 'TAREA' && !isExternal && (
            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad</label>
               <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRIORIDAD_MAP).map(([key, val]) => {
                    const active = form.prioridad === key;
                    return (
                      <button key={key} onClick={() => handleFieldChange('prioridad', key)} className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all active:scale-95", active ? "text-white shadow-md" : "bg-white border-slate-100 text-slate-500")} style={active ? { backgroundColor: val.color, borderColor: val.color } : undefined}>
                        <Icon name={val.icon} size="14px" />
                        <span className="text-[10px] font-black uppercase">{val.label}</span>
                      </button>
                    )
                  })}
               </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm">
             {renderImagePanel()}
          </div>
        </div>
      </div>
    );
  };

  const footerActions = (
    <div className="flex gap-4 w-full">
      <Button variant="neutro" onClick={onClose} disabled={submitting} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 text-slate-400">Cancelar</Button>
      <Button variant="guardar" icon="check_circle" onClick={handleSubmit} isLoading={submitting} className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-emerald-500/20">Guardar Cambios</Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" className="md:max-w-6xl rounded-[2.5rem] overflow-hidden">
        <ModalHeader title={entry.tempId ? 'Editar Borrador' : 'Edición Integral de Entrada'} onClose={onClose} />
        <ModalBody className="p-8 lg:p-10 bg-slate-50/30">{renderFormContent()}</ModalBody>
        <ModalFooter className="p-6 bg-white border-t border-slate-100">{footerActions}</ModalFooter>
      </Modal>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-full rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300 ease-out max-h-[95vh] flex flex-col overflow-hidden">
        <div className="flex justify-center pt-4 pb-2" onClick={onClose}><div className="w-12 h-1.5 rounded-full bg-slate-100" /></div>
        <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center"><Pencil size={20} /></div>
             <h2 className="text-xl font-black text-slate-900 tracking-tight">Editar</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 custom-scrollbar">{renderFormContent()}</div>
        <div className="p-6 bg-white border-t border-slate-100 shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{footerActions}</div>
      </div>
    </div>,
    document.body
  );
};
