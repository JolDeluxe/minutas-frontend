// src/features/usuarios/hooks/use-users.js
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
} from '../api/users-api';

export const useUsers = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [meta, setMeta] = useState({
    totalFiltrado:  0,
    totalAbsoluto:  0,
    totalPages:     1,
    resumenRoles:   {},
  });

  const lastFetchParams = useRef({});

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    lastFetchParams.current = params;

    try {
      const response = await getUsers(params);

      if (Array.isArray(response)) {
        setUsers(response);
        setMeta({
          totalFiltrado: response.length,
          totalAbsoluto: response.length,
          totalPages:    1,
          resumenRoles:  {},
        });
        return;
      }

      const pagination   = response.pagination ?? {};
      const data         = Array.isArray(response.data) ? response.data : [];

      setUsers(data);
      setMeta({
        totalFiltrado:  pagination.total     ?? 0,
        totalAbsoluto:  response.totalAbsoluto ?? pagination.total ?? 0,
        totalPages:     pagination.totalPages ?? 1,
        resumenRoles:   response.resumenRoles ?? {},
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (data) => {
    setSubmitting(true);
    try { return await createUser(data); }
    finally { setSubmitting(false); }
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    setSubmitting(true);
    try { return await updateUser(id, data); }
    finally { setSubmitting(false); }
  }, []);

  const handleToggleStatus = useCallback(async (id, estado) => {
    setSubmitting(true);
    try { return await updateUserStatus(id, estado); }
    finally { setSubmitting(false); }
  }, []);

  // Reactivo: re-fetch al sincronizar
  useEffect(() => {
    const handleSyncComplete = () => {
      if (Object.keys(lastFetchParams.current).length > 0 || users.length > 0) {
        fetchUsers(lastFetchParams.current);
      }
    };

    window.addEventListener('cuadra-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
  }, [fetchUsers, users.length]);

  return {
    users,
    meta,
    loading,
    submitting,
    fetchUsers,
    createUser:   handleCreate,
    updateUser:   handleUpdate,
    toggleStatus: handleToggleStatus,
  };
};