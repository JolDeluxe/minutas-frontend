import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Modal, ModalHeader, ModalBody, ModalFooter, Button as UIButton } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getCatalogos, LINEAS_POR_AREA, PRIORIDAD_MAP } from '../../constants';
import { useAuthStore } from '@/stores/auth-store';
import { getModulesByRole } from '@/config/modules-config';
import { useUsers } from '../../../usuarios/hooks/use-users';
import { LineIconSelector } from '../icons/line-icons';
import { Camera, X, Plus, Send, StickyNote, Calendar, UserPlus, Check } from 'lucide-react';

/**
 * MobileAllNotesModal — Versión móvil para ver todas las notas.
 */
const MobileAllNotesModal = ({ isOpen, onClose, notas, onUpdate, onRemove, onAdd }) => {
  return (
    <div className={cn(
      "fixed inset-0 z-[130] bg-slate-950/40 backdrop-blur-sm flex items-end justify-center transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "bg-white w-full rounded-t-[2rem] max-h-[85vh] flex flex-col transition-transform duration-300 transform",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex justify-center pt-4 pb-2"><div className="w-12 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900">Todas las Notas</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notas.map((nota, idx) => (
            <div key={idx} className="relative group animate-in slide-in-from-bottom-2 duration-300">
              <textarea
                value={nota}
                onChange={(e) => onUpdate(idx, e.target.value)}
                placeholder="Escribe una nota..."
                className="w-full h-24 p-4 text-sm font-medium bg-[#fffbeb] border border-amber-200 rounded-2xl resize-none outline-none text-amber-900"
              />
              <button
                onClick={() => onRemove(idx)}
                className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={onAdd}
            disabled={notas.some(n => !n.trim())}
            className="w-full py-4 border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/30 text-amber-500 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest disabled:opacity-40"
          >
            <Plus size={20} /> Añadir Nueva Nota
          </button>
        </div>
        <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-slate-100">
          <UIButton variant="dark" onClick={onClose} className="w-full h-12 rounded-xl">Listo</UIButton>
        </div>
      </div>
    </div>
  );
};

/**
 * MobileQuickComposer — Versión Sólida y Robusta para móviles.
 * Rediseñado según la solicitud del usuario:
 * Desc > Notas > Imágenes > Línea (visual naranja) > Área / Clasificación (Selects nativos)
 */
export const MobileQuickComposer = ({
  minutaId,
  lineaDefault,
  departamento,
  onSubmit,
  submitting,
  estado = 'ACTIVA',
  onIniciar,
  iniciando = false,
  onExpandedChange
}) => {
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const userRole = currentUser?.rol || 'GERENCIA';
  const userModules = useMemo(() => getModulesByRole(userRole), [userRole]);
  const showBottomNav = userModules.length > 0 && userModules.length <= 5;
  const bottomClass = showBottomNav ? "bottom-20" : "bottom-6";

  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);

  const [expanded, setExpanded] = useState(false);
  const [texto, setTexto] = useState('');
  const [notasRapidas, setNotasRapidas] = useState([]);
  const [area, setArea] = useState(departamento || catalogos.areas[0]?.value || 'DISENO');
  
  useEffect(() => {
    if (departamento && area === 'DISENO' && departamento !== 'DISENO') {
      setArea(departamento);
    }
  }, [departamento]);

  const lineasDisponibles = useMemo(() => LINEAS_POR_AREA[area] || [], [area]);
  const tieneLineas = lineasDisponibles.length > 0;
  const isOperationalArea = area === 'DISENO' || area === 'MARKETING';

  const [linea, setLinea] = useState(tieneLineas ? (lineaDefault || lineasDisponibles[0]?.value) : null);
  const [clasificacion, setClasificacion] = useState('');
  const [localImages, setLocalImages] = useState([]);
  const [showAllNotes, setShowAllNotes] = useState(false);

  // Estados Operativos
  const [esTarea, setEsTarea] = useState(false);
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [responsables, setResponsables] = useState([]);
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  const { users: allUsers, fetchUsers } = useUsers();
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => u.estado === 'ACTIVO' && (u.rol === 'ADMIN' || u.departamento === departamento));
  }, [allUsers, departamento]);

  const fileInputRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);

  const normalizedArea = String(area || '').trim().toUpperCase();
  const allowTarea = normalizedArea === 'MARKETING' || normalizedArea === 'DISEÑO' || normalizedArea === 'DISENO';

  useEffect(() => {
    if (!allowTarea && esTarea) {
      setEsTarea(false);
    }
  }, [allowTarea, esTarea]);
  const [touchEnd, setTouchEnd] = useState(null);

  // Validación personalizada
  const isValid = useMemo(() => {
    if (!texto.trim()) return false;
    const isOperationalArea = area === 'DISENO' || area === 'MARKETING';
    if (isOperationalArea) {
      const hasLinea = tieneLineas ? !!linea : true;
      const hasClasif = !!clasificacion;
      if (!(hasLinea && hasClasif)) return false;
    }
    
    if (esTarea) {
      if (!fechaVencimiento) return false;
    }
    
    return true;
  }, [texto, area, linea, clasificacion, tieneLineas, esTarea, fechaVencimiento]);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  const handleAddNota = () => {
    if (notasRapidas.some(n => !n.trim())) return;
    setNotasRapidas([...notasRapidas, '']);
  };

  const handleUpdateNota = (index, value) => {
    const newNotas = [...notasRapidas];
    newNotas[index] = value;
    setNotasRapidas(newNotas);
  };

  const handleRemoveNota = (index) => {
    setNotasRapidas(notasRapidas.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, Math.max(0, 3 - localImages.length));
    const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString(36).substr(2, 9) }));
    setLocalImages(prev => [...prev, ...newImages]);
    setExpanded(true);
  };

  const removeImage = (id) => {
    setLocalImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleSubmit = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isValid || submitting) return;
    const esPolitica = clasificacion === 'POLITICAS';
    
    const tareaData = {
      descripcion: texto.trim(),
      area,
      linea: tieneLineas ? linea : null,
      clasificacion: clasificacion || 'OTROS',
      tipo: esPolitica ? 'POLITICA' : (esTarea ? 'TAREA' : undefined),
      minutaId: Number(minutaId),
      fecha: new Date().toISOString(),
      _localImages: localImages,
      notas: notasRapidas.filter(n => n.trim()).map(n => ({ contenido: n.trim() })),
    };

    if (esTarea) {
      tareaData.prioridad = prioridad;
      tareaData.fechaVencimiento = fechaVencimiento ? new Date(fechaVencimiento).toISOString() : null;
      if (responsables.length > 0) {
        tareaData.responsables = responsables;
      }
    }

    onSubmit({ tareas: [tareaData] });
    
    setTexto('');
    setNotasRapidas([]);
    setLocalImages([]);
    setExpanded(false);

    // --- REINICIAR SELECTORES A SUS VALORES INICIALES ---
    const defaultArea = catalogos.areas[0]?.value || departamento;
    const defaultLineas = LINEAS_POR_AREA[defaultArea] || [];
    setArea(defaultArea);
    setLinea(defaultLineas.length > 0 ? (lineaDefault || defaultLineas[0]?.value) : null);
    setClasificacion('');
    
    setEsTarea(false);
    setPrioridad('MEDIA');
    setResponsables([]);
    setFechaVencimiento('');
  };

  const handleClose = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setExpanded(false);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);
  const handleTouchEndClose = () => { if (touchStart && touchEnd && touchEnd - touchStart > 50 && expanded) setExpanded(false); setTouchStart(null); setTouchEnd(null); };
  const handleTouchEndOpen = () => { if (touchStart && touchEnd && touchStart - touchEnd > 50 && !expanded) setExpanded(true); setTouchStart(null); setTouchEnd(null); };

  if (estado === 'PROGRAMADA') {
    return createPortal(
      <div className={cn("fixed left-3 right-3 z-[99] rounded-2xl bg-white border border-slate-200 p-4 shadow-[0_-10px_50px_rgba(0,0,0,0.15)] flex flex-col items-center gap-3 text-center sm:left-6 sm:right-6 animate-in slide-in-from-bottom duration-300", bottomClass)}>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minuta Programada</span></div>
        <p className="text-[11px] font-bold text-slate-500 max-w-xs leading-relaxed">Debes iniciar la junta para poder capturar acuerdos y tareas.</p>
        <button onClick={onIniciar} disabled={iniciando} className="w-full flex items-center justify-center gap-2 py-3 bg-marca-primario text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 touch-manipulation cursor-pointer">{iniciando ? <Icon name="progress_activity" size="14px" className="animate-spin" /> : <Icon name="play_arrow" size="14px" />} {iniciando ? 'Iniciando...' : 'Iniciar Junta Ahora'}</button>
      </div>,
      document.body
    );
  }

  return createPortal(
    <>
      <div className={cn("fixed bg-white flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]", expanded ? "inset-0 z-[120] rounded-none bg-slate-50" : `left-3 right-3 h-[4.5rem] z-[50] rounded-2xl shadow-[0_-10px_50px_rgba(0,0,0,0.15)] border border-slate-200 sm:left-6 sm:right-6 ${bottomClass}`)}>
        {!expanded ? (
          <div className="w-full flex flex-col items-center py-2 shrink-0 cursor-pointer" onClick={() => setExpanded(true)} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEndOpen}><div className="w-12 h-1 bg-slate-100 rounded-full" /></div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/60 shrink-0 select-none" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEndClose}>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Captura Mobile</span></div>
            <button onClick={handleClose} className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border border-slate-300 cursor-pointer touch-manipulation"><X size={14} /> Volver / Cerrar</button>
          </div>
        )}

        <div className={cn("flex-1 min-h-0 flex flex-col overflow-hidden transition-all", expanded ? "px-4 pt-4 bg-slate-50" : "px-4 pb-3")}>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-start gap-3 w-full">
              <textarea placeholder="Escribe la idea, acuerdo o tarea aquí..." value={texto} onChange={(e) => setTexto(e.target.value)} onFocus={() => setExpanded(true)} rows={expanded ? (esTarea ? 2 : 3) : 1} className={cn("flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold transition-all resize-none focus:outline-none focus:border-marca-primario/40", expanded ? (esTarea ? "min-h-[4rem] max-h-[5rem]" : "min-h-[6rem] max-h-[8rem]") + " bg-white border-slate-200 shadow-inner" : "h-12 py-2.5 overflow-hidden")} />
              {!expanded && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setExpanded(true)} className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 touch-manipulation shadow-md"><Plus size={22} strokeWidth={3} /></button>
                </div>
              )}
            </div>
          </div>

          <div className={cn("flex-1 flex flex-col min-h-0 transition-all duration-500", expanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
            <div className={cn("flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-6 pt-4 transition-all duration-300", "pb-4")}>
              
              {/* NOTAS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Notas Rápidas</span>
                  {notasRapidas.length > 2 && <button onClick={() => setShowAllNotes(true)} className="text-[8px] font-black text-amber-600 uppercase">Ver todas ({notasRapidas.length})</button>}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1">
                  <button onClick={handleAddNota} disabled={notasRapidas.some(n => !n.trim())} className="w-16 h-16 shrink-0 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center text-amber-500 bg-white active:scale-95 disabled:opacity-40"><Plus size={20} /><span className="text-[6px] font-black uppercase">Nota</span></button>
                  {notasRapidas.slice(0, 2).map((nota, idx) => (
                    <div key={idx} className="relative w-16 h-16 shrink-0 group animate-in zoom-in-95 duration-300">
                      <textarea value={nota} onChange={(e) => handleUpdateNota(idx, e.target.value)} placeholder="..." className="w-full h-full p-2 text-[9px] font-bold bg-[#fffbeb] border border-amber-200 rounded-2xl resize-none outline-none text-amber-900 placeholder:text-amber-300" />
                      <button onClick={() => handleRemoveNota(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-md border border-rose-50"><X size={10} /></button>
                    </div>
                  ))}
                  {notasRapidas.length > 2 && (
                    <button onClick={() => setShowAllNotes(true)} className="w-16 h-16 shrink-0 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800 text-xs font-black">+{notasRapidas.length - 2}</button>
                  )}
                </div>
              </div>

              {/* IMÁGENES */}
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Imágenes Adjuntas ({localImages.length}/3)</span>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1">
                  <button onClick={() => fileInputRef.current?.click()} disabled={localImages.length >= 3} className="w-16 h-16 shrink-0 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white active:scale-95 disabled:opacity-40"><Camera size={20} /><span className="text-[6px] font-black uppercase">Foto</span></button>
                  {localImages.map((img) => (
                    <div key={img.id} className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm"><img src={img.preview} className="w-full h-full object-cover" /><button onClick={() => removeImage(img.id)} className="absolute inset-0 bg-slate-900/40 text-white flex items-center justify-center opacity-0 active:opacity-100 transition-opacity"><X size={18} /></button></div>
                  ))}
                </div>
                {/* ÁREA / CLASIFICACIÓN (ROW) */}
              <div className={cn("grid gap-3 mt-4", isOperationalArea ? "grid-cols-2" : "grid-cols-1")}>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Área</span>
                  <div className="relative">
                    <select 
                      value={area} 
                      onChange={(e) => {
                        const newArea = e.target.value;
                        setArea(newArea);
                        const newLineas = LINEAS_POR_AREA[newArea] || [];
                        setLinea(newLineas.length > 0 ? newLineas[0].value : null);
                        if (newArea !== 'DISENO' && newArea !== 'MARKETING') {
                          setClasificacion('');
                        }
                      }}
                      className="w-full bg-white border-2 border-slate-100 rounded-xl pl-2 pr-7 py-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-marca-primario/40 transition-all appearance-none shadow-sm h-11 truncate"
                    >
                      {catalogos.areas.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Icon name="expand_more" size="14px" />
                    </div>
                  </div>
                </div>

                {isOperationalArea && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Clasificación</span>
                    <div className="relative">
                      <select 
                        value={clasificacion} 
                        onChange={(e) => {
                          const newClasificacion = e.target.value;
                          setClasificacion(newClasificacion);
                          if (newClasificacion === 'POLITICAS') {
                            setEsTarea(false);
                          }
                        }}
                        className="w-full bg-white border-2 border-slate-100 rounded-xl pl-2 pr-7 py-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-marca-primario/40 transition-all appearance-none shadow-sm h-11 truncate"
                      >
                        <option value="">— Tipo —</option>
                        {catalogos.clasificaciones.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Icon name="expand_more" size="14px" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>

              {/* LÍNEA (CUADROS VISUALES NARANJA O SELECT DEPENDIENDO DEL ÁREA) */}
              {tieneLineas && (
                isOperationalArea ? (
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Línea de Producto</span>
                    <div className="grid grid-cols-5 gap-1.5 px-0.5">
                      {lineasDisponibles.map(({ value, label }) => (
                        <button 
                          key={value} 
                          onClick={() => setLinea(value)} 
                          className={cn(
                            "flex flex-col items-center justify-center p-1.5 rounded-2xl border-2 transition-all active:scale-95 touch-manipulation aspect-square gap-1 relative overflow-hidden", 
                            linea === value 
                              ? "bg-emerald-50 border-emerald-500 shadow-md scale-[1.02]" 
                              : "bg-white border-slate-100 opacity-60"
                          )}
                        >
                          {linea === value && (
                            <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full flex items-center justify-center w-3 h-3 shadow-sm">
                              <Icon name="check" size="8px" weight={900} />
                            </div>
                          )}
                          <LineIconSelector type={value} size={28} />
                          <span className={cn(
                            "text-[6.5px] font-black uppercase tracking-tighter truncate w-full text-center leading-none",
                            linea === value ? "text-emerald-600" : "text-slate-400"
                          )}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Línea / Departamento</span>
                    <div className="relative">
                      <select 
                        value={linea || ''} 
                        onChange={(e) => setLinea(e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-xl pl-2 pr-7 py-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-marca-primario/40 transition-all appearance-none shadow-sm h-11 truncate"
                      >
                        <option value="">— Seleccionar Línea —</option>
                        {lineasDisponibles.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Icon name="expand_more" size="14px" />
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* SWITCH ¿ES TAREA? */}
              {allowTarea && clasificacion !== 'POLITICAS' && (
                <div className="flex items-center gap-3 px-2 pt-2 border-t border-slate-100">
                   <button
                      type="button"
                      onClick={() => setEsTarea(!esTarea)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-marca-primario focus:ring-offset-2",
                        esTarea ? "bg-emerald-500" : "bg-slate-200"
                      )}
                      role="switch"
                      aria-checked={esTarea}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          esTarea ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                   </button>
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                     ¿Es una Tarea?
                   </span>
                </div>
              )}

              {/* CAMPOS OPERATIVOS */}
              {allowTarea && esTarea && (
                <div className="flex flex-col gap-3 px-1 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="grid grid-cols-2 gap-2.5">
                     <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml- flex items-center gap-1">
                           <Calendar size={10} /> Fecha Límite
                        </label>
                        <input 
                          type="date" 
                          value={fechaVencimiento} 
                          onChange={(e) => setFechaVencimiento(e.target.value)} 
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-white border-2 border-slate-100 rounded-xl px-2 py-2.5 text-[9px] font-bold text-slate-700 focus:outline-none focus:border-marca-primario/40 transition-all shadow-sm h-11"
                        />
                     </div>

                     <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridad</label>
                        <div className="relative">
                          <select 
                            value={prioridad} 
                            onChange={(e) => setPrioridad(e.target.value)} 
                            className="w-full bg-white border-2 border-slate-100 rounded-xl pl-2 pr-7 py-2.5 text-[9px] font-bold text-slate-700 focus:outline-none focus:border-marca-primario/40 transition-all appearance-none shadow-sm h-11 truncate"
                          >

                            {Object.entries(PRIORIDAD_MAP).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Icon name="expand_more" size="14px" />
                          </div>
                        </div>
                     </div>
                   </div>

                   <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                         <UserPlus size={10} /> Responsable(s)
                      </label>
                      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1 -mx-1">
                        {filteredUsers.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic ml-1">No hay responsables disponibles</p>
                        ) : (
                          filteredUsers.map((u) => {
                            const isSelected = responsables.includes(u.id);
                            return (
                              <button
                                type="button"
                                key={u.id}
                                onClick={() => {
                                  setResponsables(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])
                                }}
                                className={cn(
                                  "flex flex-col items-center gap-1 shrink-0 transition-all select-none cursor-pointer focus:outline-none",
                                  isSelected ? "scale-105 font-bold" : "hover:scale-102"
                                )}
                                title={u.nombre}
                              >
                                <div className={cn(
                                  "w-11 h-11 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all bg-slate-50 relative shadow-xs",
                                  isSelected 
                                    ? "border-emerald-500 ring-4 ring-emerald-100 shadow-md opacity-100" 
                                    : "border-slate-200 opacity-50 hover:opacity-85"
                                )}>
                                  {u.imagen ? (
                                    <img src={u.imagen} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-black uppercase text-slate-600">{u.nombre.charAt(0)}</span>
                                  )}
                                  
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                      <div className="bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                                        <Check size={8} strokeWidth={4} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[8.5px] uppercase tracking-wider text-center truncate w-12 leading-tight transition-colors",
                                  isSelected ? "text-emerald-800 font-extrabold" : "text-slate-500 font-bold"
                                )}>
                                  {u.nombre.split(' ')[0]}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                   </div>
                </div>
              )}

            </div>

            {/* FOOTER FIXO (EXPANDED) */}
            <div className="shrink-0 border-t border-slate-200/60 flex items-center justify-between bg-white pt-4 pb-8 px-4 -mx-4 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={localImages.length >= 3} className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 disabled:opacity-40 touch-manipulation"><Camera size={20} /> FOTO</button>
              <button type="button" onClick={handleSubmit} disabled={!isValid || submitting} className={cn("px-8 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest shadow-2xl touch-manipulation", isValid ? "bg-emerald-600 text-white shadow-emerald-600/30" : "bg-slate-100 text-slate-300 shadow-none border border-slate-100")}>
                {submitting ? <Icon name="progress_activity" className="animate-spin" size="20px" /> : <Send size={18} />}
                {submitting ? 'GUARDANDO...' : 'GUARDAR TAREA'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileAllNotesModal isOpen={showAllNotes} onClose={() => setShowAllNotes(false)} notas={notasRapidas} onUpdate={handleUpdateNota} onRemove={handleRemoveNota} onAdd={handleAddNota} />
      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </>,
    document.body
  );
};
