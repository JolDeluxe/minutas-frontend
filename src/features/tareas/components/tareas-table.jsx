import { Table, Skeleton, Icon } from "@/components/ui/z_index";
import { cn } from "@/utils/cn";

const ESTADO_TAREA_LABEL = {
    NUEVO: 'Nueva',
    PENDIENTE: 'Pendiente',
    EN_PROGRESO: 'En Progreso',
    COMPLETADO: 'Completada',
    CANCELADO: 'Cancelada',
};

const ESTADO_TAREA_COLOR = {
    NUEVO: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    EN_PROGRESO: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    COMPLETADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELADO: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const TareasTable = ({
    tareas,
    loading,
    page,
    totalPages,
    totalItems,
    limit = 20,
    onPageChange,
    sortConfig,
    onSortChange,
    onViewDetail,
    onEdit,
    onOrganize,
}) => {
    const columns = [
        {
            header: "ID",
            accessorKey: "id",
            sortable: true,
            headerClassName: "w-[6%] min-w-[60px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-10" />;
                return <span className="font-mono text-slate-500 text-xs">#{row.id}</span>;
            },
        },
        {
            header: "Descripción",
            accessorKey: "descripcion",
            sortable: true,
            headerClassName: "w-[30%] min-w-[200px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-3/4" />;
                return <span className="text-sm font-medium text-slate-900 line-clamp-2">{row.descripcion}</span>;
            },
        },
        {
            header: "Área",
            accessorKey: "area",
            sortable: true,
            headerClassName: "w-[15%] min-w-[120px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20" />;
                return <span className="text-sm text-slate-600">{row.area || 'N/A'}</span>;
            },
        },
        {
            header: "Minuta",
            accessorKey: "minutaId",
            sortable: true,
            headerClassName: "w-[10%] min-w-[80px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-12" />;
                return row.minutaId ? (
                    <span className="font-mono text-xs text-slate-500">#{row.minutaId}</span>
                ) : (
                    <span className="text-xs text-slate-400 italic">Libre</span>
                );
            },
        },
        {
            header: "Estado",
            accessorKey: "estado",
            sortable: true,
            align: "center",
            headerClassName: "w-[12%] min-w-[110px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-6 w-20 mx-auto rounded-full" />;
                const estadoLabel = ESTADO_TAREA_LABEL[row.estado] || row.estado;
                const estadoColor = ESTADO_TAREA_COLOR[row.estado] || 'bg-slate-50 text-slate-600 border-slate-200';
                return (
                    <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border whitespace-nowrap", estadoColor)}>
                        {estadoLabel}
                    </span>
                );
            },
        },
        {
            header: "Vencimiento",
            accessorKey: "fechaVencimiento",
            sortable: true,
            align: "center",
            headerClassName: "w-[15%] min-w-[110px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20 mx-auto" />;
                return row.fechaVencimiento ? (
                    <span className="text-xs text-slate-600">{new Date(row.fechaVencimiento).toLocaleDateString()}</span>
                ) : (
                    <span className="text-xs text-slate-400 italic">N/A</span>
                );
            },
        },
        {
            header: "Acciones",
            accessorKey: "acciones",
            align: "center",
            headerClassName: "w-[12%] min-w-[120px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-8 w-20 mx-auto rounded-md" />;
                return (
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDetail?.(row); }}
                            className="p-1.5 text-slate-400 hover:text-marca-primario transition-colors rounded-md hover:bg-slate-100"
                            title="Ver Detalle"
                        >
                            <Icon name="visibility" size="sm" />
                        </button>
                        {onOrganize && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onOrganize?.(row); }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50"
                                title="Organizar"
                            >
                                <Icon name="low_priority" size="sm" />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors rounded-md hover:bg-amber-50"
                                title="Editar"
                            >
                                <Icon name="edit" size="sm" />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    const tableData = loading
        ? Array.from({ length: limit }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
        : tareas;

    return (
        <Table
            columns={columns}
            data={tableData}
            keyField="id"
            loading={false}
            emptyMessage="No se encontraron entradas/tareas."
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
            sortConfig={sortConfig}
            onSortChange={(key) => {
                const direction = sortConfig?.key === key && sortConfig?.direction === "asc" ? "desc" : "asc";
                onSortChange(key, direction);
            }}
            onRowClick={onViewDetail}
        />
    );
};
