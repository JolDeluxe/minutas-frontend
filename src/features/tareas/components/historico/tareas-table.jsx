// src/features/tareas/components/historico/tareas-table.jsx
import { useState } from 'react';
import { Table, Skeleton, Icon } from '@/components/ui/z_index';
import { TareaStatusBadge } from '../common/tarea-status-badge';
import { TareaPriorityBadge } from '../common/tarea-priority-badge';
import { TareaActions } from './tarea-actions';
import { formatFecha, formatFechaRelativa } from '@/lib/date';
import { cn } from '@/utils/cn';
import { LineIconSelector } from '../../../minutas/components/icons/line-icons';
import { LINEA_MAP, AREA_MAP } from '../../../minutas/constants';

const ResponsablesCell = ({ lista }) => {
    const [expanded, setExpanded] = useState(false);

    if (!lista || lista.length === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
                <Icon name="person_off" size="xs" />
                Sin asignar
            </span>
        );
    }

    const mostrar = expanded ? lista : lista.slice(0, 3);
    const extra = lista.length - 3;

    return (
        <div className="flex flex-col gap-2 items-start justify-center">
            {mostrar.map((r) => (
                <div key={r.id} className="flex items-center gap-2" title={r.nombre}>
                    {r.imagen ? (
                        <img
                            src={r.imagen}
                            alt={r.nombre}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario text-xs font-bold border border-marca-primario/20 shrink-0 shadow-sm">
                            {r.nombre?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                    )}
                    <span className="text-sm text-slate-700 font-medium truncate max-w-[120px]">
                        {r.nombre}
                    </span>
                </div>
            ))}
            {extra > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="text-[10px] font-bold text-marca-primario hover:underline ml-9"
                >
                    {expanded ? 'Ver menos' : `+ ${extra} ver más`}
                </button>
            )}
        </div>
    );
};

export const TareasTable = ({
    tareas,
    loading,
    currentUser,
    page,
    totalPages,
    totalItems,
    sortConfig,
    onPageChange,
    onSortChange,
    onChangeStatus,
    onViewDetail,
    onEdit,
    onAssign,
    onReview,
    onCancel,
    hidePagination = false,
    hideResponsables = false,
}) => {
    const columns = [
        {
            header: 'ID',
            accessorKey: 'id',
            sortable: true,
            headerClassName: 'w-[5%] min-w-[50px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-12 rounded-md" />;
                return (
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-mono font-bold text-slate-500">#{row.id}</span>
                    </div>
                );
            },
        },
        {
            header: '',
            accessorKey: 'imagenes',
            sortable: false,
            headerClassName: 'w-[4%] min-w-[44px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-9 w-9 rounded-lg" />;
                if (!row.imagenes || row.imagenes.length === 0) return null;
                return (
                    <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={row.imagenes[0].url} className="w-full h-full object-cover" alt="" />
                        {row.imagenes.length > 1 && (
                            <div className="absolute bottom-0 right-0 px-1 bg-slate-900/80 text-white text-[7px] font-black rounded-tl-md">
                                +{row.imagenes.length - 1}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Descripción de la Entrada',
            accessorKey: 'titulo',
            sortable: true,
            headerClassName: 'w-[30%] min-w-[200px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                );

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                                {row.descripcion}
                            </span>
                            {row.isOverdue && (
                                <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-estado-rechazado bg-estado-rechazado/10 border border-estado-rechazado/20 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                    <Icon name="warning" size="xs" /> ATRASADA
                                </span>
                            )}
                        </div>
                        {row.minuta && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <Icon name="description" size="10px" className="text-slate-300" />
                                <span className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">
                                    {row.minuta.titulo || `Minuta #${row.minutaId}`}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Línea',
            accessorKey: 'linea',
            sortable: true,
            headerClassName: 'w-[10%] min-w-[100px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-20 rounded-md" />;
                if (!row.linea) return <span className="text-xs text-slate-300 italic">N/A</span>;
                return (
                    <div className="flex items-center gap-2">
                        <LineIconSelector type={row.linea} size={16} className="text-slate-600" />
                        <span className="text-xs font-bold text-slate-600">
                            {LINEA_MAP[row.linea]?.label || row.linea}
                        </span>
                    </div>
                );
            },
        },
        ...(hideResponsables ? [] : [{
            header: 'Responsables',
            accessorKey: 'responsables',
            sortable: false,
            headerClassName: 'w-[15%] min-w-[140px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-4 w-24 rounded-md" />;
                return <ResponsablesCell lista={row.responsables} />;
            },
        }]),
        {
            header: 'Estado',
            accessorKey: 'estado',
            sortable: true,
            align: 'center',
            headerClassName: 'w-[12%] min-w-[110px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-5 w-20 mx-auto rounded-md" />;
                return <TareaStatusBadge status={row.estadoOperativo || row.estado} />;
            },
        },
        {
            header: 'Prioridad',
            accessorKey: 'prioridad',
            sortable: true,
            align: 'center',
            headerClassName: 'w-[10%] min-w-[90px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-5 w-14 mx-auto rounded-md" />;
                return <TareaPriorityBadge priority={row.prioridad} />;
            },
        },
        {
            header: 'Vencimiento / Conclusión',
            accessorKey: 'fechaVencimiento',
            sortable: true,
            headerClassName: 'w-[15%] min-w-[150px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-8 w-24 rounded-md" />;

                const isResolvedOrClosed = row.estado === 'COMPLETADO' || row.estado === 'CERRADO';

                if (isResolvedOrClosed) {
                    const fechaFin = row.finalizadoAt || row.updatedAt;
                    return (
                        <div className="flex flex-col gap-0.5 text-[10px] w-full">
                            {row.fechaVencimiento ? (
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-slate-400 font-bold uppercase">Venc:</span>
                                    <span className="text-slate-600 font-medium">{formatFecha(row.fechaVencimiento)}</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 italic">Sin fecha límite</div>
                            )}
                            {fechaFin && (
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-slate-400 font-bold uppercase">Concl:</span>
                                    <span className={cn("font-bold", row.isLate ? "text-red-600" : "text-emerald-600")}>
                                        {formatFecha(fechaFin)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                }

                const textoRelativo = row.fechaVencimiento ? formatFechaRelativa(row.fechaVencimiento) : 'Sin fecha límite';
                const textoAbsoluto = row.fechaVencimiento ? formatFecha(row.fechaVencimiento) : '';
                const mostrarAbsoluto = row.fechaVencimiento && (textoRelativo.toLowerCase() !== textoAbsoluto.toLowerCase());

                return (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <span className={cn('font-medium', row.isOverdue ? 'text-estado-rechazado' : 'text-slate-600')}>
                            {textoRelativo}
                        </span>
                        {mostrarAbsoluto && <span className="text-[10px] text-slate-400">{textoAbsoluto}</span>}
                    </div>
                );
            },
        },
        {
            header: 'Acciones',
            accessorKey: 'acciones',
            align: 'center',
            headerClassName: 'w-[12%] min-w-[50px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex gap-1 justify-center">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-7 rounded-md" />)}
                    </div>
                );
                return (
                    <TareaActions
                        tarea={row}
                        currentUser={currentUser}
                        onViewDetail={onViewDetail}
                        onEdit={onEdit}
                        onAssign={onAssign}
                        onChangeStatus={onChangeStatus}
                        onReview={onReview}
                        onCancel={onCancel}
                    />
                );
            },
        },
    ];

    const tableData = loading
        ? Array.from({ length: 10 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
        : tareas;

    return (
        <div className="w-full">
            <Table
                columns={columns}
                data={tableData}
                keyField="id"
                loading={false}
                emptyMessage="No hay entradas registradas."
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                sortConfig={sortConfig}
                hidePagination={hidePagination}
                rowClassName={(row) =>
                    row.isSkeleton
                        ? 'bg-white'
                        : row.isOverdue
                            ? 'bg-red-50/40 hover:bg-red-50/70'
                            : 'bg-white hover:bg-slate-50'
                }
                onSortChange={(key) => {
                    const direction =
                        sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
                    onSortChange(key, direction);
                }}
            />
        </div>
    );
};
