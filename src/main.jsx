import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// En producción, vite-plugin-pwa genera este módulo virtual
if (import.meta.env.PROD) {
  // Manejo de actualización inmediata del Service Worker
  if ('serviceWorker' in navigator) {
    let isRefreshing = false;

    // Cuando el nuevo SW toma control, recargamos inmediatamente en automático
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) return;
      isRefreshing = true;
      window.location.reload();
    });
  }

  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Fuerza al nuevo Service Worker a activarse de inmediato
        updateSW(true);
      },
      onRegisteredSW(swUrl, r) {
        if (!r) return;

        // 1. Chequeo periódico cada 60 segundos si hay conexión
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
        }, 60 * 1000);

        // 2. Chequeo automático en cuanto el usuario enfoca la pestaña o vuelve a ella
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
}

createRoot(document.getElementById('root')).render(
    <App />
);