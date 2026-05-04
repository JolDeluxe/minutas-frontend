import React from 'react';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useMobileSnackbarStore } from './adaptive-notify';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Icon } from '@/components/ui/icon';

export const ToastContainer = () => {
  const { notification, close } = useMobileSnackbarStore();
  const isDesktop = useIsDesktop();

  // Diccionario visual original adaptado a los TOKENS del sistema
  const mobileTypes = {
    success: { icon: 'check_circle', bg: 'bg-estado-resuelto', text: 'text-white' },
    error: { icon: 'error', bg: 'bg-estado-rechazado', text: 'text-white' },
    warning: { icon: 'warning', bg: 'bg-estado-pendiente', text: 'text-white' },
    info: { icon: 'info', bg: 'bg-estado-asignada', text: 'text-white' },
  };

  return (
    <>
      {/* 🖥️ VISTA ESCRITORIO: Contenedor oficial de react-toastify */}
      <div className="hidden lg:block">
        <ReactToastifyContainer 
          position="bottom-right" 
          theme="colored" 
          autoClose={4000} 
          hideProgressBar={false}
          toastClassName="font-sans shadow-lg rounded-sm"
        />
      </div>

      {/* 📱 VISTA MÓVIL: Fiel a la maqueta (Abajo, barra completa, X circular) */}
      {!isDesktop && notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Aplicamos los colores dinámicos respetando tu diseño */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-md shadow-xl ${mobileTypes[notification.type].bg} ${mobileTypes[notification.type].text}`}>
            
            {/* Contenido a la izquierda (Icono de estado + Texto) */}
            <div className="flex items-center gap-3 flex-1">
              <Icon name={mobileTypes[notification.type].icon} size="24px" fill={true} />
              <p className="font-medium text-sm leading-snug text-left">
                {notification.message}
              </p>
            </div>

            {/* El botón con la "X" circular idéntico al de tu imagen */}
            <button
              onClick={close}
              className="shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-full border-2 border-current opacity-80 hover:opacity-100 cursor-pointer transition-opacity"
            >
              <Icon name="close" size="18px" />
            </button>
            
          </div>
        </div>
      )}
    </>
  );
};