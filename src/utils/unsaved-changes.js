/**
 * Helper utilitario para detectar si el usuario tiene formularios o modales activos
 * con trabajo o cambios pendientes en la pantalla.
 */
export const hasPendingWork = () => {
  try {
    // 1. Modales abiertos (creación/edición de minuta, tarea, nota, general, revisión)
    const openModals = document.querySelectorAll('[role="dialog"], .modal-open');
    if (openModals.length > 0) {
      return true;
    }

    // 2. Elementos de formulario activos con texto ingresado
    const inputsAndTextareas = document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea');
    for (const el of inputsAndTextareas) {
      // Ignorar inputs que no pertenecen a captura (ej. barra de búsqueda vacía o genérica)
      if (el.value && el.value.trim().length > 0 && el.type !== 'search') {
        // Si el usuario está enfocado o tiene texto significativo escrito
        return true;
      }
    }

    // 3. Comprobación de foco activo en elementos editables
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true')
    ) {
      return true;
    }

    return false;
  } catch (_) {
    return false;
  }
};
