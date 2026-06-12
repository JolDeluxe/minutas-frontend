import { useState, useCallback, useEffect } from 'react';
import { getPoliticas, createPolitica, updatePolitica, deletePolitica } from '../api/politicas-apis';
import { notify } from '@/components/notification/adaptive-notify';

export const usePoliticas = () => {
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100, // Traemos todas para el repositorio
    q: '',
    tipo: 'POLITICA', // 🔥 FILTRO ESTRICTO (string en vez de array para qs de express)
    todo: true,
  });

  const fetchPoliticas = useCallback(async () => {
    setLoading(true);
    try {
      const responsePayload = await getPoliticas({ ...filters, tipo: 'POLITICA' });
      
      console.group('🔍 DEBUG POLITICAS');
      console.log('1. Filtros enviados:', { ...filters, tipo: 'POLITICA' });
      console.log('2. Respuesta cruda de la API:', responsePayload);
      
      // La API devuelve: { data: { tareas: [...] } } o directamente { tareas: [...] } dependiendo del interceptor
      const payloadData = responsePayload?.data ? responsePayload.data : responsePayload;
      
      console.log('3. Data extraída (payloadData):', payloadData);
      
      if (payloadData && Array.isArray(payloadData.tareas)) {
        // Doble validación en cliente
        const soloPoliticas = payloadData.tareas.filter(t => t.tipo === 'POLITICA');
        
        console.log('4. Total de items recibidos:', payloadData.tareas.length);
        console.log('5. Total filtrados en frontend (tipo===POLITICA):', soloPoliticas.length);
        console.log('6. Arreglo final a renderizar:', soloPoliticas);
        console.groupEnd();
        
        setPoliticas(soloPoliticas);
        setTotal(payloadData.total || soloPoliticas.length);
      } else {
        console.log('⚠️ No se encontró un array de tareas válido');
        console.groupEnd();
        
        setPoliticas([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching politicas:', error);
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
