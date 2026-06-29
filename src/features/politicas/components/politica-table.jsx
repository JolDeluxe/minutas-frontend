import { Table, Icon, Skeleton, ConfirmModal, TableActions } from '@/components/ui/z_index';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ImageViewer } from '@/features/tareas/components/comun/tarjeta-tarea';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';
import { AreaLineaBadge } from './area-linea-badge';

const TableImagePreview = ({ images, remoteImageCount, onClick }) => {
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

  if ((!images || images.length === 0) && remoteImageCount > 0) {
    return (
      <div className="h-28 w-28 min-w-[7rem] shrink-0 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-1.5 p-2 text-slate-400 select-none shadow-xs mx-auto">
        <Icon name="photo_camera" size="20px" className="text-slate-400/80 animate-pulse" />
        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase text-center leading-tight">
          {remoteImageCount} {remoteImageCount === 1 ? 'Foto' : 'Fotos'}
        </span>
      </div>
    );
  }

  if (!images || images.length === 0) return <span className="text-[11px] text-slate-300">—</span>;
  
  const currentImg = images[currentIndex]?.preview || images[currentIndex]?.url || images[currentIndex]?.base64Thumb;

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
        className="h-20 w-20 shrink-0 rounded-2xl border-2 border-slate-100 bg-white relative z-10 cursor-pointer p-1 hover:border-marca-primario/30 transition-all group" 
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
              src={img.preview || img.url || img.base64Thumb} 
              alt={`Preview ${i}`} 
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out group-hover:scale-110",
                i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            />
          ))}
        </div>
        
        {images.length > 1 && (
          <div className="absolute top-1 right-1 bg-slate-900/80 backdrop-blur-md px-1.5 py-0.5 text-[8px] font-black text-white rounded-md z-20 shadow-lg border border-white/20">
            {currentIndex + 1}/{images.length}
          </div>
        )}

        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
           <Icon name="zoom_in" size="20px" className="text-white drop-shadow-md" />
        </div>
      </div>

      {showHover && isDesktop && createPortal(
        <div 
          className="fixed z-[99999] pointer-events-none animate-in fade-in zoom-in-95 duration-200" 
          style={{ left: coords.x, top: coords.y, transform: 'translateY(-50%)' }}
        >
          <div className="w-[400px] h-[400px] flex items-center justify-center relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 p-2 shadow-2xl">
            <img src={currentImg} alt="Preview Zoom" className="w-full h-full object-contain rounded-[1.5rem] bg-slate-50 drop-shadow-md" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

/**
 * PoliticaTable - Componente independiente y limpio.
 * Solo muestra: Referencia (Imagen), Descripción (y minuta), Acciones.
 */
export const PoliticaTable = ({ politicas, loading, onEdit, onDelete }) => {
  const [viewerIndex, setViewerIndex] = useState(null);
  const [activeImages, setActiveImages] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openViewer = (images) => {
    setActiveImages(images);
    setViewerIndex(0);
  };

  const columns = [
    {
      header: 'Adjunto',
      accessorKey: 'imagenes',
      align: 'center',
      headerClassName: 'w-[10%] min-w-[120px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-20 w-20 rounded-2xl mx-auto" />;
        const hasImage = row.imagenes && row.imagenes.length > 0;
        if (!hasImage) {
           return (
              <div className="flex justify-center p-1">
                 <div className="h-20 w-20 shrink-0 rounded-2xl border-2 border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-300 hover:border-marca-primario/30 transition-all cursor-pointer">
                    <ShieldCheck size={20} />
                 </div>
              </div>
           );
        }
        return <TableImagePreview images={row.imagenes} onClick={() => openViewer(row.imagenes)} />;
      }
    },
    {
      header: 'Descripción',
      accessorKey: 'descripcion',
      headerClassName: 'w-[50%]',
      cell: (row) => {
        if (row.isSkeleton) return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
        );
        return (
          <div className="flex flex-col gap-1.5 py-2">
            <span className="font-semibold text-slate-800 text-[13px] leading-relaxed">
              {row.descripcion}
            </span>
            {row.minuta && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <ExternalLink size={12} className="text-amber-500 shrink-0" />
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">
                  Origen: <span className="text-amber-900">{row.minuta.titulo}</span>
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Área / Línea',
      accessorKey: 'area',
      align: 'center',
      headerClassName: 'w-[20%] min-w-[160px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-6 w-28 mx-auto rounded-lg" />;
        return (
          <div className="flex justify-center py-2">
            <AreaLineaBadge area={row.area} linea={row.linea} />
          </div>
        );
      }
    },
    {
      header: 'Fecha',
      accessorKey: 'createdAt',
      align: 'center',
      headerClassName: 'w-[15%] min-w-[120px]',
      cell: (row) => {
         if (row.isSkeleton) return <Skeleton className="h-6 w-20 mx-auto rounded-md" />;
         return (
            <div className="flex justify-center">
               <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-100 shadow-xs">
                 <Icon name="event" size="12px" className="shrink-0 text-slate-400" />
                 {row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-MX') : '—'}
               </span>
            </div>
         );
      }
    },
    {
      header: 'Acciones',
      accessorKey: 'acciones',
      align: 'center',
      headerClassName: 'w-[120px]',
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-8 w-16 mx-auto rounded-lg" />;
        return (
          <div className="flex items-center justify-center gap-2">
             <TableActions 
                row={row} 
                actions={[
                   { key: 'editar', enabled: true, onClick: (r) => onEdit(r) },
                   { key: 'borrar', enabled: true, onClick: (r) => setDeleteTarget(r.id) }
                ]} 
             />
          </div>
        );
      }
    }
  ];

  const tableData = loading
    ? Array.from({ length: 5 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
    : politicas;

  return (
    <>
      <Table 
        columns={columns}
        data={tableData}
        keyField="id"
        loading={false}
        emptyMessage="No se encontraron políticas registradas."
        rowClassName={() => "hover:bg-slate-50/50 transition-colors border-b border-slate-100 bg-white group"}
      />
      {viewerIndex !== null && (
        <ImageViewer 
          images={activeImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerIndex(null)} 
        />
      )}
      <ConfirmModal
         isOpen={deleteTarget !== null}
         onClose={() => setDeleteTarget(null)}
         onConfirm={() => {
           if (deleteTarget) onDelete(deleteTarget);
           setDeleteTarget(null);
         }}
         title="Descartar Política"
         message="¿Estás seguro que deseas descartar esta política? Dejará de aparecer en los listados activos."
         confirmText="Descartar"
         cancelText="Cancelar"
         variant="danger"
      />
    </>
  );
};
