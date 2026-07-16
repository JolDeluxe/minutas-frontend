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
    imagenUrl1:    minuta?.imagenUrl1           || '',
    publicId1:     minuta?.publicId1            || '',
    imagenUrl2:    minuta?.imagenUrl2           || '',
    publicId2:     minuta?.publicId2            || '',
    imagenUrl3:    minuta?.imagenUrl3           || '',
    publicId3:     minuta?.publicId3            || '',
  });

  // Sincronizar estado local cuando cambia la minuta externamente
  useEffect(() => {
    setResumenLocal({
      temas:         minuta?.resumenTemas         || '',
      acuerdos:      minuta?.resumenAcuerdos      || '',
      proximosPasos: minuta?.resumenProximosPasos || '',
      imagenUrl1:    minuta?.imagenUrl1           || '',
      publicId1:     minuta?.publicId1            || '',
      imagenUrl2:    minuta?.imagenUrl2           || '',
      publicId2:     minuta?.publicId2            || '',
      imagenUrl3:    minuta?.imagenUrl3           || '',
      publicId3:     minuta?.publicId3            || '',
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

  /**
   * Guarda manualmente las imágenes actualizadas.
   */
  const handleGuardarImagenes = useCallback(async (imagenesPayload) => {
    try {
      if (esExterna) {
        await updateMinutaExterna(minuta.id, imagenesPayload);
      } else {
        await guardarResumenMinuta(minuta.id, imagenesPayload);
      }

      setResumenLocal(prev => ({ ...prev, ...imagenesPayload }));
      onResumenUpdated?.(imagenesPayload);
      notify.success('Imágenes actualizadas correctamente.');
    } catch {
      notify.error('Error al guardar imágenes. Intenta de nuevo.');
      throw new Error('save failed');
    }
  }, [minuta?.id, esExterna, onResumenUpdated]);

  const commonProps = {
    minuta,
    tareas,
    resumenLocal,
    isAdmin,
    onGuardar:         handleGuardarSeccion,
    onGuardarImagenes: handleGuardarImagenes,
    onSwitchToTareas,
  };

  if (!minuta) return null;

  return isDesktop
    ? <MinutaResumenDesktop {...commonProps} />
    : <MinutaResumenMobile  {...commonProps} />;
};
