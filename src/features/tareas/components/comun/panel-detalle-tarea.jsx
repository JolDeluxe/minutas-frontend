// src/features/tareas/components/common/tarea-detail-drawer.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, ConfirmModal } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TAREA_STATUS_MAP, TAREA_STATUS_OPTS, TAREA_PRIORIDAD_OPTS } from '../../constants';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../../minutas/constants';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { createPortal } from 'react-dom';
import { EtiquetaEstadoTarea } from './etiqueta-estado-tarea';
import { EtiquetaPrioridadTarea } from './etiqueta-prioridad-tarea';
import { ModalEntregarTarea } from './modal-entregar-tarea';
import { formatFecha, formatFechaHora } from '@/lib/date';
import { ImageViewer } from './tarjeta-tarea';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes internos
// ─────────────────────────────────────────────────────────────────────────────

/** Cabecera de sección: barra de color + icono + label + contador opcional */
const SectionHeader = ({ icon, label, count, color = 'slate' }) => {
    const colors = {
        slate:  { bar: 'bg-slate-300',  icon: 'text-slate-400',  text: 'text-slate-400',  badge: 'bg-slate-100 text-slate-400' },
        blue:   { bar: 'bg-blue-400',   icon: 'text-blue-400',   text: 'text-blue-500',   badge: 'bg-blue-100 text-blue-500'   },
        amber:  { bar: 'bg-amber-400',  icon: 'text-amber-400',  text: 'text-amber-500',  badge: 'bg-amber-100 text-amber-500' },
        emerald:{ bar: 'bg-emerald-400',icon: 'text-emerald-500',text: 'text-emerald-600',badge: 'bg-emerald-100 text-emerald-600'},
    };
    const c = colors[color] ?? colors.slate;
    return (
        <div className="flex items-center gap-2 mb-3">
            <div className={cn('w-0.5 h-4 rounded-full shrink-0', c.bar)} />
            <Icon name={icon} size="14px" className={c.icon} />
            <span className={cn('text-[10px] font-black uppercase tracking-widest', c.text)}>{label}</span>
            {count !== undefined && (
                <span className={cn('ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full', c.badge)}>
                    {count}
                </span>
            )}
        </div>
    );
};

/** Tarjeta de metadato individual */
const MetaCard = ({ label, children, className }) => (
    <div className={cn(
        'p-3 bg-white rounded-xl border border-slate-100 flex flex-col gap-1 shadow-sm',
        className
    )}>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <div className="text-sm font-bold text-slate-800 leading-snug">{children}</div>
    </div>
);



// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export const PanelDetalleTarea = ({
    isOpen,
    onClose,
    tarea,
    onChangeStatus,
    onUpdate,
    onDelete,
    submitting = false,
    currentUser,
    users = [],
}) => {
    const isDesktop = useIsDesktop();
    const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
    const [isConfirmAprobarOpen, setIsConfirmAprobarOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [viewerState, setViewerState] = useState(null);

    if (!isOpen || !tarea) return null;

    const { rol, id: userId } = currentUser ?? {};

    // Normalizar responsables para que funcione tanto en Tareas (responsables) como en Minutas (asignaciones)
    const responsablesRaw = tarea.responsables || (tarea.asignaciones?.map(a => ({ ...a.usuario, id: a.usuarioId ?? a.usuario?.id })) || []);
    const responsables = responsablesRaw.map(r => {
        const isObj = typeof r === 'object' && r !== null;
        const id = isObj ? (r.id ?? r.usuarioId) : r;
        const fullUser = users?.find(u => u.id === id);
        if (fullUser) return { ...fullUser, ...(isObj ? r : {}) };
        return isObj ? (r.nombre ? r : { ...r, nombre: 'Cargando...' }) : { id: r, nombre: 'Cargando...' };
    }).filter(r => r && r.nombre);

    const tieneJefeAsignado = responsables.some((r) => r.rol === 'JEFE');
    const esJefe            = rol === 'ADMIN' || rol === 'GERENCIA' || (rol === 'JEFE' && !tieneJefeAsignado);
    const esAsignado        = responsables.some((r) => r.id == userId);
    const esResponsable     = esAsignado || ['ADMIN', 'JEFE', 'GERENCIA'].includes(rol);

    const estado      = tarea.estado?.toUpperCase();
    const isPendiente = estado === 'PENDIENTE';
    const isEnRevision = estado === 'EN_REVISION';
    const isCerrado   = estado === 'CERRADA' || estado === 'DESCARTADA' || estado === 'CANCELADA';

    const imagenesCaptura  = tarea.imagenes?.filter((img) => img.tipo !== 'EVIDENCIA') || [];
    const imagenesEvidencia = tarea.imagenes?.filter((img) => img.tipo === 'EVIDENCIA') || [];
    const tieneImagenes    = imagenesCaptura.length > 0 || imagenesEvidencia.length > 0;

    // ── Helpers de render ───────────────────────────────────────────────────

    const renderImageGrid = (images, tipo = 'captura') => {
        const esEvidencia = tipo === 'evidencia';
        return (
            <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                    <div
                        key={img.id || idx}
                        onClick={() => setViewerState({ images, index: idx })}
                        className={cn(
                            'relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all duration-300',
                            'shadow-sm hover:shadow-md active:scale-95',
                            esEvidencia
                                ? 'border-2 border-amber-200 hover:border-amber-400 bg-amber-50'
                                : 'border border-slate-200 hover:border-blue-300 bg-white'
                        )}
                    >
                        <img
                            src={img.preview || img.url || img.base64Thumb}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={esEvidencia ? 'Evidencia' : 'Captura'}
                        />
                        {/* Overlay zoom */}
                        <div className={cn(
                            'absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300',
                            esEvidencia ? 'bg-amber-900/20' : 'bg-slate-900/15'
                        )}>
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm',
                                esEvidencia ? 'bg-amber-500/80' : 'bg-white/80'
                            )}>
                                <Icon name="zoom_in" size="16px" className={esEvidencia ? 'text-white' : 'text-slate-700'} />
                            </div>
                        </div>
                        {/* Badge EVID */}
                        {esEvidencia && (
                            <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none shadow-sm">
                                EVID
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderNota = (nota) => {
        const creador = nota.creadoPor || {};
        return (
            <div key={nota.id} className="flex gap-3 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[11px] shrink-0 shadow-inner">
                    {creador.imagen
                        ? <img src={creador.imagen} className="w-full h-full object-cover" alt={creador.nombre} />
                        : creador.nombre?.charAt(0) || 'U'
                    }
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{creador.nombre || 'Usuario'}</p>
                        <p className="text-[9px] text-slate-400 font-semibold shrink-0">{formatFechaHora(nota.createdAt)}</p>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                        {nota.contenido}
                    </p>
                </div>
            </div>
        );
    };

    // ── Layout principal ────────────────────────────────────────────────────

    const renderContent = () => (
        <div className="flex flex-col h-full bg-white min-h-0">

            {/* ══ HEADER ══════════════════════════════════════════════════════ */}
            <div className={cn(
                'shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white text-left',
                isDesktop ? 'px-8 py-5 pr-20' : 'p-6 pr-16'
            )}>
                {/* Fila superior: REF + badges */}
                <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{tarea.id}
                    </span>
                    <EtiquetaEstadoTarea status={tarea.estado} size="xs" />
                    <EtiquetaPrioridadTarea priority={tarea.prioridad} />
                </div>

                {/* Título principal */}
                <h1 className={cn(
                    'font-extrabold text-slate-800 leading-snug tracking-tight whitespace-pre-wrap text-left',
                    isDesktop
                        ? 'text-lg max-h-[72px] overflow-y-auto custom-scrollbar pr-2 mb-3'
                        : 'text-base max-h-[120px] overflow-y-auto custom-scrollbar pr-2 mb-3',
                    isCerrado && 'line-through opacity-50 text-slate-400'
                )}>
                    {tarea.descripcion}
                </h1>

                {/* Responsables */}
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                        Responsable:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {responsables.length > 0
                            ? responsables.map((r) => (
                                <div
                                    key={r.id}
                                    className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-white border border-slate-200/80 rounded-full shadow-sm text-xs font-bold text-slate-700"
                                >
                                    <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 shrink-0">
                                        {r.imagen
                                            ? <img src={r.imagen} className="w-full h-full object-cover" alt={r.nombre} />
                                            : r.nombre?.charAt(0)
                                        }
                                    </div>
                                    <span>{r.nombre}</span>
                                </div>
                            ))
                            : <span className="text-xs text-slate-400 italic font-medium">Sin asignar</span>
                        }
                    </div>
                </div>
            </div>

            {/* ══ BODY: dos columnas en desktop, apilado en mobile ══════════ */}
            {/*
                flex-1 + min-h-0 + overflow-y-auto = el único scroll del modal,
                todo el contenido vive aquí dentro.
            */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className={cn(
                    isDesktop && 'grid grid-cols-12 divide-x divide-slate-100'
                )}>

                    {/* ── COLUMNA IZQUIERDA: contexto + origen + notas ──── */}
                    <div className={cn(
                        isDesktop ? 'col-span-7 p-8 space-y-6' : 'p-6 space-y-6'
                    )}>

                        {/* Sección: Detalles de la tarea */}
                        <section>
                            <SectionHeader icon="info" label="Detalles de la tarea" color="slate" />
                            <div className="grid grid-cols-2 gap-2.5">
                                <MetaCard label="Área">
                                    {AREA_MAP[tarea.area] || 'General'}
                                </MetaCard>
                                {tarea.departamento !== 'MARKETING' && tarea.area !== 'MARKETING' && (
                                    <MetaCard label="Línea">
                                        {LINEA_MAP[tarea.linea]?.label || tarea.linea || 'Multi'}
                                    </MetaCard>
                                )}
                                {tarea.fechaVencimiento && (
                                    <MetaCard label="Fecha de Vencimiento" className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <Icon name="event" size="15px" className="text-slate-400 shrink-0" />
                                            <span>{formatFecha(tarea.fechaVencimiento)}</span>
                                        </div>
                                    </MetaCard>
                                )}
                                <MetaCard label="Registrada el" className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Icon name="schedule" size="15px" className="text-slate-400 shrink-0" />
                                        <span>{formatFechaHora(tarea.createdAt)}</span>
                                    </div>
                                </MetaCard>
                            </div>
                        </section>

                        {/* Sección: Minuta de Origen (condicional) */}
                        {tarea.minuta && (
                            <section>
                                <SectionHeader icon="description" label="Origen: Minuta" color="blue" />
                                <div className="flex gap-3.5 items-start p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
                                    {/* Icono doc */}
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-sm">
                                        <Icon name="description" size="20px" className="text-blue-500" />
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-blue-900 leading-snug mb-1">
                                            {tarea.minuta.titulo || `Minuta #${tarea.minutaId}`}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <Icon name="link" size="11px" className="text-blue-400" />
                                            <span className="text-[10px] text-blue-500 font-semibold">
                                                Tarea originada en esta minuta
                                            </span>
                                        </div>
                                        {tarea.minuta.fecha && (
                                            <p className="text-[10px] text-blue-400 font-medium mt-1">
                                                Fecha de minuta: {formatFecha(tarea.minuta.fecha)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Estado vacío si no hay minuta */}
                        {!tarea.minuta && (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
                                <Icon name="inbox" size="28px" className="text-slate-300" />
                                <p className="text-xs text-slate-400 font-semibold">Sin minuta de origen</p>
                            </div>
                        )}
                    </div>

                    {/* ── COLUMNA DERECHA: imágenes ──────────────────────── */}
                    <div className={cn(
                        'bg-slate-50/60',
                        isDesktop ? 'col-span-5 p-7 space-y-6' : 'p-6 space-y-6 border-t border-slate-100'
                    )}>

                        {/* Imágenes de Captura */}
                        {imagenesCaptura.length > 0 && (
                            <section>
                                <SectionHeader
                                    icon="photo_camera"
                                    label="Imágenes de captura"
                                    count={imagenesCaptura.length}
                                    color="slate"
                                />
                                {renderImageGrid(imagenesCaptura, 'captura')}
                            </section>
                        )}

                        {/* Evidencias de Entrega */}
                        {imagenesEvidencia.length > 0 && (
                            <section>
                                <SectionHeader
                                    icon="verified"
                                    label="Evidencias de entrega"
                                    count={imagenesEvidencia.length}
                                    color="amber"
                                />
                                {renderImageGrid(imagenesEvidencia, 'evidencia')}

                                {/* Info pill de evidencia */}
                                <div className="mt-2.5 flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                                    <Icon name="info" size="13px" className="text-amber-400 shrink-0" />
                                    <span className="text-[10px] text-amber-600 font-semibold leading-tight">
                                        Imágenes adjuntas al entregar la tarea
                                    </span>
                                </div>
                            </section>
                        )}

                        {/* Notas de Entrega — van junto a las evidencias */}
                        {tarea.notas?.length > 0 && (
                            <section>
                                <SectionHeader icon="chat_bubble" label="Notas de entrega" count={tarea.notas.length} color="emerald" />
                                <div className="space-y-2.5">
                                    {tarea.notas.map(renderNota)}
                                </div>
                            </section>
                        )}

                        {/* Estado vacío si no hay imágenes ni notas */}
                        {!tieneImagenes && !tarea.notas?.length && (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <Icon name="hide_image" size="26px" className="text-slate-300" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400">Sin imágenes adjuntas</p>
                                    <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                                        Se añadirán al entregar
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ FOOTER: acciones ════════════════════════════════════════════ */}
            <div className={cn(
                'shrink-0 border-t border-slate-100 bg-white',
                isDesktop
                    ? 'px-8 py-4'
                    : 'p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]'
            )}>
                {/* 1. Responsable: entregar */}
                {isPendiente && esAsignado && (
                    <div className="flex items-center gap-3 w-full">
                        {!isCerrado && (esJefe || (userId && tarea.creadoPorId === userId)) && onDelete && (
                            <Button
                                onClick={() => setIsConfirmDeleteOpen(true)}
                                variant="outline"
                                className="px-4 py-3.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors shrink-0 h-[48px]"
                                icon="delete"
                                title="Eliminar Tarea"
                            />
                        )}
                        <Button
                            onClick={() => setIsEntregaModalOpen(true)}
                            className="flex-1 py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all h-[48px]"
                            isLoading={submitting}
                            icon="check_circle"
                        >
                            Entregar para Revisión
                        </Button>
                    </div>
                )}

                {/* 2. Jefatura: aprobar */}
                {isEnRevision && esJefe && (
                    <div className="flex items-center gap-3 w-full">
                        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shrink-0 h-[48px]">
                            <Icon name="fact_check" size="15px" />
                            <span className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                                Pendiente
                            </span>
                        </div>
                        <Button
                            onClick={() => setIsConfirmAprobarOpen(true)}
                            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 font-black uppercase text-[11px] tracking-widest active:scale-[0.98] transition-all cursor-pointer h-[48px]"
                            isLoading={submitting}
                            icon="verified"
                        >
                            Aprobar y Cerrar
                        </Button>
                    </div>
                )}

                {/* 3. Solo lectura: en revisión no-jefe */}
                {isEnRevision && !esJefe && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
                            <Icon name="lock" size="15px" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Entregada · En espera de validación de jefatura
                            </span>
                        </div>
                    </div>
                )}

                {/* 4. Cerrado / descartado */}
                {isCerrado && (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl">
                        <Icon name="check_circle" size="15px" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            Tarea {tarea.estado?.toLowerCase()}
                        </span>
                    </div>
                )}

                {/* 5. Caso alternativo: No es Pendiente ni En Revisión, pero se puede eliminar */}
                {!isCerrado && !isEnRevision && !((isPendiente && esAsignado) || (isEnRevision && esJefe)) && (esJefe || (userId && tarea.creadoPorId === userId)) && onDelete && (
                    <Button
                        onClick={() => setIsConfirmDeleteOpen(true)}
                        className="w-full py-3.5 rounded-xl border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 shadow-md font-black uppercase text-[11px] tracking-widest transition-all h-[48px]"
                        icon="delete"
                    >
                        Eliminar Tarea
                    </Button>
                )}
            </div>
        </div>
    );

    // ── Clases del contenedor ────────────────────────────────────────────────
    const wrapperClasses = isDesktop
        ? 'fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-200'
        : 'fixed inset-0 z-1000 flex items-end';

    /*
     * Desktop → max-w-4xl (896px) da suficiente espacio para las dos columnas.
     * max-h-[92vh] + overflow-hidden en el wrapper, flex-col + min-h-0 adentro
     * = modal que nunca se desborda y solo hace scroll interno si es necesario.
     */
    const containerClasses = isDesktop
        ? 'relative bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100/80'
        : 'fixed inset-x-0 bottom-0 h-[88vh] bg-white rounded-t-[2rem] z-1000 animate-in slide-in-from-bottom duration-500 shadow-drawer overflow-hidden flex flex-col';

    return createPortal(
        <div className={wrapperClasses}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={containerClasses}>
                {/* Botón cerrar — desktop */}
                {isDesktop && (
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors active:scale-90 z-50 border border-slate-200/50 cursor-pointer"
                    >
                        <Icon name="close" size="18px" />
                    </button>
                )}

                {/* Handle — mobile */}
                {!isDesktop && (
                    <button
                        onClick={onClose}
                        className="w-10 h-1.5 rounded-full bg-slate-200 mx-auto mt-4 mb-1 shrink-0"
                        aria-label="Cerrar"
                    />
                )}

                {renderContent()}
            </div>

            {/* Modal de entrega */}
            {isEntregaModalOpen && (
                <ModalEntregarTarea
                    isOpen={isEntregaModalOpen}
                    onClose={() => setIsEntregaModalOpen(false)}
                    tareaId={tarea.id}
                    submitting={submitting}
                    onConfirm={async () => {
                        const nextStatus = (rol === 'ADMIN' || rol === 'GERENCIA' || (rol === 'JEFE' && !esAsignado)) ? 'CERRADA' : 'EN_REVISION';
                        if (onChangeStatus) await onChangeStatus(tarea.id, nextStatus);
                    }}
                />
            )}

            {isConfirmAprobarOpen && (
                <ConfirmModal
                    isOpen={isConfirmAprobarOpen}
                    onClose={() => setIsConfirmAprobarOpen(false)}
                    onConfirm={async () => {
                        if (onChangeStatus) await onChangeStatus(tarea.id, 'CERRADA');
                        setIsConfirmAprobarOpen(false);
                    }}
                    title="Aprobar y Cerrar Tarea"
                    message="¿Estás seguro de que deseas aprobar y cerrar esta tarea de forma definitiva?"
                    confirmText="Aprobar y Cerrar"
                    cancelText="Cancelar"
                    variant="success"
                />
            )}

            {isConfirmDeleteOpen && (
                <ConfirmModal
                    isOpen={isConfirmDeleteOpen}
                    onClose={() => setIsConfirmDeleteOpen(false)}
                    onConfirm={async () => {
                        if (onDelete) await onDelete(tarea.id);
                        setIsConfirmDeleteOpen(false);
                        onClose(); // Cerrar el drawer principal
                    }}
                    title="Eliminar Tarea"
                    message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción la descartará del listado."
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    variant="danger"
                />
            )}

            {/* Visor de imágenes */}
            {viewerState !== null && (
                <ImageViewer
                    images={viewerState.images}
                    initialIndex={viewerState.index}
                    onClose={() => setViewerState(null)}
                />
            )}
        </div>,
        document.body
    );
};