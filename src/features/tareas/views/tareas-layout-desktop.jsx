// src/features/tareas/views/tareas-layout-desktop.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Icon } from '@/components/ui/z_index';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { getTareas } from '../api/tareas-api';
import { useTareasStore } from '../store/tareas-store';

export const TareasLayoutDesktop = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    // Estado global de departamento
    const { departamento, setDepartamento } = useTareasStore();
    
    // Conteos dinámicos
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

    useEffect(() => {
        if (!currentUser?.id) return;
        let isMounted = true;
        const fetchCounts = async () => {
            try {
                // Mis tareas pendientes
                const paramsPend = { tipo: 'TAREA', estado: 'PENDIENTE', responsableId: currentUser.id, limit: 1 };
                if (currentUser?.rol === 'ADMIN' && departamento) {
                    paramsPend.departamento = departamento;
                }
                const resPend = await getTareas(paramsPend);

                // Pendientes de aprobación
                let resApprov = null;
                if (['JEFE', 'GERENCIA', 'ADMIN'].includes(currentUser?.rol)) {
                    const paramsApprov = { estado: 'EN_REVISION', limit: 1 };
                    if (currentUser?.rol === 'ADMIN' && departamento) {
                        paramsApprov.departamento = departamento;
                    }
                    resApprov = await getTareas(paramsApprov);
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
        
        // Escuchar cambios de departamento para actualizar contadores inmediatamente
        const handleDeptChange = () => fetchCounts();
        window.addEventListener('tareas-departamento-changed', handleDeptChange);
        
        const interval = setInterval(fetchCounts, 60000);
        return () => { 
            isMounted = false; 
            clearInterval(interval); 
            window.removeEventListener('tareas-departamento-changed', handleDeptChange);
        };
    }, [currentUser?.rol, currentUser?.id, departamento]);

    const menu = useMemo(() => {
        const tareasModule = MODULES_CONFIG.find(m => m.id === 'tareas');
        const baseMenu = [
            { id: 'mis-tareas', label: 'Mis Tareas', path: '/tareas/mis-tareas', icon: 'person_check' },
            { id: 'activas', label: 'Activas', path: '/tareas/activas', icon: 'radio_button_checked' },
            { id: 'por-aprobar', label: 'Por Aprobar', path: '/tareas/por-aprobar', icon: 'fact_check' },
            { id: 'historico-tareas', label: 'Historial', path: '/tareas/historico', icon: 'assignment' },
        ];
        return baseMenu.filter(item => {
            const childConfig = tareasModule?.children?.find(c => c.id === item.id);
            return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
        });
    }, [currentUser?.rol]);

    if (menu.length === 0) return null;

    return (
        <div className="flex items-center sticky top-0 p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 w-full gap-4">
            {/* Navigation Buttons (Left Column) */}
            <div className="flex-1 flex justify-start gap-3">
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

            {/* Centralized Department Switcher (Center Column - Admin Only) */}
            {currentUser?.rol === 'ADMIN' && (
                <div className="flex-shrink-0 flex justify-center animate-in fade-in duration-300">
                    <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/50 shadow-inner">
                        {['DISEÑO', 'MARKETING'].map(opt => {
                            const val = opt === 'DISEÑO' ? 'DISENO' : 'MARKETING';
                            const isActive = departamento === val;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => setDepartamento(val)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                        isActive 
                                            ? 'bg-white text-marca-primario shadow-sm ring-1 ring-slate-200/50 font-black' 
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                                    }`}
                                >
                                    {opt === 'DISEÑO' && <Icon name="draw" size="14px" />}
                                    {opt === 'MARKETING' && <Icon name="campaign" size="14px" />}
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Spacing Balance (Right Column - Admin Only) */}
            {currentUser?.rol === 'ADMIN' && <div className="flex-1" />}
        </div>
    );
};
