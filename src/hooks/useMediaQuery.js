import { useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false // Snapshot para SSR
  );
}

// Navaja suiza directa para usar en los componentes contenedores
export function useIsDesktop() {
  // true = Escritorio (Pantallas > 768px, incluye laptops y desktops)
  return useMediaQuery('(min-width: 769px)');
}

export function useIsTablet() {
  // true = Tablets (entre 426px y 768px)
  return useMediaQuery('(min-width: 426px) and (max-width: 768px)');
}

export function useIsMobile() {
  // true = Celulares (hasta 425px)
  return useMediaQuery('(max-width: 425px)');
}