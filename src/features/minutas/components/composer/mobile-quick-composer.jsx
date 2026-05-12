import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { CLASIFICACION_MAP, AREA_MAP, LINEA_MAP } from '../../constants';

/**
 * MobileQuickComposer — Versión Sólida y Robusta para móviles.
 * Sin efectos de cristal, enfocada en contraste y facilidad de uso.
 */
export const MobileQuickComposer = ({ 
  minutaId, 
  lineaDefault, 
  onSubmit, 
  submitting 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [texto, setTexto] = useState('');
  const [area, setArea] = useState('DISENO');
  const [linea, setLinea] = useState(lineaDefault || 'CALZADO');
  const [clasificacion, setClasificacion] = useState('IDEA');

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!texto.trim() || submitting) return;

    onSubmit({
      tareas: [{
        tempId: Date.now(),
        descripcion: texto.trim(),
        area,
        linea,
        clasificacion: area === 'DISENO' ? (clasificacion || 'OTROS') : 'OTROS',
        minutaId: Number(minutaId),
        fecha: new Date().toISOString()
      }]
    });

    setTexto('');
    setExpanded(false);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (touchEnd - touchStart > 80 && expanded) setExpanded(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      {/* Overlay Sólido */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-slate-900/30 z-[40]"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Drawer Sólido */}
      <div 
        className={cn(
          "fixed bottom-20 left-4 right-4 z-[50] transition-all duration-300 ease-out bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border border-slate-200 flex flex-col",
          expanded ? "h-[65vh] rounded-[2.5rem]" : "h-20 rounded-2xl"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Handle */}
        <div className="w-full flex flex-col items-center py-2 shrink-0" onClick={() => setExpanded(!expanded)}>
          <div className="w-10 h-1 bg-slate-200 rounded-full mb-1" />
        </div>

        <div className="flex-1 flex flex-col px-5 overflow-hidden">
          
          <div className="flex items-center gap-3 shrink-0">
            <textarea 
              placeholder="Escribe aquí..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onFocus={() => setExpanded(true)}
              rows={expanded ? 2 : 1}
              className={cn(
                "flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-base font-bold transition-all resize-none",
                !expanded && "h-12 py-2"
              )}
            />
            {!expanded && (
              <button onClick={handleSubmit} disabled={!texto.trim()} className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all">
                <Icon name="add" size="24px" />
              </button>
            )}
          </div>

          <div className={cn(
            "mt-4 flex-1 flex transition-all duration-300",
            expanded ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            
            {/* Selectores */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Clasificación</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(CLASIFICACION_MAP).slice(0, 4).map(([key, val]) => (
                    <button key={key} onClick={() => setClasificacion(key)} className={cn("px-2.5 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all", clasificacion === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-100")}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Línea</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(LINEA_MAP).map(([key, label]) => (
                    <button key={key} onClick={() => setLinea(key)} className={cn("px-2.5 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all", linea === key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-100")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Área</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(AREA_MAP).map(([key, label]) => (
                    <button key={key} onClick={() => setArea(key)} className={cn("px-2.5 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all", area === key ? "bg-marca-primario text-white border-marca-primario" : "bg-white text-slate-500 border-slate-100")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botón de Envío Gigante */}
            <div className="shrink-0 flex items-center justify-center pl-4">
              <button
                onClick={handleSubmit}
                disabled={!texto.trim() || submitting}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl",
                  texto.trim() ? "bg-emerald-600 text-white shadow-emerald-600/40" : "bg-slate-100 text-slate-200"
                )}
              >
                <Icon name={submitting ? "progress_activity" : "add"} className={cn(submitting && "animate-spin")} size="48px" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
