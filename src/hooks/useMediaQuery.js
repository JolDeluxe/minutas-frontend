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
  // Tailwind lg = 1024px.
  // true = Escritorio (lg, xl, 2xl)
  // false = Móvil/Tablet (xs, sm, md)
  return useMediaQuery('(min-width: 1200px)');
}