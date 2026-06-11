// minutas-frontend/src/features/minutas/views/minuta-resumen-desktop.jsx
/**
 * MinutaResumenDesktop — Vista desktop del Resumen de Minuta (Manual, sin IA).
 *
 * Layout: 2 columnas
 *  Izquierda (1/3): Gráfico de tareas + estadísticas
 *  Derecha  (2/3): Secciones de Resumen (Temas, Acuerdos, Próximos Pasos)
 */
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { SeccionIA } from '../components/minuta-resumen/seccion-ia';
import { GraficoEstados } from '../components/minuta-resumen/grafico-estados';

export const MinutaResumenDesktop = ({
  minuta,
  tareas = [],
  resumenLocal,
  isAdmin,
  onGuardar,
  onSwitchToTareas,
}) => {
  const hayResumen = !!(resumenLocal.temas || resumenLocal.acuerdos || resumenLocal.proximosPasos);
  const tareasFiltradas = tareas.filter(t => 
    !t.tempId && 
    t.tipo !== 'DESCARTADA' && 
    t.estado !== 'CANCELADA' && 
    t.estado !== 'DESCARTADA'
  );

  return (
    <div className="flex flex-col gap-5 py-2 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
            <Icon name="summarize" size="16px" className="text-white" />
          </div>
          <div>
            <h2 className="fuente-titulos text-base font-black tracking-tight text-slate-900">
              Resumen de Minuta
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              Registro de temas, acuerdos y próximos pasos de la junta
            </p>
          </div>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Columna izquierda — Gráfico + Estadísticas */}
        <div className="col-span-1 flex flex-col gap-4">

          {/* Card Principal de Métricas */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-5">
            
            {/* Título de la sección */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Icon name="analytics" size="18px" className="text-slate-500" />
              <h3 className="fuente-titulos text-[11px] font-black tracking-widest uppercase text-slate-700">
                Métricas de la Minuta
              </h3>
            </div>

            {/* Gráfico Donut de Estados */}
            <div className="w-full">
              <GraficoEstados
                tareas={tareasFiltradas}
                onVerDetalle={onSwitchToTareas}
              />
            </div>

            {/* Estadísticas de tipos de tareas en una cuadrícula limpia */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                Distribución por Tipo
              </h4>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Total', value: tareasFiltradas.length, icon: 'list_alt', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100' },
                  { label: 'Tareas', value: tareasFiltradas.filter(t => t.tipo === 'TAREA').length, icon: 'task_alt', color: 'text-blue-500', bg: 'bg-blue-50/30 border-blue-100/50' },
                  { label: 'Políticas', value: tareasFiltradas.filter(t => t.tipo === 'POLITICA').length, icon: 'policy', color: 'text-purple-500', bg: 'bg-purple-50/30 border-purple-100/50' },
                  { label: 'Recordatorios', value: tareasFiltradas.filter(t => t.tipo === 'RECORDATORIO').length, icon: 'notifications_active', color: 'text-amber-500', bg: 'bg-amber-50/30 border-amber-100/50' },
                ].map(({ label, value, icon, color, bg }) => (
                  <div key={label} className={cn("flex flex-col gap-1 p-2.5 rounded-xl border transition-all hover:shadow-sm", bg)}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon name={icon} size="14px" className={color} />
                      <span className="text-[10px] text-slate-500 font-bold truncate">{label}</span>
                    </div>
                    <span className="text-lg font-black text-slate-800 font-mono tracking-tight mt-0.5">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Columna derecha — Secciones del Resumen */}
        <div className="col-span-2 flex flex-col gap-4">
          {!hayResumen && (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-10 px-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl shadow-sm text-slate-400">
                <Icon name="description" size="24px" />
              </div>
              <div>
                <p className="fuente-titulos font-black text-slate-700 text-sm">Sin resumen redactado</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {isAdmin 
                    ? 'Haz clic en "Editar" en cualquiera de las secciones para redactar el resumen de la minuta.'
                    : 'No se ha registrado ningún resumen para esta minuta aún.'
                  }
                </p>
              </div>
            </div>
          )}

          <SeccionIA
            titulo="Temas Tratados"
            icono="topic"
            accentColor="violet"
            valor={resumenLocal.temas}
            placeholder="No se han registrado temas tratados aún."
            onGuardar={isAdmin ? (val) => onGuardar('temas', val) : null}
          />

          <SeccionIA
            titulo="Acuerdos"
            icono="handshake"
            accentColor="blue"
            valor={resumenLocal.acuerdos}
            placeholder="No se han registrado acuerdos aún."
            onGuardar={isAdmin ? (val) => onGuardar('acuerdos', val) : null}
          />

          <SeccionIA
            titulo="Próximos Pasos"
            icono="checklist"
            accentColor="emerald"
            valor={resumenLocal.proximosPasos}
            placeholder="No se han registrado próximos pasos aún."
            onGuardar={isAdmin ? (val) => onGuardar('proximosPasos', val) : null}
          />
        </div>
      </div>
    </div>
  );
};
