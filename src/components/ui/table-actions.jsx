// src/components/ui/table-actions.jsx
import { cn } from "@/utils/cn";
import { Icon } from "./icon";
import { Tooltip } from "./tooltip";

const ACTION_CONFIG = {
    ver_detalle: {
        icon: "visibility",
        tooltip: "Ver detalles",
        variant: "dark",
        className: "text-slate-600 hover:bg-slate-600/10",
    },
    editar: {
        icon: "edit",
        tooltip: "Editar",
        variant: "dark",
        className: "text-amber-500 hover:bg-amber-500/10",
    },
    borrar: {
        icon: "delete",
        tooltip: "Borrar",
        variant: "dark",
        className: "text-estado-rechazado hover:bg-estado-rechazado/10",
    },
    entregar: {
        icon: "check",
        tooltip: "Entregar para Revisión",
        variant: "dark",
        className: "text-amber-500 hover:bg-amber-500/10",
    },
    aprobar: {
        icon: "verified",
        tooltip: "Aprobar y Cerrar",
        variant: "dark",
        className: "text-emerald-600 hover:bg-emerald-600/10",
    },
    forzar_cierre_tarea: {
        icon: "gavel",
        tooltip: "Forzar Cierre (Sin Entrega)",
        variant: "error",
        className: "text-rose-600 hover:bg-rose-600/10",
    },
    toggle_estatus_desactivar: {
        icon: "person_remove",
        tooltip: "Desactivar usuario",
        variant: "dark",
        className: "text-estado-rechazado hover:bg-estado-rechazado/10",
    },
    toggle_estatus_activar: {
        icon: "person_add",
        tooltip: "Activar usuario",
        variant: "dark",
        className: "text-estado-resuelto hover:bg-estado-resuelto/10",
    },
    descargar_pdf: {
        icon: "picture_as_pdf",
        tooltip: "Descargar PDF",
        variant: "dark",
        className: "text-red-600 hover:bg-red-50",
    },
    // ── Acciones de Tickets ──
    asignar_tecnico: {
        icon: "engineering",
        tooltip: "Asignar técnico",
        variant: "dark",
        className: "text-estado-asignada hover:bg-estado-asignada/10",
    },
    cambiar_estado: {
        icon: "swap_horiz",
        tooltip: "Cambiar estado",
        variant: "dark",
        className: "text-estado-en-progreso hover:bg-estado-en-progreso/10",
    },
    revisar_ticket: {
        icon: "fact_check",
        tooltip: "Revisar",
        variant: "dark",
        className: "text-estado-resuelto hover:bg-estado-resuelto/10",
    },
    cancelar_ticket: {
        icon: "cancel",
        tooltip: "Cancelar ticket",
        variant: "error",
        className: "text-red-700 hover:bg-red-500/10",
    },
};

export const TableActions = ({ row, actions = [] }) => {
    return (
        <div className="flex items-center justify-center gap-1.5">
            {actions.map(({ key, enabled, hidden, onClick, tooltip: tooltipOverride, isLoading, iconOverride }) => {
                if (hidden || !enabled) return null;

                const config = ACTION_CONFIG[key];
                if (!config) return null;

                const tooltip = tooltipOverride ?? config.tooltip;
                const finalIcon = isLoading ? "hourglass_empty" : (iconOverride || config.icon);

                return (
                    <Tooltip
                        key={key}
                        text={tooltip}
                        variant={config.variant || 'default'}
                        // Reducción drástica del tamaño del Tooltip:
                        className="text-[13px] px-2 py-0.5 font-bold tracking-tight"
                    >
                        <button
                            disabled={isLoading}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick?.(row);
                            }}
                            className={cn(
                                "p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed", // Padding del botón intacto
                                config.className
                            )}
                        >
                            <Icon name={finalIcon} size="sm" className={isLoading ? "animate-spin" : ""} />
                        </button>
                    </Tooltip>
                );
            })}
        </div>
    );
};