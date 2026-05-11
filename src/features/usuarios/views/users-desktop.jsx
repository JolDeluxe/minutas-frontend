// src/features/usuarios/views/users-desktop.jsx
import { UsersTable } from '../components/users-table';
import { UserFilterBar } from '../components/user-filter-bar';
import { UserSummaryBar } from '../components/user-summary-bar';
import { UserAddButton } from '../components/user-add-button';

export const UsersDesktop = ({
    users,
    loading,
    submitting,
    currentUser,
    page,
    limit,
    totalPages,
    sortConfig,
    query,
    filtroRol,
    totalParaSummary,
    totalParaPaginador,
    resumenRoles,
    mostrarInactivos,
    onToggleInactivos,
    onPageChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    onSave,
    onToggleStatus,
    onRefresh,
    onOpenCreate,
}) => {
    return (
        <div className="flex flex-col gap-4 relative">

            <UserSummaryBar
                currentUser={currentUser}
                total={totalParaSummary}
                conteos={resumenRoles}
                filtroActual={filtroRol}
                onFilterChange={onFilterChange}
                loading={loading}
                mostrarInactivos={mostrarInactivos}
            />

            <UserAddButton onClick={onOpenCreate} />

            <UserFilterBar
                query={query}
                onSearchChange={onSearchChange}
                mostrarInactivos={mostrarInactivos}
                onToggleInactivos={onToggleInactivos}
            />

            <UsersTable
                usuarios={users}
                loading={loading}
                submitting={submitting}
                currentUser={currentUser}
                page={page}
                limit={limit}
                totalPages={totalPages}
                totalItems={totalParaPaginador}
                sortConfig={sortConfig}
                onPageChange={onPageChange}
                onSortChange={onSortChange}
                onSave={onSave}
                onToggleStatus={onToggleStatus}
                onRefresh={onRefresh}
            />
        </div>
    );
};