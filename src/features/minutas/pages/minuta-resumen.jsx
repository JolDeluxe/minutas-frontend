// minutas-frontend/src/features/minutas/pages/minuta-resumen.jsx
/**
 * MinutaResumen — Controlador principal del Resumen de Minuta (Manual, sin IA).
 *
 * Props recibidas desde minuta-detail-page.jsx:
 *  - minuta          : objeto completo de la minuta (incluye resumenTemas, etc.)
 *  - tareas          : array de entradas organizacionales de la minuta
 *  - onSwitchToTareas: callback para volver a la vista de tareas
 *  - onResumenUpdated: callback para notificar que el resumen fue guardado
 */
import { useState, useCallback, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { guardarResumenMinuta, updateMinutaExterna } from '../api/minutas-api';
import { MinutaResumenDesktop } from '../views/minuta-resumen-desktop';
import { MinutaResumenMobile } from '../views/minuta-resumen-mobile';

export const MinutaResumen = ({
  minuta,
  tareas = [],
  onSwitchToTareas,
  onResumenUpdated,
  esExterna = false,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { user } = useAuthStore();

  const userRole = user?.data?.rol || user?.rol;
  const isAdmin = userRole === 'ADMIN';

  const [resumenLocal, setResumenLocal] = useState({
    temas:         minuta?.resumenTemas         || '',
    acuerdos:      minuta?.resumenAcuerdos      || '',
    proximosPasos: minuta?.resumenProximosPasos || '',
  });

  // Sincronizar estado local cuando cambia la minuta externamente
  useEffect(() => {
    setResumenLocal({
      temas:         minuta?.resumenTemas         || '',
      acuerdos:      minuta?.resumenAcuerdos      || '',
      proximosPasos: minuta?.resumenProximosPasos || '',
    });
  }, [minuta]);

  /**
   * Guarda manualmente una sección editada.
   */
  const handleGuardarSeccion = useCallback(async (campo, valor) => {
    try {
      const payload = {};
      if (campo === 'temas')         payload.resumenTemas         = valor;
      if (campo === 'acuerdos')      payload.resumenAcuerdos      = valor;
      if (campo === 'proximosPasos') payload.resumenProximosPasos = valor;

      if (esExterna) {
        await updateMinutaExterna(minuta.id, payload);
      } else {
        await guardarResumenMinuta(minuta.id, payload);
      }

      setResumenLocal(prev => ({ ...prev, [campo]: valor }));
      onResumenUpdated?.(
        campo === 'temas'         ? { resumenTemas: valor }         :
        campo === 'acuerdos'      ? { resumenAcuerdos: valor }      :
                                    { resumenProximosPasos: valor }
      );
      notify.success('Sección guardada correctamente.');
    } catch {
      notify.error('Error al guardar. Intenta de nuevo.');
      throw new Error('save failed'); // para que SeccionIA no cierre el editor
    }
  }, [minuta?.id, esExterna, onResumenUpdated]);

  const commonProps = {
    minuta,
    tareas,
    resumenLocal,
    isAdmin,
    onGuardar:     handleGuardarSeccion,
    onSwitchToTareas,
  };

  if (!minuta) return null;

  return isDesktop
    ? <MinutaResumenDesktop {...commonProps} />
    : <MinutaResumenMobile  {...commonProps} />;
};
