import { Table, Skeleton, Icon } from "@/components/ui/z_index";
import { cn } from "@/utils/cn";
import { LINEA_MAP } from '../constants';
import { LineIconSelector } from './icons/line-icons';

const ESTADO_LABEL = {
    ACTIVA: 'Activa',
    CERRADA: 'Cerrada',
};

const ESTADO_COLORS = {
    ACTIVA: 'bg-green-100 text-green-800 border-green-200',
    CERRADA: 'bg-slate-100 text-slate-600 border-slate-200',
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
    ultimaJuntaId,
    juntaAnteriorId,
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
                const isCurrent = row.id === ultimaJuntaId;
                const isPrevious = row.id === juntaAnteriorId;
                return (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{row.titulo}</span>
                        {isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/40 whitespace-nowrap">
                                Junta Actual
                            </span>
                        )}
                        {isPrevious && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/40 whitespace-nowrap">
                                Anterior
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: "Línea Default",
            accessorKey: "lineaDefault",
            sortable: true,
            headerClassName: "w-[15%] min-w-[120px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20" />;
                return (
                    <div className="flex items-center gap-2">
                        <LineIconSelector type={row.lineaDefault} size={16} className="text-slate-900" />
                        <span className="text-sm font-medium text-slate-700">
                            {LINEA_MAP[row.lineaDefault]?.label || row.lineaDefault}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Progreso",
            accessorKey: "progreso",
            sortable: false,
            headerClassName: "w-[18%] min-w-[160px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-32" />;
                const resumen = row.resumenOperativo || {};
                const total = resumen.totalEntradas || row._count?.tareas || 0;
                const porcentaje = resumen.porcentajeCompletado || 0;
                const atrasadas = resumen.atrasadas || 0;
                const completadas = (resumen.completadas || 0) + (resumen.cerradas || 0);
                const enProgreso = resumen.enProgreso || 0;

                if (total === 0) {
                    return (
                        <span className="text-xs text-slate-400 italic">Sin entradas</span>
                    );
                }

                return (
                    <div className="flex flex-col w-full max-w-[150px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-500">
                                {porcentaje}%
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400">
                                {completadas}/{total} entr.
                            </span>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div 
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${porcentaje}%` }}
                            />
                        </div>
                        {(enProgreso > 0 || atrasadas > 0) && (
                            <div className="flex items-center gap-1.5 mt-1">
                                {enProgreso > 0 && (
                                    <div className="flex items-center gap-0.5" title="En progreso">
                                        <div className="w-1 h-1 rounded-full bg-amber-400" />
                                        <span className="text-[8px] font-bold font-mono text-slate-400">{enProgreso}</span>
                                    </div>
                                )}
                                {atrasadas > 0 && (
                                    <div className="flex items-center gap-0.5" title="Atrasadas">
                                        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[8px] font-black font-mono text-red-500">{atrasadas}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
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
