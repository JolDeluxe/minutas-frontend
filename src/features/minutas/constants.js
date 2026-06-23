// ─── Constantes Centralizadas para el Módulo de Minutas ─────────────────────
// Colores intencionalmente sobrios: se usan SOLO en borde lateral, íconos y
// badges pequeños. Los fondos de las cards permanecen neutros/blancos.

export const CLASIFICACION_MAP = {
  // DISEÑO
  IDEA:          { label: 'Idea',          icon: 'emoji_objects',     color: '#482b2c', border: '#846768' },
  INVESTIGACION: { label: 'Investigación', icon: 'travel_explore',    color: '#3b82f6', border: '#60a5fa' },
  CORRECCION:    { label: 'Corrección',    icon: 'edit_location_alt', color: '#ef4444', border: '#f87171' },
  ANALISIS:      { label: 'Análisis',      icon: 'search_insights',   color: '#f59e0b', border: '#fbbf24' },
  MUESTRA:       { label: 'Muestra',       icon: 'design_services',   color: '#10b981', border: '#34d399' },
  BOCETO:        { label: 'Boceto',        icon: 'draw',              color: '#f97316', border: '#fb923c' },
  POLITICAS:     { label: 'Políticas',     icon: 'policy',            color: '#6366f1', border: '#818cf8' },
  // MARKETING
  REDES_SOCIALES:{ label: 'Redes Sociales',icon: 'share',             color: '#10b981', border: '#34d399' },
  DISENO_INSUMOS:{ label: 'Diseño Insumos',icon: 'brush',             color: '#f59e0b', border: '#fbbf24' },
  TIENDAS:       { label: 'Tiendas',       icon: 'store',             color: '#3b82f6', border: '#60a5fa' },
  CATALOGOS:     { label: 'Catálogos',     icon: 'menu_book',         color: '#ec4899', border: '#f472b6' },
  // DIRECCION MBC & CFI
  PRODUCCION_MUESTRAS: { label: 'Desarrollo de Muestras', icon: 'construction', color: '#8b5cf6', border: '#a78bfa' },
  ORDEN_COMPRA:        { label: 'Órdenes de Compra',     icon: 'shopping_bag', color: '#482b2c', border: '#846768' },
  MEJORA_PROCESO:      { label: 'Optimización Producción',icon: 'precision_manufacturing', color: '#10b981', border: '#34d399' },
  CONTROL_CALIDAD:     { label: 'Control de Calidad',     icon: 'verified', color: '#14b8a6', border: '#2dd4bf' },
  LOGISTICA_DISTRIBUCION:{ label: 'Logística y Distribución', icon: 'local_shipping', color: '#f97316', border: '#fb923c' },
  // DIRECCION TIENDAS
  EXHIBICION_VISUAL:   { label: 'Exhibición y Visual',   icon: 'visibility', color: '#ec4899', border: '#f472b6' },
  KPI_VENTAS:          { label: 'Indicadores de Ventas', icon: 'analytics', color: '#3b82f6', border: '#60a5fa' },
  INVENTARIOS:         { label: 'Control Inventarios',   icon: 'inventory', color: '#f59e0b', border: '#fbbf24' },
  ATENCION_CLIENTE:    { label: 'Atención al Cliente',   icon: 'sentiment_satisfied', color: '#10b981', border: '#34d399' },
  // DIRECCION MKT
  PAGINA_WEB:          { label: 'Página Web / E-com',    icon: 'language', color: '#06b6d4', border: '#22d3ee' },
  EVENTOS_PROMOS:      { label: 'Eventos y Promos',      icon: 'event', color: '#db2777', border: '#f472b6' },
  // DIRECCION ALTA CALIDAD
  AUDITORIA_CALIDAD:   { label: 'Auditoría de Calidad',  icon: 'fact_check', color: '#2563eb', border: '#60a5fa' },
  RECHAZOS_DEVOLUCIONES:{ label: 'Rechazos / Devoluciones',icon: 'assignment_return', color: '#ef4444', border: '#f87171' },
  MEJORA_TECNICA:      { label: 'Fichas Técnicas',       icon: 'engineering', color: '#475569', border: '#94a3b8' },
  // DIRECCION ADJUNTA
  ACUERDO_DIRECCION:   { label: 'Acuerdo Dirección',     icon: 'gavel', color: '#482b2c', border: '#846768' },
  PLANEACION_ESTRATEGICA:{ label: 'Planeación Estratégica', icon: 'insights', color: '#8b5cf6', border: '#a78bfa' },
  PRESUPUESTOS:        { label: 'Presupuestos y Costos', icon: 'payments', color: '#d97706', border: '#fbbf24' },
  // GENERAL
  OTROS:               { label: 'Otros Asuntos',         icon: 'more_horiz', color: '#64748b', border: '#94a3b8' },
};

export const TIPO_ENTRADA_MAP = {
  TAREA:          { label: 'Tarea',                   icon: 'task',           color: '#10b981' },
  RECORDATORIO:   { label: 'Recordatorio',            icon: 'notifications',  color: '#3b82f6' },
  POLITICA:       { label: 'Política / Lineamiento',  icon: 'policy',         color: '#482b2c' },
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
  DIRECCION_MKT:     'Dirección MKT',
  DIRECCION_ALTA_CALIDAD: 'Dirección Alta Calidad',
};

export const LINEA_MAP = {
  CALZADO:    { label: 'Calzado',    icon: 'shoe',         color: '#64748b' }, 
  BOTA:       { label: 'Bota',       icon: 'boot',         color: '#475569' }, 
  ROPA:       { label: 'Ropa',       icon: 'checkroom',    color: '#0f172a' },
  ACCESORIOS: { label: 'Accesorios', icon: 'shopping_bag', color: '#94a3b8' },
  MARKETING:  { label: 'Marketing',  icon: 'record_voice_over',     color: '#7c3aed' },
  TODAS:      { label: 'Todas',      icon: 'all_inclusive',         color: '#64748b' },
  OTROS:      { label: 'Otros',      icon: 'more_horiz',            color: '#64748b' },
};

export const LINEAS_POR_AREA = {
  DISENO: [
    { value: 'CALZADO',    label: 'Calzado',    color: '#f97316', icon: 'footprint' },
    { value: 'BOTA',       label: 'Bota',       color: '#482b2c', icon: 'hiking' },
    { value: 'ROPA',       label: 'Ropa',       color: '#ec4899', icon: 'checkroom' },
    { value: 'ACCESORIOS', label: 'Accesorios', color: '#14b8a6', icon: 'watch' },
    { value: 'TODAS',      label: 'Todas',      color: '#64748b', icon: 'all_inclusive' },
    { value: 'OTROS',      label: 'Otros',      color: '#64748b', icon: 'more_horiz' },
  ],
  DIRECCION_MBC: [
    { value: 'COMPRAS',    label: 'Compras',    color: '#482b2c', icon: 'shopping_bag' },
    { value: 'PRODUCCION', label: 'Producción', color: '#482b2c', icon: 'precision_manufacturing' },
    { value: 'INGENIERIA', label: 'Ingeniería', color: '#482b2c', icon: 'engineering' },
    { value: 'DESARROLLO', label: 'Desarrollo', color: '#482b2c', icon: 'construction' },
    { value: 'PT',         label: 'PT',         color: '#482b2c', icon: 'inventory' },
    { value: 'TRAFICO',    label: 'Tráfico',    color: '#482b2c', icon: 'local_shipping' },
    { value: 'DIRECCION',  label: 'Dirección',  color: '#482b2c', icon: 'business' },
    { value: 'OTROS',          label: 'Otros',          color: '#482b2c', icon: 'more_horiz' },
  ],
  DIRECCION_CFI: [
    { value: 'COMPRAS',    label: 'Compras',    color: '#482b2c', icon: 'shopping_bag' },
    { value: 'PRODUCCION', label: 'Producción', color: '#482b2c', icon: 'precision_manufacturing' },
    { value: 'INGENIERIA', label: 'Ingeniería', color: '#482b2c', icon: 'engineering' },
    { value: 'DESARROLLO', label: 'Desarrollo', color: '#482b2c', icon: 'construction' },
    { value: 'PT',         label: 'PT',         color: '#482b2c', icon: 'inventory' },
    { value: 'TRAFICO',    label: 'Tráfico',    color: '#482b2c', icon: 'local_shipping' },
    { value: 'DIRECCION',  label: 'Dirección',  color: '#482b2c', icon: 'business' },
    { value: 'OTROS',          label: 'Otros',          color: '#482b2c', icon: 'more_horiz' },
  ],
  DIRECCION_TIENDAS: [
    { value: 'VISUAL',          label: 'Visual',          color: '#482b2c', icon: 'visibility' },
    { value: 'ANALISIS_VENTAS', label: 'Análisis Ventas', color: '#482b2c', icon: 'analytics' },
    { value: 'DIRECCION',       label: 'Dirección',       color: '#482b2c', icon: 'business' },
    { value: 'OTROS',          label: 'Otros',          color: '#482b2c', icon: 'more_horiz' },
  ],
  DIRECCION_MKT: [
    { value: 'REDES_SOCIALES', label: 'Redes Sociales', color: '#482b2c', icon: 'share' },
    { value: 'PAGINA_WEB',     label: 'Página Web',     color: '#482b2c', icon: 'language' },
    { value: 'EVENTOS',        label: 'Eventos',        color: '#482b2c', icon: 'event' },
    { value: 'DISENO_GRAFICO', label: 'Diseño Gráfico', color: '#482b2c', icon: 'brush' },
    { value: 'VISUAL',         label: 'Visual',         color: '#482b2c', icon: 'visibility' },
    { value: 'OTROS',          label: 'Otros',          color: '#482b2c', icon: 'more_horiz' },
  ],
  DIRECCION_ALTA_CALIDAD: [
    { value: 'COMPRAS',    label: 'Compras',    color: '#482b2c', icon: 'shopping_bag' },
    { value: 'PRODUCCION', label: 'Producción', color: '#482b2c', icon: 'precision_manufacturing' },
    { value: 'INGENIERIA', label: 'Ingeniería', color: '#482b2c', icon: 'engineering' },
    { value: 'DESARROLLO', label: 'Desarrollo', color: '#482b2c', icon: 'construction' },
    { value: 'PT',         label: 'PT',         color: '#482b2c', icon: 'inventory' },
    { value: 'TRAFICO',    label: 'Tráfico',    color: '#482b2c', icon: 'local_shipping' },
    { value: 'DIRECCION',  label: 'Dirección',  color: '#482b2c', icon: 'business' },
    { value: 'OTROS',          label: 'Otros',          color: '#482b2c', icon: 'more_horiz' },
  ],
  DIRECCION_ADJUNTA: [
    { value: 'DIRECCION',  label: 'Dirección',  color: '#482b2c', icon: 'business' },
    { value: 'OTROS',          label: 'Otros',          color: '#482b2c', icon: 'more_horiz' },
  ],
  MARKETING: [],
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
  ASIGNACION:     { label: 'Responsable asignado',  icon: 'person_add',   color: '#482b2c' },
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
      { value: 'DIRECCION_MKT',     label: 'Dirección MKT' },
      { value: 'DIRECCION_ALTA_CALIDAD', label: 'Dirección Alta Calidad' },
    ],
    clasificaciones: [
      { value: "IDEA", label: "Idea", color: "#482b2c", icon: "emoji_objects" },
      { value: "INVESTIGACION", label: "Investigación", color: "#3b82f6", icon: "travel_explore" },
      { value: "CORRECCION", label: "Corrección", color: "#ef4444", icon: "edit_location_alt" },
      { value: "ANALISIS", label: "Análisis", color: "#f59e0b", icon: "search_insights" },
      { value: "MUESTRA", label: "Muestra", color: "#10b981", icon: "design_services" },
      { value: "BOCETO", label: "Boceto", color: "#f97316", icon: "draw" },
      { value: "POLITICAS", label: "Políticas", color: "#6366f1", icon: "policy" },
      { value: "OTROS", label: "Otros", color: "#64748b", icon: "more_horiz" },
    ],
    lineas: [
      { value: 'CALZADO',    label: 'Calzado',    color: '#f97316', icon: 'footprint' },
      { value: 'BOTA',       label: 'Bota',       color: '#482b2c', icon: 'hiking' },
      { value: 'ROPA',       label: 'Ropa',       color: '#ec4899', icon: 'checkroom' },
      { value: 'ACCESORIOS', label: 'Accesorios', color: '#14b8a6', icon: 'watch' },
      { value: 'TODAS',      label: 'Todas',      color: '#64748b', icon: 'all_inclusive' },
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
      { value: 'DIRECCION_ALTA_CALIDAD', label: 'Dirección Alta Calidad' },
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
  EXTERNO: {
    areas: [
      { value: 'DIRECCION_MBC',     label: 'Dirección MBC' },
      { value: 'DIRECCION_CFI',     label: 'Dirección CFI' },
      { value: 'DIRECCION_ADJUNTA', label: 'Dirección Adjunta' },
      { value: 'DIRECCION_TIENDAS', label: 'Dirección Tiendas' },
      { value: 'DIRECCION_MKT',     label: 'Dirección MKT' },
      { value: 'DIRECCION_ALTA_CALIDAD', label: 'Dirección Alta Calidad' },
    ],
    clasificaciones: [
      { value: 'OTROS',           label: 'Otros',           color: '#64748b', icon: 'more_horiz' },
    ],
    lineas: [],
  },
};

/** Helper: obtiene catálogos del departamento, con fallback a DISENO */
export const getCatalogos = (departamento) =>
  CATALOGOS_POR_DEPARTAMENTO[departamento] || CATALOGOS_POR_DEPARTAMENTO.DISENO;
