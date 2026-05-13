// src/features/tareas/views/tareas-layout-desktop.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { getTareas } from '../api/tareas-api';

export const TareasLayoutDesktop = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    
    // Simulación de unassignedCount (pendientes de Mis Tareas)
    const [unassignedCount, setUnassignedCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchCount = async () => {
            try {
                const res = await getTareas({ formalizada: true, estadoOperativo: 'PENDIENTE', limit: 1 });
                if (isMounted) setUnassignedCount(res?.data?.total || 0);
            } catch (error) {
                console.warn("Error al obtener conteo:", error);
            }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 60000);
        return () => { isMounted = false; clearInterval(interval); };
    }, []);

    const menu = useMemo(() => {
        const tareasModule = MODULES_CONFIG.find(m => m.id === 'tareas');
        const baseMenu = [
            { id: 'mis-tareas', label: 'Mis Entradas', path: '/tareas/mis-tareas', icon: 'today' },
            { id: 'mis-seguimientos', label: 'Seguimientos', path: '/tareas/mis-seguimientos', icon: 'update' },
            { id: 'historico-tareas', label: 'Historial', path: '/tareas/historico', icon: 'assignment_globe' },
        ];
        return baseMenu.filter(item => {
            const childConfig = tareasModule?.children?.find(c => c.id === item.id);
            return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
        });
    }, [currentUser?.rol]);

    if (menu.length === 0) return null;

    return (
        <div className="flex gap-3 sticky top-0 p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 w-full">
            {menu.map(item => {
                const isActive = location.pathname.includes(item.path);
                const isMisTareas = item.id === 'mis-tareas';

                return (
                    <div key={item.id} className="relative">
                        <Button
                            size="sm"
                            variant={isActive ? 'primario' : 'ghost'}
                            icon={item.icon}
                            iconSize="md"
                            onClick={() => navigate(item.path)}
                            className={isActive ? 'shadow-md' : 'bg-white'}
                        >
                            {item.label}
                        </Button>

                        {isMisTareas && unassignedCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-white text-[10px] font-bold border-2 border-white shadow-md z-10 bg-amber-500 leading-none">
                                {unassignedCount > 99 ? '99+' : unassignedCount}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
