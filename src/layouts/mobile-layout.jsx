import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileHeader } from './components/mobile-header.jsx';
import { MobileSidebar } from './components/mobile-sidebar.jsx';
import { MobileBottomNav } from './components/mobile-bottom-nav.jsx';
import { useAuthStore } from '@/stores/auth-store';
import { getModulesByRole } from '@/config/modules-config';

/**
 * MobileLayout — Layout institucional para móviles.
 * Gestiona el Header y el BottomNav como anclas persistentes.
 */
export const MobileLayout = () => {
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const userRole = currentUser?.rol || 'GERENCIA';
  const userModules = getModulesByRole(userRole);

  const showBottomNav = userModules.length > 0 && userModules.length <= 5;
  const showSidebar = userModules.length > 5;

  return (
    <div className="w-full flex flex-col bg-cuadra-arena min-h-screen">
      
      {/* HEADER: Z-40 para estar debajo de modales pero sobre el contenido */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <MobileHeader showBurger={showSidebar} />
      </header>

      <div className="flex-1 relative flex flex-col min-h-0">
        {showSidebar && <MobileSidebar userModules={userModules} />}
        
        {/* MAIN: El contenido (MinutaDetailPage) se renderiza aquí */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* BOTTOM NAV: Z-[100] para estar SIEMPRE sobre cualquier drawer o sheet del contenido */}
      {showBottomNav && (
        <footer className="sticky bottom-0 z-[100] bg-white border-t border-slate-200">
          <MobileBottomNav userModules={userModules} />
        </footer>
      )}

    </div>
  );
};