/**
 * Helper utilitario para detectar si el usuario tiene formularios o modales activos
 * con trabajo o cambios pendientes en la pantalla.
 */
export const hasPendingWork = () => {
  try {
    // 1. Modales de captura o edición abiertos
    const openModals = document.querySelectorAll('[role="dialog"], .modal-open');
    if (openModals.length > 0) {
      for (const modal of openModals) {
        // Si el modal tiene inputs o textareas con contenido editable que el usuario pueda perder
        const modalInputs = modal.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])');
        for (const input of modalInputs) {
          if (input.type !== 'search' && input.value && input.value.trim().length > 0) {
            return true;
          }
        }
      }
    }

    // 2. Elemento activamente enfocado por el usuario con edición en curso
    const activeEl = document.activeElement;
    if (activeEl) {
      const isContentEditable = activeEl.getAttribute('contenteditable') === 'true';
      if (isContentEditable && activeEl.innerText && activeEl.innerText.trim().length > 0) {
        return true;
      }

      const tagName = activeEl.tagName;
      if (
        (tagName === 'INPUT' || tagName === 'TEXTAREA') &&
        !activeEl.readOnly &&
        !activeEl.disabled
      ) {
        // Ignorar si es búsqueda, filtro, botón o selector
        const type = (activeEl.type || '').toLowerCase();
        const isFilterOrSearch =
          type === 'search' ||
          type === 'checkbox' ||
          type === 'radio' ||
          type === 'button' ||
          type === 'submit' ||
          activeEl.dataset?.filter === 'true' ||
          activeEl.classList.contains('filter-input') ||
          activeEl.placeholder?.toLowerCase().includes('buscar') ||
          activeEl.placeholder?.toLowerCase().includes('filtrar');

        if (!isFilterOrSearch) {
          // Si el usuario modificó el valor respecto al inicial o tiene texto escrito
          const defaultValue = activeEl.defaultValue || '';
          if (activeEl.value !== defaultValue && activeEl.value.trim().length > 0) {
            return true;
          }
        }
      }
    }

    // 3. Compositores de texto / captura rápida (ej. QuickComposer o notas de minuta)
    // Solo bloquea si hay un textarea de captura con texto escrito explícitamente
    const composerTextareas = document.querySelectorAll(
      'textarea[placeholder*="idea"], textarea[placeholder*="acuerdo"], textarea[placeholder*="tarea"], textarea[placeholder*="nota"], textarea.composer-input'
    );
    for (const textarea of composerTextareas) {
      if (!textarea.readOnly && !textarea.disabled && textarea.value && textarea.value.trim().length > 0) {
        return true;
      }
    }

    return false;
  } catch (_) {
    return false;
  }
};
