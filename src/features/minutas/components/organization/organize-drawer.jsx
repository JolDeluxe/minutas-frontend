import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/utils/cn';
import { getCatalogos, PRIORIDAD_MAP, AREA_MAP, LINEA_MAP } from '../../constants';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Check, Calendar, Users, Info, Bell, Layout, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * OrganizeDrawer — Flujo especializado para dar naturaleza a una entrada SIN_ORGANIZAR.
 * Usa un sistema de checkboxes mutuamente excluyentes (Tarea, Recordatorio, Política).
 */
export const OrganizeDrawer = ({
  isOpen,
  onClose,
  entry,
  onSave,
  submitting = false,
  departamento = 'DISENO',
}) => {
  const isDesktop = useIsDesktop();
  const { users, fetchUsers } = useUsers();

  const [tipo, setTipo] = useState(null);
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [responsables, setResponsables] = useState([]);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [alcanceRecordatorio, setAlcanceRecordatorio] = useState('DEPARTAMENTO');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setTipo(null); // Resetear naturaleza al abrir o cambiar de entrada
      setPrioridad('MEDIA');
      setResponsables([]);
      setFechaVencimiento('');
      setAlcanceRecordatorio('DEPARTAMENTO');
      setError('');
    }
  }, [isOpen, entry?.id, fetchUsers]);

  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);
  
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

  // Filtrar usuarios por el departamento de la entrada
  const filteredUsers = useMemo(() => {
    return users.filter(u => u.estado === 'ACTIVO' && (u.rol === 'ADMIN' || u.departamento === departamento));
  }, [users, departamento]);

  if (!isOpen || !entry) return null;

  const toggleResponsable = (userId) => {
    setResponsables(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (tipo === 'TAREA' && fechaVencimiento) {
      const todayStr = new Date().toLocaleDateString('sv-SE');
      const originalDateStr = entry && entry.fechaVencimiento 
        ? new Date(entry.fechaVencimiento).toISOString().split('T')[0] 
        : '';
      
      if (fechaVencimiento < todayStr) {
        if (originalDateStr) {
          if (fechaVencimiento < originalDateStr) {
            setError('La fecha límite no puede ser menor a la fecha original de la tarea.');
            return;
          }
        } else {
          setError('La fecha límite no puede ser menor a hoy.');
          return;
        }
      }
    }

    const payload = { tipo };

    if (tipo === 'TAREA') {
      payload.prioridad = prioridad;
      payload.fechaVencimiento = fechaVencimiento ? new Date(fechaVencimiento).toISOString() : undefined;
      payload.responsables = responsables;
      payload.estado = 'PENDIENTE';
    } else if (tipo === 'RECORDATORIO') {
      payload.alcanceRecordatorio = alcanceRecordatorio;
      payload.responsables = alcanceRecordatorio === 'PERSONAL' ? responsables : [];
    } else if (tipo === 'POLITICA') {
      payload.clasificacion = 'POLITICAS';
    }

    await onSave(entry.id, payload);
  };

  const CheckOption = ({ value, label, icon: LucideIcon, description }) => {
    const active = tipo === value;

    // Configuración de colores premium según el tipo
    const styles = {
      TAREA: {
        activeBg: "bg-emerald-50/70 border-emerald-500 text-emerald-950 shadow-sm",
        inactiveBg: "bg-white border-slate-100 text-slate-600 hover:border-slate-200",
        checkboxActive: "bg-emerald-600 border-emerald-600 text-white",
        iconColorActive: "text-emerald-600",
        descActive: "text-emerald-800/80"
      },
      RECORDATORIO: {
        activeBg: "bg-blue-50/70 border-blue-500 text-blue-950 shadow-sm",
        inactiveBg: "bg-white border-slate-100 text-slate-600 hover:border-slate-200",
        checkboxActive: "bg-blue-600 border-blue-600 text-white",
        iconColorActive: "text-blue-600",
        descActive: "text-blue-800/80"
      },
      POLITICA: {
        activeBg: "bg-purple-50/70 border-purple-500 text-purple-950 shadow-sm",
        inactiveBg: "bg-white border-slate-100 text-slate-600 hover:border-slate-200",
        checkboxActive: "bg-purple-600 border-purple-600 text-white",
        iconColorActive: "text-purple-600",
        descActive: "text-purple-800/80"
      }
    }[value];

    return (
      <button 
        onClick={() => setTipo(value)}
        className={cn(
          "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left w-full",
          active ? styles.activeBg : styles.inactiveBg
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
          active ? styles.checkboxActive : "border-slate-200 bg-white"
        )}>
          {active && <Check size={16} strokeWidth={4} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <LucideIcon size={16} className={active ? styles.iconColorActive : "text-slate-400"} />
             <p className="text-[13px] font-black uppercase tracking-wide leading-none">{label}</p>
          </div>
          <p className={cn("text-[10px] font-medium leading-snug", active ? styles.descActive : "text-slate-500")}>{description}</p>
        </div>
      </button>
    );
  };

  const renderContent = () => (
    <div className="space-y-8">
      {/* 1. SELECCIÓN DE NATURALEZA (CHECKBOXES) */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Tarea</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <CheckOption 
            value="TAREA" 
            label="Tarea" 
            icon={Layout}
            description="Trabajo ejecutable con entrega."
          />
          <CheckOption 
            value="RECORDATORIO" 
            label="Recordatorio" 
            icon={Bell}
            description="Acuerdo para seguimiento."
          />
          <CheckOption 
            value="POLITICA" 
            label="Política" 
            icon={ShieldCheck}
            description="Norma permanente."
          />
        </div>
      </div>

      {/* 2. CAMPOS CONDICIONALES */}
      {tipo && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
          {tipo === 'TAREA' && (
            <div className="space-y-8">
              {/* Prioridad */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Prioridad Operativa</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(PRIORIDAD_MAP).map(([key, val]) => (
                    <button key={key} onClick={() => setPrioridad(key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 border-2',
                        prioridad === key ? 'text-white shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                      )}
                      style={prioridad === key ? { backgroundColor: val.color, borderColor: val.color } : undefined}
                    >
                      <Icon name={val.icon} size="16px" />{val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha Vencimiento */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1 flex items-center gap-2">
                  <Calendar size={14} /> Fecha Límite de Entrega
                </label>
                <input 
                  type="date" 
                  value={fechaVencimiento} 
                  min={minDate}
                  onChange={(e) => {
                    setFechaVencimiento(e.target.value);
                    setError('');
                  }}
                  className={cn(
                    "w-full px-4 py-3 bg-white border rounded-xl text-sm font-bold focus:ring-4 focus:ring-marca-primario/5",
                    error ? "border-rose-300 text-rose-900 focus:ring-rose-100 animate-shake" : "border-slate-200 text-slate-800"
                  )}
                />
                {error && (
                  <p className="mt-2 text-rose-600 font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
                    <Icon name="error" size="14px" className="text-rose-500" /> {error}
                  </p>
                )}
              </div>

              {/* Responsables Tarea */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Asignar Responsables</label>
                <div className="flex flex-wrap gap-4 px-1 py-1 max-w-full">
                  {filteredUsers.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No hay responsables disponibles en tu departamento</p>
                  ) : (
                    filteredUsers.map(u => {
                      const isSelected = responsables.includes(u.id);
                      return (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => toggleResponsable(u.id)}
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
                            
                            {/* Check overlay en el avatar */}
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

          {tipo === 'RECORDATORIO' && (
            <div className="space-y-6">
              {/* Recordatorio Scope */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alcance del Recordatorio</label>
                <div className="flex flex-col gap-2">
                   <button 
                    onClick={() => setAlcanceRecordatorio('DEPARTAMENTO')}
                    className={cn("flex items-center justify-between p-4 rounded-xl border-2 transition-all", alcanceRecordatorio === 'DEPARTAMENTO' ? "bg-blue-50 border-blue-500 text-blue-800 shadow-sm" : "bg-white border-slate-100 text-slate-500")}
                   >
                     <div className="flex items-center gap-3">
                        <Icon name="groups" size="20px" />
                        <div>
                          <p className="text-xs font-black uppercase">General / Departamento</p>
                          <p className="text-[10px] font-medium opacity-70">Visible para todo el equipo de {departamento}.</p>
                        </div>
                     </div>
                     {alcanceRecordatorio === 'DEPARTAMENTO' && <Check size={18} className="text-blue-600" />}
                   </button>

                   <button 
                    onClick={() => setAlcanceRecordatorio('PERSONAL')}
                    className={cn("flex items-center justify-between p-4 rounded-xl border-2 transition-all", alcanceRecordatorio === 'PERSONAL' ? "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm" : "bg-white border-slate-100 text-slate-500")}
                   >
                     <div className="flex items-center gap-3">
                        <Icon name="person" size="20px" />
                        <div>
                          <p className="text-xs font-black uppercase">Específico / Personal</p>
                          <p className="text-[10px] font-medium opacity-70">Solo visible para los responsables seleccionados.</p>
                        </div>
                     </div>
                     {alcanceRecordatorio === 'PERSONAL' && <Check size={18} className="text-indigo-600" />}
                   </button>
                </div>
              </div>

              {/* Responsables Recordatorio (Solo si es Personal) */}
              {alcanceRecordatorio === 'PERSONAL' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">¿A quién va dirigido?</label>
                   <div className="flex flex-wrap gap-4 px-1 py-1 max-w-full">
                     {filteredUsers.map(u => {
                       const isSelected = responsables.includes(u.id);
                       return (
                         <button
                           type="button"
                           key={u.id}
                           onClick={() => toggleResponsable(u.id)}
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
                             
                             {/* Check overlay en el avatar */}
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
                     })}
                   </div>
                </div>
              )}
            </div>
          )}

          {tipo === 'POLITICA' && (
            <div className="bg-marca-primario/5 p-6 rounded-[2rem] border-2 border-marca-primario/20 flex items-start gap-5 animate-in zoom-in-95 duration-500 shadow-xl shadow-marca-primario/5">
               <div className="w-14 h-14 rounded-2xl bg-marca-primario text-white flex items-center justify-center shrink-0 shadow-lg shadow-marca-primario/20">
                  <ShieldCheck size={32} />
               </div>
               <div className="space-y-1">
                  <h4 className="text-base font-black text-marca-primario uppercase tracking-tight leading-none">Lineamiento Permanente</h4>
                  <p className="text-[11px] text-marca-secundario font-bold leading-relaxed">
                    Esta entrada se clasificará como una **norma o directriz** institucional. 
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-marca-acento font-black text-[9px] uppercase tracking-widest">
                     <CheckCircle2 size={12} />
                     No genera tareas operativas
                  </div>
                  <div className="flex items-center gap-2 text-marca-acento font-black text-[9px] uppercase tracking-widest">
                     <CheckCircle2 size={12} />
                     Visible en el mural de políticas
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const footerActions = (
    <div className="flex gap-3 w-full">
      <Button variant="neutro" onClick={onClose} disabled={submitting} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors">
        Cancelar
      </Button>
      <Button 
        variant="guardar" 
        icon="done_all" 
        onClick={handleSubmit} 
        isLoading={submitting} 
        disabled={!tipo || (tipo === 'TAREA' && responsables.length === 0)}
        className="flex-[2] h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20"
      >
        Guardar Organización
      </Button>
    </div>
  );

  const header = (
    <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-50">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center">
            <Icon name="auto_fix_high" size="20px" />
         </div>
         <div className="flex flex-col">
            <h2 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">Organizar Entrada</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID #{entry.id}</p>
         </div>
      </div>
      <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all"><X size={20} /></button>
    </div>
  );

  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="md:max-w-2xl rounded-[2.5rem] overflow-hidden">
        <ModalHeader title="Organizar Entrada" onClose={onClose} />
        <ModalBody className="p-8 bg-slate-50/30">
          {renderContent()}
        </ModalBody>
        <ModalFooter className="p-6 bg-white border-t border-slate-100">
          {footerActions}
        </ModalFooter>
      </Modal>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-110 flex items-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300 ease-out max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex justify-center pt-4 pb-2" onClick={onClose}><div className="w-12 h-1.5 rounded-full bg-slate-100" /></div>
        {header}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 custom-scrollbar">
          {renderContent()}
        </div>
        <div className="p-6 bg-white border-t border-slate-100 shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {footerActions}
        </div>
      </div>
    </div>,
    document.body
  );
};
