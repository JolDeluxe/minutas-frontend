// src/features/tareas/views/tareas-layout-desktop.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Icon } from '@/components/ui/z_index';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { getTareas } from '../api/tareas-api';

export const TareasLayoutDesktop = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    
    // Conteos dinámicos
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

    useEffect(() => {
        if (!currentUser?.id) return;
        let isMounted = true;
        const fetchCounts = async () => {
            try {
                // Mis tareas pendientes
                const resPend = await getTareas({ tipo: 'TAREA', estado: 'PENDIENTE', responsableId: currentUser.id, limit: 1 });
                // Pendientes de aprobación (solo para Jefes/Gerentes)
                let resApprov = null;
                if (['JEFE', 'GERENCIA'].includes(currentUser?.rol)) {
                    resApprov = await getTareas({ estado: 'EN_REVISION', limit: 1 });
                }

                if (isMounted) {
                    setUnassignedCount(resPend?.data?.total || 0);
                    setPendingApprovalCount(resApprov?.data?.total || 0);
                }
            } catch (error) {
                console.warn("Error al obtener conteos:", error);
            }
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 60000);
        return () => { isMounted = false; clearInterval(interval); };
    }, [currentUser?.rol, currentUser?.id]);

    const menu = useMemo(() => {
        const tareasModule = MODULES_CONFIG.find(m => m.id === 'tareas');
        const baseMenu = [
            { id: 'mis-tareas', label: 'Mis Tareas', path: '/tareas/mis-tareas', icon: 'person_check' },
            { id: 'activas', label: 'Activas', path: '/tareas/activas', icon: 'monitoring' },
            { id: 'por-aprobar', label: 'Por Aprobar', path: '/tareas/por-aprobar', icon: 'fact_check' },
            { id: 'historico-tareas', label: 'Historial', path: '/tareas/historico', icon: 'history' },
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

                        {item.id === 'por-aprobar' && pendingApprovalCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-white text-[10px] font-bold border-2 border-white shadow-md z-10 bg-black leading-none">
                                {pendingApprovalCount > 99 ? '99+' : pendingApprovalCount}
                            </span>
                        )}
                    </div>
                );
            })}

        </div>
    );
};
