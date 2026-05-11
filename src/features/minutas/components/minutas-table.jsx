import { Table, Skeleton, Icon } from "@/components/ui/z_index";
import { cn } from "@/utils/cn";

const ESTADO_LABEL = {
    ACTIVA: 'Activa',
    CERRADA: 'Cerrada',
};

const ESTADO_COLORS = {
    ACTIVA: 'bg-green-100 text-green-800 border-green-200',
    CERRADA: 'bg-slate-100 text-slate-600 border-slate-200',
};

const LINEA_MAP = {
    CALZADO: 'Calzado',
    BOTA: 'Bota',
    ROPA: 'Ropa',
    ACCESORIOS: 'Accesorios',
};

export const MinutasTable = ({
    minutas,
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
}) => {
    const columns = [
        {
            header: "ID",
            accessorKey: "id",
            sortable: true,
            headerClassName: "w-[8%] min-w-[60px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-10" />;
                return <span className="font-mono text-slate-500 text-xs">#{row.id}</span>;
            },
        },
        {
            header: "Título",
            accessorKey: "titulo",
            sortable: true,
            headerClassName: "w-[30%] min-w-[200px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-3/4" />;
                return <span className="font-semibold text-slate-900">{row.titulo}</span>;
            },
        },
        {
            header: "Línea Default",
            accessorKey: "lineaDefault",
            sortable: true,
            headerClassName: "w-[15%] min-w-[120px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20" />;
                return <span className="text-sm font-medium text-slate-700">{LINEA_MAP[row.lineaDefault] || row.lineaDefault}</span>;
            },
        },
        {
            header: "Creador",
            accessorKey: "creador",
            sortable: false,
            headerClassName: "w-[15%] min-w-[150px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-32" />;
                return <span className="text-sm text-slate-600">{row.creador?.nombre || 'Desconocido'}</span>;
            },
        },
        {
            header: "Estado",
            accessorKey: "estado",
            sortable: true,
            align: "center",
            headerClassName: "w-[12%] min-w-[100px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-6 w-20 mx-auto rounded-full" />;
                const estadoLabel = ESTADO_LABEL[row.estado] || row.estado;
                const estadoColor = ESTADO_COLORS[row.estado] || 'bg-slate-50 text-slate-600 border-slate-200';
                return (
                    <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border whitespace-nowrap", estadoColor)}>
                        {estadoLabel}
                    </span>
                );
            },
        },
        {
            header: "Entradas",
            accessorKey: "tareas",
            sortable: false,
            align: "center",
            headerClassName: "w-[10%] min-w-[80px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-10 mx-auto" />;
                return <span className="text-sm font-bold text-slate-700">{row._count?.tareas || 0}</span>;
            },
        },
        {
            header: "Acciones",
            accessorKey: "acciones",
            align: "center",
            headerClassName: "w-[10%] min-w-[100px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-8 w-16 mx-auto rounded-md" />;
                return (
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDetail?.(row); }}
                            className="p-1.5 text-slate-400 hover:text-marca-primario transition-colors rounded-md hover:bg-slate-100"
                            title="Ver Detalle"
                        >
                            <Icon name="visibility" size="sm" />
                        </button>
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors rounded-md hover:bg-slate-100"
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
        : minutas;

    return (
        <Table
            columns={columns}
            data={tableData}
            keyField="id"
            loading={false}
            emptyMessage="No se encontraron minutas."
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
