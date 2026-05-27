import { EntryFormModal } from '@/features/minutas/components/timeline/entry-form-modal';
import { useTareas } from '../../hooks/use-tareas';
import { notify } from '@/components/notification/adaptive-notify';

export const TareaEditModal = ({ isOpen, onClose, tarea, onSuccess, currentUser }) => {
    const { updateTarea, addTareaImagen, deleteTareaImagen, submitting } = useTareas();

    const handleSave = async (id, payload, imagesData) => {
        try {
            // 1. Actualizar datos base
            await updateTarea(id, payload);

            // 2. Eliminar imágenes marcadas
            if (imagesData?.deleteImageIds?.length > 0) {
                for (const imgId of imagesData.deleteImageIds) {
                    await deleteTareaImagen(id, imgId);
                }
            }

            // 3. Subir nuevas imágenes (por defecto se suben como CAPTURA en la edición general)
            if (imagesData?.newImages?.length > 0) {
                for (const file of imagesData.newImages) {
                    await addTareaImagen(id, file, 'CAPTURA');
                }
            }

            notify.success('Tarea actualizada correctamente.');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            notify.error('Ocurrió un error al guardar los cambios.');
        }
    };

    if (!tarea) return null;

    return (
        <EntryFormModal
            isOpen={isOpen}
            onClose={onClose}
            entry={tarea}
            onSave={handleSave}
            submitting={submitting}
            departamento={currentUser?.departamento || 'DISENO'}
        />
    );
};