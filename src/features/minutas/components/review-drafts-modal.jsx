import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, ConfirmModal } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../constants';
import { LineIconSelector } from './icons/line-icons';
import { Trash2 } from 'lucide-react';

/**
 * ReviewDraftsModal — Revisión final antes del guardado masivo.
 * Muestra el listado de lo capturado para validación visual.
 */
export const ReviewDraftsModal = ({
  isOpen,
  onClose,
  onConfirm,
  entries = [],
  notesCount = 0,
  submitting,
  minutaEstado = 'ACTIVA',
  onRemoveEntry,
  onClearAll,
}) => {
  const [closeAfterSave, setCloseAfterSave] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const isEnCurso = minutaEstado === 'EN_CURSO';

  const handleClearAllConfirm = () => {
    onClearAll();
    setShowClearConfirm(false);
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg" 
        className="md:max-w-3xl"
      >
        <ModalHeader title="Revisión de Minuta" onClose={onClose} />
        
        <ModalBody>
          <div className="flex flex-col gap-6">
            
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                     <Icon name="fact_check" size="24px" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Validar Capturas</h3>
                     <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Resumen: {entries.length} Entradas y {notesCount} Notas</p>
                  </div>
               </div>
               
               {entries.length > 0 && !submitting && (
                 <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 uppercase tracking-widest"
                 >
                   <Icon name="delete_sweep" size="14px" />
                   Vaciar Todo
                 </button>
               )}
            </div>

            {/* Listado de Entradas para Revisión */}
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {entries.length === 0 ? (
                <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-medium text-slate-400 italic">No hay borradores pendientes</p>
                </div>
              ) : (
                entries.map((entry, idx) => (
                  <div key={entry.tempId || idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm group">
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center shrink-0 font-black text-[10px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[15px] font-bold leading-snug mb-2 line-clamp-2", !entry.descripcion?.trim() ? "text-rose-400 italic" : "text-slate-800")}>
                        {entry.descripcion || "(Sin descripción — Entrada inválida)"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {AREA_MAP[entry.area] || entry.area}
                        </span>
                        {entry.linea && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100">
                            <LineIconSelector type={entry.linea} size={14} className="text-slate-900" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                              {LINEA_MAP[entry.linea]?.label || entry.linea}
                            </span>
                          </div>
                        )}
                        {entry.clasificacion && (
                          <span 
                            className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter"
                            style={{ backgroundColor: `${CLASIFICACION_MAP[entry.clasificacion]?.color}15`, color: CLASIFICACION_MAP[entry.clasificacion]?.color }}
                          >
                            {CLASIFICACION_MAP[entry.clasificacion]?.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry._localImages?.length > 0 && (
                         <div className="flex -space-x-2">
                            {entry._localImages.map((img, i) => (
                               <div key={i} className="w-8 h-8 rounded-lg border-2 border-white shadow-sm overflow-hidden">
                                  <img src={img.preview} className="w-full h-full object-cover" />
                               </div>
                            ))}
                         </div>
                      )}
                      {!submitting && (
                        <button 
                          onClick={() => onRemoveEntry?.(entry.tempId)}
                          className="w-8 h-8 rounded-xl bg-white text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                          title="Eliminar borrador"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {submitting && (
              <div className="p-6 bg-emerald-600 rounded-[2rem] text-white flex items-center gap-6 animate-pulse shadow-2xl shadow-emerald-600/30">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
                   <Icon name="cloud_upload" size="32px" className="animate-bounce" />
                </div>
                <div className="flex flex-col">
                  <p className="text-lg font-black uppercase tracking-widest leading-none mb-1">Sincronizando...</p>
                  <p className="text-[11px] font-bold opacity-80 leading-relaxed">
                     Estamos subiendo tus datos y fotografías. <br/>
                     <span className="text-white underline">No cierres la aplicación</span>, esto puede tardar unos segundos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-4">
          {/* Toggle / Checkbox for closing the meeting */}
          <div 
            className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setCloseAfterSave(!closeAfterSave)}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${closeAfterSave ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
              {closeAfterSave && <Icon name="check" size="16px" className="font-black" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">
                {isEnCurso ? 'Finalizar sesión de junta tras guardar' : 'Cerrar minuta tras guardar'}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {isEnCurso ? 'Pasará a la etapa de organización post-junta.' : 'Ya no se podrán agregar más acuerdos ni tareas a esta minuta.'}
              </span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <Button 
              variant="neutro" 
              onClick={onClose} 
              disabled={submitting}
              className="flex-1 h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-2 border-slate-100"
            >
              Regresar
            </Button>
            <Button 
              variant="guardar" 
              icon="check_circle" 
              onClick={() => onConfirm(closeAfterSave)} 
              isLoading={submitting}
              className="flex-2 h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-emerald-500/20"
            >
              Guardar Todo
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAllConfirm}
        title="Vaciar Todas las Entradas"
        message="¿Estás seguro de que deseas eliminar TODOS los borradores pendientes de guardar? Esta acción no se puede deshacer."
        confirmText="Sí, vaciar todo"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
};
