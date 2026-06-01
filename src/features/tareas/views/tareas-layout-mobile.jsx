// src/features/tareas/views/tareas-layout-mobile.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle, Icon } from '@/components/ui/z_index';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { getTareas } from '../api/tareas-api';
import { useTareasStore } from '../store/tareas-store';
import { DisenoIcon, MarketingIcon } from '@/features/minutas/components/icons/line-icons';

const calculateDaysWaiting = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const today = new Date();
    created.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - created.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

export const TareasLayoutMobile = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const userRole = currentUser?.rol;

    // Estado global del departamento
    const { departamento, setDepartamento } = useTareasStore();

    const [unassignedCount, setUnassignedCount] = useState(0);
    const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
    const [hasCritical, setHasCritical] = useState(false);

    useEffect(() => {
        if (!currentUser?.id) return;
        let isMounted = true;
        const fetchCounts = async () => {
            try {
                // Mis Tareas
                const paramsPend = { tipo: 'TAREA', estado: 'PENDIENTE', responsableId: currentUser.id };
                if (userRole === 'ADMIN' && departamento) {
                    paramsPend.departamento = departamento;
                }
                const response = await getTareas(paramsPend);
                
                let resApprov = null;
                if (['JEFE', 'GERENCIA', 'ADMIN'].includes(userRole)) {
                    const paramsApprov = { estado: 'EN_REVISION', limit: 1 };
                    if (userRole === 'ADMIN' && departamento) {
                        paramsApprov.departamento = departamento;
                    }
                    resApprov = await getTareas(paramsApprov);
                }

                if (isMounted) {
                    const list = response?.data?.tareas || [];
                    const count = response?.data?.total || 0;
                    const isCritical = list.some(t => calculateDaysWaiting(t.createdAt) >= 3);
                    setUnassignedCount(count);
                    setHasCritical(isCritical);
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
    }, [userRole, currentUser?.id, departamento]);

    const { moduleInfo, menuOptions } = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'tareas');
        const baseMenuOptions = [
            { configId: 'mis-tareas', id: '/tareas/mis-tareas', label: 'Mis Tareas', icon: 'person_check' },
            { configId: 'activas', id: '/tareas/activas', label: 'Activas', icon: 'radio_button_checked' },
            { configId: 'por-aprobar', id: '/tareas/por-aprobar', label: 'Por Aprobar', icon: 'fact_check' },
            { configId: 'historico-tareas', id: '/tareas/historico', label: 'Historial', icon: 'assignment' }
        ];

        const filteredOptions = baseMenuOptions
            .filter(opt => {
                const childConfig = config?.children?.find(c => c.id === opt.configId);
                return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
            })
            .map(({ configId, label, icon, ...rest }) => {
                const isMisTareas = configId === 'mis-tareas';
                const isPorAprobar = configId === 'por-aprobar';
                const hasBadge = (isMisTareas && unassignedCount > 0) || (isPorAprobar && pendingApprovalCount > 0);
                const isActive = location.pathname.includes(rest.id);
                const showRedAlert = isMisTareas && hasCritical && !isActive;

                const currentCount = isMisTareas ? unassignedCount : pendingApprovalCount;
                const badgeColor = isMisTareas 
                    ? (hasCritical ? 'bg-red-100 !text-red-600 border-red-200 animate-pulse' : 'bg-amber-100 !text-amber-700 border-amber-200')
                    : 'bg-slate-900 !text-white border-slate-800';

                return {
                    ...rest,
                    icon,
                    label: hasBadge ? (
                        <div className={`flex items-center gap-1.5 ${showRedAlert ? '!text-red-500 alert-icon-trigger' : ''}`}>
                            {showRedAlert && (
                                <style>{`button:has(.alert-icon-trigger) .material-symbols-rounded { color: #ef4444 !important; transition: color 0.2s; }`}</style>
                            )}
                            <span className={isActive ? "" : "hidden sm:inline"}>{label}</span>
                            <span className={`relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center leading-none border ${badgeColor}`}>
                                {currentCount > 99 ? '99+' : currentCount}
                            </span>
                        </div>
                    ) : (
                        <span className={`${showRedAlert ? '!text-red-500 font-bold alert-icon-trigger' : ''} ${isActive ? '' : 'hidden sm:inline'}`}>
                            {showRedAlert && (
                                <style>{`button:has(.alert-icon-trigger) .material-symbols-rounded { color: #ef4444 !important; transition: color 0.2s; }`}</style>
                            )}
                            {label}
                        </span>
                    )
                };
            });

        return {
            moduleInfo: {
                title: config?.name || 'Tareas Operativas',
                description: 'Administra, supervisa y resuelve las actividades y acuerdos de las tareas.'
            },
            menuOptions: filteredOptions
        };
    }, [userRole, unassignedCount, hasCritical, location.pathname, pendingApprovalCount]);

    const activePath = menuOptions.find(opt => location.pathname.includes(opt.id))?.id
        || menuOptions[0]?.id
        || '/tareas/mis-tareas';

    return (
        <>
            {/* ── 1. ENCABEZADO ── */}
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
                    {moduleInfo.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    {moduleInfo.description}
                </p>
            </div>

            {/* ── 2. CONTROLES STICKY 100% TRANSPARENTES ── */}
            {menuOptions.length > 0 && (
                <div className="sticky top-0 z-40 mb-3 py-1.5 flex flex-col gap-2.5 items-center justify-center transition-all bg-transparent">
                    <div className="overflow-x-auto no-scrollbar w-full flex justify-center">
                        <GlassViewToggle
                            options={menuOptions}
                            value={activePath}
                            onChange={(newPath) => navigate(newPath)}
                            activeVariant="primary"
                        />
                    </div>
                </div>
            )}

            {/* Selector de Departamento Centrado para ADMIN en Mobile (No Sticky) */}
            {userRole === 'ADMIN' && (
                <div className="flex justify-center mb-3">
                    <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/50 shadow-inner max-w-xs backdrop-blur-md animate-in fade-in duration-300">
                        {['DISEÑO', 'MARKETING'].map(opt => {
                            const val = opt === 'DISEÑO' ? 'DISENO' : 'MARKETING';
                            const isActive = departamento === val;
                            const isMarketing = val === 'MARKETING';
                            return (
                                <button
                                    key={opt}
                                    onClick={() => setDepartamento(val)}
                                    className={`flex items-center gap-1 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                        isActive 
                                            ? `bg-white shadow-sm ring-1 ring-slate-200/50 font-black ${isMarketing ? 'text-purple-600' : 'text-blue-600'}` 
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                                    }`}
                                >
                                    {opt === 'DISEÑO' && <DisenoIcon size={12} />}
                                    {opt === 'MARKETING' && <MarketingIcon size={12} />}
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};
