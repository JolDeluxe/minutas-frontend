import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useTareasStore } from '../../store/tareas-store';
import { getTareas } from '../../api/tareas-api';

export const RedireccionIndiceTareas = () => {
    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const { departamento } = useTareasStore();
    
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const determineRoute = async () => {
            if (!currentUser) return;
            
            const rol = currentUser.rol;
            
            if (!['ADMIN', 'JEFE', 'GERENCIA'].includes(rol)) {
                if (isMounted) setDestination('mis-tareas');
                return;
            }

            try {
                // Check Mis Tareas
                const paramsMisTareas = { 
                    tipo: 'TAREA', 
                    estado: 'PENDIENTE', 
                    responsableId: currentUser.id, 
                    limit: 1 
                };
                if (rol === 'ADMIN' && departamento) {
                    paramsMisTareas.departamento = departamento;
                }
                const resMisTareas = await getTareas(paramsMisTareas);
                
                const countMisTareas = resMisTareas?.data?.totalFiltrado ?? resMisTareas?.data?.total ?? 0;
                
                if (countMisTareas > 0) {
                    if (isMounted) setDestination('mis-tareas');
                    return;
                }

                // Check Activas (PENDIENTE o EN_REVISION)
                const paramsActivas = {
                    tipo: 'TAREA',
                    estado: 'PENDIENTE,EN_REVISION',
                    limit: 1
                };
                
                if (rol === 'ADMIN' && departamento) {
                    paramsActivas.departamento = departamento;
                }
                // For JEFE and GERENCIA, the backend automatically filters by their own department from req.user.

                const resActivas = await getTareas(paramsActivas);
                const countActivas = resActivas?.data?.totalFiltrado ?? resActivas?.data?.total ?? 0;

                if (countActivas > 0) {
                    if (isMounted) setDestination('activas');
                    return;
                }

                // Default to Historico
                if (isMounted) setDestination('historico');
                
            } catch (error) {
                console.error("Error determining index redirect:", error);
                if (isMounted) setDestination('mis-tareas'); // Fallback safe option
            }
        };

        determineRoute();

        return () => {
            isMounted = false;
        };
    }, [currentUser, departamento]);

    if (!destination) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin"></div>
            </div>
        );
    }

    return <Navigate to={destination} replace />;
};
