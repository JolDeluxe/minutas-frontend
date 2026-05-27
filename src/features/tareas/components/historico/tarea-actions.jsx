// src/features/tareas/components/historico/tarea-actions.jsx
import { useState } from 'react';
import { Icon, TableActions } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TareaEntregaModal } from '../common/tarea-entrega-modal';

const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

export const TareaActions = ({
    tarea,
    currentUser,
    onViewDetail,
    onEdit,
    onChangeStatus,
    onReview,
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
        <div className="flex items-center justify-center gap-1.5 min-w-[110px]">
            {/* Indicador de "En Revisión" para Coordinadores cuando está completado */}
            {isEnRevision && !esJefe && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm animate-pulse">
                    <Icon name="hourglass_empty" size="14px" />
                    <span className="text-[10px] font-black uppercase tracking-tight">En Revisión</span>
                </div>
            )}

            <TableActions 
                row={tarea} 
                actions={[
                    { key: 'entregar', enabled: isPendiente && esAsignado && esResponsable && !isCerrada, onClick: (r) => { setIsEntregaModalOpen(true); } },
                    { key: 'aprobar', enabled: isEnRevision && esJefe && esResponsable && !isCerrada, onClick: (r) => { onReview ? onReview(r) : onChangeStatus?.(r.id, 'CERRADA'); } },
                    { key: 'ver_detalle', enabled: true, onClick: (r) => { onViewDetail?.(r); } },
                    { key: 'editar', enabled: (isPendiente && (esJefe || (userId && tarea.creadoPorId === userId))), onClick: (r) => { onEdit?.(r); } }
                ]} 
            />

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
