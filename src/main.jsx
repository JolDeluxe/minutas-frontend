import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// En producción, vite-plugin-pwa genera este módulo virtual
if (import.meta.env.PROD) {
  import('@/utils/unsaved-changes').then(({ hasPendingWork }) => {
    // Interceptar controllerchange para evitar recargas destructivas si el usuario está llenando datos
    if ('serviceWorker' in navigator) {
      let isRefreshing = false;
      let pendingReload = false;

      const triggerSafeReload = () => {
        if (isRefreshing) return;
        if (hasPendingWork()) {
          pendingReload = true;
          console.log('[PWA] Actualización lista pero diferida: el usuario tiene trabajo/formulario en curso.');
          return;
        }
        isRefreshing = true;
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        triggerSafeReload();
      });

      // Si había una recarga diferida, aplicarla en cuanto el usuario termine o cierre los modales
      const checkPendingReload = () => {
        if (pendingReload && !hasPendingWork()) {
          pendingReload = false;
          triggerSafeReload();
        }
      };

      document.addEventListener('visibilitychange', checkPendingReload);
      window.addEventListener('focus', checkPendingReload);
      document.addEventListener('click', () => setTimeout(checkPendingReload, 400));
    }

    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onRegisteredSW(swUrl, r) {
          if (!r) return;

          // 1. Chequeo periódico cada 5 minutos si hay conexión
          setInterval(async () => {
            if (!r.installing && navigator && navigator.onLine) {
              try {
                const resp = await fetch(swUrl, {
                  cache: 'no-store',
                  headers: { cache: 'no-store', 'cache-control': 'no-cache' },
                });
                if (resp?.status === 200) await r.update();
              } catch (_) {}
            }
          }, 5 * 60 * 1000);

          // 2. Chequeo automático cada vez que el usuario regresa a la pestaña/app (visibilitychange o focus)
          const checkUpdateOnForeground = async () => {
            if (document.visibilityState === 'visible' && navigator && navigator.onLine) {
              try {
                await r.update();
              } catch (_) {}
            }
          };

          document.addEventListener('visibilitychange', checkUpdateOnForeground);
          window.addEventListener('focus', checkUpdateOnForeground);
        },
        onOfflineReady() {
          console.log('[PWA] App lista para usar offline.');
        },
      });
    });
  });
}

createRoot(document.getElementById('root')).render(
    <App />
);