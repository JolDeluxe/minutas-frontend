// src/features/tareas/pages/tareas-page.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { TareasLayoutDesktop } from '../views/tareas-layout-desktop';
import { TareasLayoutMobile } from '../views/tareas-layout-mobile';

export default function TareasPage() {
    const isDesktop = useIsDesktop();

    return (
        <div className="max-w-full mx-auto">
            <div className="p-1 lg:p-4 flex flex-col h-full">
                {/* Navegación interna adaptativa */}
                {isDesktop ? <TareasLayoutDesktop /> : <TareasLayoutMobile />}

                {/* Contenido dinámico de los submódulos */}
                <div className="flex-1 w-full mt-2">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
