import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { usePushAndSocket } from '@/hooks/usePushAndSocket';
import { DesktopLayout } from './desktop-layout.jsx';
import { MobileLayout } from './mobile-layout.jsx';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { RefreshFab } from '@/components/ui/refresh-fab';

export const DashboardLayout = () => {
  const isDesktop = useIsDesktop();

  // Inicializar notificaciones push y sockets globalmente para el entorno logueado
  usePushAndSocket();

  return (
    <>
      <OfflineBanner />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      <RefreshFab />
    </>
  );
};