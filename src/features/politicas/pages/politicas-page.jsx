import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePoliticas } from '../hooks/use-politicas';
import { PoliticasDesktop } from '../views/politicas-desktop';
import { PoliticasMobile } from '../views/politicas-mobile';
import { PoliticaFormModal } from '../components/politica-form-modal';
import { notify } from '@/components/notification/adaptive-notify';

export const PoliticasPage = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { 
    politicas, 
    loading, 
    filters, 
    setFilters, 
    handleCreate, 
    handleUpdate, 
    handleDelete 
  } = usePoliticas();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPolitica, setSelectedPolitica] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(isDesktop ? 'table' : 'cards');

  // Ajustar viewMode al cambiar el tamaño de pantalla
  useEffect(() => {
    setViewMode(isDesktop ? 'table' : 'cards');
  }, [isDesktop]);

  const handleOpenAdd = () => {
    setSelectedPolitica(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (politica) => {
    setSelectedPolitica(politica);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    setSubmitting(true);
    let success = false;
    
    if (selectedPolitica) {
      if (data instanceof FormData) {
          // El backend de updateTarea no soporta FormData directamente de la misma forma que crear.
          // Extraemos la descripción para actualizar. 
          // Si el usuario quiere cambiar imagen, en este flujo simplificado solo actualizamos texto.
          const desc = data.get('tareas[0][descripcion]');
          success = await handleUpdate(selectedPolitica.id, { descripcion: desc });
      } else {
          success = await handleUpdate(selectedPolitica.id, data);
      }
    } else {
      success = await handleCreate(data);
    }

    if (success) {
      setModalOpen(false);
    }
    setSubmitting(false);
  };

  const commonProps = {
    politicas,
    loading,
    filters,
    setFilters,
    onAdd: handleOpenAdd,
    onEdit: handleOpenEdit,
    onDelete: handleDelete,
    viewMode,
    onViewChange: setViewMode
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/30 overflow-y-auto custom-scrollbar">
      {isDesktop ? (
        <PoliticasDesktop {...commonProps} />
      ) : (
        <PoliticasMobile {...commonProps} />
      )}

      <PoliticaFormModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        politica={selectedPolitica}
        onSave={handleSave}
        submitting={submitting}
      />
    </div>
  );
};

export default PoliticasPage;
