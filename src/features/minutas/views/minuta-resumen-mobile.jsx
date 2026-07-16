// minutas-frontend/src/features/minutas/views/minuta-resumen-mobile.jsx
/**
 * MinutaResumenMobile — Vista mobile del Resumen de Minuta (Manual, sin IA).
 *
 * Layout vertical:
 *  1. Header
 *  2. Gráfico de dona + estadísticas (fila compacta)
 *  3. Secciones del Resumen en acordeón colapsable
 */
import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { SeccionIA } from '../components/minuta-resumen/seccion-ia';
import { GraficoEstados } from '../components/minuta-resumen/grafico-estados';
import { SeccionImagenes } from '../components/minuta-resumen/seccion-imagenes';

export const MinutaResumenMobile = ({
  minuta,
  tareas = [],
  resumenLocal,
  isAdmin,
  onGuardar,
  onGuardarImagenes,
  onSwitchToTareas,
}) => {
  const hayResumen = !!(
    resumenLocal.temas || 
    resumenLocal.acuerdos || 
    resumenLocal.proximosPasos ||
    resumenLocal.imagenUrl1 ||
    resumenLocal.imagenUrl2 ||
    resumenLocal.imagenUrl3
  );
  const tareasFiltradas = tareas.filter(t => 
    !t.tempId && 
    t.tipo !== 'DESCARTADA' && 
    t.estado !== 'CANCELADA' && 
    t.estado !== 'DESCARTADA'
  );

  const [graficaExpanded, setGraficaExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm shrink-0">
            <Icon name="summarize" size="14px" className="text-white" />
          </div>
          <div>
            <h2 className="fuente-titulos text-sm font-black tracking-tight text-slate-900">
              Resumen de Minuta
            </h2>
            <p className="text-[9px] text-slate-400 font-medium">Temas, acuerdos y próximos pasos</p>
          </div>
        </div>
      </div>

      {/* ── Acordeón de gráfica ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setGraficaExpanded(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100"
        >
          <div className="flex items-center gap-2">
            <Icon name="pie_chart" size="15px" className="text-slate-400" />
            <span className="fuente-titulos text-[11px] font-black tracking-widest uppercase text-slate-700">
              Tareas / Actividades
            </span>
          </div>
          <Icon
            name={graficaExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            size="16px"
            className="text-slate-400"
          />
        </button>

        {graficaExpanded && (
          <div className="p-4 space-y-4">
            {/* 1. Gráfico de estados (Dona + Leyenda de Estados) centrado y completo */}
            <div className="w-full">
              <GraficoEstados tareas={tareasFiltradas} onVerDetalle={onSwitchToTareas} />
            </div>

            {/* Separador */}
            <div className="border-t border-slate-100 pt-3" />

            {/* 2. Estadísticas de tipos de tareas en una cuadrícula limpia */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Resumen por Tipo
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Total', value: tareasFiltradas.length, icon: 'list_alt', color: 'text-slate-500' },
                  { label: 'Tareas', value: tareasFiltradas.filter(t => t.tipo === 'TAREA').length, icon: 'task_alt', color: 'text-blue-500' },
                  { label: 'Políticas', value: tareasFiltradas.filter(t => t.tipo === 'POLITICA').length, icon: 'policy', color: 'text-purple-500' },
                  { label: 'Recordatorios', value: tareasFiltradas.filter(t => t.tipo === 'RECORDATORIO').length, icon: 'notifications_active', color: 'text-amber-500' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon name={icon} size="14px" className={color} />
                      <span className="text-[10px] text-slate-500 font-bold truncate">{label}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-800 font-mono ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Secciones del Resumen ── */}
      {!hayResumen && (
        <div className="flex flex-col items-center justify-center text-center gap-3 py-8 px-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl shadow-sm text-slate-400">
            <Icon name="description" size="20px" />
          </div>
          <div>
            <p className="fuente-titulos font-black text-slate-700 text-sm">Sin resumen redactado</p>
            <p className="text-xs text-slate-400 mt-1">
              {isAdmin 
                ? 'Toca "Editar" en cualquiera de las secciones para redactar el resumen de la minuta.'
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

      <SeccionImagenes
        minuta={minuta}
        isAdmin={isAdmin}
        onGuardar={onGuardarImagenes}
      />
    </div>
  );
};
