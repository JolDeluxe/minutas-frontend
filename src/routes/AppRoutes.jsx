// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard } from './RoleGuard';

import LoginPage from '@/features/auth/pages/login-page';
import ProfilePage from '@/features/auth/pages/profile-page';
import UsersPage from '@/features/usuarios/pages/users-page';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import WelcomePage from '@/pages/welcome-page';
import NotFound from '@/pages/not-found';

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
          <Route element={<RoleGuard allowedRoles={['GERENCIA']} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>

          {/* TODO: Módulos futuros */}
          {/* <Route path="/minutas" element={<MinutasPage />} /> */}
          {/* <Route path="/entradas" element={<EntradasPage />} /> */}

        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};