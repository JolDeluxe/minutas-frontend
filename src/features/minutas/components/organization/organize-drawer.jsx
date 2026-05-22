import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { getCatalogos, TIPO_ENTRADA_MAP, PRIORIDAD_MAP } from '../../constants';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { SearchableSelect } from '@/components/ui/searchable-select';

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

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const [tipo, setTipo] = useState(() => entry?.tipo || 'SIN_ORGANIZAR');
  const [prioridad, setPrioridad] = useState(() => entry?.prioridad || '');
  const [responsables, setResponsables] = useState(() => 
    entry?.asignaciones?.map(a => a.usuarioId) || []
  );
  
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    if (!entry?.fechaVencimiento) return '';
    return new Date(entry.fechaVencimiento).toISOString().split('T')[0];
  });

  const [alcanceRecordatorio, setAlcanceRecordatorio] = useState(() => entry?.alcanceRecordatorio || 'DEPARTAMENTO');

  const catalogos = useMemo(() => getCatalogos(departamento), [departamento]);
  const clasif = useMemo(() => 
    catalogos.clasificaciones.find(c => c.value === entry?.clasificacion) || null,
  [catalogos.clasificaciones, entry?.clasificacion]);

  if (!isOpen || !entry) return null;

  const toggleResponsable = (userId) => {
    setResponsables(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    const payload = { tipo };

    if (tipo === 'TAREA') {
      payload.prioridad = prioridad || undefined;
      payload.fechaVencimiento = fechaVencimiento ? new Date(fechaVencimiento).toISOString() : undefined;
      payload.responsables = responsables;
      payload.estado = 'PENDIENTE'; // Asegurar que inicie en PENDIENTE
    } else if (tipo === 'RECORDATORIO') {
      payload.alcanceRecordatorio = alcanceRecordatorio;
      payload.responsables = responsables;
    } else if (tipo === 'POLITICA' || tipo === 'DESCARTADA') {
      // Nothing else needed
    }

    await onSave(entry.id, payload);
  };

  const TipoButton = ({ value, icon, title, subtitle, colorClass, borderClass, bgClass }) => {
    const active = tipo === value;
    return (
      <button 
        onClick={() => setTipo(value)}
        className={cn(
          "flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left",
          active ? `${bgClass} ${borderClass} shadow-md` : "bg-white border-slate-100 opacity-60"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? colorClass : "bg-slate-100 text-slate-400")}>
            <Icon name={icon} size="20px" />
          </div>
          <div>
            <p className="text-[13px] font-black text-slate-900 uppercase leading-none">{title}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{subtitle}</p>
          </div>
        </div>
        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", active ? `${colorClass} ${borderClass} text-white` : "border-slate-200")}>
          {active && <Icon name="check" size="14px" weight={800} />}
        </div>
      </button>
    );
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Context Card */}
      <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 shadow-sm"
        style={{ borderLeftWidth: 4, borderLeftColor: clasif?.border || '#e2e8f0' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white" 
            style={{ backgroundColor: clasif?.color || '#94a3b8' }}>
            {clasif?.label || 'SIN CLASIFICACIÓN'}
          </span>
          <span className="text-xs text-slate-400 font-mono">#{entry.id}</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-medium">{entry.descripcion}</p>
      </div>

      {/* Naturaleza de la Entrada */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Clasificar Como</label>
        <div className="grid grid-cols-1 gap-3">
          <TipoButton 
            value="TAREA" 
            icon="task" 
            title="Tarea o Seguimiento" 
            subtitle="Trabajo tangible con entrega y métricas"
            colorClass="bg-emerald-500 text-white"
            borderClass="border-emerald-500"
            bgClass="bg-emerald-50"
          />
          <TipoButton 
            value="RECORDATORIO" 
            icon="notifications" 
            title="Recordatorio" 
            subtitle="Revisión en agenda sin métricas operativas"
            colorClass="bg-blue-500 text-white"
            borderClass="border-blue-500"
            bgClass="bg-blue-50"
          />
          <TipoButton 
            value="POLITICA" 
            icon="policy" 
            title="Política / Lineamiento" 
            subtitle="Decisión permanente o norma"
            colorClass="bg-purple-500 text-white"
            borderClass="border-purple-500"
            bgClass="bg-purple-50"
          />
          <TipoButton 
            value="DESCARTADA" 
            icon="cancel" 
            title="Descartada / Informativa" 
            subtitle="No requiere acción, o fue cancelada"
            colorClass="bg-rose-500 text-white"
            borderClass="border-rose-500"
            bgClass="bg-rose-50"
          />
        </div>
      </div>

      {/* Condicionales TAREA */}
      {tipo === 'TAREA' && (
        <div className="animate-in fade-in duration-300 space-y-8">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Prioridad Operativa</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(PRIORIDAD_MAP).map(([key, val]) => (
                <button key={key} onClick={() => setPrioridad(prioridad === key ? '' : key)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 border-2',
                    prioridad === key ? 'text-white shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                  )}
                  style={prioridad === key ? { backgroundColor: val.color, borderColor: val.color } : undefined}
                >
                  <Icon name={val.icon} size="16px" />{val.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">
              Fecha Límite de Entrega (Vencimiento)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Icon name="calendar_today" size="20px" />
              </div>
              <input 
                type="date" 
                value={fechaVencimiento} 
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Responsables: TAREA o RECORDATORIO */}
      {(tipo === 'TAREA' || tipo === 'RECORDATORIO') && (
        <div className="animate-in fade-in duration-300 pt-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Responsables (Opcional)</label>
          {isDesktop ? (
            <div className="space-y-4">
              <SearchableSelect 
                options={users.filter(u => u.estado === 'ACTIVO').map(u => ({ label: u.nombre, value: u.id }))}
                onChange={(val) => {
                  if (val && !responsables.includes(Number(val))) {
                    setResponsables([...responsables, Number(val)]);
                  }
                }}
                placeholder="Buscar y agregar responsable..."
                icon="person_add"
                className="w-full h-11 rounded-2xl"
              />
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                {responsables.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic flex items-center gap-2 px-2">
                    <Icon name="info" size="14px" /> No hay responsables asignados aún
                  </p>
                )}
                {responsables.map(userId => {
                  const user = users.find(u => u.id === userId);
                  if (!user) return null;
                  return (
                    <div key={userId} className="flex items-center gap-2 pl-1 pr-2 py-1 bg-white shadow-sm border border-slate-200 rounded-xl animate-in zoom-in-95 duration-200">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-50">
                        {user.imagen ? (
                          <img src={user.imagen} className="w-full h-full object-cover" alt={user.nombre} />
                        ) : (
                          <Icon name="person" size="14px" className="text-slate-400" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{user.nombre}</span>
                      <button 
                        onClick={() => toggleResponsable(userId)} 
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"
                      >
                        <Icon name="close" size="14px" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
              {users.filter(u => u.estado === 'ACTIVO').map(user => (
                <button
                  key={user.id}
                  onClick={() => toggleResponsable(user.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 shrink-0 transition-all",
                    responsables.includes(user.id) ? "opacity-100 scale-105" : "opacity-40 grayscale"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full border-4 flex items-center justify-center overflow-hidden bg-slate-100 transition-all",
                    responsables.includes(user.id) ? "border-marca-primario shadow-lg" : "border-transparent"
                  )}>
                    {user.imagen ? (
                      <img src={user.imagen} className="w-full h-full object-cover" alt={user.nombre} />
                    ) : (
                      <Icon name="person" size="24px" className="text-slate-400" />
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600 truncate w-14 text-center tracking-tighter">
                    {user.nombre.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const footerActions = (
    <div className="flex gap-3 w-full">
      <Button variant="cancelar" onClick={onClose} disabled={submitting} className="flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px]">
        Cancelar
      </Button>
      <Button variant="guardar" icon="done_all" onClick={handleSubmit} isLoading={submitting} className="flex-1 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20">
        Guardar Cambios
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="md:max-w-xl rounded-[2rem] overflow-hidden">
        <ModalHeader title="Organizar Entrada" onClose={onClose} />
        <ModalBody className="p-8">
          {renderContent()}
        </ModalBody>
        <ModalFooter className="p-6 bg-slate-50 border-t border-slate-100">
          {footerActions}
        </ModalFooter>
      </Modal>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300 ease-out max-h-[92vh] flex flex-col">
        <div className="flex justify-center pt-4 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-100" />
        </div>

        <div className="px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center">
                <Icon name="tune" size="20px" />
             </div>
             <h2 className="text-xl font-black text-slate-900 tracking-tight">Organizar</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
             <Icon name="close" size="20px" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 pb-12 scrollbar-none">
          {renderContent()}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0 pb-[max(2rem,env(safe-area-inset-bottom))]">
          {footerActions}
        </div>
      </div>
    </div>,
    document.body
  );
};
