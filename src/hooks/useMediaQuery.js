import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Sincronización inicial
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener reactivo a cambios de resolución
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Navaja suiza directa para usar en los componentes contenedores
export function useIsDesktop() {
  // Tailwind lg = 1024px.
  // true = Escritorio (lg, xl, 2xl)
  // false = Móvil/Tablet (xs, sm, md)
  return useMediaQuery('(min-width: 1024px)');
}