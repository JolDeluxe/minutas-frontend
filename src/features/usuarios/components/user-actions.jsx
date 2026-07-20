import { TableActions } from '@/components/ui/table-actions';

export const UserActions = ({
    usuario,
    currentUser,
    onViewDetail,
    onEdit,
    onToggleStatus
}) => {
    const esAdmin = currentUser?.rol === "ADMIN";
    const esGerencia = currentUser?.rol === "GERENCIA";
    const esMismoUsuario = currentUser?.id === usuario.id;

    // ADMIN edita de todos los deptos. GERENCIA solo de su propio departamento.
    const esMismoDepto = currentUser?.departamento === usuario.departamento;

    const puedeEditar = esAdmin || (esGerencia && esMismoDepto) || esMismoUsuario;
    const puedeToggle = (esAdmin || (esGerencia && esMismoDepto)) && !esMismoUsuario;

    const estadoActual = usuario.estado || usuario.estatus;

    return (
        <TableActions
            row={usuario}
            actions={[
                {
                    key: "ver_detalle",
                    enabled: true,
                    onClick: onViewDetail,
                },
                {
                    key: "editar",
                    enabled: puedeEditar,
                    onClick: onEdit,
                },
                {
                    key: "toggle_estatus_desactivar",
                    enabled: puedeToggle,
                    hidden: estadoActual !== "ACTIVO",
                    onClick: onToggleStatus,
                },
                {
                    key: "toggle_estatus_activar",
                    enabled: puedeToggle,
                    hidden: estadoActual === "ACTIVO",
                    onClick: onToggleStatus,
                },
            ]}
        />
    );
};