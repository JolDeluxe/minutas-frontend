// src/features/tareas/constants.js

export const TAREA_STATUS_MAP = {
    PENDIENTE:   { label: 'Pendiente',   icon: 'schedule',    color: '#f59e0b', border: '#fbbf24', bg: '#fffbeb', text: '#b45309' },
    EN_REVISION: { label: 'En Revisión', icon: 'visibility', color: '#3b82f6', border: '#60a5fa', bg: '#eff6ff', text: '#1d4ed8' },
    CERRADA:     { label: 'Cerrada',     icon: 'verified',    color: '#000000', border: '#000000', bg: '#f8fafc', text: '#000000' },
    CANCELADA:   { label: 'Cancelada',   icon: 'cancel',      color: '#ef4444', border: '#f87171', bg: '#fef2f2', text: '#b91c1c' },
};

export const TAREA_STATUS_OPTS = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_REVISION', label: 'En Revisión' },
    { value: 'CERRADA', label: 'Cerrada' },
    { value: 'CANCELADA', label: 'Cancelada' },
];

export const ENTRADA_TIPO_OPTS = [
    { value: 'SIN_ORGANIZAR', label: 'Sin Organizar' },
    { value: 'TAREA', label: 'Tarea' },
    { value: 'RECORDATORIO', label: 'Recordatorio' },
    { value: 'POLITICA', label: 'Política / Lineamiento' },
    { value: 'DESCARTADA', label: 'Descartada / Informativa' },
];

export const TAREA_PRIORIDAD_OPTS = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' },
];

export const TAREA_AREA_OPTS = [
    { value: 'DISENO', label: 'Diseño' },
    { value: 'DIRECCION_MBC', label: 'Dirección MBC' },
    { value: 'DIRECCION_CFI', label: 'Dirección CFI' },
    { value: 'DIRECCION_ADJUNTA', label: 'Dirección Adjunta' },
    { value: 'DIRECCION_TIENDAS', label: 'Dirección Tiendas' },
    { value: 'DIRECCION_MKT', label: 'Dirección MKT' },
    { value: 'DIRECCION_ALTA_CALIDAD', label: 'Dirección Alta Calidad' },
];

export const TAREA_LINEA_OPTS = [
    { value: 'CALZADO', label: 'Calzado' },
    { value: 'BOTA', label: 'Bota' },
    { value: 'ROPA', label: 'Ropa' },
    { value: 'ACCESORIOS', label: 'Accesorios' },
    { value: 'TODAS', label: 'Todas' },
];

export const TAREA_CLASIFICACION_OPTS = [
    { value: 'IDEA', label: 'Idea' },
    { value: 'INVESTIGACION', label: 'Investigación' },
    { value: 'CORRECCION', label: 'Corrección' },
    { value: 'ANALISIS', label: 'Análisis' },
    { value: 'MUESTRA', label: 'Muestra' },
    { value: 'POLITICAS', label: 'Políticas' },
    { value: 'OTROS', label: 'Otros' },
];

export const ROLES_ADMIN = new Set(['ADMIN', 'GERENCIA', 'JEFE']);
