// src/features/tareas/components/hoy/hoy-tarea-card.jsx
import { Icon } from '@/components/ui/z_index';
import { TareaStatusBadge } from '../common/tarea-status-badge';
import { TareaPriorityBadge } from '../common/tarea-priority-badge';
import { TareaEntregaModal } from '../common/tarea-entrega-modal';
import { isPastDate } from '@/lib/date';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { LINEA_MAP, CLASIFICACION_MAP, AREA_MAP } from '../../../minutas/constants';
import { LineIconSelector, MarketingIcon } from '../../../minutas/components/icons/line-icons';

const ESTADOS_FINALES = ['CERRADA', 'CANCELADA', 'DESCARTADA'];
const ROLES_ADMIN = ['GERENCIA', 'JEFE', 'ADMIN'];

const isVencida = (tarea) => {
    if (!tarea.fechaVencimiento) return false;
    if (['EN_REVISION', ...ESTADOS_FINALES].includes(tarea.estado)) return false;
    return isPastDate(tarea.fechaVencimiento);
};

const CardImageCarousel = ({ images, lineInfo, isMarketing }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHover, setShowHover] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;
  const currentImg = images[currentIndex];

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const previewWidth = window.innerWidth < 640 ? 260 : 380;
    
    let x = rect.right + 20;
    if (x + previewWidth > window.innerWidth) {
      x = rect.left - previewWidth - 20;
    }
    x = Math.max(20, x);
    let y = rect.top + (rect.height / 2);
    
    setCoords({ x, y });
    setShowHover(true);
  };

  return (
    <div className="relative group/img flex flex-col items-center gap-2 w-full" ref={containerRef}>
      <div
        className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-[1.25rem] border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center p-0.5 group-hover/img:border-marca-primario/40 transition-all active:scale-95"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowHover(false)}
      >
        <div className="relative w-full h-full rounded-[1rem] overflow-hidden bg-slate-50">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out",
                i === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
              )}
              alt={`Adjunto ${i + 1}`}
            />
          ))}
        </div>
        
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentIndex ? "bg-white w-3 shadow-sm" : "bg-white/40 w-1")} />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Icon name="zoom_in" size="20px" className="text-white drop-shadow-md" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-xs animate-in fade-in duration-500 max-w-full">
         {isMarketing ? (
            <MarketingIcon size={14} style={{ color: lineInfo.color }} />
         ) : (
            <LineIconSelector type={lineInfo.value} size={16} style={{ color: lineInfo.color }} />
         )}
         <span className="text-[7px] font-black uppercase tracking-wider truncate" style={{ color: lineInfo.color }}>{lineInfo.label}</span>
      </div>

      {showHover && createPortal(
        <div 
          className="fixed z-[999999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ left: coords.x, top: coords.y, transform: 'translateY(-50%)' }}
        >
          <div className="w-64 h-64 sm:w-[380px] sm:h-[380px] flex items-center justify-center relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-2 shadow-[0_50px_120px_rgba(0,0,0,0.5)] ring-[12px] ring-white/20">
            <img src={currentImg.url} alt="Preview Zoom" className="w-full h-full object-contain rounded-3xl drop-shadow-lg animate-in fade-in duration-500 bg-slate-50" />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-2xl border border-white/10">
               Vista Rápida
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const HoyTareaCard = ({
    tarea,
    currentUser,
    onViewDetail,
    onChangeStatus,
    onReview,
    className,
}) => {

    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
    const isExpanded = false;

    const { rol } = currentUser || {};
    const esJefe = rol ? ROLES_ADMIN.includes(rol) : false;

    const estado = tarea.estado?.toUpperCase() || 'PENDIENTE';
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrado = ESTADOS_FINALES.includes(estado);
    
    const vencida = isVencida(tarea);
    const isMarketing = tarea.departamento === 'MARKETING';

    const getCardStyles = () => {
        if (vencida) return 'bg-red-50/40 hover:bg-red-100/60 ring-1 ring-red-500/20';
        if (isCerrado) return 'opacity-85 bg-slate-50/50 hover:bg-slate-100/60';
        switch (estado) {
            case 'PENDIENTE': return 'bg-white hover:bg-amber-50/30';
            case 'EN_REVISION': return 'bg-blue-50/30 hover:bg-blue-100/50';
            default: return 'bg-white hover:bg-slate-50/30';
        }
    };

    const imagenesCaptura = tarea.imagenes?.filter(img => img.tipo !== 'EVIDENCIA') || [];
    const hasImages = imagenesCaptura.length > 0;
    const esAsignadoDirecto = tarea.responsables?.some((r) => r.id == currentUser?.id);
    
    const lineInfo = {
        label: isMarketing ? 'Marketing' : (LINEA_MAP[tarea.linea]?.label || tarea.linea || '—'),
        color: isMarketing ? '#8b5cf6' : (LINEA_MAP[tarea.linea]?.color || '#64748b'),
        value: tarea.linea
    };

    const clasif = CLASIFICACION_MAP[tarea.clasificacion] || null;
    const isExternal = (currentUser?.departamento === 'DISEÑO' && tarea.area !== 'DISENO') || (currentUser?.departamento === 'MARKETING' && tarea.area !== 'MARKETING');

    return (
        <>
            <div
                onClick={() => onViewDetail?.(tarea)}
                className={cn(
                    'group relative flex flex-col transition-all duration-300 rounded-[1.5rem] border border-slate-200/80 overflow-hidden cursor-pointer',
                    isExpanded ? 'shadow-xl ring-2 ring-slate-200' : 'shadow-sm hover:shadow-md',
                    getCardStyles(),
                    className
                )}
            >
                <div className="flex flex-row h-full min-h-[140px]">
                    
                    {/* PANEL IZQUIERDO: IMAGEN / IDENTIDAD */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-[105px] sm:w-[135px] bg-slate-50/50 border-r border-slate-100/50 p-2 sm:p-3 relative group/side">
                        {hasImages ? (
                            <CardImageCarousel 
                                images={imagenesCaptura} 
                                lineInfo={lineInfo}
                                isMarketing={isMarketing}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full gap-2">
                                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] transition-all duration-500 group-hover:scale-110 shadow-sm" style={{ backgroundColor: `${lineInfo.color}0f`, border: `1.5px solid ${lineInfo.color}25` }}>
                                   {isMarketing ? (
                                      <MarketingIcon size={32} style={{ color: lineInfo.color }} />
                                   ) : (
                                      <LineIconSelector type={tarea.linea} size={48} style={{ color: lineInfo.color }} />
                                   )}
                                </div>
                                <span className="font-black tracking-[0.1em] text-[7px] sm:text-[8px] uppercase font-mono text-center leading-tight px-1" style={{ color: lineInfo.color }}>
                                    {lineInfo.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* PANEL DERECHO: CONTENIDO */}
                    <div className="flex flex-col flex-1 min-w-0 p-3 sm:p-4">
                        
                        {/* Header: Status + Fechas */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <TareaStatusBadge status={estado} className="scale-90 origin-left" />
                                {isExternal && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border bg-purple-100/50 text-purple-700 border-purple-200/50">
                                    <Icon name="output" size="10px" />
                                    {AREA_MAP[tarea.area] || tarea.area}
                                  </span>
                                )}
                                {clasif && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest border" style={{ backgroundColor: `${clasif.color}08`, color: clasif.color, borderColor: `${clasif.color}15` }}>
                                    <Icon name={clasif.icon} size="10px" />
                                    {clasif.label}
                                  </span>
                                )}
                                {tarea.prioridad && <TareaPriorityBadge priority={tarea.prioridad} className="scale-90 origin-left" />}
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                    #{tarea.id}
                                </span>
                                {vencida && <span className="text-[7px] font-black text-rose-500 animate-pulse uppercase">¡Vencida!</span>}
                            </div>
                        </div>

                        {/* Cuerpo: Descripción */}
                        <div className="flex-1 min-h-0">
                            <div className="relative group/text">
                                <p className={cn(
                                    "whitespace-pre-wrap break-words text-[13px] font-semibold leading-relaxed text-slate-800 transition-all duration-300 px-0.5",
                                    isCerrado && "line-through text-slate-400 opacity-60",
                                    !isExpanded && "line-clamp-3"
                                )}>
                                    {tarea.descripcion}
                                </p>
                            </div>
                        </div>

                        {/* Metadatos Rápidos Extra (Opcional, en la expansión o inline) */}
                        <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                {tarea.responsables?.length > 0 ? (
                                    <div className="flex -space-x-1.5">
                                        {tarea.responsables.slice(0, 3).map((r) => (
                                            <div 
                                                key={r.id} 
                                                className="h-6 w-6 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm shrink-0 ring-1 ring-slate-200/60"
                                                title={r.nombre}
                                            >
                                                {r.imagen ? <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" /> : r.nombre?.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-[9px] text-slate-400 italic">Sin resp.</span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                {isPendiente && esAsignadoDirecto && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEntregaModalOpen(true);
                                        }}
                                        className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1"
                                    >
                                        <Icon name="check" size="12px" /> Entregar
                                    </button>
                                )}

                                {isEnRevision && esJefe && (onChangeStatus || onReview) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onReview) {
                                                onReview(tarea);
                                            } else {
                                                onChangeStatus?.(tarea.id, 'CERRADA');
                                            }
                                        }}
                                        className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <Icon name="verified" size="12px" /> Aprobar
                                    </button>
                                )}

                                {isEnRevision && !esJefe && (
                                    <div className="h-7 px-2 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Icon name="fact_check" size="12px" /> En Revisión
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEntregaModalOpen && (
                <TareaEntregaModal
                    isOpen={isEntregaModalOpen}
                    onClose={() => setIsEntregaModalOpen(false)}
                    tareaId={tarea.id}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(tarea.id, 'EN_REVISION');
                    }}
                />
            )}
        </>
    );
};
