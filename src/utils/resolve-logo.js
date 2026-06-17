import defaultLogo from '/img/grupo_cuadra_logo.png';
import disenoLogo from '/img/grupo_cuadra_diseno.webp';
import marketingLogo from '/img/grupo_cuadra_marketing.webp';

export const getLogoByUser = (user) => {
  const currentUser = user?.data || user;
  
  if (!currentUser) return defaultLogo;

  if (currentUser.rol === 'ADMIN') {
    return defaultLogo;
  }

  const dept = typeof currentUser.departamento === 'string' ? currentUser.departamento.toUpperCase() : '';
  
  if (dept === 'DISENO' || dept === 'DISEÑO') {
    return disenoLogo;
  }
  
  if (dept === 'MARKETING') {
    return marketingLogo;
  }

  return defaultLogo;
};
