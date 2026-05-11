import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Icon } from '@/components/ui/icon';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const WelcomePage = () => {
  const user = useAuthStore((state) => state.user);
  const currentUser = user?.data || user;
  const isDesktop = useIsDesktop();

  const rolLabels = {
    GERENCIA: 'Gerencia',
    JEFE: 'Jefatura',
    COORDINADOR: 'Coordinador(a)',
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] px-4 py-8">

      {/* Logo */}
      <img
        src="/img/01_Cuadra_Diseño.webp"
        alt="Cuadra — Diseño e Imagen"
        className={`w-auto object-contain mb-8 drop-shadow-md ${isDesktop ? 'h-20' : 'h-14'}`}
      />

      {/* Card de Bienvenida */}
      <div className={`
        bg-white rounded-2xl shadow-lg border border-gray-100
        flex flex-col items-center text-center
        ${isDesktop ? 'p-12 max-w-lg' : 'p-8 max-w-sm w-full'}
      `}>

        {/* Avatar del usuario */}
        {currentUser?.imagen ? (
          <img
            src={currentUser.imagen}
            alt={currentUser.nombre}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md mb-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-marca-primario to-marca-primario/70 flex items-center justify-center ring-4 ring-white shadow-md mb-4">
            <span className="text-white text-2xl font-bold">
              {currentUser?.nombre?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}

        {/* Saludo */}
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-1">
          {greeting()}
        </p>
        <h1 className="fuente-titulos text-2xl md:text-3xl font-bold text-gray-800 mb-1">
          {currentUser?.nombre || 'Usuario'}
        </h1>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-marca-primario/10 text-marca-primario text-xs font-semibold mb-6">
          <Icon name="badge" size="14px" />
          {rolLabels[currentUser?.rol] || currentUser?.rol || 'Sin rol'}
        </span>

        {/* Separador */}
        <div className="w-16 h-0.5 bg-gray-200 rounded-full mb-6" />

        {/* Info del sistema */}
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Icon name="description" size="20px" />
          <span className="text-sm font-medium">Sistema de Minutas</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
          Captura, organiza y da seguimiento a las iniciativas organizacionales surgidas durante las juntas ejecutivas.
        </p>
      </div>

      {/* Indicador sutil */}
      <p className="mt-8 text-xs text-gray-300 tracking-wide">
        Diseño e Imagen • {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default WelcomePage;
