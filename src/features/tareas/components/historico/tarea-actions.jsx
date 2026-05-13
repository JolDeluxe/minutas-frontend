// src/features/tareas/components/historico/tarea-actions.jsx
import { TableActions } from '@/components/ui/z_index';

const ROLES_ADMIN = ['GERENCIA', 'JEFE'];
const ROLES_SUPERVISOR = ['GERENCIA', 'JEFE'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA'];

const puedeEditar = ({ rol, id }, tarea) => {
    if (['EN_PROGRESO', 'COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    if (ROLES_ADMIN.includes(rol)) return true;
    if (tarea.creadorId === id && tarea.estado === 'PENDIENTE') return true;
    return false;
};

const puedeAsignar = ({ rol }, tarea) => {
    if (!ROLES_ADMIN.includes(rol)) return false;
    if (['EN_PROGRESO', 'COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    return true;
};

const puedeCambiarEstado = ({ rol, id }, tarea) => {
    if (!tarea.responsables || tarea.responsables.length === 0) return false;
    if (['COMPLETADO', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    if (ROLES_ADMIN.includes(rol)) return true;
    if (rol === 'COORDINADOR') return tarea.responsables.some((r) => r.id === id);
    return false;
};

const puedeRevisar = ({ rol, id }, tarea) => {
    if (tarea.estado !== 'COMPLETADO') return false;
    if (ROLES_SUPERVISOR.includes(rol)) return true;
    if (tarea.creadorId === id) return true;
    return false;
};

const puedeCancelar = ({ rol, id }, tarea) => {
    if (['COMPLETADO', 'CERRADO', 'CANCELADA'].includes(tarea.estado)) return false;
    if (ROLES_ADMIN.includes(rol)) return true;
    if (tarea.creadorId === id && tarea.estado === 'PENDIENTE') return true;
    return false;
};

export const TareaActions = ({
    tarea,
    currentUser,
    onViewDetail,
    onEdit,
    onAssign,
    onChangeStatus,
    onReview,
    onCancel,
}) => {
    if (!tarea || !currentUser) return null;

    return (
        <TableActions
            row={tarea}
            actions={[
                { key: 'ver_detalle', enabled: true, onClick: onViewDetail },
                { key: 'revisar_ticket', enabled: puedeRevisar(currentUser, tarea), onClick: onReview, tooltip: 'Revisar tarea' },
                { key: 'editar', enabled: puedeEditar(currentUser, tarea), onClick: onEdit },
                { key: 'asignar_tecnico', enabled: puedeAsignar(currentUser, tarea), onClick: onAssign, tooltip: 'Asignar responsables' },
                { key: 'cambiar_estado', enabled: puedeCambiarEstado(currentUser, tarea), onClick: onChangeStatus },
                { key: 'cancelar_ticket', enabled: puedeCancelar(currentUser, tarea), onClick: onCancel, tooltip: 'Cancelar tarea' },
            ]}
        />
    );
};
