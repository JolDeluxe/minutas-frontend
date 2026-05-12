import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../constants';

const LINEA_ICONS = {
  CALZADO: 'steps',
  BOTA: 'custom_bota',
  ROPA: 'checkroom',
  ACCESORIOS: 'local_mall',
};

const BootSVG = ({ size = "14px", className }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" className={className}>
    <path d="M186.04 28.48a130 130 0 0 0-5.07.054c-49.926 1.53-75.597 31.9-74.4 57.398c.89 18.922 2.416 37.83 4.444 56.733c19.092-4.165 37.502-6.347 55.134-6.797c11.13-.284 21.945.136 32.434 1.166c-2.545-36.064-5.777-72.215-8.744-108.45c-1.275-.045-2.55-.094-3.797-.105zm21.972 1.466c3.003 36.432 6.283 72.948 8.824 109.553c37.808 6.546 70.754 21.334 97.615 40.987a3378 3378 0 0 0 17.077-73.777c-9.38 2.87-18.88 7.747-24.04 16.015l-13.88 22.23l-2.707-26.065c-3.884-37.403-15.315-58.383-31.798-71.15c-13.105-10.15-30.336-15.402-51.09-17.794zm-33.04 123.758a248 248 0 0 0-3.66.004c-18.41.157-37.85 2.365-58.22 6.947c7.097 57.442 18.488 114.89 30.615 172.664c20.94 1.16 38.01 2.942 54.818 7.325c6.488-61.598 5.21-123.43 1.288-185.515a241 241 0 0 0-24.842-1.426zm43.08 4.182c3.85 62.53 4.95 125.308-2.007 188.322c13.285 4.984 27.21 11.94 43.518 21.807l2.67 1.617l1.097 2.922c12.882 34.34 25.885 69.15 31.828 104.648c68.924-1.1 149.596 3.353 197.332-3.967c-40-52.644-101.235-64.218-147.013-70.672c-9.992-.196-18.673.505-31.99 1.596c6.397-6.884 10.99-11.14 16.503-13.43l-54.908-63.407l1.387-4.717c11.695-39.76 22.927-81.474 33.292-123.058c-24.73-19.558-55.586-34.706-91.71-41.662zM69.51 279.98l-8.883 26.654q-.678.26-1.336.56l-25.136-12.568l12.57 25.137q-.3.658-.562 1.336l-26.652 8.88l26.652 8.886q.262.677.56 1.334l-12.568 25.137L59.29 352.77q.66.299 1.337.56l8.883 26.65l8.885-26.65q.675-.261 1.334-.56l25.135 12.567L92.3 340.2c.074-.166.138-.338.21-.506c17.088 5.487 30.27 8.56 48.287 11.533c.157-9.57 2.457-14.43 2.775-17.867c-15.31-1.792-29.058-6.342-44.04-10.197l-6.675-2.065q-.26-.676-.558-1.335l12.565-25.137l-25.136 12.568q-.66-.3-1.335-.56zm0 38.638c6.356 0 11.363 5.007 11.363 11.363c0 6.358-5.007 11.365-11.363 11.365c-6.357 0-11.364-5.007-11.364-11.364c0-6.355 5.007-11.362 11.364-11.362zm71.39 32.57c-11.994 19.473-18.548 50.984-24.37 71.516c34.156 6.413 72.87 2.2 100.835 11.896c19.624 6.545 38.616 17.945 57.326 31.65c-6.132-27.707-16.43-55.875-27.102-84.362c-41.578-24.765-63.012-28.43-106.688-30.7zm-22.96 89.72c5.37 14.482 15.01 27.736 29.4 41.347c10.983 1.942 24.74 1.31 37.1.396c2.596-11.198 7.043-22.792 14.148-33.626c-27.144-4.143-53.522-5.665-80.65-8.117z"/>
  </svg>
);

const DRAFT_KEY = (id) => `minuta_draft_${id}`;

const loadDraft = (id) => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveDraft = (id, draft) => {
  try { localStorage.setItem(DRAFT_KEY(id), JSON.stringify(draft)); }
  catch { /* quota exceeded — safe to ignore */ }
};

const clearDraft = (id) => {
  try { localStorage.removeItem(DRAFT_KEY(id)); }
  catch { /* safe to ignore */ }
};

/**
 * QuickComposer — Herramienta principal de captura.
 *
 * Diseño: composer dominante, siempre visible, sticky bottom.
 * Colapsado: una línea + botón enviar.
 * Expandido (on focus): chips de clasificación + área.
 * Draft persistence: localStorage keyed por minutaId.
 *
 * ESLint clean: no setState in useEffect — uses lazy initializers.
 */
export const QuickComposer = ({
  minutaId,
  lineaDefault,
  onSubmit,
  submitting = false,
  isDesktop = false,
}) => {
  // Lazy initializers from localStorage draft
  const [descripcion, setDescripcion] = useState(() => loadDraft(minutaId)?.descripcion || '');
  const [clasificacion, setClasificacion] = useState(() => loadDraft(minutaId)?.clasificacion || '');
  const [area, setArea] = useState(() => loadDraft(minutaId)?.area || 'DISENO');
  const [linea, setLinea] = useState(() => loadDraft(minutaId)?.linea || lineaDefault || '');
  const [expanded, setExpanded] = useState(() => Boolean(loadDraft(minutaId)?.descripcion));

  const textareaRef = useRef(null);
  const composerRef = useRef(null);

  // Persist draft on every keystroke
  useEffect(() => {
    if (descripcion || clasificacion || linea !== lineaDefault) {
      saveDraft(minutaId, { descripcion, clasificacion, area, linea });
    }
  }, [descripcion, clasificacion, area, linea, minutaId, lineaDefault]);

  // Auto-resize textarea
  const handleInput = useCallback((e) => {
    setDescripcion(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
    }
  }, []);

  // Click-outside collapses when empty
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => {
      if (composerRef.current && !composerRef.current.contains(e.target) && !descripcion.trim()) {
        setExpanded(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [expanded, descripcion]);

  const handleSubmit = async () => {
    if (!descripcion.trim() || submitting) return;
    const finalClasificacion = area === 'DISENO' ? (clasificacion || undefined) : 'OTROS';
    const payload = {
      tareas: [{
        descripcion: descripcion.trim(),
        area,
        linea: linea || undefined,
        clasificacion: finalClasificacion,
        minutaId: Number(minutaId),
      }],
    };
    try {
      await onSubmit(payload);
      setDescripcion('');
      setClasificacion('');
      setArea('DISENO');
      setLinea(lineaDefault || '');
      clearDraft(minutaId);
      setExpanded(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch {
      // Error handled by parent via notify
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 768) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Desktop: Top placed below filters
  // Mobile: fixed above MobileBottomNav (which is approx 64px-72px tall)
  const wrapperClass = isDesktop
    ? 'border-b border-slate-200/50 bg-white/60 backdrop-blur-md shrink-0'
    : 'fixed bottom-[72px] left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]';

  return (
    <div
      ref={composerRef}
      className={wrapperClass}
      style={{
        ...glassBase('surface'),
        borderRadius: isDesktop ? 0 : 0,
        borderBottom: 'none',
        borderLeft: isDesktop ? undefined : 'none',
        borderRight: isDesktop ? undefined : 'none',
      }}
    >
      <GlassSheen />
      <div className="relative z-10 px-3 pt-2.5 pb-2">
        {/* Main row */}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={descripcion}
            onChange={handleInput}
            onFocus={() => setExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder="Capturar entrada..."
            rows={1}
            disabled={submitting}
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm bg-white/80 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-marca-secundario/25 focus:border-marca-secundario placeholder:text-slate-400 transition-all"
            style={{ minHeight: 40, maxHeight: 100, fontSize: '16px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!descripcion.trim() || submitting}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90',
              descripcion.trim()
                ? 'bg-marca-primario text-white shadow-lg shadow-marca-primario/30'
                : 'bg-slate-200 text-slate-400'
            )}
          >
            <Icon
              name={submitting ? 'progress_activity' : (isDesktop ? 'arrow_downward' : 'arrow_upward')}
              size="20px"
              className={cn(submitting && 'animate-spin')}
            />
          </button>
        </div>

        {/* Expandable: clasificación chips + área */}
        <div className={cn(
          'overflow-hidden transition-all duration-300 ease-out flex flex-col gap-2',
          (expanded || isDesktop) ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
        )}>
          {/* Fila 1: Área y Línea */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 self-center">Área</span>
            {Object.entries(AREA_MAP).map(([key, label]) => {
              const on = area === key;
              return (
                <button key={key} onClick={() => {
                  setArea(key);
                  if (key !== 'DISENO') setClasificacion('OTROS');
                }}
                  className={cn(
                    'px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95',
                    on ? 'bg-slate-700 text-white shadow-sm' : 'bg-white/70 text-slate-600 border border-slate-200/60 hover:bg-slate-50'
                  )}
                >
                  {label}
                </button>
              );
            })}
            
            {area === 'DISENO' && (
              <>
                <div className="w-px h-4 bg-slate-300 shrink-0 self-center mx-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 self-center">Línea</span>
                {Object.entries(LINEA_MAP).map(([key, label]) => {
                  const on = linea === key;
                  return (
                    <button key={key} onClick={() => setLinea(key)}
                      className={cn(
                        'flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95',
                        on ? 'bg-marca-primario text-white shadow-sm' : 'bg-white/70 text-slate-600 border border-slate-200/60 hover:bg-slate-50'
                      )}
                    >
                      {key === 'BOTA' ? (
                        <BootSVG size="14px" className={on ? 'text-white' : 'text-slate-400'} />
                      ) : (
                        <Icon name={LINEA_ICONS[key] || 'label'} size="14px" className={on ? 'text-white' : 'text-slate-400'} />
                      )}
                      {label}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Fila 2: Clasificación (solo si es Diseño) */}
          {area === 'DISENO' && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
              {Object.entries(CLASIFICACION_MAP).map(([key, val]) => {
                const on = clasificacion === key;
                return (
                  <button key={key} onClick={() => setClasificacion(on ? '' : key)}
                    className={cn(
                      'flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95',
                      on ? 'text-white shadow-sm' : 'bg-white/70 text-slate-600 border border-slate-200/60 hover:bg-slate-50'
                    )}
                    style={on ? { backgroundColor: val.color } : undefined}
                  >
                    <Icon name={val.icon} size="14px" className={on ? 'text-white' : ''} style={!on ? { color: val.color } : undefined} />
                    {val.label}
                  </button>
                );
              })}
              {descripcion.trim() && (
                <span className="text-[9px] text-slate-400 ml-auto flex items-center gap-0.5 self-center">
                  <Icon name="save" size="10px" />borrador
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
