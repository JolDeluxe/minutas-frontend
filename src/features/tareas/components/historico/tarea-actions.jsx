// src/features/tareas/components/historico/tarea-actions.jsx
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

export const TareaActions = ({
    tarea,
    currentUser,
    onViewDetail,
    onEdit,
    onChangeStatus,
}) => {
    if (!tarea || !currentUser) return null;

    const { rol, id: userId } = currentUser;
    const esJefe = ROLES_ADMIN.includes(rol);
    const esResponsable = tarea.responsables?.some(r => r.id === userId) || esJefe;

    const estado = tarea.estado?.toUpperCase();
    const isEnProgreso = estado === 'EN_PROGRESO';
    const isCompletado = estado === 'COMPLETADO';
    const isRechazado = estado === 'RECHAZADO';
    const isCerrado = ['CERRADO', 'DESCARTADO', 'CANCELADA'].includes(estado);
    const isPendiente = !isEnProgreso && !isCompletado && !isCerrado && !isRechazado;

    return (
        <div className="flex items-center justify-center gap-1.5">
            {/* Quick Actions based on status */}
            {esResponsable && !isCerrado && (
                <div className="flex items-center gap-1.5">
                    {(isPendiente || isRechazado) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.(tarea.id, 'EN_PROGRESO');
                            }}
                            title={isRechazado ? "Reiniciar Trabajo" : "Iniciar Trabajo"}
                            className={cn(
                                "p-1.5 rounded-lg text-white shadow-sm active:scale-90 transition-all",
                                isRechazado ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                            )}
                        >
                            <Icon name={isRechazado ? "replay" : "play_arrow"} size="xs" />
                        </button>
                    )}

                    {isEnProgreso && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.(tarea.id, 'COMPLETADO');
                            }}
                            title="Marcar como Completado"
                            className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-90 transition-all"
                        >
                            <Icon name="check" size="xs" />
                        </button>
                    )}

                    {isCompletado && esJefe && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeStatus?.(tarea.id, 'RECHAZADO');
                                }}
                                title="Rechazar"
                                className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm active:scale-90 transition-all"
                            >
                                <Icon name="close" size="xs" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeStatus?.(tarea.id, 'CERRADO');
                                }}
                                title="Aprobar"
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-90 transition-all"
                            >
                                <Icon name="verified" size="xs" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Always available detail action */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail?.(tarea);
                }}
                title="Ver detalle"
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90"
            >
                <Icon name="visibility" size="xs" />
            </button>

            {/* Edit action for pending tasks or Admins */}
            {(isPendiente && (esJefe || tarea.creadoPorId === userId)) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(tarea);
                    }}
                    title="Editar"
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-marca-primario hover:border-marca-primario transition-all active:scale-90"
                >
                    <Icon name="edit" size="xs" />
                </button>
            )}
        </div>
    );
};
