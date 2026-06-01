import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Table, Skeleton, Icon } from '@/components/ui/z_index';
import { EtiquetaEstadoTarea } from './etiqueta-estado-tarea';
import { EtiquetaPrioridadTarea } from './etiqueta-prioridad-tarea';
import { AccionesTablaTarea } from './acciones-tabla-tarea';
import { formatFecha, formatFechaRelativa } from '@/lib/date';
import { cn } from '@/utils/cn';
import { LineIconSelector, MarketingIcon } from '../../../minutas/components/icons/line-icons';
import { LINEA_MAP, AREA_MAP } from '../../../minutas/constants';
import { Tooltip } from '@/components/ui/z_index';
import { ImageViewer } from './tarjeta-tarea';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const TableImagePreview = ({ images, onClick }) => {
  const isDesktop = useIsDesktop();
  const [showHover, setShowHover] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return <span className="text-[11px] text-slate-300">-</span>;
  
  const currentImg = images[currentIndex]?.preview || images[currentIndex]?.url;

  const handleMouseEnter = () => {
    if (!isDesktop) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const xPos = spaceRight > 420 ? rect.right + 25 : rect.left - 410;
      
      setCoords({
        x: xPos,
        y: Math.max(200, Math.min(window.innerHeight - 200, rect.top + (rect.height / 2)))
      });
      setShowHover(true);
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="relative flex items-center justify-center p-1" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={() => setShowHover(false)}
    >
      <div 
        className="h-28 w-28 min-w-[7rem] shrink-0 rounded-2xl border-2 border-slate-100 bg-white relative z-10 cursor-pointer p-1 hover:border-marca-primario/30 transition-all group" 
        onClick={(e) => { 
          e.stopPropagation(); 
          setShowHover(false); 
          onClick?.(e); 
        }}
      >
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm">
          {images.map((img, i) => (
            <img 
              key={i}
              src={img.preview || img.url} 
              alt={`Preview ${i}`} 
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out group-hover:scale-110",
                i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            />
          ))}
        </div>
        
        {images.length > 1 && (
          <div className="absolute top-1.5 right-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 text-[9px] font-black text-white rounded-lg z-20 shadow-lg border border-white/20">
            {currentIndex + 1}/{images.length} FOTOS
          </div>
        )}

        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
           <Icon name="zoom_in" size="24px" className="text-white drop-shadow-md" />
        </div>
      </div>

      {showHover && isDesktop && createPortal(
        <div 
          className="fixed z-99999 pointer-events-none animate-in fade-in zoom-in-95 duration-200" 
          style={{ 
            left: coords.x, 
            top: coords.y, 
            transform: 'translateY(-50%)' 
          }}
        >
          <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.35)] border border-slate-200 w-[380px] h-[380px] flex flex-col items-center justify-center relative overflow-hidden ring-4 ring-slate-100/50">
            <img src={currentImg} alt="Preview Zoom" className="w-full h-full object-contain rounded-3xl drop-shadow-xl" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl">
               Previsualización Rápida
            </div>
          </div>
        </div>, 
        document.body
      )}
    </div>
  );
};

const ResponsablesCell = ({ lista }) => {
    if (!lista || lista.length === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-slate-300 italic">
                —
            </span>
        );
    }

    const tooltipText = lista.map(r => r.nombre).join('\n');

    return (
        <div className="flex justify-center">
            <Tooltip text={tooltipText} position="top" className="whitespace-pre-line text-left">
                <div className="flex -space-x-3 cursor-help py-1">
                    {lista.map((r) => (
                        <div 
                            key={r.id} 
                            className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-md shrink-0 ring-1 ring-slate-200 transition-all hover:scale-110 hover:z-30"
                        >
                            {r.imagen ? (
                                <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" />
                            ) : (
                                r.nombre?.charAt(0)
                            )}
                        </div>
                    ))}
                </div>
            </Tooltip>
        </div>
    );
};

export const TablaTareas = ({
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
    onDelete,
    isPorAprobar = false,
}) => {
    const [viewerIndex, setViewerIndex] = useState(null);
    const [activeEntryImages, setActiveEntryImages] = useState([]);

    const openViewer = (images) => {
        setActiveEntryImages(images);
        setViewerIndex(0);
    };
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
            header: 'Adjuntos',
            accessorKey: 'imagenes',
            sortable: false,
            headerClassName: 'w-[10%] min-w-[150px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-28 w-28 rounded-2xl mx-auto" />;
                const captureImages = row.imagenes?.filter(img => img.tipo !== 'EVIDENCIA') || [];
                return (
                    <TableImagePreview 
                        images={captureImages} 
                        onClick={() => openViewer(captureImages)} 
                    />
                );
            },
        },
        {
            header: 'Descripción de la Tarea',
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

                const isMarketing = row.departamento === 'MARKETING';

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                            {['ADMIN', 'GERENCIA', 'JEFE'].includes(currentUser?.rol) && (
                                <span className={cn(
                                    "inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border whitespace-nowrap",
                                    isMarketing 
                                        ? "bg-purple-100/50 text-purple-700 border-purple-200/40" 
                                        : "bg-blue-50 text-blue-700 border-blue-200/60"
                                )}>
                                    {isMarketing ? 'Marketing' : 'Diseño'}
                                </span>
                            )}
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
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <Icon name="description" size="10px" className="text-slate-300 shrink-0" />
                                <span className="text-[10px] text-slate-400 font-bold break-words whitespace-normal leading-tight max-w-[320px]" title={row.minuta.titulo}>
                                    {row.minuta.titulo || `Minuta #${row.minutaId}`}
                                </span>
                                {row.minuta.isJuntaActual && (
                                    <span className="inline-flex items-center px-1 py-px rounded-full text-[7px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/40 whitespace-nowrap shadow-sm">
                                        Junta Actual
                                    </span>
                                )}
                                {row.minuta.isJuntaAnterior && (
                                    <span className="inline-flex items-center px-1 py-px rounded-full text-[7px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/40 whitespace-nowrap shadow-sm">
                                        Anterior
                                    </span>
                                )}
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
            align: 'center',
            headerClassName: 'w-[10%] min-w-[100px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-10 w-10 rounded-full mx-auto" />;
                
                const isMarketing = row.departamento === 'MARKETING';
                const lineInfo = isMarketing 
                    ? { label: 'Marketing', color: '#7c3aed' } 
                    : (LINEA_MAP[row.linea] || { label: row.linea || '—', color: '#64748b' });

                return (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                        <div className="flex items-center justify-center">
                            {isMarketing ? (
                                <MarketingIcon size={50} style={{ color: lineInfo.color }} />
                            ) : (
                                <LineIconSelector type={row.linea} size={50} style={{ color: lineInfo.color }} />
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
        ...(hideResponsables ? [] : [{
            header: 'Responsables',
            accessorKey: 'responsables',
            align: 'center',
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
                // SOLUCIÓN: Usamos row.estado siempre para evitar la inconsistencia con estadoOperativo
                return <EtiquetaEstadoTarea status={row.estado} />;
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
                return <EtiquetaPrioridadTarea priority={row.prioridad} />;
            },
        },
        {
            header: 'Vencimiento / Conclusión',
            accessorKey: 'fechaVencimiento',
            sortable: true,
            headerClassName: 'w-[15%] min-w-[150px]',
            cell: (row) => {
                if (row.isSkeleton) return <Skeleton className="h-8 w-24 rounded-md" />;

                const isResolvedOrClosed = row.estado === 'EN_REVISION' || row.estado === 'CERRADA';

                if (isResolvedOrClosed) {
                    const fechaFin = row.completadoAt || row.cerradoAt || row.updatedAt;
                    return (
                        <div className="flex flex-col gap-0.5 text-[10px] w-full">
                            {row.fechaVencimiento ? (
                                <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-bold uppercase">Venc:</span>
                                    <span className="text-slate-600 font-medium">{formatFecha(row.fechaVencimiento)}</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 italic">Sin fecha límite</div>
                            )}
                            {fechaFin && (
                                <div className="flex items-center gap-1">
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
            headerClassName: 'w-[12%] min-w-[140px]',
            cell: (row) => {
                if (row.isSkeleton) return (
                    <div className="flex gap-1 justify-center">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-7 rounded-md" />)}
                    </div>
                );
                return (
                    <AccionesTablaTarea
                        tarea={row}
                        currentUser={currentUser}
                        onViewDetail={onViewDetail}
                        onEdit={onEdit}
                        onAssign={onAssign}
                        onChangeStatus={onChangeStatus}
                        onReview={onReview}
                        onCancel={onCancel}
                        onDelete={onDelete}
                        isPorAprobar={isPorAprobar}
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
                emptyMessage="No hay tareas registradas."
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                sortConfig={sortConfig}
                hidePagination={hidePagination}
                rowClassName={(row) => {
                    if (row.isSkeleton) return 'bg-white';
                    const estadoFinal = ['CERRADA', 'CANCELADA', 'DESCARTADA'].includes(row.estado?.toUpperCase());
                    if (estadoFinal) return 'opacity-70 grayscale bg-slate-50/50';
                    const isAdmin = ['ADMIN', 'GERENCIA', 'JEFE'].includes(currentUser?.rol);
                    if (!isAdmin) {
                        return row.isOverdue
                            ? 'bg-red-50/40 hover:bg-red-50/70'
                            : 'bg-white hover:bg-slate-50';
                    }
                    const isMarketing = row.departamento === 'MARKETING';
                    return isMarketing
                        ? 'bg-purple-50/40 hover:bg-purple-100/60 border-b border-purple-200/50 text-slate-800'
                        : 'bg-blue-50/40 hover:bg-blue-100/60 border-b border-blue-200/50 text-slate-800';
                }}
                onSortChange={(key) => {
                    const direction =
                        sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
                    onSortChange(key, direction);
                }}
            />
            {viewerIndex !== null && (
                <ImageViewer 
                    images={activeEntryImages} 
                    initialIndex={viewerIndex} 
                    onClose={() => setViewerIndex(null)} 
                />
            )}
        </div>
    );
};
