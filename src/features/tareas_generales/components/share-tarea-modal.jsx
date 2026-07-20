import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';
import { notify } from '@/components/notification/adaptive-notify';

export const ShareTareaModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;
  const { url, area, descripcion } = data;
  
  const subject = `Tarea Asignada - ${area}`;
    
  const body = `Hola, te comparto la tarea asignada al área de ${area}:\n\n` +
               `${descripcion || 'Sin descripción'}\n\n` +
               `Puedes descargar o visualizar el documento de la tarea en el siguiente enlace:\n` +
               `${url}\n\n` +
               `*Nota: Este enlace es seguro y proviene de nuestro sistema interno de gestión de minutas.*`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } finally {
          textArea.remove();
        }
      }
      notify.success('Enlace copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
      notify.error('Error al copiar. Tu navegador bloqueó la acción.');
    }
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(body)}`, '_blank');
  };

  const handleDownload = async () => {
    try {
      notify.success('Iniciando descarga...', { duration: 2000 });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al descargar archivo: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const sanitizedName = `Tarea_${area}.pdf`.replace(/\s+/g, '_');
      link.setAttribute('download', sanitizedName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al descargar, usando fallback:', error);
      let finalUrl = url;
      if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
        const fallbackName = `Tarea_${area.replace(/\s+/g, '_')}`;
        finalUrl = url.replace('/upload/', `/upload/fl_attachment:${fallbackName}/`);
      }
      window.open(finalUrl, '_blank');
    }
  };

  const handleNativeShare = async () => {
    try {
      notify.success('Preparando archivo para compartir...', { duration: 1500 });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al preparar archivo: ${response.status}`);
      }
      const blob = await response.blob();
      const sanitizedName = `Tarea_${area}.pdf`.replace(/\s+/g, '_');
      const file = new File([blob], sanitizedName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: subject,
          text: `Hola, te comparto los detalles de la tarea asignada al área de ${area}.`
        });
      } else {
        await navigator.share({
          title: subject,
          text: body,
          url: url
        });
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error al compartir nativamente:', e);
        notify.error('No se pudo compartir el archivo nativamente');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <ModalHeader title="Compartir Tarea" onClose={onClose} />
      <ModalBody>
        <div className="flex flex-col gap-3 pb-4">
          <p className="text-sm text-slate-500 mb-2 font-medium">Elige cómo deseas compartir el PDF de la tarea para el área de <b>{area}</b>:</p>
          
          <button onClick={handleEmail} className="flex items-center gap-3 p-3 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
            <Icon name="mail" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Enviar por Correo</span>
              <span className="text-[10px] opacity-80">Abre tu cliente de correo (Outlook, Gmail, etc.)</span>
            </div>
          </button>

          <button onClick={handleWhatsApp} className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer">
            <Icon name="chat" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">WhatsApp</span>
              <span className="text-[10px] opacity-80">Abre un chat con el enlace y detalles precargados</span>
            </div>
          </button>

          <button onClick={handleDownload} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer">
            <Icon name="download" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Descargar Archivo</span>
              <span className="text-[10px] opacity-80">Guarda el PDF directamente en tu dispositivo</span>
            </div>
          </button>

          <button onClick={handleCopy} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <Icon name="content_copy" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Copiar Enlace</span>
              <span className="text-[10px] opacity-80">Copia la URL segura para pegarla donde quieras</span>
            </div>
          </button>

          {navigator.share && (
            <button onClick={handleNativeShare} className="flex justify-center items-center gap-2 p-3 mt-2 rounded-2xl bg-marca-primario text-white hover:bg-marca-secundario transition-all font-bold text-sm cursor-pointer">
              <Icon name="share" size="20px" />
              Compartir (Opciones del Dispositivo)
            </button>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};
