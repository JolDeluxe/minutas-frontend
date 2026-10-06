// minutas-frontend/src/features/minutas/components/minuta-resumen/seccion-asistentes.jsx
import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { useAuthStore } from '@/stores/auth-store';

export const SeccionAsistentes = ({
  minuta,
  isAdmin,
  onGuardar,
}) => {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [nombreManual, setNombreManual] = useState('');

  const { user: authUser } = useAuthStore();
  const currentUser = authUser?.data || authUser;

  const { users: allUsers, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Parsear asistentes guardados
  const parseAsistentes = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const initialAsistentes = useMemo(() => {
    const guardados = parseAsistentes(minuta?.asistentes);
    // Si ya hay asistentes previamente guardados en la minuta, respetarlos
    if (guardados.length > 0) {
      // Sincronizar con la foto más actual del catálogo de usuarios si coincide el ID numérico
      return guardados.map(a => {
        const usuarioActual = allUsers?.find(u => String(u.id) === String(a.id));
        if (usuarioActual) {
          return {
            ...a,
            nombre: usuarioActual.nombre || a.nombre,
            imagen: usuarioActual.imagen || null,
          };
        }
        return a;
      });
    }

    // Por defecto la lista debe estar vacía hasta que el usuario decida agregar asistentes y guardar
    return [];
  }, [minuta?.asistentes, allUsers]);

  const [asistentesSeleccionados, setAsistentesSeleccionados] = useState(initialAsistentes);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    setAsistentesSeleccionados(initialAsistentes);
  }, [initialAsistentes]);

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Lista de usuarios disponibles (activos)
  const activeUsers = useMemo(() => {
    return (allUsers || []).filter(u => u.activo !== false);
  }, [allUsers]);

  // Filtro de búsqueda
  const filteredUsers = useMemo(() => {
    if (!busqueda.trim()) return activeUsers;
    const term = busqueda.toLowerCase();
    return activeUsers.filter(u =>
      u.nombre?.toLowerCase().includes(term) ||
      u.departamento?.toLowerCase().includes(term)
    );
  }, [activeUsers, busqueda]);

  const toggleUsuario = (user) => {
    setAsistentesSeleccionados(prev => {
      const exists = prev.some(a => String(a.id) === String(user.id));
      if (exists) {
        return prev.filter(a => String(a.id) !== String(user.id));
      }
      return [
        ...prev,
        {
          id: user.id,
          nombre: user.nombre,
          imagen: user.imagen || null,
        }
      ];
    });
  };

  const handleAgregarManual = () => {
    const trimmed = nombreManual.trim();
    if (!trimmed) return;
    const tempId = `ext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setAsistentesSeleccionados(prev => [
      ...prev,
      {
        id: tempId,
        nombre: trimmed,
        imagen: null,
        esExterno: true,
      }
    ]);
    setNombreManual('');
  };

  const handleRemoverAsistente = (idToRemove) => {
    setAsistentesSeleccionados(prev => prev.filter(a => String(a.id) !== String(idToRemove)));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await onGuardar?.(asistentesSeleccionados);
      setEditando(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setAsistentesSeleccionados(initialAsistentes);
    setNombreManual('');
    setBusqueda('');
    setEditando(false);
  };

  const tieneAsistentes = asistentesSeleccionados.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all">
      {/* ── Header idéntico a las demás secciones del resumen ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50 border-slate-200">
        <div className="flex items-center gap-2">
          <Icon name="groups" size="18px" className="text-slate-400" />
          <h3 className="fuente-titulos text-[11px] font-black tracking-widest uppercase text-slate-700">
            Asistentes
          </h3>
          {tieneAsistentes && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold">
              {asistentesSeleccionados.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de colapsar */}
          <button
            type="button"
            onClick={() => setColapsado(!colapsado)}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title={colapsado ? 'Expandir' : 'Colapsar'}
          >
            <Icon name={colapsado ? 'expand_more' : 'expand_less'} size="18px" />
          </button>

          {!editando && isAdmin && (
            <Button
              variant="soft"
              size="sm"
              icon="edit"
              onClick={() => {
                setEditando(true);
                setColapsado(false);
              }}
              className="h-6 px-2 text-[9px]"
            >
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3">
        {colapsado ? null : editando ? (
          /* Modo Edición */
          <div className="flex flex-col gap-2.5">
            {/* Acceso rápido a uno mismo si no está seleccionado */}
            {currentUser?.id && (
              <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {currentUser.imagen ? (
                      <img src={currentUser.imagen} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="person" size="14px" className="text-slate-500" />
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-700 font-semibold truncate">
                    Yo ({currentUser.nombre})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleUsuario(currentUser)}
                  className={cn(
                    "px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer shrink-0",
                    asistentesSeleccionados.some(a => String(a.id) === String(currentUser.id))
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  )}
                >
                  {asistentesSeleccionados.some(a => String(a.id) === String(currentUser.id))
                    ? '✓ Asistiendo'
                    : '+ Agregarme'}
                </button>
              </div>
            )}

            {/* Asistentes ya seleccionados (con opción de quitar) */}
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Seleccionados ({asistentesSeleccionados.length})
              </p>
              {asistentesSeleccionados.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No has seleccionado ningún asistente aún.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {asistentesSeleccionados.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-col items-center gap-1 group relative"
                    >
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center overflow-hidden shadow-xs">
                        {a.imagen && !imageErrors[a.id] ? (
                          <img
                            src={a.imagen}
                            alt={a.nombre}
                            onError={() => handleImageError(a.id)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="person" size="16px" className="text-slate-400" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoverAsistente(a.id)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Eliminar asistente"
                        >
                          <Icon name="close" size="13px" />
                        </button>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-slate-700 font-medium truncate w-12 sm:w-14 text-center leading-tight">
                        {a.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sección para agregar participante manual (no registrado en el sistema) */}
            <div className="border-t border-slate-100 pt-2.5">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Participante no registrado
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nombre del invitado..."
                  value={nombreManual}
                  onChange={(e) => setNombreManual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAgregarManual();
                    }
                  }}
                  className="flex-1 text-[11px] sm:text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAgregarManual}
                  disabled={!nombreManual.trim()}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Icon name="add" size="13px" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Selector de usuarios del sistema */}
            <div className="border-t border-slate-100 pt-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Usuarios del sistema
                </p>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="text-[10px] sm:text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 sm:py-1 focus:outline-none text-slate-700 placeholder-slate-400 w-28 sm:w-40"
                />
              </div>

              <div className="max-h-40 sm:max-h-48 overflow-y-auto custom-scrollbar p-0.5">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                  {filteredUsers.map((u) => {
                    const isSelected = asistentesSeleccionados.some(a => String(a.id) === String(u.id));
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUsuario(u)}
                        className={cn(
                          "flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl border text-left transition-all cursor-pointer select-none",
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center overflow-hidden shrink-0 bg-slate-100",
                          isSelected ? "border-emerald-500" : "border-slate-200"
                        )}>
                          {u.imagen ? (
                            <img src={u.imagen} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Icon name="person" size="13px" className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-[9.5px] sm:text-[10.5px] font-bold truncate leading-tight",
                            isSelected ? "text-emerald-900" : "text-slate-700"
                          )}>
                            {u.nombre}
                          </p>
                        </div>
                        {isSelected && (
                          <Icon name="check" size="13px" className="text-emerald-600 shrink-0 mr-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Acciones Guardar / Cancelar en el mismo estilo de SeccionIA */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="cancelar"
                size="sm"
                onClick={handleCancelar}
                disabled={guardando}
                className="h-6 sm:h-7 px-2.5 sm:px-3 text-[10px] sm:text-[11px]"
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
                className="h-6 sm:h-7 px-3 sm:px-4 text-[10px] sm:text-[11px]"
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        ) : (
          /* Modo Visualización compacto: IMAGEN encima y Nombre debajo */
          !tieneAsistentes ? (
            <p className="text-[11px] sm:text-sm text-slate-400 italic">
              No se han registrado asistentes aún.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5 sm:gap-4 items-start py-0.5">
              {asistentesSeleccionados.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col items-center gap-1 group select-none"
                  title={a.nombre}
                >
                  {/* IMAGEN circular compacta en mobile */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shadow-xs transition-transform group-hover:scale-105">
                    {a.imagen && !imageErrors[a.id] ? (
                      <img
                        src={a.imagen}
                        alt={a.nombre}
                        onError={() => handleImageError(a.id)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="person" size="16px" className="text-slate-400 sm:text-[20px]" />
                    )}
                  </div>
                  {/* Nombre compacto */}
                  <span className="text-[9.5px] sm:text-[11px] font-medium text-slate-700 truncate w-12 sm:w-16 text-center leading-tight">
                    {a.nombre}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
