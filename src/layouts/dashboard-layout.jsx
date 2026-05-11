import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { DesktopLayout } from './desktop-layout.jsx';
import { MobileLayout } from './mobile-layout.jsx';
import { OfflineBanner } from '@/components/ui/offline-banner';

export const DashboardLayout = () => {
  const isDesktop = useIsDesktop();

  return (
    <>
      <OfflineBanner />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </>
  );
};