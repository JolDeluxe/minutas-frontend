import React from 'react';
import { ModalRevisionTarea } from '../../tareas/components/comun/modal-revision-tarea';

export const NotifyReviewModal = ({ isOpen, onClose, ticket, onConfirm, isSubmitting }) => {
    return (
        <ModalRevisionTarea
            isOpen={isOpen}
            onClose={onClose}
            tarea={ticket}
            onConfirm={onConfirm}
            submitting={isSubmitting}
        />
    );
};