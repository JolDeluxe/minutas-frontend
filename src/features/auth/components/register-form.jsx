import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/form/input';

export const RegisterForm = ({
  formData,
  loading,
  submitted,
  onChange,
  onSubmit,
  onBack
}) => {
  // Validación de dominio corporativo
  const isCorporateEmail = formData.email.toLowerCase().endsWith('@cuadra.com.mx');
  const emailError = !formData.email.trim() 
    ? "El correo es obligatorio" 
    : !isCorporateEmail 
      ? "Solo se permiten correos @cuadra.com.mx" 
      : null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="fuente-titulos text-2xl font-bold mb-2 text-center text-marca-primario uppercase">
        Solicitar Cuenta
      </h2>
      <p className="text-slate-500 text-xs text-center mb-6 leading-tight">
        Usa tu correo institucional para darte de alta en el sistema de mantenimiento.
      </p>

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <Input
          label="Nombre Completo"
          iconName="person"
          type="text"
          name="nombre"
          placeholder="Juan Pérez"
          value={formData.nombre}
          onChange={onChange}
          submitted={submitted}
          error={!formData.nombre.trim() ? "El nombre es obligatorio" : null}
        />

        <Input
          label="Correo Corporativo"
          iconName="alternate_email"
          type="email"
          name="email"
          placeholder="usuario@cuadra.com.mx"
          value={formData.email}
          onChange={onChange}
          submitted={submitted}
          error={emailError}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Contraseña"
            iconName="lock"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            submitted={submitted}
            error={!formData.password.trim() ? "Requerida" : null}
          />
          <Input
            label="Confirmar"
            iconName="shield_lock"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={onChange}
            submitted={submitted}
            error={formData.password !== formData.confirmPassword ? "No coincide" : null}
          />
        </div>

        <button
          type="submit"
          disabled={loading || (submitted && !isCorporateEmail)}
          className={`w-full mt-2 py-3 rounded-md font-bold uppercase tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 ${
            loading
              ? "bg-slate-400 text-white cursor-not-allowed"
              : "bg-marca-primario hover:bg-opacity-90 text-white cursor-pointer"
          }`}
        >
          {loading ? "Procesando..." : "Registrarme"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-slate-500 hover:text-marca-primario hover:underline focus:outline-none cursor-pointer flex items-center justify-center gap-1 mx-auto"
        >
          <Icon name="arrow_back" size="16px" />
          Ya tengo cuenta, volver
        </button>
      </div>
    </div>
  );
};