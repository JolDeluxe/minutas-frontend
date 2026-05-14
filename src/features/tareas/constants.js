// src/features/tareas/constants.js

export const TAREA_STATUS_MAP = {
    PENDIENTE:   { label: 'Pendiente',   icon: 'schedule',    color: '#f59e0b', border: '#fbbf24', bg: '#fffbeb', text: '#b45309' },
    EN_PROGRESO: { label: 'En Progreso', icon: 'play_circle', color: '#8b5cf6', border: '#a78bfa', bg: '#f5f3ff', text: '#6d28d9' },
    COMPLETADO:  { label: 'Completado',  icon: 'task_alt',    color: '#10b981', border: '#34d399', bg: '#f0fdf4', text: '#047857' },
    CERRADO:     { label: 'Cerrado',     icon: 'verified',    color: '#000000', border: '#000000', bg: '#f8fafc', text: '#000000' },
    CANCELADO:   { label: 'Cancelado',   icon: 'cancel',      color: '#ef4444', border: '#f87171', bg: '#fef2f2', text: '#b91c1c' },
};

export const TAREA_STATUS_OPTS = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROGRESO', label: 'En Progreso' },
    { value: 'COMPLETADO', label: 'Completado' },
    { value: 'CERRADO', label: 'Cerrado' },
    { value: 'CANCELADO', label: 'Cancelado' },
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
];

export const TAREA_LINEA_OPTS = [
    { value: 'CALZADO', label: 'Calzado' },
    { value: 'BOTA', label: 'Bota' },
    { value: 'ROPA', label: 'Ropa' },
    { value: 'ACCESORIOS', label: 'Accesorios' },
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

export const ROLES_ADMIN = new Set(['GERENCIA', 'JEFE']);
