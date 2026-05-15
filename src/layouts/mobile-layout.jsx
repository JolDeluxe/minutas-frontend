import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileHeader } from './components/mobile-header.jsx';
import { MobileSidebar } from './components/mobile-sidebar.jsx';
import { MobileBottomNav } from './components/mobile-bottom-nav.jsx';
import { useAuthStore } from '@/stores/auth-store';
import { getModulesByRole } from '@/config/modules-config';

/**
 * MobileLayout — Layout Institucional Reforzado.
 * Actúa como un contenedor rígido (App-like) que no "baila" en móvil.
 */
export const MobileLayout = () => {
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const userRole = currentUser?.rol || 'GERENCIA';
  const userModules = getModulesByRole(userRole);

  const showBottomNav = userModules.length > 0 && userModules.length <= 5;
  const showSidebar = userModules.length > 5;

  return (
    /* h-[100dvh] asegura que el layout siempre ocupe el área visible real */
    /* fixed inset-0 + overscroll-none evita que la app "baile" o rebote */
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col bg-cuadra-arena overflow-hidden overscroll-none select-none">
      
      {/* HEADER: Z-40 para estar sobre el contenido pero bajo modales críticos */}
      <header className="shrink-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <MobileHeader showBurger={showSidebar} />
      </header>

      {/* SIDEBAR MÓVIL: Se gestiona mediante el UI Store */}
      {showSidebar && <MobileSidebar userModules={userModules} />}
      
      {/* MAIN: Área de scroll independiente y contenida */}
      <main className="flex-1 overflow-y-auto overscroll-contain relative z-10 custom-scrollbar focus:outline-none">
        <Outlet />
      </main>

      {/* BOTTOM NAV: Anclado físicamente al final del flexbox */}
      {showBottomNav && (
        <footer className="shrink-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
          <MobileBottomNav userModules={userModules} />
        </footer>
      )}
    </div>
  );
};