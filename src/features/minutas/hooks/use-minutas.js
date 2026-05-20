import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getMinutas,
  createMinuta,
  updateMinuta,
  changeMinutaStatus,
} from '../api/minutas-api';

export const useMinutas = () => {
  const [minutas, setMinutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [meta, setMeta] = useState({
    totalFiltrado: 0,
    totalPages: 1,
  });

  // Navegación ejecutiva: IDs GLOBALES de última junta y anterior (del backend)
  const [navegacionEjecutiva, setNavegacionEjecutiva] = useState({
    ultimaJuntaId: null,
    juntaAnteriorId: null,
  });

  const lastFetchParams = useRef({});

  const fetchMinutas = useCallback(async (params = {}) => {
    setLoading(true);
    
    // Sanitize parameters to avoid validation issues (like 'TODAS' enums)
    const cleanParams = { ...params };
    if (cleanParams.estado === 'TODAS' || cleanParams.estado === '') {
      delete cleanParams.estado;
    }
    if (cleanParams.departamentoGlobal === 'TODAS' || cleanParams.departamentoGlobal === '') {
      delete cleanParams.departamentoGlobal;
    }
    
    lastFetchParams.current = cleanParams;

    try {
      const response = await getMinutas(cleanParams);
      
      const data = response?.data || [];
      const pagination = response?.pagination || {};

      setMinutas(Array.isArray(data) ? data : []);
      setMeta({
        totalFiltrado: pagination.total ?? 0,
        totalPages: pagination.totalPages ?? 1,
      });

      // Navegación ejecutiva del backend (GLOBAL, no afectada por filtros)
      const nav = response?.navegacionEjecutiva || {};
      setNavegacionEjecutiva({
        ultimaJuntaId: nav.ultimaJuntaId ?? null,
        juntaAnteriorId: nav.juntaAnteriorId ?? null,
      });
    } catch (error) {
      console.error("Error fetching minutas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (data) => {
    setSubmitting(true);
    try { 
      const res = await createMinuta(data);
      return res.data;
    } finally { 
      setSubmitting(false); 
    }
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    setSubmitting(true);
    try { 
      const res = await updateMinuta(id, data);
      return res.data;
    } finally { 
      setSubmitting(false); 
    }
  }, []);

  const handleToggleStatus = useCallback(async (id, estado) => {
    setSubmitting(true);
    try { 
      const res = await changeMinutaStatus(id, estado);
      return res.data;
    } finally { 
      setSubmitting(false); 
    }
  }, []);

  // Reactivo: re-fetch al sincronizar si hubiera offline-queue
  useEffect(() => {
    const handleSyncComplete = () => {
      if (Object.keys(lastFetchParams.current).length > 0 || minutas.length > 0) {
        fetchMinutas(lastFetchParams.current);
      }
    };

    window.addEventListener('cuadra-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
  }, [fetchMinutas, minutas.length]);

  return {
    minutas,
    meta,
    navegacionEjecutiva,
    loading,
    submitting,
    fetchMinutas,
    createMinuta: handleCreate,
    updateMinuta: handleUpdate,
    toggleStatus: handleToggleStatus,
  };
};
