// src/features/tareas/components/historico/tarea-actions.jsx
import { useState } from 'react';
import { Icon, TableActions, ConfirmModal } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { ModalEntregarTarea } from './modal-entregar-tarea';

const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

export const AccionesTablaTarea = ({
    tarea,
    currentUser,
    onViewDetail,
    onEdit,
    onChangeStatus,
    onReview,
    onDelete,
    isPorAprobar = false,
}) => {
    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [approveTarget, setApproveTarget] = useState(null);
    const [forceCloseTarget, setForceCloseTarget] = useState(null);

    if (!tarea) return null;

    const { rol, id: userId } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;
    const esAsignado = tarea.responsables?.some(r => r.id === userId);
    const esResponsable = (esAsignado || esJefe) && currentUser;

    const tieneJefeAsignado = tarea.responsables?.some(r => r.rol === 'JEFE');
    const puedeAprobar = rol === 'ADMIN' || rol === 'GERENCIA' || (rol === 'JEFE' && !tieneJefeAsignado);

    const estado = tarea.estado?.toUpperCase();
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrada = estado === 'CERRADA' || estado === 'DESCARTADA' || estado === 'CANCELADA';

    const canForceClose = esJefe && !esAsignado && isPendiente && !isPorAprobar && tarea.tipo === 'TAREA';

    return (
        <div className="flex items-center justify-center gap-1.5 min-w-[110px]">
            {/* Indicador de "En Revisión" para Coordinadores cuando está completado */}
            {isEnRevision && !puedeAprobar && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm animate-pulse">
                    <Icon name="hourglass_empty" size="14px" />
                    <span className="text-[10px] font-black uppercase tracking-tight">En Revisión</span>
                </div>
            )}

            <TableActions 
                row={tarea} 
                actions={[
                    { key: 'entregar', enabled: isPendiente && esAsignado && esResponsable && !isCerrada, onClick: (r) => { setIsEntregaModalOpen(true); } },
                    { key: 'aprobar', enabled: isEnRevision && puedeAprobar && !isCerrada, onClick: (r) => { if (onReview) onReview(r); else setApproveTarget(r); } },
                    { key: 'forzar_cierre_tarea', enabled: canForceClose && !isCerrada, onClick: (r) => { setForceCloseTarget(r); } },
                    { key: 'ver_detalle', enabled: true, onClick: (r) => { onViewDetail?.(r); } },
                    { key: 'editar', enabled: (isPendiente && (esJefe || (userId && tarea.creadoPorId === userId))), onClick: (r) => { 
                        const tareaToEdit = { ...r };
                        if (r.responsables) {
                            tareaToEdit.responsables = r.responsables.map(x => typeof x === 'object' ? x.id : x).filter(Boolean);
                        }
                        onEdit?.(tareaToEdit); 
                    } },
                    { key: 'borrar', enabled: isPendiente && (esJefe || (userId && tarea.creadoPorId === userId)), onClick: (r) => { setDeleteTarget({ ...r, _deleteAll: Boolean(r.isGrouped) }); } }
                ]} 
            />

            {isEntregaModalOpen && (
                <ModalEntregarTarea
                    isOpen={isEntregaModalOpen}
                    onClose={() => setIsEntregaModalOpen(false)}
                    tareaId={tarea.id}
                    onConfirm={async () => {
                        const nextStatus = (rol === 'ADMIN' || rol === 'GERENCIA' || (rol === 'JEFE' && !esAsignado)) ? 'CERRADA' : 'EN_REVISION';
                        if (onChangeStatus) await onChangeStatus(tarea.id, nextStatus);
                    }}
                />
            )}

            {deleteTarget && (
                <ConfirmModal
                    isOpen={Boolean(deleteTarget)}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={async () => {
                        if (onDelete) await onDelete(deleteTarget.id, deleteTarget._deleteAll);
                        setDeleteTarget(null);
                    }}
                    title="Eliminar Tarea"
                    message={deleteTarget._deleteAll ? "¿Confirmas que deseas eliminar este grupo de tareas por completo? Esta acción la descartará del listado." : "¿Estás seguro de que deseas eliminar esta tarea individual? Esta acción la descartará del listado."}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    variant="danger"
                />
            )}

            {approveTarget && (
                <ConfirmModal
                    isOpen={Boolean(approveTarget)}
                    onClose={() => setApproveTarget(null)}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(approveTarget.id, 'CERRADA');
                        setApproveTarget(null);
                    }}
                    title="Aprobar Tarea"
                    message="¿Deseas aprobar y cerrar esta tarea de forma definitiva?"
                    confirmText="Aprobar"
                    cancelText="Cancelar"
                    variant="success"
                />
            )}

            {forceCloseTarget && (
                <ConfirmModal
                    isOpen={Boolean(forceCloseTarget)}
                    onClose={() => setForceCloseTarget(null)}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(forceCloseTarget.id, 'CERRADA');
                        setForceCloseTarget(null);
                    }}
                    title="Forzar Cierre de Tarea"
                    message="¿Estás seguro de que deseas cerrar esta tarea sin pasar por revisión? Advertencia: no hubo entrega registrada para esta tarea."
                    confirmText="Cerrar Tarea"
                    cancelText="Cancelar"
                    variant="danger"
                />
            )}
        </div>
    );
};
