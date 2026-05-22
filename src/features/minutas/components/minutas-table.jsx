import { Table, Skeleton, Icon } from "@/components/ui/z_index";
import { cn } from "@/utils/cn";
import { LINEA_MAP } from '../constants';
import { LineIconSelector } from './icons/line-icons';

const ESTADO_LABEL = {
    PROGRAMADA: 'Programada',
    ACTIVA: 'Activa',
    CERRADA: 'Cerrada',
    CANCELADA: 'Cancelada',
};

const ESTADO_COLORS = {
    PROGRAMADA: 'bg-blue-50 text-blue-700 border-blue-200',
    ACTIVA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CERRADA: 'bg-slate-100 text-slate-500 border-slate-200',
    CANCELADA: 'bg-red-50 text-red-700 border-red-200',
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
    isAdmin = false,
    hidePagination = false,
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
                const dept = row.departamento || row.creadoPor?.departamento;
                const isMarketing = dept === 'MARKETING';
                
                const isCurrent = ultimaJuntaId && (typeof ultimaJuntaId === 'object' 
                    ? row.id === (isMarketing ? ultimaJuntaId.MARKETING : ultimaJuntaId.DISENO)
                    : row.id === ultimaJuntaId);
                const isPrevious = juntaAnteriorId && (typeof juntaAnteriorId === 'object' 
                    ? row.id === (isMarketing ? juntaAnteriorId.MARKETING : ultimaJuntaId.DISENO)
                    : row.id === juntaAnteriorId);

                return (
                    <div className="flex items-center gap-2 flex-wrap">
                        {isAdmin && (
                            <span className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border whitespace-nowrap",
                                isMarketing 
                                    ? "bg-purple-50 text-purple-700 border-purple-200/60" 
                                    : "bg-blue-50 text-blue-700 border-blue-200/60"
                            )}>
                                {isMarketing ? 'Marketing' : 'Diseño'}
                            </span>
                        )}
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
            header: "Línea",
            accessorKey: "lineaDefault",
            sortable: true,
            align: "center",
            headerClassName: "w-[15%] min-w-[120px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20 mx-auto" />;

                const isMarketing = row.creadoPor?.departamento === 'MARKETING';

                const lineInfo = isMarketing
                    ? { label: 'Campaña', color: '#8b5cf6' }
                    : (LINEA_MAP[row.lineaDefault] || {
                        label: row.lineaDefault,
                        color: '#64748b'
                    });

                return (
                    <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center">
                            {isMarketing ? (
                                <Icon
                                    name="campaign"
                                    size="32px"
                                    style={{ color: lineInfo.color }}
                                />
                            ) : (
                                <LineIconSelector
                                    type={row.lineaDefault}
                                    size={70}
                                    style={{ color: lineInfo.color }}
                                />
                            )}
                        </div>

                        <span
                            className="text-[7px] font-black uppercase tracking-widest font-mono leading-none text-center"
                            style={{ color: lineInfo.color }}
                        >
                            {lineInfo.label}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Progreso",
            accessorKey: "progreso",
            sortable: false,
            align: "center",
            headerClassName: "w-[18%] min-w-[180px]",
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-5 w-40" />;

                const resumen = row.resumenOperativo || {};

                const totalTareas =
                    (resumen.completadas || 0) +
                    (resumen.cerradas || 0) +
                    (resumen.pendientes || 0);

                const porcentaje = resumen.porcentajeCompletado || 0;
                const atrasadas = resumen.atrasadas || 0;
                const completadas =
                    (resumen.completadas || 0) +
                    (resumen.cerradas || 0);

                const enProgreso = resumen.enProgreso || 0;

                if (totalTareas === 0) {
                    return (
                        <span className="text-sm text-slate-400 italic">
                            Sin tareas
                        </span>
                    );
                }

                return (
                    <div className="flex flex-col w-full max-w-[300px]">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-500">
                                {porcentaje}%
                            </span>

                            <span className="text-[10px] font-semibold text-slate-400">
                                {completadas}/{totalTareas} tareas
                            </span>
                        </div>

                        <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={cn(
                                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                                    porcentaje < 100
                                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                        : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                )}
                                style={{ width: `${porcentaje}%` }}
                            />
                        </div>

                        {(enProgreso > 0 || atrasadas > 0) && (
                            <div className="flex items-center gap-2 mt-1.5">
                                {enProgreso > 0 && (
                                    <div
                                        className="flex items-center gap-1"
                                        title="En progreso"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />

                                        <span className="text-[9px] font-bold font-mono text-slate-400">
                                            {enProgreso}
                                        </span>
                                    </div>
                                )}

                                {atrasadas > 0 && (
                                    <div
                                        className="flex items-center gap-1"
                                        title="Atrasadas"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />

                                        <span className="text-[9px] font-black font-mono text-red-500">
                                            {atrasadas}
                                        </span>
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
                    <span className={cn("flex items-center justify-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border whitespace-nowrap mx-auto w-fit", estadoColor)}>
                        {row.estado === 'ACTIVA' && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        )}
                        {estadoLabel}
                    </span>
                );
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
            page={hidePagination ? undefined : page}
            totalPages={hidePagination ? undefined : totalPages}
            totalItems={hidePagination ? undefined : totalItems}
            onPageChange={hidePagination ? undefined : onPageChange}
            sortConfig={sortConfig}
            onSortChange={(key) => {
                const direction = sortConfig?.key === key && sortConfig?.direction === "asc" ? "desc" : "asc";
                onSortChange(key, direction);
            }}
            onRowClick={onViewDetail}
            rowClassName={(row) => {
                if (row.isSkeleton) return 'bg-white';
                if (!isAdmin) return 'bg-white hover:bg-slate-50';
                const isMarketing = row.creadoPor?.departamento === 'MARKETING' || row.departamento === 'MARKETING';
                return isMarketing 
                    ? 'bg-purple-50 hover:bg-purple-100 border-b border-purple-200 text-slate-800' 
                    : 'bg-blue-50 hover:bg-blue-100 border-b border-blue-200 text-slate-800';
            }}
        />
    );
};
