import { create } from 'zustand';
import { toast } from 'react-toastify';

// Store dedicado exclusivamente para el Snackbar móvil
export const useMobileSnackbarStore = create((set) => ({
  notification: null,
  
  trigger: (message, type) => {
    const id = Date.now();
    set({ notification: { id, message, type } });
    
    // Auto-cierre del snackbar móvil después de 3 segundos
    setTimeout(() => {
      set((state) => (state.notification?.id === id ? { notification: null } : state));
    }, 3000);
  },
  
  close: () => set({ notification: null }),
}));

// Navaja Suiza: Enruta la notificación a la librería o al store móvil según la pantalla
export const notify = {
  success: (msg) => {
    if (window.innerWidth >= 1024) toast.success(msg);
    else useMobileSnackbarStore.getState().trigger(msg, 'success');
  },
  error: (msg) => {
    if (window.innerWidth >= 1024) toast.error(msg);
    else useMobileSnackbarStore.getState().trigger(msg, 'error');
  },
  info: (msg) => {
    if (window.innerWidth >= 1024) toast.info(msg);
    else useMobileSnackbarStore.getState().trigger(msg, 'info');
  },
  warning: (msg) => {
    if (window.innerWidth >= 1024) toast.warn(msg);
    else useMobileSnackbarStore.getState().trigger(msg, 'warning');
  }
};