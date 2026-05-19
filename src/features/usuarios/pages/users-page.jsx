// src/features/usuarios/pages/users-page.jsx
import { useState, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useUsers } from '../hooks/use-users';
import { UsersDesktop } from '../views/users-desktop';
import { UsersMobile } from '../views/users-mobile';
import { UserFormModal } from '../components/user-form-modal';

const LIMIT = 10;

const UsersPage = () => {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const {
        users,
        meta,
        loading,
        submitting,
        fetchUsers,
        createUser,
        updateUser,
        toggleStatus,
    } = useUsers();

    // ── Estado de la página ──
    const [query, setQuery] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');
    const [filtroDepartamento, setFiltroDepartamento] = useState('TODOS');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);

    // ── Carga de datos ──
    const loadUsers = useCallback(() => {
        const params = { page, limit: LIMIT };

        if (query) params.q = query;
        if (filtroRol !== 'TODOS') params.rol = filtroRol;
        if (filtroDepartamento !== 'TODOS') params.departamento = filtroDepartamento;
        if (mostrarInactivos) params.estado = 'INACTIVO';
        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }

        return fetchUsers(params).catch(() => notify.error('Error al cargar usuarios.'));
    }, [page, query, filtroRol, filtroDepartamento, sortConfig, mostrarInactivos, fetchUsers]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    // ── Handlers ──
    const handleSearchChange = useCallback((q) => { setQuery(q); setPage(1); }, []);
    const handleFilterChange = useCallback((rol) => { setFiltroRol(rol); setPage(1); }, []);
    const handleDepartamentoChange = useCallback((dep) => { setFiltroDepartamento(dep); setPage(1); }, []);
    const handleSortChange = useCallback((key, direction) => { setSortConfig({ key, direction }); setPage(1); }, []);
    const handleToggleInactivos = useCallback(() => { setMostrarInactivos(prev => !prev); setFiltroRol('TODOS'); setFiltroDepartamento('TODOS'); setPage(1); }, []);

    const handleCreate = async (payload) => {
        try {
            await createUser(payload);
            notify.success('Usuario creado correctamente.');
            setShowCreate(false);
            await loadUsers();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al crear el usuario.';
            notify.error(msg);
            throw err;
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateUser(id, payload);
            notify.success('Usuario actualizado correctamente.');
            await loadUsers();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar el usuario.';
            notify.error(msg);
            throw err;
        }
    };

    const handleToggleStatus = async (id, estatus) => {
        try {
            await toggleStatus(id, estatus);
            const label = estatus === 'ACTIVO' ? 'reactivado' : 'desactivado';
            notify.success(`Usuario ${label} correctamente.`);
            await loadUsers();
        } catch {
            notify.error('Error al cambiar el estatus del usuario.');
        }
    };

    // ── Props compartidos ──
    const sharedViewProps = {
        users,
        loading,
        submitting,
        currentUser,
        page,
        limit: LIMIT,
        totalPages: meta.totalPages,
        totalParaSummary: meta.totalAbsoluto,
        totalParaPaginador: meta.totalFiltrado,
        resumenRoles: meta.resumenRoles,
        sortConfig,
        query,
        filtroRol,
        filtroDepartamento,
        mostrarInactivos,
        onToggleInactivos: handleToggleInactivos,
        onPageChange: setPage,
        onSortChange: handleSortChange,
        onSearchChange: handleSearchChange,
        onFilterChange: handleFilterChange,
        onDepartamentoChange: handleDepartamentoChange,
        onSave: handleUpdate,
        onToggleStatus: handleToggleStatus,
        onRefresh: loadUsers,
        onOpenCreate: () => setShowCreate(true),
    };

    return (
        <div className="max-w-full mx-auto">
            <div className="p-2 lg:p-4">
                {isDesktop
                    ? <UsersDesktop {...sharedViewProps} />
                    : <UsersMobile  {...sharedViewProps} />
                }
            </div>

            <UserFormModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                usuarioAEditar={null}
                currentUser={currentUser}
                submitting={submitting}
                onSuccess={handleCreate}
            />
        </div>
    );
};

export default UsersPage;