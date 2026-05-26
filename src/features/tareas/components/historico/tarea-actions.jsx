// src/features/tareas/components/historico/tarea-actions.jsx
import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TareaEntregaModal } from '../common/tarea-entrega-modal';

const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

export const TareaActions = ({
    tarea,
    currentUser,
    onViewDetail,
    onEdit,
    onChangeStatus,
}) => {
    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);

    if (!tarea) return null;

    const { rol, id: userId } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;
    const esAsignado = tarea.responsables?.some(r => r.id === userId);
    const esResponsable = (esAsignado || esJefe) && currentUser;

    const estado = tarea.estado?.toUpperCase();
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrada = estado === 'CERRADA' || estado === 'DESCARTADA' || estado === 'CANCELADA';

    return (
        <div className="flex items-center justify-center gap-2 min-w-[110px]">
            {/* Quick Actions based on status */}
            {esResponsable && !isCerrada && (
                <div className="flex items-center gap-2">
                    {isPendiente && esAsignado && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEntregaModalOpen(true);
                            }}
                            title="Entregar para Revisión"
                            className="p-2 rounded-xl text-white shadow-lg bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 active:scale-90 transition-all cursor-pointer"
                        >
                            <Icon name="check" size="sm" />
                        </button>
                    )}

                    {/* Solo Jefatura puede Aprobar y Cerrar (Estética Black) */}
                    {isEnRevision && esJefe && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.(tarea.id, 'CERRADA');
                            }}
                            title="Aprobar y Cerrar Tarea"
                            className="px-3 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white shadow-lg shadow-black/20 active:scale-90 transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                        >
                            <Icon name="verified" size="xs" />
                            CERRAR
                        </button>
                    )}
                </div>
            )}

            {/* Indicador de "En Revisión" para Coordinadores cuando está completado */}
            {isEnRevision && !esJefe && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm animate-pulse">
                    <Icon name="hourglass_empty" size="14px" />
                    <span className="text-[10px] font-black uppercase tracking-tight">En Revisión</span>
                </div>
            )}

            {/* Always available detail action */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail?.(tarea);
                }}
                title="Ver detalle completo"
                className="p-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90 shadow-sm cursor-pointer"
            >
                <Icon name="visibility" size="sm" />
            </button>

            {/* Edit action for pending tasks or Admins */}
            {(isPendiente && (esJefe || (userId && tarea.creadoPorId === userId))) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(tarea);
                    }}
                    title="Editar"
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-marca-primario hover:border-marca-primario transition-all active:scale-90 shadow-sm cursor-pointer"
                >
                    <Icon name="edit" size="sm" />
                </button>
            )}

            {isEntregaModalOpen && (
                <TareaEntregaModal
                    isOpen={isEntregaModalOpen}
                    onClose={() => setIsEntregaModalOpen(false)}
                    tareaId={tarea.id}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(tarea.id, 'EN_REVISION');
                    }}
                />
            )}
        </div>
    );
};
