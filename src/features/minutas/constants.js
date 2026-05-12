// ─── Constantes Centralizadas para el Módulo de Minutas ─────────────────────
// Colores intencionalmente sobrios: se usan SOLO en borde lateral, íconos y
// badges pequeños. Los fondos de las cards permanecen neutros/blancos.

export const CLASIFICACION_MAP = {
  IDEA:          { label: 'Idea',          icon: 'lightbulb',      color: '#d97706', border: '#fbbf24' },
  INVESTIGACION: { label: 'Investigación', icon: 'science',        color: '#2563eb', border: '#60a5fa' },
  CORRECCION:    { label: 'Corrección',    icon: 'build',          color: '#dc2626', border: '#f87171' },
  ANALISIS:      { label: 'Análisis',      icon: 'analytics',      color: '#7c3aed', border: '#a78bfa' },
  MUESTRA:       { label: 'Muestra',       icon: 'palette',        color: '#db2777', border: '#f472b6' },
  POLITICAS:     { label: 'Políticas',     icon: 'policy',         color: '#475569', border: '#94a3b8' },
  OTROS:         { label: 'Otros',         icon: 'more_horiz',     color: '#64748b', border: '#cbd5e1' },
};

export const ESTADO_CONCEPTUAL_MAP = {
  CAPTURADO:   { label: 'Capturado',   icon: 'radio_button_unchecked', color: '#94a3b8' },
  EN_REVISION: { label: 'En Revisión', icon: 'pending',                color: '#3b82f6' },
  CERRADO:     { label: 'Cerrado',     icon: 'check_circle',           color: '#10b981' },
  DESCARTADO:  { label: 'Descartado',  icon: 'cancel',                 color: '#ef4444' },
};

export const ESTADO_OPERATIVO_MAP = {
  PENDIENTE:   { label: 'Pendiente',   icon: 'schedule',           color: '#f59e0b' },
  EN_PROGRESO: { label: 'En Progreso', icon: 'play_circle',        color: '#8b5cf6' },
  COMPLETADO:  { label: 'Completado',  icon: 'task_alt',           color: '#10b981' },
};

export const AREA_MAP = {
  DISENO:            'Diseño',
  DIRECCION_MBC:     'Dirección MBC',
  DIRECCION_CFI:     'Dirección CFI',
  DIRECCION_ADJUNTA: 'Dirección Adjunta',
  DIRECCION_TIENDAS: 'Dirección Tiendas',
};

export const LINEA_MAP = {
  CALZADO:    { label: 'Calzado',    icon: 'shoe',         color: '#64748b' }, 
  BOTA:       { label: 'Bota',       icon: 'boot',         color: '#475569' }, 
  ROPA:       { label: 'Ropa',       icon: 'checkroom',    color: '#0f172a' },
  ACCESORIOS: { label: 'Accesorios', icon: 'shopping_bag', color: '#94a3b8' },
};

export const PRIORIDAD_MAP = {
  BAJA:    { label: 'Baja',    icon: 'arrow_downward', color: '#10b981' },
  MEDIA:   { label: 'Media',   icon: 'remove',         color: '#f59e0b' },
  ALTA:    { label: 'Alta',    icon: 'arrow_upward',   color: '#f97316' },
  CRITICA: { label: 'Crítica', icon: 'priority_high',  color: '#ef4444' },
};

// ─── Helpers de agrupación temporal ──────────────────────────────────────────

export const getTemporalGroup = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - today.getDay());
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  if (date >= today) return 'HOY';
  if (date >= yesterday) return 'AYER';
  if (date >= weekStart) return 'ESTA SEMANA';
  if (date >= lastWeekStart) return 'SEMANA PASADA';
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

export const formatRelative = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

// ─── Eventos del sistema (para timeline-event) ──────────────────────────────

export const EVENTO_MAP = {
  CAPTURA:        { label: 'Entrada capturada',    icon: 'add_circle',   color: '#94a3b8' },
  ACTUALIZACION:  { label: 'Actualizada',          icon: 'edit',         color: '#64748b' },
  REVISION:       { label: 'Marcada en revisión',   icon: 'pending',      color: '#3b82f6' },
  FORMALIZACION:  { label: 'Formalizada',           icon: 'verified',     color: '#10b981' },
  ASIGNACION:     { label: 'Responsable asignado',  icon: 'person_add',   color: '#8b5cf6' },
  CAMBIO_ESTADO:  { label: 'Estado actualizado',    icon: 'swap_horiz',   color: '#f59e0b' },
  CIERRE:         { label: 'Cerrada',               icon: 'check_circle', color: '#10b981' },
  DESCARTE:       { label: 'Descartada',            icon: 'cancel',       color: '#ef4444' },
  COMENTARIO:     { label: 'Comentario',            icon: 'comment',      color: '#64748b' },
  ADJUNTO:        { label: 'Adjunto agregado',      icon: 'attach_file',  color: '#64748b' },
};
