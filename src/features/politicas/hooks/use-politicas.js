import { useState, useCallback, useEffect } from 'react';
import { getPoliticas, createPolitica, updatePolitica, deletePolitica } from '../api/politicas-apis';
import { notify } from '@/components/notification/adaptive-notify';

export const usePoliticas = () => {
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    page:  1,
    limit: 100,         // Traemos todas para el repositorio
    q:     '',
    tipo:  'POLITICA',  // Filtro estricto — string, no array, para qs de Express
    todo:  true,
    area:  undefined,   // undefined = sin filtro activo (axios lo omite de la query)
    linea: undefined,   // undefined = sin filtro activo
  });

  const fetchPoliticas = useCallback(async () => {
    setLoading(true);
    try {
      // `filters` ya incluye area y linea (undefined cuando no hay filtro activo).
      // Axios omite los keys undefined de la query string automáticamente.
      const responsePayload = await getPoliticas({ ...filters, tipo: 'POLITICA' });

      // La API puede devolver { data: { tareas: [] } } o { tareas: [] } según el interceptor.
      const payloadData = responsePayload?.data ? responsePayload.data : responsePayload;

      if (payloadData && Array.isArray(payloadData.tareas)) {
        // Doble validación en cliente — garantía defensiva.
        const soloPoliticas = payloadData.tareas.filter((t) => t.tipo === 'POLITICA');
        setPoliticas(soloPoliticas);
        setTotal(payloadData.total || soloPoliticas.length);
      } else {
        setPoliticas([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('[usePoliticas] Error fetching politicas:', error);
      notify.error('No se pudieron cargar las políticas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPoliticas();
  }, [fetchPoliticas]);

  const handleCreate = async (formData) => {
    try {
      await createPolitica(formData);
      notify.success('Política institucional registrada');
      fetchPoliticas();
      return true;
    } catch (error) {
      notify.error('Error al registrar la política');
      return false;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updatePolitica(id, data);
      notify.success('Política actualizada');
      fetchPoliticas();
      return true;
    } catch (error) {
      notify.error('Error al actualizar la política');
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePolitica(id);
      notify.success('Política eliminada');
      fetchPoliticas();
      return true;
    } catch (error) {
      notify.error('Error al eliminar la política');
      return false;
    }
  };

  return {
    politicas,
    loading,
    total,
    filters,
    setFilters,
    fetchPoliticas,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
