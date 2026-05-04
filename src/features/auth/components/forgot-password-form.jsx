import React from 'react';
import { Icon } from '@/components/ui/icon';

export const ForgotPasswordForm = ({ onBack }) => {
  return (
    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-amber-100 text-marca-acento rounded-full flex items-center justify-center mb-4">
        {/* Usando el componente Icon con los ejes variables de la documentación */}
        <Icon 
          name="warning" 
          size="32px" 
          weight={600} 
          grad={200} 
          fill={true} 
        />
      </div>

      <h2 className="fuente-titulos text-xl font-bold mb-4 text-marca-primario uppercase">
        Recuperación No Habilitada
      </h2>
      
      <p className="text-slate-600 text-sm mb-6 leading-relaxed">
        La función de recuperación automática de contraseña aún no está habilitada en el sistema. 
        <br/><br/>
        Favor de contactar al equipo de Procesos Tecnológicos para solicitar el cambio de sus credenciales al correo: 
        <br/>
        <a href="mailto:coordinador.procesostecnologicos@cuadra.com.mx" className="font-bold text-marca-acento hover:underline">
          coordinador.procesostecnologicos@cuadra.com.mx
        </a>
      </p>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-3 border-2  rounded-md font-bold uppercase tracking-wide bg-marca-primario text-white transition-colors duration-300 cursor-pointer"
      >
        Regresar al Login
      </button>
    </div>
  );
};