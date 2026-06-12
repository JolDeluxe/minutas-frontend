import { Icon, ConfirmModal, TableActions } from '@/components/ui/z_index';
import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageViewer } from '@/features/tareas/components/comun/tarjeta-tarea';
import { cn } from '@/utils/cn';

const MiniCarousel = ({ images, onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center p-0.5 cursor-pointer hover:border-marca-primario/40 transition-all active:scale-95 group"
      onClick={() => onClick(currentIndex)}
    >
      <div className="relative w-full h-full rounded-[0.75rem] overflow-hidden bg-slate-50">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.preview || img.url || img.base64Thumb}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out",
              i === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
            )}
            alt={`Adjunto ${i + 1}`}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-20 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          {images.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentIndex ? "bg-white w-2.5 shadow-sm" : "bg-white/50 w-1")} />
          ))}
        </div>
      )}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Icon name="zoom_in" size="20px" className="text-white drop-shadow-md" />
      </div>
    </div>
  );
};

/**
 * PoliticaCard - Componente independiente y limpio.
 * Solo muestra: Descripción, Minuta (opcional), Imagen y Acciones (Editar/Eliminar).
 */
export const PoliticaCard = ({ politica, onEdit, onDelete }) => {
  const [viewerIndex, setViewerIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const captureImages = politica.imagenes || [];
  const hasImage = captureImages.length > 0;
  const minutaTitulo = politica.minuta?.titulo;

  return (
    <>
      <div className="group relative flex gap-2 sm:gap-3 rounded-2xl transition-all duration-300 hover:shadow-md border border-solid border-slate-200 bg-white hover:border-slate-300 shadow-sm p-2 sm:p-3">
        
        {/* Panel Izquierdo: Imagen */}
        {hasImage && (
          <div className="flex flex-col items-center border-r border-slate-100 pr-2 shrink-0">
             <MiniCarousel images={captureImages} onClick={(idx) => setViewerIndex(idx)} />
          </div>
        )}

        {/* Panel Derecho: Contenido */}
        <div className="flex flex-col flex-1 min-w-0">
           <div className="flex items-center justify-between gap-2 mb-1.5">
             <span className="text-[10px] text-slate-400 font-bold tracking-wider">
               #{politica.id}
             </span>
             {politica.createdAt && (
               <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-500 border border-slate-100 shadow-xs">
                 <Icon name="event" size="10px" className="shrink-0" />
                 {new Date(politica.createdAt).toLocaleDateString('es-MX')}
               </span>
             )}
           </div>

           {minutaTitulo && (
              <div className="flex items-center gap-1 mb-1.5 opacity-80">
                 <ExternalLink size={10} className="text-amber-500 shrink-0" />
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    Origen: {minutaTitulo}
                 </span>
              </div>
           )}

           <p className="text-[12px] sm:text-[13px] font-medium text-slate-700 leading-relaxed break-words whitespace-pre-wrap flex-1">
              {politica.descripcion}
           </p>

           <div className="flex items-center justify-end pt-2 mt-2 border-t border-slate-50 gap-1.5">
              <TableActions 
                   row={politica} 
                   actions={[
                      { key: 'editar', enabled: true, onClick: (r) => onEdit(r) },
                      { key: 'borrar', enabled: true, onClick: () => setShowConfirm(true) }
                   ]} 
              />
           </div>
        </div>
        
        {viewerIndex !== null && (
          <ImageViewer 
            images={captureImages} 
            initialIndex={viewerIndex} 
            onClose={() => setViewerIndex(null)} 
          />
        )}
      </div>

      <ConfirmModal
         isOpen={showConfirm}
         onClose={() => setShowConfirm(false)}
         onConfirm={() => {
           onDelete(politica.id);
           setShowConfirm(false);
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
