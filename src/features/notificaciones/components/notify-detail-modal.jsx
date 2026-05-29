import React from 'react';
import { PanelDetalleTarea } from '../../tareas/components/comun/panel-detalle-tarea';

export const NotifyDetailModal = ({ isOpen, onClose, ticket, currentUser, onChangeStatus, onUpdate, onDelete, submitting }) => {
    return (
        <PanelDetalleTarea
            isOpen={isOpen}
            onClose={onClose}
            tarea={ticket}
            currentUser={currentUser}
            onChangeStatus={onChangeStatus}
            onUpdate={onUpdate}
            onDelete={onDelete}
            submitting={submitting}
        />
    );
};