/**
 * Valida si un archivo es una imagen permitida (JPEG, PNG, WEBP, HEIC) y si cumple con el límite de tamaño.
 * @param {File} file El archivo a validar.
 * @returns {{isValid: boolean, error?: string}} Objeto indicando si es válido y el mensaje de error si aplica.
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No se seleccionó ningún archivo.' };
  }
  
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  const extension = file.name ? file.name.split('.').pop().toLowerCase() : '';
  const isAllowedExt = allowedExtensions.includes(extension);
  
  const isImageMime = file.type ? file.type.startsWith('image/') : false;
  const isHeicMime = file.type === 'image/heic' || file.type === 'image/heif';
  
  if (!isImageMime && !isAllowedExt && !isHeicMime) {
    return { 
      isValid: false, 
      error: `Formato de archivo .${extension || 'desconocido'} no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP, HEIC).` 
    };
  }
  
  // Límite de tamaño: 25MB
  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `La imagen "${file.name}" supera el tamaño máximo permitido de 25MB.`
    };
  }
  
  return { isValid: true };
};
