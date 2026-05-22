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

export const TIPO_ENTRADA_MAP = {
  TAREA:          { label: 'Tarea / Seguimiento',     icon: 'task',           color: '#10b981' },
  RECORDATORIO:   { label: 'Recordatorio',            icon: 'notifications',  color: '#3b82f6' },
  POLITICA:       { label: 'Política / Lineamiento',  icon: 'policy',         color: '#8b5cf6' },
  DESCARTADA:     { label: 'Descartada',              icon: 'cancel',         color: '#ef4444' },
  SIN_ORGANIZAR:  { label: 'Sin Organizar',           icon: 'pending_actions',color: '#f59e0b' },
};

export const ESTADO_TAREA_MAP = {
  PENDIENTE:   { label: 'Pendiente',   icon: 'schedule',           color: '#f59e0b' },
  EN_REVISION: { label: 'En Revisión', icon: 'visibility',         color: '#3b82f6' },
  CERRADA:     { label: 'Cerrada',     icon: 'check_circle',       color: '#10b981' },
  CANCELADA:   { label: 'Cancelada',   icon: 'cancel',             color: '#ef4444' },
};

export const ESTADO_MINUTA_MAP = {
  PROGRAMADA:      { label: 'Programada',      icon: 'event',            color: '#94a3b8' }, // gris
  EN_CURSO:        { label: 'En Curso',        icon: 'play_circle',      color: '#3b82f6' }, // azul
  EN_ORGANIZACION: { label: 'En Organización', icon: 'account_tree',     color: '#f97316' }, // naranja
  ACTIVA:          { label: 'Activa',          icon: 'trending_up',      color: '#10b981' }, // verde
  CERRADA:         { label: 'Cerrada',         icon: 'check_circle',     color: '#64748b' }, // neutral
  CANCELADA:       { label: 'Cancelada',       icon: 'cancel',           color: '#ef4444' }, // rojo
};

export const AREA_MAP = {
  DISENO:            'Diseño',
  MARKETING:         'Marketing',
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
  CAMPANA:    { label: 'Campaña',    icon: 'campaign',     color: '#8b5cf6' },
  'CAMPAÑA':  { label: 'Campaña',    icon: 'campaign',     color: '#8b5cf6' }, // alias legacy
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
  CAPTURA:        { label: 'Entrada capturada',     icon: 'add_circle',   color: '#94a3b8' },
  ACTUALIZACION:  { label: 'Actualizada',           icon: 'edit',         color: '#64748b' },
  REVISION:       { label: 'Marcada en revisión',   icon: 'pending',      color: '#3b82f6' },
  FORMALIZACION:  { label: 'Formalizada',           icon: 'verified',     color: '#10b981' },
  ASIGNACION:     { label: 'Responsable asignado',  icon: 'person_add',   color: '#8b5cf6' },
  CAMBIO_ESTADO:  { label: 'Estado actualizado',    icon: 'swap_horiz',   color: '#f59e0b' },
  CIERRE:         { label: 'Cerrada',               icon: 'check_circle', color: '#10b981' },
  DESCARTE:       { label: 'Descartada',            icon: 'cancel',       color: '#ef4444' },
  COMENTARIO:     { label: 'Comentario',            icon: 'comment',      color: '#64748b' },
  ADJUNTO:        { label: 'Adjunto agregado',      icon: 'attach_file',  color: '#64748b' },
};

// ─── Catálogos por Departamento ──────────────────────────────────────────────
// Espejo de la estructura en backend configuracion/controller.ts.
// Cada departamento define sus propias áreas, clasificaciones y líneas.

export const CATALOGOS_POR_DEPARTAMENTO = {
  DISENO: {
    areas: [
      { value: 'DISENO',            label: 'Diseño' },
      { value: 'DIRECCION_MBC',     label: 'Dirección MBC' },
      { value: 'DIRECCION_CFI',     label: 'Dirección CFI' },
      { value: 'DIRECCION_ADJUNTA', label: 'Dirección Adjunta' },
      { value: 'DIRECCION_TIENDAS', label: 'Dirección Tiendas' },
    ],
    clasificaciones: [
      { value: 'IDEA',          label: 'Idea',          color: '#8b5cf6', icon: 'lightbulb' },
      { value: 'INVESTIGACION', label: 'Investigación', color: '#3b82f6', icon: 'search' },
      { value: 'CORRECCION',    label: 'Corrección',    color: '#ef4444', icon: 'build' },
      { value: 'ANALISIS',      label: 'Análisis',      color: '#f59e0b', icon: 'analytics' },
      { value: 'MUESTRA',       label: 'Muestra',       color: '#10b981', icon: 'inventory_2' },
      { value: 'POLITICAS',     label: 'Políticas',     color: '#6366f1', icon: 'gavel' },
      { value: 'OTROS',         label: 'Otros',         color: '#64748b', icon: 'more_horiz' },
    ],
    lineas: [
      { value: 'CALZADO',    label: 'Calzado',    color: '#f97316', icon: 'footprint' },
      { value: 'BOTA',       label: 'Bota',       color: '#8b5cf6', icon: 'hiking' },
      { value: 'ROPA',       label: 'Ropa',       color: '#ec4899', icon: 'checkroom' },
      { value: 'ACCESORIOS', label: 'Accesorios', color: '#14b8a6', icon: 'watch' },
      { value: 'OTROS',      label: 'Otros',      color: '#64748b', icon: 'more_horiz' },
    ],
  },
  MARKETING: {
    areas: [
      { value: 'MARKETING',         label: 'Marketing' },
      { value: 'DIRECCION_MBC',     label: 'Dirección MBC' },
      { value: 'DIRECCION_CFI',     label: 'Dirección CFI' },
      { value: 'DIRECCION_ADJUNTA', label: 'Dirección Adjunta' },
      { value: 'DIRECCION_TIENDAS', label: 'Dirección Tiendas' },
    ],
    clasificaciones: [
      { value: 'REDES_SOCIALES',  label: 'Redes Sociales',  color: '#10b981', icon: 'share' },
      { value: 'DISENO_INSUMOS',  label: 'Diseño Insumos',  color: '#f59e0b', icon: 'brush' },
      { value: 'TIENDAS',         label: 'Tiendas',         color: '#3b82f6', icon: 'store' },
      { value: 'CATALOGOS',       label: 'Catálogos',       color: '#ec4899', icon: 'menu_book' },
      { value: 'OTROS',           label: 'Otros',           color: '#64748b', icon: 'more_horiz' },
    ],
    lineas: [], // Marketing no usa líneas
  },
};

/** Helper: obtiene catálogos del departamento, con fallback a DISENO */
export const getCatalogos = (departamento) =>
  CATALOGOS_POR_DEPARTAMENTO[departamento] || CATALOGOS_POR_DEPARTAMENTO.DISENO;
