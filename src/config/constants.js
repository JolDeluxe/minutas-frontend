/**
 * Colores para Badges de Estado (bg, text, border)
 * Según requerimiento: Pendiente(Gris), Asignada(Azul), Progreso(Amarillo), 
 * Resuelto(Morado), Cerrado(Verde), Cancelada(Roja)
 */
export const STATUS_COLORS = {
  PENDIENTE:   'bg-slate-100 text-slate-600 border-slate-300',
  ASIGNADA:    'bg-blue-100 text-blue-700 border-blue-300',
  EN_PROGRESO: 'bg-amber-100 text-amber-700 border-amber-300',
  RESUELTO:    'bg-purple-100 text-purple-700 border-purple-300',
  CERRADO:     'bg-emerald-100 text-emerald-700 border-emerald-300',
  CANCELADA:   'bg-red-100 text-red-700 border-red-300',
  RECHAZADO:   'bg-red-200 text-red-900 border-red-400',
};

/**
 * Colores para texto de Prioridad
 * Según requerimiento: Baja(Verde), Media(Amarilla), Alta(Roja), Crítica(Rojo Obscuro)
 */
export const PRIORIDAD_COLORS = {
  BAJA:    'text-emerald-600 font-medium',
  MEDIA:   'text-amber-500 font-medium',
  ALTA:    'text-red-500 font-bold',
  CRITICA: 'text-red-900 font-black uppercase tracking-tighter italic',
};