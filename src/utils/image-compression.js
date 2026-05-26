/**
 * Comprime una imagen en el lado del cliente para reducir el ancho de banda y mejorar el rendimiento móvil.
 * @param {File} file El archivo original (File o Blob).
 * @param {Object} options Opciones de compresión.
 * @returns {Promise<Blob>} El blob comprimido.
 */
export const compressImage = async (file, { maxWidth = 1200, quality = 0.6 } = {}) => {
  return new Promise((resolve, reject) => {
    // Si no es una imagen, devolver original
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Si la imagen ya es pequeña, no re-escalar pero sí recomprimir
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        
        // Limpiar canvas para evitar artefactos
        ctx.clearRect(0, 0, width, height);
        
        // Dibujar imagen re-escalada
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG (mejor compresión para fotos que PNG)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Error al generar el Blob de imagen'));
            }
            
            // Log de depuración para desarrollo
            console.log(`[ImageCompression] Finalizado: ${file.name || 'imagen'} | Original: ${(file.size / 1024).toFixed(1)}KB | Comprimido: ${(blob.size / 1024).toFixed(1)}KB`);
            
            // Retornar el más pequeño (seguridad)
            resolve(blob.size < file.size ? blob : file);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = (err) => {
        console.error('[ImageCompression] Error cargando imagen en objeto Image', err);
        resolve(file); // Fallback al original
      };
    };
    
    reader.onerror = (err) => {
      console.error('[ImageCompression] Error leyendo archivo', err);
      resolve(file); // Fallback al original
    };
  });
};
