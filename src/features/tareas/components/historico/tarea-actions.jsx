// src/features/tareas/components/historico/tarea-actions.jsx
import { Icon, Button } from '@/components/ui/z_index.html';
import { cn } from '@/utils/cn';

const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

export const TareaActions = ({
    tarea,
    currentUser,
    onViewDetail,
    onEdit,
    onChangeStatus,
}) => {
    // Si no hay tarea, no renderizamos nada.
    if (!tarea) return null;

    const { rol, id: userId } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;
    const esResponsable = (tarea.responsables?.some(r => r.id === userId) || esJefe) && currentUser;

    const estado = tarea.estado?.toUpperCase();
    const isEnProgreso = estado === 'EN_PROGRESO';
    const isCompletado = estado === 'COMPLETADO';
    const isRechazado = estado === 'RECHAZADO';
    const isCerrado = ['CERRADO', 'DESCARTADO', 'CANCELADA'].includes(estado);
    const isPendiente = !isEnProgreso && !isCompletado && !isCerrado && !isRechazado;

    return (
        <div className="flex items-center justify-center gap-2 min-w-[110px]">
            {/* Quick Actions based on status */}
            {esResponsable && !isCerrado && (
                <div className="flex items-center gap-2">
                    {(isPendiente || isRechazado) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.(tarea.id, 'EN_PROGRESO');
                            }}
                            title={isRechazado ? "Reiniciar Trabajo" : "Iniciar Trabajo"}
                            className={cn(
                                "p-2 rounded-xl text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all",
                                isRechazado ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                            )}
                        >
                            <Icon name={isRechazado ? "replay" : "play_arrow"} size="sm" />
                        </button>
                    )}

                    {isEnProgreso && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const esAsignadoDirecto = tarea.responsables?.some(r => r.id === userId);
                                onChangeStatus?.(tarea.id, (esJefe && esAsignadoDirecto) ? 'CERRADO' : 'COMPLETADO');
                            }}
                            title={(esJefe && tarea.responsables?.some(r => r.id === userId)) ? "Terminar y Cerrar" : "Marcar como Completado"}
                            className={cn(
                                "p-2 rounded-xl text-white shadow-lg active:scale-90 transition-all",
                                (esJefe && tarea.responsables?.some(r => r.id === userId)) 
                                    ? "bg-black hover:bg-neutral-800 shadow-black/20" 
                                    : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                            )}
                        >
                            <Icon name={(esJefe && tarea.responsables?.some(r => r.id === userId)) ? "verified" : "check"} size="sm" />
                        </button>
                    )}

                    {/* Solo Jefatura puede Aprobar y Cerrar (Estética Black) */}
                    {isCompletado && esJefe && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.(tarea.id, 'CERRADO');
                            }}
                            title="Aprobar y Cerrar Tarea"
                            className="px-3 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white shadow-lg shadow-black/20 active:scale-90 transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5"
                        >
                            <Icon name="verified" size="xs" />
                            CERRAR
                        </button>
                    )}
                </div>
            )}

            {/* Indicador de "En Revisión" para Coordinadores cuando está completado */}
            {isCompletado && !esJefe && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shadow-sm animate-pulse">
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
                className="p-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90 shadow-sm"
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
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-marca-primario hover:border-marca-primario transition-all active:scale-90 shadow-sm"
                >
                    <Icon name="edit" size="sm" />
                </button>
            )}
        </div>
    );
};
