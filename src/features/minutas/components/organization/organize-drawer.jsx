import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, ESTADO_CONCEPTUAL_MAP, PRIORIDAD_MAP } from '../../constants';

/**
 * OrganizeDrawer — Bottom sheet para organización post-junta.
 *
 * ESLint clean: Uses `key` prop reset pattern — parent should render:
 *   <OrganizeDrawer key={entry?.id} ... />
 * This forces remount, allowing lazy initializers instead of setState-in-useEffect.
 *
 * z-100 instead of z-[100].
 */
export const OrganizeDrawer = ({
  isOpen,
  onClose,
  entry,
  onSave,
  submitting = false,
}) => {
  // Lazy initializers — parent should use `key={entry?.id}` to force fresh state
  const [prioridad, setPrioridad] = useState(() => entry?.prioridad || '');
  const [estadoConceptual, setEstadoConceptual] = useState(() => entry?.estadoConceptual || 'CAPTURADO');
  const [formalizar, setFormalizar] = useState(() => entry?.formalizada || false);
  const [requiereSeguimiento, setRequiereSeguimiento] = useState(() => entry?.requiereSeguimiento || false);
  const [fechaSeguimiento, setFechaSeguimiento] = useState(() => {
    if (!entry?.fechaSeguimiento) return '';
    return new Date(entry.fechaSeguimiento).toISOString().split('T')[0];
  });
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    if (!entry?.fechaVencimiento) return '';
    return new Date(entry.fechaVencimiento).toISOString().split('T')[0];
  });

  const clasif = useMemo(() => CLASIFICACION_MAP[entry?.clasificacion] || null, [entry?.clasificacion]);

  if (!isOpen || !entry) return null;

  const handleSubmit = async () => {
    const payload = {
      prioridad: prioridad || undefined,
      estadoConceptual,
      formalizada: formalizar,
      requiereSeguimiento,
    };
    if (fechaSeguimiento) payload.fechaSeguimiento = new Date(fechaSeguimiento).toISOString();
    if (fechaVencimiento) payload.fechaVencimiento = new Date(fechaVencimiento).toISOString();
    await onSave(entry.id, payload);
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className={cn(
        'relative bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl',
        'max-h-[85vh] flex flex-col'
      )}>
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="tune" size="18px" className="text-marca-primario" />
            <h2 className="text-sm font-bold text-slate-900">Organizar Entrada</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100">
            <Icon name="close" size="18px" className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Context */}
          <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-200"
            style={{ borderLeftWidth: 3, borderLeftColor: clasif?.border || '#e2e8f0' }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              {clasif && <span className="text-[10px] font-bold uppercase" style={{ color: clasif.color }}>{clasif.label}</span>}
              <span className="text-[10px] text-slate-400 font-mono">#{entry.id}</span>
            </div>
            <p className="text-[13px] text-slate-700 leading-snug">{entry.descripcion}</p>
          </div>

          {/* Estado Conceptual */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Estado</label>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(ESTADO_CONCEPTUAL_MAP).map(([key, val]) => (
                <button key={key} onClick={() => setEstadoConceptual(key)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95',
                    estadoConceptual === key ? 'text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200'
                  )}
                  style={estadoConceptual === key ? { backgroundColor: val.color } : undefined}
                >
                  <Icon name={val.icon} size="14px" />{val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Prioridad</label>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(PRIORIDAD_MAP).map(([key, val]) => (
                <button key={key} onClick={() => setPrioridad(prioridad === key ? '' : key)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95',
                    prioridad === key ? 'text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200'
                  )}
                  style={prioridad === key ? { backgroundColor: val.color } : undefined}
                >
                  <Icon name={val.icon} size="14px" />{val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            {[
              { value: formalizar, set: setFormalizar, icon: 'verified', label: 'Formalizar', sub: 'Trabajo operativo real', activeColor: 'bg-emerald-500' },
              { value: requiereSeguimiento, set: setRequiereSeguimiento, icon: 'update', label: 'Seguimiento', sub: 'Revisión futura', activeColor: 'bg-blue-500' },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Icon name={t.icon} size="16px" className={t.value ? 'text-emerald-600' : 'text-slate-400'} />
                  <div>
                    <p className="text-[12px] font-bold text-slate-800 leading-tight">{t.label}</p>
                    <p className="text-[10px] text-slate-500">{t.sub}</p>
                  </div>
                </div>
                <button onClick={() => t.set(!t.value)}
                  className={cn('w-10 h-6 rounded-full transition-all relative', t.value ? t.activeColor : 'bg-slate-300')}>
                  <div className={cn('w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all', t.value ? 'left-5' : 'left-1')} />
                </button>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Seguimiento', value: fechaSeguimiento, set: setFechaSeguimiento },
              { label: 'Vencimiento', value: fechaVencimiento, set: setFechaVencimiento },
            ].map((d) => (
              <div key={d.label}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{d.label}</label>
                <input type="date" value={d.value} onChange={(e) => d.set(e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-marca-secundario/20"
                  style={{ fontSize: '16px' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex gap-2 pb-[env(safe-area-inset-bottom)]">
          <Button variant="cancelar" onClick={onClose} disabled={submitting} className="flex-1" size="sm">Cancelar</Button>
          <Button variant="guardar" icon="done_all" onClick={handleSubmit} isLoading={submitting} className="flex-1" size="sm">Guardar</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
