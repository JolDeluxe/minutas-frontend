// src/features/usuarios/components/user-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const SearchInput = ({ localValue, onChange, onClear, mostrarInactivos }) => (
  <div className="relative w-full lg:max-w-sm shrink-0">
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <Icon name="search" size="sm" className="text-slate-400" />
    </div>
    <input
      type="text"
      value={localValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={mostrarInactivos ? 'Buscar inactivos…' : 'Buscar usuario…'}
      className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                 focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                 focus:border-marca-secundario transition-all placeholder:text-slate-400"
    />
    {localValue && (
      <button
        onClick={onClear}
        className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400"
      >
        <Icon name="close" size="xs" />
      </button>
    )}
  </div>
);

export const UserFilterBar = ({
  query,
  onSearchChange,
  departamentoFilter = 'TODOS',
  onDepartamentoChange,
  mostrarInactivos,
  onToggleInactivos,
  currentUser,
  mobileSearchOnly = false,
}) => {
  const [localValue, setLocalValue] = useState(query || '');

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(localValue), 450);
    return () => clearTimeout(timer);
  }, [localValue, onSearchChange]);

  const searchProps = {
    localValue,
    onChange: setLocalValue,
    onClear: () => setLocalValue(''),
    mostrarInactivos,
  };

  const isSystemAdmin = currentUser?.rol === 'ADMIN';

  if (mobileSearchOnly) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <SearchInput {...searchProps} />
        {isSystemAdmin && (
          <div className="relative w-full">
            <select
              value={departamentoFilter}
              onChange={(e) => onDepartamentoChange?.(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none text-slate-700 font-medium"
            >
              <option value="TODOS">Todos los departamentos</option>
              <option value="DISENO">Diseño</option>
              <option value="MARKETING">Marketing</option>
              <option value="GLOBAL">Global (Sin departamento)</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* CAPA MÓVIL / TABLET */}
      <div className="flex flex-col gap-3 lg:hidden">
        <SearchInput {...searchProps} />

        <div className="flex items-center gap-2">
          {isSystemAdmin && (
            <select
              value={departamentoFilter}
              onChange={(e) => onDepartamentoChange?.(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs border border-slate-200 rounded-full bg-white focus:outline-none text-slate-700 font-medium shrink-0"
            >
              <option value="TODOS">Todos los departamentos</option>
              <option value="DISENO">Diseño</option>
              <option value="MARKETING">Marketing</option>
              <option value="GLOBAL">Global (Sin departamento)</option>
            </select>
          )}

          <button
            onClick={onToggleInactivos}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0 ${
              mostrarInactivos
                ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Icon name={mostrarInactivos ? 'close' : 'person_off'} size="xs" />
            Inactivos
          </button>
        </div>
      </div>

      {/* CAPA DESKTOP */}
      <div className="hidden lg:flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 flex-1">
          <SearchInput {...searchProps} />

          {isSystemAdmin && (
            <div className="relative shrink-0">
              <select
                value={departamentoFilter}
                onChange={(e) => onDepartamentoChange?.(e.target.value)}
                className="pl-3 pr-10 h-10 text-sm border border-slate-200 rounded-xl bg-white
                           focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                           focus:border-marca-secundario transition-all text-slate-700 font-semibold appearance-none"
              >
                <option value="TODOS">Todos los departamentos</option>
                <option value="DISENO">Diseño</option>
                <option value="MARKETING">Marketing</option>
                <option value="GLOBAL">Global (Sin departamento)</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <Icon name="arrow_drop_down" size="sm" />
              </div>
            </div>
          )}
        </div>

        <Button
          variant={mostrarInactivos ? 'borrar' : 'default'}
          icon={mostrarInactivos ? 'close' : 'person_off'}
          size="sm"
          onClick={onToggleInactivos}
          className="h-10 px-4"
        >
          Inactivos
        </Button>
      </div>

    </div>
  );
};