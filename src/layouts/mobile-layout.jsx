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
    <div className="h-screen w-full flex flex-col bg-cuadra-arena overflow-hidden relative">
      
      {/* HEADER: No es sticky, fluye con el contenido o se queda arriba según scroll del main */}
      <div className="shrink-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm relative">
        <MobileHeader showBurger={showSidebar} />
      </div>

      {/* SIDEBAR MÓVIL (Condicional: > 5 módulos) */}
      {showSidebar && <MobileSidebar userModules={userModules} />}
      
      {/* MAIN: Area de scroll principal */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-24">
        <Outlet />
      </main>

      {/* BOTTOM NAV: Z-[100] para estar SIEMPRE sobre cualquier drawer o sheet del contenido */}
      {showBottomNav && (
        <footer className="sticky bottom-0 z-[100] bg-white border-t border-slate-200">
          <MobileBottomNav userModules={userModules} />
        </footer>
      )}

    </div>
  );
};