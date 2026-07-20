import { useState } from 'react';
import { GlassFab, GlassPaginationPill, GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { UserFormModal } from '../components/user-form-modal';
import { UserStatusModal } from '../components/user-status-modal';
import { UserDetailModal } from '../components/user-detail-modal';
import { UserSummaryBar } from '../components/user-summary-bar';
import { UserFilterBar } from '../components/user-filter-bar';
import { UsersTable } from '../components/users-table';
import { MobileUserCardsContent } from '../components/mobile-user-cards-content';
import { cn } from '@/utils/cn';

export const UsersMobile = ({
    users,
    loading,
    submitting,
    currentUser,
    page,
    limit,
    totalPages,
    totalParaSummary,
    totalParaPaginador,
    resumenRoles,
    filtroRol,
    filtroDepartamento,
    query,
    sortConfig,
    mostrarInactivos,
    onPageChange,
    onSortChange,
    onSave,
    onToggleStatus,
    onRefresh,
    onOpenCreate,
    onFilterChange,
    onSearchChange,
    onDepartamentoChange,
    onToggleInactivos,
}) => {
    const [viewMode, setViewMode] = useState('cards');
    const [editTarget, setEditTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);

    const hasContent = !loading && users.length > 0;
    const hasPaginator = hasContent && totalPages > 1;

    const handleStatusConfirm = async () => {
        if (!statusTarget) return;
        const nuevoEstado = statusTarget.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        await onToggleStatus(statusTarget.id, nuevoEstado);
        setStatusTarget(null);
    };

    const fabAddBottom = hasPaginator ? '104px' : '84px';

    return (
        <>
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                    Usuarios
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    Gestiona los usuarios y sus niveles de acceso.
                </p>
            </div>

            <div className="mb-3">
                <UserSummaryBar
                    currentUser={currentUser}
                    total={totalParaSummary}
                    conteos={resumenRoles}
                    filtroActual={filtroRol}
                    onFilterChange={onFilterChange}
                    loading={loading}
                    mostrarInactivos={mostrarInactivos}
                />
            </div>

            <div className="mb-3 flex flex-col gap-2">
                <UserFilterBar
                    query={query}
                    onSearchChange={onSearchChange}
                    departamentoFilter={filtroDepartamento}
                    onDepartamentoChange={onDepartamentoChange}
                    mostrarInactivos={mostrarInactivos}
                    onToggleInactivos={onToggleInactivos}
                    currentUser={currentUser}
                    mobileSearchOnly
                />

                <div className="flex items-center justify-between">
                    <button
                        onClick={onToggleInactivos}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0",
                            mostrarInactivos
                                ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100"
                                : "bg-white border-slate-200 text-slate-600"
                        )}
                    >
                        {mostrarInactivos ? '✕ Inactivos' : 'Ver Inactivos'}
                    </button>
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {viewMode === 'cards' ? (
                <MobileUserCardsContent
                    users={users}
                    loading={loading}
                    currentUser={currentUser}
                    hasPaginator={hasPaginator}
                    onEdit={setEditTarget}
                    onToggleStatus={setStatusTarget}
                    onViewDetail={setDetailTarget}
                />
            ) : (
                <div className={cn('mb-40', hasPaginator && 'mb-52')}>
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
                        onRecargar={onRefresh}
                        hidePagination
                    />
                </div>
            )}

            {hasPaginator && (
                <GlassPaginationPill
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalParaPaginador}
                    onPageChange={onPageChange}
                    loading={loading}
                    bottom="80px"
                />
            )}

            <GlassFab
                icon="add"
                onClick={onOpenCreate}
                variant="primary"
                size={56}
                bottom={fabAddBottom}
                right="20px"
            />

            <ScrollToTopButton bottom={fabAddBottom} left="20px" />

            <UserFormModal
                isOpen={Boolean(editTarget)}
                onClose={() => setEditTarget(null)}
                usuarioAEditar={editTarget}
                currentUser={currentUser}
                submitting={submitting}
                onSuccess={async (payload) => {
                    await onSave(editTarget.id, payload);
                    setEditTarget(null);
                }}
            />

            <UserStatusModal
                isOpen={Boolean(statusTarget)}
                onClose={() => setStatusTarget(null)}
                onConfirm={handleStatusConfirm}
                usuario={statusTarget}
                submitting={submitting}
            />

            <UserDetailModal
                isOpen={Boolean(detailTarget)}
                onClose={() => setDetailTarget(null)}
                usuario={detailTarget}
            />
        </>
    );
};