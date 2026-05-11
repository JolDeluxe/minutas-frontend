import { TableActions } from "@/components/ui/z_index";

export const UserActions = ({
    usuario,
    currentUser,
    onViewDetail,
    onEdit,
    onToggleStatus
}) => {
    const esMismoUsuario = currentUser?.id === usuario.id;
    const esGerencia = currentUser?.rol === "GERENCIA";

    // Permisos simplificados para el sistema de minutas
    const puedeEditar = esGerencia || esMismoUsuario;
    const puedeToggle = esGerencia && !esMismoUsuario;

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