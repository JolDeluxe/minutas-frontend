// minutas-frontend/src/features/minutas/components/minuta-resumen/seccion-ia.jsx
/**
 * SeccionIA — Bloque reutilizable para las secciones generadas por Gemini.
 * Usa SOLO componentes del sistema: Button, Icon de @/components/ui/z_index.
 */
import { useState, useEffect, useRef } from 'react';
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

export const SeccionIA = ({
  titulo,
  icono = 'article',
  valor = '',
  onGuardar,
  placeholder = 'Aún no se ha generado este contenido.',
  accentColor = 'slate',
}) => {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor || '');
  const [guardando, setGuardando] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => { setTexto(valor || ''); }, [valor]);

  useEffect(() => {
    if (editando && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editando]);

  const handleGuardar = async () => {
    if (!onGuardar) return;
    setGuardando(true);
    try {
      await onGuardar(texto);
      setEditando(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setTexto(valor || '');
    setEditando(false);
  };

  const colorMap = {
    slate:   { border: 'border-slate-200',  header: 'bg-slate-50',       icon: 'text-slate-400',   badge: 'bg-slate-100 text-slate-500 border-slate-200' },
    violet:  { border: 'border-violet-100', header: 'bg-violet-50/60',   icon: 'text-violet-400',  badge: 'bg-violet-50 text-violet-600 border-violet-200' },
    blue:    { border: 'border-blue-100',   header: 'bg-blue-50/60',     icon: 'text-blue-400',    badge: 'bg-blue-50 text-blue-600 border-blue-200' },
    amber:   { border: 'border-amber-100',  header: 'bg-amber-50/60',    icon: 'text-amber-400',   badge: 'bg-amber-50 text-amber-600 border-amber-200' },
    emerald: { border: 'border-emerald-100',header: 'bg-emerald-50/60',  icon: 'text-emerald-400', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  };
  const c = colorMap[accentColor] || colorMap.slate;

  return (
    <div className={cn('rounded-2xl border bg-white shadow-sm overflow-hidden transition-all', c.border)}>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 border-b', c.header, c.border)}>
        <div className="flex items-center gap-2.5">
          <Icon name={icono} size="18px" className={c.icon} />
          <h3 className="fuente-titulos text-[11px] font-black tracking-widest uppercase text-slate-700">
            {titulo}
          </h3>
        </div>

        {!editando && onGuardar && (
          <Button
            variant="soft"
            size="sm"
            icon="edit"
            onClick={() => setEditando(true)}
            className="h-6 px-2 text-[9px]"
          >
            Editar
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {editando ? (
          <div className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={5}
              className="w-full text-sm text-slate-700 leading-relaxed resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario transition-all"
              placeholder={placeholder}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="cancelar"
                size="sm"
                onClick={handleCancelar}
                disabled={guardando}
                className="h-7 px-3 text-[11px]"
              >
                Cancelar
              </Button>
              <Button
                variant="guardar"
                size="sm"
                icon={guardando ? 'progress_activity' : 'check'}
                onClick={handleGuardar}
                loading={guardando}
                disabled={guardando}
                className="h-7 px-4 text-[11px]"
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        ) : (
          <p className={cn(
            'text-sm leading-relaxed whitespace-pre-wrap',
            texto ? 'text-slate-700' : 'text-slate-400 italic'
          )}>
            {texto || placeholder}
          </p>
        )}
      </div>
    </div>
  );
};
