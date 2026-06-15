// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard } from './RoleGuard';
import { MODULES_CONFIG } from '@/config/modules-config';

import LoginPage from '@/features/auth/pages/login-page';
import ProfilePage from '@/features/auth/pages/profile-page';
import UsersPage from '@/features/usuarios/pages/users-page';
import PoliticasPage from '@/features/politicas/pages/politicas-page';
import RecordatoriosPage from '@/features/recordatorios/pages/recordatorios-page';
import MinutasPage from '@/features/minutas/pages/minutas-page';
import MinutaDetailPage from '@/features/minutas/pages/minuta-detail-page';
import MinutaExternaDetailPage from '@/features/minutas/pages/minuta-externa-detail-page';

import TareasPage from '@/features/tareas/pages/tareas-page';
import MisTareasPage from '@/features/tareas/pages/mis-tareas-page';
import ActivasPage from '@/features/tareas/pages/activas-page';
import HistoricoPage from '@/features/tareas/pages/historico-page';
import PorAprobarPage from '@/features/tareas/pages/por-aprobar-page';

import NotifyPage from '@/features/notificaciones/pages/notify-page';
import TareasGeneralesPage from '@/features/tareas_generales/pages/tareas-generales-page';


import { DashboardLayout } from '@/layouts/dashboard-layout';
import WelcomePage from '@/pages/welcome-page';
import NotFound from '@/pages/not-found';

import { RedireccionIndiceTareas } from '@/features/tareas/components/comun/redireccion-indice-tareas';

const ROLES = {
  minutas: MODULES_CONFIG.find(m => m.id === 'minutas')?.allowedRoles || [],
  usuarios: MODULES_CONFIG.find(m => m.id === 'usuarios')?.allowedRoles || [],
  politicas: MODULES_CONFIG.find(m => m.id === 'politicas')?.allowedRoles || [],
  recordatorios: MODULES_CONFIG.find(m => m.id === 'recordatorios')?.allowedRoles || [],
  tareas: MODULES_CONFIG.find(m => m.id === 'tareas')?.allowedRoles || [],
  misTareas: MODULES_CONFIG.find(m => m.id === 'tareas')?.children?.find(c => c.id === 'mis-tareas')?.allowedRoles || [],
  activas: MODULES_CONFIG.find(m => m.id === 'tareas')?.children?.find(c => c.id === 'activas')?.allowedRoles || [],
  historicoTareas: MODULES_CONFIG.find(m => m.id === 'tareas')?.children?.find(c => c.id === 'historico-tareas')?.allowedRoles || [],
  porAprobar: MODULES_CONFIG.find(m => m.id === 'tareas')?.children?.find(c => c.id === 'por-aprobar')?.allowedRoles || [],
  notificaciones: MODULES_CONFIG.find(m => m.id === 'notificaciones')?.allowedRoles || [],
  tareasGenerales: MODULES_CONFIG.find(m => m.id === 'tareas-generales')?.allowedRoles || [],
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Pantalla principal después del login */}
          <Route index element={<WelcomePage />} />

          <Route path="/perfil" element={<ProfilePage />} />

          {/* Módulo: Usuarios (solo GERENCIA) */}
          <Route element={<RoleGuard allowedRoles={ROLES.usuarios} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>

          {/* Módulo: Políticas (solo ADMIN y GERENCIA) */}
          <Route element={<RoleGuard allowedRoles={ROLES.politicas} />}>
            <Route path="/politicas" element={<PoliticasPage />} />
          </Route>

          {/* Módulo: Recordatorios (solo ADMIN, GERENCIA y JEFE) */}
          <Route element={<RoleGuard allowedRoles={ROLES.recordatorios} />}>
            <Route path="/recordatorios" element={<RecordatoriosPage />} />
          </Route>

          {/* Módulo: Minutas */}
          <Route element={<RoleGuard allowedRoles={ROLES.minutas} />}>
            <Route path="/minutas" element={<MinutasPage />} />
            <Route path="/minutas/:id" element={<MinutaDetailPage />} />
            <Route path="/minutas-externas/:id" element={<MinutaExternaDetailPage />} />
          </Route>

          {/* Módulo: Notificaciones */}
          <Route element={<RoleGuard allowedRoles={ROLES.notificaciones} />}>
            <Route path="/notificaciones" element={<NotifyPage />} />
          </Route>

          {/* Módulo: Tareas Generales (solo ADMIN) */}
          <Route element={<RoleGuard allowedRoles={ROLES.tareasGenerales} />}>
            <Route path="/tareas-generales" element={<TareasGeneralesPage />} />
          </Route>

          {/* Módulo: Tareas */}
          <Route element={<RoleGuard allowedRoles={ROLES.tareas} />}>
            <Route path="/tareas" element={<TareasPage />}>
              <Route index element={<RedireccionIndiceTareas />} />
              
              <Route element={<RoleGuard allowedRoles={ROLES.misTareas} />}>
                <Route path="mis-tareas" element={<MisTareasPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.activas} />}>
                <Route path="activas" element={<ActivasPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.historicoTareas} />}>
                <Route path="historico" element={<HistoricoPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={ROLES.porAprobar} />}>
                <Route path="por-aprobar" element={<PorAprobarPage />} />
              </Route>
            </Route>
          </Route>

        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};