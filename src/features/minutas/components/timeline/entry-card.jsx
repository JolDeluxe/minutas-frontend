// src/features/minutas/components/timeline/entry-card.jsx
//
// Adaptador — mapea los props de Minutas (entry) al componente unificado TareaCard.
// TareaCard es la fuente de verdad única para el diseño de tarjetas.
// Cualquier cambio de diseño debe hacerse en:
//   src/features/tareas/components/comun/tarjeta-tarea.jsx

// Re-exportar ImageViewer para compatibilidad con imports existentes
export { ImageViewer } from '../../../tareas/components/comun/tarjeta-tarea';

import { TareaCard } from '../../../tareas/components/comun/tarjeta-tarea';
import { useAuthStore } from '@/stores/auth-store';

/**
 * EntryCard — Adaptador de TareaCard para el módulo de Minutas.
 *
 * Recibe los props originales de EntryCard (entry, departamento, onRemove, etc.)
 * y los mapea a los props que acepta TareaCard.
 */
export const EntryCard = ({
  entry,
  departamento = 'DISENO',
  onOrganize,
  onRemove,
  onUpdate,
  onEdit,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onAddImage,
  onDeleteImage,
  onChangeStatus,
  users = [],
  onDownloadPdf,
  isGeneratingPdf,
  onViewDetail,
  meetingMode,
  onToggleNotificado,
}) => {
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const isRemoteDraft = Boolean(entry._isRemoteDraft);

  // Determinar si la entrada es externa al departamento actual
  const isExternal =
    (departamento === 'DISENO' && entry.area !== 'DISENO') ||
    (departamento === 'MARKETING' && entry.area !== 'MARKETING');

  // Enriquecer la entrada con el flag de external para que TareaCard lo detecte
  const entryEnriquecida = { ...entry, _isExternal: isExternal, readOnly: isRemoteDraft || entry.readOnly };

  return (
    <TareaCard
      tarea={entryEnriquecida}
      currentUser={currentUser}
      onViewDetail={onViewDetail}
      onChangeStatus={(id, status) => onChangeStatus?.(id, { estado: status })}
      onEdit={isRemoteDraft ? undefined : onEdit}
      onDelete={isRemoteDraft ? undefined : onRemove}
      onOrganize={isRemoteDraft ? undefined : onOrganize}
      onDownloadPdf={onDownloadPdf}
      isGeneratingPdf={isGeneratingPdf}
      isDraft={Boolean(entry.tempId)}
      onToggleNotificado={onToggleNotificado}
      users={users}
    />
  );
};
