/**
 * Validador y Centralizador de Variables de Entorno
 * Sistema de Minutas — Diseño e Imagen
 */

const requiredVars = [
  'VITE_APP_NAME',
  'VITE_API_URL_LOCAL',
  'VITE_API_URL_NETWORK',
];

const optionalVars = {
  VITE_VAPID_PUBLIC_KEY: '',
  VITE_ENV: 'development',
};

function validateEnv() {
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    const errorMsg = `
╔════════════════════════════════════════════════════════════╗
║  ⚠️  ERROR CRÍTICO: Variables de Entorno Faltantes          ║
╠════════════════════════════════════════════════════════════╣
║  Las siguientes variables son REQUERIDAS para esta APP:    ║
║  ${missing.map(v => `  - ${v}`).join('\n║ ')}
║                                                            ║
║  📁 Archivo: .env (en la raíz del proyecto)                ║
║  💡 Recuerda: Reinicia el servidor después de editar .env  ║
╚════════════════════════════════════════════════════════════╝
    `.trim();
    
    console.error(errorMsg);
    throw new Error('Configuración de entorno incompleta.');
  }
}

validateEnv();

const connection = import.meta.env.VITE_CONNECTION;

export const ENV = {
  API_URL:
    connection === 'network'
      ? import.meta.env.VITE_API_URL_NETWORK
      : connection === 'prod'
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL_LOCAL,

  // Identidad
  APP_NAME: import.meta.env.VITE_APP_NAME,

  // Notificaciones
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || optionalVars.VITE_VAPID_PUBLIC_KEY,
  ENV_MODE: import.meta.env.VITE_ENV || optionalVars.VITE_ENV,
  
  // Utilidades de Vite
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
};

export default ENV;