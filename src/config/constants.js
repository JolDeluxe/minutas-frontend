/**
 * Colores para Badges de Estado — Sistema de Minutas
 */

// Estado Conceptual (Seguimiento del tema)
export const ESTADO_CONCEPTUAL_COLORS = {
  CAPTURADO:   'bg-slate-100 text-slate-600 border-slate-300',
  EN_REVISION: 'bg-blue-100 text-blue-700 border-blue-300',
  CERRADO:     'bg-emerald-100 text-emerald-700 border-emerald-300',
  DESCARTADO:  'bg-red-100 text-red-700 border-red-300',
};

// Estado Operativo (Ejecución real de trabajo)
export const ESTADO_OPERATIVO_COLORS = {
  PENDIENTE:   'bg-slate-100 text-slate-600 border-slate-300',
  EN_PROGRESO: 'bg-amber-100 text-amber-700 border-amber-300',
  COMPLETADO:  'bg-emerald-100 text-emerald-700 border-emerald-300',
};

// Estado Tarea (Compatibilidad / estado global)
export const ESTADO_TAREA_COLORS = {
  PENDIENTE:   'bg-slate-100 text-slate-600 border-slate-300',
  EN_PROGRESO: 'bg-amber-100 text-amber-700 border-amber-300',
  COMPLETADO:  'bg-purple-100 text-purple-700 border-purple-300',
  CERRADO:     'bg-emerald-100 text-emerald-700 border-emerald-300',
};

// Clasificación (Naturaleza del tema)
export const CLASIFICACION_COLORS = {
  IDEA:          'bg-violet-100 text-violet-700 border-violet-300',
  INVESTIGACION: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  CORRECCION:    'bg-orange-100 text-orange-700 border-orange-300',
  ANALISIS:      'bg-cyan-100 text-cyan-700 border-cyan-300',
  MUESTRA:       'bg-pink-100 text-pink-700 border-pink-300',
  POLITICAS:     'bg-gray-100 text-gray-700 border-gray-300',
  OTROS:         'bg-stone-100 text-stone-600 border-stone-300',
};

// Prioridad
export const PRIORIDAD_COLORS = {
  BAJA:    'text-emerald-600 font-medium',
  MEDIA:   'text-amber-500 font-medium',
  ALTA:    'text-red-500 font-bold',
  CRITICA: 'text-red-900 font-black uppercase tracking-tighter italic',
};

// Labels legibles
export const CLASIFICACION_LABELS = {
  IDEA: 'Idea',
  INVESTIGACION: 'Investigación',
  CORRECCION: 'Corrección',
  ANALISIS: 'Análisis',
  MUESTRA: 'Muestra',
  POLITICAS: 'Políticas',
  OTROS: 'Otros',
};