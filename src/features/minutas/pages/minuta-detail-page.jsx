import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMinutaById, iniciarMinuta, cancelarMinuta, cerrarMinuta, reabrirMinuta, finalizarMinuta, generarPdfPorArea } from '../api/minutas-api';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutaDraftStore } from '../stores/minuta-draft-store';
import { useAuthStore } from '@/stores/auth-store';
import socket from '@/lib/socket';
import { ENV } from '@/config/env';

import { Icon, ConfirmModal, Modal, ModalHeader, ModalBody } from '@/components/ui/z_index';
import { MinutaDetailDesktopView } from '../views/minuta-detail-desktop-view';
import { MinutaDetailMobileView } from '../views/minuta-detail-mobile-view';

const getClientId = () => {
  const key = 'minutas_live_client_id';
  let clientId = localStorage.getItem(key);
  if (!clientId) {
    clientId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, clientId);
  }
  return clientId;
};

const generateCompressedThumbnail = (file, maxWidth = 300, maxHeight = 300, quality = 0.5) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

const sanitizeDraftEntryForSocket = (entry) => {
  if (!entry) return null;
  const safeEntry = { ...entry };
  const localImages = safeEntry._localImages || [];
  delete safeEntry._localImages;
  delete safeEntry.file;
  delete safeEntry.preview;
  delete safeEntry.readOnly;
  delete safeEntry._isRemoteDraft;

  return {
    ...safeEntry,
    _remoteImageCount: localImages.length,
    _remoteImageThumbnails: localImages.map(img => img.base64Thumb).filter(Boolean),
  };
};

const SharePdfModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;
  const { url, area, fechaStr, minutaTitulo } = data;
  
  const subject = `Minuta ${area} - ${fechaStr}`;
  const body = `Hola, te comparto los puntos y acuerdos asignados al área de ${area} derivados de la minuta "${minutaTitulo}":\n\n${url}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback robusto para HTTP (ej. cuando se accede por IP local)
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } finally {
          textArea.remove();
        }
      }
      notify.success('Enlace copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
      notify.error('Error al copiar. Tu navegador bloqueó la acción.');
    }
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(body)}`, '_blank');
  };

  const handleDownload = async () => {
    try {
      notify.success('Iniciando descarga...', { duration: 2000 });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al descargar archivo: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const sanitizedName = `Minuta_${area}_${fechaStr}.pdf`.replace(/\s+/g, '_');
      link.setAttribute('download', sanitizedName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al descargar, usando fallback:', error);
      // Si falla por CORS u otro motivo, abrimos directamente la URL.
      // fl_attachment solo se inyecta si es un recurso de tipo "image" (ya que "raw" no lo soporta).
      let finalUrl = url;
      if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
        const fallbackName = `Minuta_${area.replace(/\s+/g, '_')}`;
        finalUrl = url.replace('/upload/', `/upload/fl_attachment:${fallbackName}/`);
      }
      window.open(finalUrl, '_blank');
    }
  };

  const handleNativeShare = async () => {
    try {
      notify.success('Preparando archivo para compartir...', { duration: 1500 });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al preparar archivo: ${response.status}`);
      }
      const blob = await response.blob();
      const sanitizedName = `Minuta_${area}_${fechaStr}.pdf`.replace(/\s+/g, '_');
      const file = new File([blob], sanitizedName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: subject,
          text: `Hola, te comparto los puntos y acuerdos asignados al área de ${area} derivados de la minuta "${minutaTitulo}".`
        });
      } else {
        await navigator.share({
          title: subject,
          text: body,
          url: url
        });
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error al compartir nativamente:', e);
        notify.error('No se pudo compartir el archivo nativamente');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <ModalHeader title="Compartir PDF" onClose={onClose} />
      <ModalBody>
        <div className="flex flex-col gap-3 pb-4">
          <p className="text-sm text-slate-500 mb-2 font-medium">Elige cómo deseas compartir el PDF de <b>{area}</b>:</p>
          
          <button onClick={handleEmail} className="flex items-center gap-3 p-3 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all">
            <Icon name="mail" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Enviar por Correo</span>
              <span className="text-[10px] opacity-80">Abre tu cliente de correo (Outlook, Gmail, etc.)</span>
            </div>
          </button>

          <button onClick={handleWhatsApp} className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all">
            <Icon name="chat" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">WhatsApp</span>
              <span className="text-[10px] opacity-80">Abre un chat con el enlace pre-cargado</span>
            </div>
          </button>

          <button onClick={handleDownload} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-800 hover:text-white transition-all">
            <Icon name="download" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Descargar Archivo</span>
              <span className="text-[10px] opacity-80">Guarda el PDF directamente en tu dispositivo</span>
            </div>
          </button>

          <button onClick={handleCopy} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-all">
            <Icon name="content_copy" size="24px" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Copiar Enlace</span>
              <span className="text-[10px] opacity-80">Copia la URL segura para pegarla donde quieras</span>
            </div>
          </button>

          {navigator.share && (
            <button onClick={handleNativeShare} className="flex justify-center items-center gap-2 p-3 mt-2 rounded-2xl bg-marca-primario text-white hover:bg-marca-secundario transition-all font-bold text-sm">
              <Icon name="share" size="20px" />
              Compartir (Opciones del Dispositivo)
            </button>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default function MinutaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const clientIdRef = useRef(getClientId());

  const {
    draftEntries, remoteDraftEntries, draftNotes, initialized, initStore,
    addDraftEntry, updateDraftEntry, removeDraftEntry,
    addDraftNote, updateDraftNote, removeDraftNote,
    clearDrafts, setRemoteDraftEntries, upsertRemoteDraftEntry,
    removeRemoteDraftEntry, removeRemoteDraftEntries, clearRemoteDrafts
  } = useMinutaDraftStore();

  const [minuta, setMinuta] = useState(null);
  const [loadingMinuta, setLoadingMinuta] = useState(true);

  const { 
    tareas, fetchTareas, loadingTareas, deleteTarea,
    createTarea: createTareaApi, updateTarea, organizarTarea, changeStatus: changeTareaStatus, createNotaGeneral, 
    createTareaNota, updateTareaNota, deleteTareaNota,
    addTareaImagen, deleteTareaImagen, generarPdfTarea, toggleNotificado: toggleNotificadoTarea
  } = useTareas();

  const { users, fetchUsers } = useUsers();

  const draftEntriesRef = useRef([]);

  const [showNotes, setShowNotes] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [organizeEntry, setOrganizeEntry] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [reabriendo, setReabriendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [showForceCloseModal, setShowForceCloseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [sharePdfData, setSharePdfData] = useState(null);

  const [activeFilter, setActiveFilter] = useState({
    tipo: 'TODAS',
    estado: null,
    clasificacion: null,
    area: null,
    linea: null,
    search: '',
    onlyExternal: false,
  });

  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('minutas_view_mode');
    if (saved) return saved;
    return window.innerWidth >= 768 ? 'table' : 'cards';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('minutas_view_mode', mode);
  };

  const refreshEntries = useCallback(() => fetchTareas({
    minutaId: id,
    todo: true,
    page: 1,
    limit: 100,
    sort: JSON.stringify([{ createdAt: 'asc' }]),
  }), [id, fetchTareas]);

  useEffect(() => {
    draftEntriesRef.current = draftEntries;
  }, [draftEntries]);

  const emitDraftEntryUpsert = useCallback((entry) => {
    const minutaId = Number(id);
    const safeEntry = sanitizeDraftEntryForSocket(entry);
    if (!minutaId || !safeEntry?.tempId) return;

    const author = {
      id: currentUser?.id,
      nombre: currentUser?.nombre,
      imagen: currentUser?.imagen,
      rol: currentUser?.rol,
    };

    if (!socket.connected) socket.connect();
    socket.emit('minuta:draft_entry_upsert', {
      minutaId,
      entry: safeEntry,
      clientId: clientIdRef.current,
      author,
    });
  }, [id, currentUser?.id, currentUser?.imagen, currentUser?.nombre, currentUser?.rol]);

  const emitDraftEntryRemove = useCallback((tempId) => {
    const minutaId = Number(id);
    if (!minutaId || !tempId) return;
    if (!socket.connected) socket.connect();
    socket.emit('minuta:draft_entry_remove', { minutaId, tempId });
  }, [id]);

  const emitDraftEntriesRemove = useCallback((tempIds = []) => {
    const minutaId = Number(id);
    const ids = tempIds.filter(Boolean);
    if (!minutaId || ids.length === 0) return;
    if (!socket.connected) socket.connect();
    socket.emit('minuta:draft_entries_remove', { minutaId, tempIds: ids });
  }, [id]);

  useEffect(() => {
    if (id) {
      initStore(id);
      const load = async () => {
        setLoadingMinuta(true);
        try {
          const res = await getMinutaById(id);
          setMinuta(res.data?.data || res.data);
          await refreshEntries();
        } catch {
          notify.error('Minuta no disponible');
          navigate('/minutas');
        } finally {
          setLoadingMinuta(false);
        }
      };
      load();
      fetchUsers();
    }
  }, [id, initStore, navigate, refreshEntries, fetchUsers]);

  useEffect(() => {
    const minutaId = Number(id);
    if (!minutaId) return;

    const normalizeRemoteEntry = (entry) => ({
      ...entry,
      _isRemoteDraft: true,
      readOnly: true,
    });

    const isOwnDraft = (entry) => entry?.clientId && entry.clientId === clientIdRef.current;

    const handleSnapshot = (payload) => {
      if (Number(payload?.minutaId) !== minutaId) return;
      const remoteEntries = (payload.entries || [])
        .filter((entry) => entry?.tempId && !isOwnDraft(entry))
        .map(normalizeRemoteEntry);
      setRemoteDraftEntries(remoteEntries);
    };

    const handleRemoteUpsert = (payload) => {
      if (Number(payload?.minutaId) !== minutaId || !payload?.entry || isOwnDraft(payload.entry)) return;
      upsertRemoteDraftEntry(normalizeRemoteEntry(payload.entry));
    };

    const handleRemoteRemove = (payload) => {
      if (Number(payload?.minutaId) !== minutaId) return;
      removeRemoteDraftEntry(payload.tempId);
    };

    const handleRemoteBulkRemove = (payload) => {
      if (Number(payload?.minutaId) !== minutaId) return;
      removeRemoteDraftEntries(payload.tempIds || []);
    };

    const handleEstadoActualizado = (payload) => {
      if (Number(payload?.minutaId) !== minutaId) return;
      if (payload?.minuta) {
        setMinuta(payload.minuta);
        refreshEntries();
      }
    };

    socket.on('minuta:drafts_snapshot', handleSnapshot);
    socket.on('minuta:draft_entry_upsert', handleRemoteUpsert);
    socket.on('minuta:draft_entry_remove', handleRemoteRemove);
    socket.on('minuta:draft_entries_remove', handleRemoteBulkRemove);
    socket.on('minuta:estado_actualizado', handleEstadoActualizado);

    const handleEntriesSaved = (payload) => {
      if (Number(payload?.minutaId) !== minutaId) return;
      refreshEntries();
    };
    socket.on('minuta:entries_saved', handleEntriesSaved);

    if (!socket.connected) socket.connect();
    socket.emit('join_minuta', {
      minutaId,
      clientId: clientIdRef.current,
      user: {
        id: currentUser?.id,
        nombre: currentUser?.nombre,
        imagen: currentUser?.imagen,
        rol: currentUser?.rol,
      },
    });

    return () => {
      socket.emit('leave_minuta', { minutaId });
      socket.off('minuta:drafts_snapshot', handleSnapshot);
      socket.off('minuta:draft_entry_upsert', handleRemoteUpsert);
      socket.off('minuta:draft_entry_remove', handleRemoteRemove);
      socket.off('minuta:draft_entries_remove', handleRemoteBulkRemove);
      socket.off('minuta:estado_actualizado', handleEstadoActualizado);
      socket.off('minuta:entries_saved', handleEntriesSaved);
      clearRemoteDrafts();
    };
  }, [
    id,
    currentUser?.id,
    currentUser?.imagen,
    currentUser?.nombre,
    currentUser?.rol,
    setRemoteDraftEntries,
    upsertRemoteDraftEntry,
    removeRemoteDraftEntry,
    removeRemoteDraftEntries,
    clearRemoteDrafts,
    refreshEntries,
  ]);

  useEffect(() => {
    if (!initialized || !id || draftEntriesRef.current.length === 0) return;
    draftEntriesRef.current.forEach(emitDraftEntryUpsert);
  }, [initialized, id, emitDraftEntryUpsert]);

  const allEntries = useMemo(() => [...draftEntries, ...remoteDraftEntries, ...tareas], [draftEntries, remoteDraftEntries, tareas]);
  const departamento = minuta?.departamento || 'DISENO';

  // ─────────────────────────────────────────────────────────────────────
  // Agrupa tareas que comparten minutaId + organizadoAt en un único objeto
  // representativo con isGrouped:true y subTareas:[...] para el acordeón.
  // Las entradas que no tienen "hermanas" se pasan tal cual (isGrouped:false).
  // ─────────────────────────────────────────────────────────────────────
  const groupTareas = (entries) => {
    const grupos = new Map(); // clave → [tarea, ...]

    for (const entry of entries) {
      // Solo agrupamos tareas persistidas (no borradores) de tipo TAREA
      if (!entry.tempId && entry.tipo === 'TAREA' && entry.organizadoAt) {
        // Clave: minutaId + marca exacta de organizadoAt (ISO string)
        const clave = `${entry.minutaId}_${new Date(entry.organizadoAt).toISOString()}`;
        if (!grupos.has(clave)) grupos.set(clave, []);
        grupos.get(clave).push(entry);
      } else {
        // Borradores, SIN_ORGANIZAR, POLITICA, RECORDATORIO → sin agrupar
        const clave = `single_${entry.id || entry.tempId}`;
        grupos.set(clave, [entry]);
      }
    }

    const resultado = [];
    for (const [, grupo] of grupos) {
      if (grupo.length <= 1) {
        resultado.push({ ...grupo[0], isGrouped: false });
        continue;
      }

      // Calcular estado consolidado
      const subtareas = grupo;
      const totalSub = subtareas.length;
      const cerradas = subtareas.filter(t => t.estado === 'CERRADA').length;
      const enRevision = subtareas.filter(t => t.estado === 'EN_REVISION').length;
      const pendientes = subtareas.filter(t => t.estado === 'PENDIENTE').length;

      let estadoConsolidado;
      if (cerradas === totalSub) {
        estadoConsolidado = 'CERRADA';
      } else if (enRevision + cerradas === totalSub) {
        estadoConsolidado = 'EN_REVISION';
      } else {
        estadoConsolidado = 'PENDIENTE';
      }

      // Tomar la primera tarea como representante (descripción, área, línea, etc.)
      const base = subtareas[0];

      // Consolidar responsables (uno por sub-tarea)
      const asignacionesConsolidadas = subtareas.flatMap(t =>
        t.asignaciones || []
      );

      resultado.push({
        ...base,
        responsables: undefined,
        asignaciones: asignacionesConsolidadas,
        estado: estadoConsolidado,
        isGrouped: true,
        subTareas: subtareas,
        _grupoStats: { total: totalSub, cerradas, enRevision, pendientes },
      });
    }
    return resultado;
  };

  const filteredEntries = useMemo(() => {
    const priorityWeight = { 'CRITICA': 0, 'ALTA': 1, 'MEDIA': 2, 'BAJA': 3 };

    // 1. Aplicar filtros sobre el array plano
    const planas = allEntries.filter(entry => {
      if (entry.estado === 'CANCELADA') return false;
      if (activeFilter.onlyExternal) {
        const isExterna = entry.area && (
          ((departamento === 'DISENO' || departamento === 'DISEÑO') && entry.area !== 'DISENO') ||
          (departamento === 'MARKETING' && entry.area !== 'MARKETING')
        );
        if (!isExterna) return false;
      }
      if (activeFilter.tipo && activeFilter.tipo !== 'TODAS' && entry.tipo !== activeFilter.tipo) {
        if (entry.tempId && (activeFilter.tipo === 'TAREA' || activeFilter.tipo === 'SIN_ORGANIZAR')) {}
        else { return false; }
      }
      if (activeFilter.estado) {
        if (activeFilter.estado === 'ATRASADA') {
          const ahora = new Date();
          const vence = entry.fechaVencimiento ? new Date(entry.fechaVencimiento) : null;
          if (!vence || vence >= ahora || entry.estado === 'CERRADA' || entry.estado === 'EN_REVISION') return false;
        } else if (entry.estado !== activeFilter.estado) {
          return false;
        }
      }
      if (activeFilter.clasificacion && entry.clasificacion !== activeFilter.clasificacion) return false;
      if (activeFilter.area && entry.area !== activeFilter.area) return false;
      if (activeFilter.linea && entry.linea !== activeFilter.linea) return false;
      if (activeFilter.search) {
        const s = activeFilter.search.toLowerCase();
        if (!entry.descripcion?.toLowerCase().includes(s)) return false;
      }
      return true;
    });

    // 2. Agrupar las tareas TAREA con múltiples responsables
    const agrupadas = groupTareas(planas);

    // 3. Ordenar el resultado agrupado
    return agrupadas.sort((a, b) => {
      const getRank = (e) => {
        if (e.tipo === 'SIN_ORGANIZAR' || e.tempId) return 0;
        if (e.estado === 'EN_REVISION') return 1;
        if (e.estado === 'CERRADA') return 3;
        return 2;
      };

      const rankA = getRank(a);
      const rankB = getRank(b);

      if (rankA !== rankB) return rankA - rankB;

      if (rankA === 2) {
        const pA = priorityWeight[a.prioridad] ?? 4;
        const pB = priorityWeight[b.prioridad] ?? 4;
        if (pA !== pB) return pA - pB;
      }

      if (rankA === 0) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [allEntries, activeFilter, departamento]);

  const handleFilterByStatus = (estado) =>
    setActiveFilter(prev => ({ ...prev, estado: prev.estado === estado ? null : estado, tipo: 'TAREA' }));

  const handleFilterByTipo = (tipo) =>
    setActiveFilter(prev => ({ ...prev, tipo: prev.tipo === tipo ? 'TAREA' : tipo, estado: null }));

  const handleResetFilter = () =>
    setActiveFilter({ tipo: 'TODAS', estado: null, clasificacion: null, area: null, linea: null, search: '', onlyExternal: false });

  const resumen = useMemo(() => {
    const now = new Date();
    let totalTareas = 0, pendientes = 0, enRevision = 0, cerradas = 0, atrasadas = 0;
    let totalPoliticas = 0, totalRecordatorios = 0;
    let totalValidas = 0;
    let externas = 0;
    let sinClasificar = 0;

    for (const t of allEntries) {
      if (t.tipo === 'DESCARTADA' || t.estado === 'DESCARTADA' || t.estado === 'CANCELADA') {
        continue;
      }
      totalValidas++;
      
      const isExterna = t.area && (
        ((departamento === 'DISENO' || departamento === 'DISEÑO') && t.area !== 'DISENO') ||
        (departamento === 'MARKETING' && t.area !== 'MARKETING')
      );

      if (isExterna) {
        externas++;
      } else {
        if (t.tipo === 'POLITICA') {
          totalPoliticas++;
        } else if (t.tipo === 'RECORDATORIO') {
          totalRecordatorios++;
        } else if (t.tipo === 'TAREA') {
          const estadoUpper = t.estado?.toUpperCase() || 'PENDIENTE';
          if (estadoUpper === 'PENDIENTE') {
            totalTareas++;
            pendientes++;
          } else if (estadoUpper === 'EN_REVISION') {
            totalTareas++;
            enRevision++;
          } else if (estadoUpper === 'CERRADA') {
            totalTareas++;
            cerradas++;
          }
          
          const isCompletada = estadoUpper === 'CERRADA' || estadoUpper === 'EN_REVISION';
          if (t.fechaVencimiento && new Date(t.fechaVencimiento) < now && !isCompletada) {
            atrasadas++;
          }
        } else if (t.tipo === 'SIN_ORGANIZAR' || !t.tipo) {
          sinClasificar++;
        }
      }
    }
    const porcentaje = totalTareas > 0 ? Math.round((cerradas / totalTareas) * 100) : 0;
    return { 
      totalTareas, pendientes, enRevision, cerradas, atrasadas, porcentaje, 
      totalPoliticas, totalRecordatorios, totalEntradas: allEntries.length, totalValidas,
      externas, sinClasificar
    };
  }, [allEntries, departamento]);

  const handleUpdateDraftEntry = useCallback((tempId, updates) => {
    const updatedEntry = updateDraftEntry(tempId, updates);
    if (updatedEntry) emitDraftEntryUpsert(updatedEntry);
    return updatedEntry;
  }, [emitDraftEntryUpsert, updateDraftEntry]);

  const handleRemoveDraftEntry = useCallback((tempId) => {
    const removedEntry = removeDraftEntry(tempId);
    if (removedEntry) emitDraftEntryRemove(tempId);
    return removedEntry;
  }, [emitDraftEntryRemove, removeDraftEntry]);

  const handleClearDrafts = useCallback(async () => {
    emitDraftEntriesRemove(draftEntriesRef.current.map((entry) => entry.tempId));
    await clearDrafts();
  }, [clearDrafts, emitDraftEntriesRemove]);

  const handleCapture = (payload) => {
    payload.tareas.forEach(t => {
      const createdEntry = addDraftEntry(t);
      emitDraftEntryUpsert(createdEntry);
    });
    notify.success('Borrador añadido', { duration: 1500 });
  };

  const handleEditEntrySave = async (entryId, payload, imageActions = {}) => {
    setIsSavingEntry(true);
    try {
      if (typeof entryId === 'string' || entryId.toString().startsWith('temp_')) {
        if (imageActions.isDraft) {
          payload._localImages = imageActions.localImages;
        }
        handleUpdateDraftEntry(entryId, payload);
        notify.success('Borrador actualizado');
        setEditEntry(null);
        return;
      }

      await updateTarea(entryId, payload);

      if (imageActions.deleteImageIds?.length > 0) {
        for (const imgId of imageActions.deleteImageIds) {
          await deleteTareaImagen(entryId, imgId);
        }
      }

      if (imageActions.newImages?.length > 0) {
        for (const file of imageActions.newImages) {
          await addTareaImagen(entryId, file);
        }
      }

      await refreshEntries();
      notify.success('Entrada actualizada correctamente');
      setEditEntry(null);
    } catch (err) {
      notify.error('Error al guardar cambios');
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleFinalSubmit = async (closeAfterSave = false) => {
    setIsSubmittingFinal(true);
    try {
      if (draftEntries.length > 0) {
        const validEntries = draftEntries.filter(e => e.descripcion && e.descripcion.trim().length >= 3);
        if (validEntries.length > 0) {
          const toSend = validEntries.map((e) => {
            const entry = { ...e };
            
            // Eliminar propiedades internas/locales que no pertenecen al esquema
            delete entry.tempId;
            delete entry.estadoConceptual;
            delete entry.formalizada;
            delete entry._isRemoteDraft;
            delete entry.readOnly;
            delete entry.createdAt;
            delete entry.updatedAt;
            delete entry.fecha; // El composer móvil añade "fecha", pero el backend espera "fechaVencimiento"
            delete entry.asignaciones; // Evitar conflictos con responsables

            // Normalizar responsables para que sea siempre un arreglo de números (IDs de usuario)
            if (entry.responsables) {
              if (Array.isArray(entry.responsables)) {
                entry.responsables = entry.responsables
                  .map(r => (typeof r === 'object' && r !== null) ? (r.usuarioId || r.id) : r)
                  .map(Number)
                  .filter(id => !isNaN(id) && id > 0);
              } else {
                delete entry.responsables;
              }
            }

            // Normalizar notas
            if (entry.notas && Array.isArray(entry.notas)) {
              entry.notas = entry.notas
                .map(n => {
                  if (typeof n === 'string') return { contenido: n.trim() };
                  if (typeof n === 'object' && n !== null && n.contenido) return { contenido: String(n.contenido).trim() };
                  return null;
                })
                .filter(n => n && n.contenido.length > 0);
            }

            return entry;
          });
          await createTareaApi({ tareas: toSend });
        }
      }
      for (const note of draftNotes) {
        await createNotaGeneral({ contenido: note.contenido, minutaId: Number(id) });
      }
      emitDraftEntriesRemove(draftEntries.map((entry) => entry.tempId));
      await clearDrafts();
      setShowReviewModal(false);
      if (closeAfterSave) {
        if (minuta?.estado === 'EN_CURSO') await finalizarMinuta(id);
        else await cerrarMinuta(id);
        notify.success('Guardado y finalizado');
      } else notify.success('Guardado con éxito');
      const res = await getMinutaById(id);
      setMinuta(res.data?.data || res.data);
      refreshEntries();
    } catch (err) {
      console.error("❌ Error al sincronizar la minuta:", err);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        const errorMsg = apiErrors.map(e => `${e.field}: ${e.message}`).join(' | ');
        notify.error(`Error de validación: ${errorMsg}`);
      } else {
        notify.error(err.response?.data?.error || err.response?.data?.message || 'Error al sincronizar');
      }
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (typeof id === 'string' || id.toString().startsWith('temp_')) {
      handleRemoveDraftEntry(id);
      notify.success('Borrador eliminado');
      return;
    }
    try {
      await deleteTarea(id);
      await refreshEntries();
      notify.success('Entrada descartada');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'No se pudo descartar la entrada';
      notify.error(errorMsg);
    }
  };

  const handleOrganizeSave = async (entryId, payload) => {
    try {
      if (typeof entryId === 'string' || entryId.toString().startsWith('temp_')) {
        handleUpdateDraftEntry(entryId, payload);
        notify.success('Organizado (Borrador)');
      } else {
        // Usar el endpoint correcto: PATCH /:id/organizar
        // Este es el que contiene la lógica de división por responsable
        await organizarTarea(entryId, payload);
        await refreshEntries();
        notify.success('Entrada organizada');
      }
      setOrganizeEntry(null);
    } catch {
      notify.error('Error al organizar');
    }
  };

  const handleStatusChange = async (entryId, payload, silent = false) => {
    try {
      const data = typeof payload === 'string' ? { estado: payload } : payload;
      await changeTareaStatus(entryId, data);
      await refreshEntries();
      if (!silent) {
        notify.success('Estado actualizado');
      }
      return true;
    } catch {
      notify.error('Error al cambiar estado');
      return false;
    }
  };

  const handleCreateEntryNote = async (entryIdOrTempId, contenido) => {
    try {
      if (typeof entryIdOrTempId === 'string' || isNaN(Number(entryIdOrTempId))) {
        const entry = draftEntries.find(e => e.tempId === entryIdOrTempId);
        if (entry) {
          const newNotes = [...(entry.notas || []), { contenido, createdAt: new Date().toISOString() }];
          handleUpdateDraftEntry(entryIdOrTempId, { notas: newNotes });
          return true;
        }
        return false;
      }
      await createTareaNota({ tareaId: entryIdOrTempId, contenido });
      await refreshEntries();
      notify.success('Nota agregada');
      return true;
    } catch {
      notify.error('Error al agregar nota');
      return false;
    }
  };

  const handleUpdateEntryNote = async (entryIdOrTempId, noteIdOrIdx, contenido) => {
    try {
      if (typeof entryIdOrTempId === 'string' || isNaN(Number(entryIdOrTempId))) {
        const entry = draftEntries.find(e => e.tempId === entryIdOrTempId);
        if (entry && entry.notas) {
          const newNotes = [...entry.notas];
          newNotes[noteIdOrIdx] = { ...newNotes[noteIdOrIdx], contenido };
          handleUpdateDraftEntry(entryIdOrTempId, { notas: newNotes });
          return true;
        }
        return false;
      }
      await updateTareaNota(noteIdOrIdx, { contenido });
      await refreshEntries();
      return true;
    } catch {
      notify.error('Error al actualizar nota');
      return false;
    }
  };

  const handleDeleteEntryNote = async (entryIdOrTempId, noteIdOrIdx) => {
    try {
      if (typeof entryIdOrTempId === 'string' || isNaN(Number(entryIdOrTempId))) {
        const entry = draftEntries.find(e => e.tempId === entryIdOrTempId);
        if (entry && entry.notas) {
          const newNotes = entry.notas.filter((_, i) => i !== noteIdOrIdx);
          handleUpdateDraftEntry(entryIdOrTempId, { notas: newNotes });
          notify.success('Nota de borrador eliminada');
          return true;
        }
        return false;
      }
      await deleteTareaNota(noteIdOrIdx);
      await refreshEntries();
      notify.success('Nota eliminada');
      return true;
    } catch {
      notify.error('Error al eliminar nota');
      return false;
    }
  };

  const handleAddEntryImage = async (entryId, file) => {
    try {
      if (typeof entryId === 'string' || isNaN(Number(entryId))) {
        const entry = draftEntries.find(e => e.tempId === entryId);
        if (entry) {
          const base64Thumb = await generateCompressedThumbnail(file);
          const newImgs = [...(entry._localImages || []), { 
            file, 
            preview: URL.createObjectURL(file), 
            id: Math.random().toString(36).substr(2, 9),
            base64Thumb
          }];
          handleUpdateDraftEntry(entryId, { _localImages: newImgs });
          return;
        }
      }
      await addTareaImagen(entryId, file);
      await refreshEntries();
      notify.success('Imagen agregada');
    } catch {
      notify.error('Error al subir imagen');
    }
  };

  const handleDeleteEntryImage = async (entryId, imagenId) => {
    try {
      if (typeof entryId === 'string' || isNaN(Number(entryId))) {
        const entry = draftEntries.find(e => e.tempId === entryId);
        if (entry && entry._localImages) {
          const newImgs = entry._localImages.filter(img => img.id !== imagenId);
          handleUpdateDraftEntry(entryId, { _localImages: newImgs });
          return;
        }
      }
      await deleteTareaImagen(entryId, imagenId);
      await refreshEntries();
      notify.success('Imagen eliminada');
    } catch {
      notify.error('Error al eliminar imagen');
    }
  };

  const handleIniciar = async () => {
    setIniciando(true);
    try {
      await iniciarMinuta(id);
      const res = await getMinutaById(id);
      setMinuta(res.data?.data || res.data);
      notify.success("Iniciada");
    } finally { setIniciando(false); }
  };

  const handleCancelar = async () => {
    setShowCancelModal(true);
  };

  const confirmCancelar = async () => {
    setCancelando(true);
    setShowCancelModal(false);
    try {
      await cancelarMinuta(id);
      notify.success("Cancelada");
      navigate('/minutas');
    } catch {
      notify.error("Error al cancelar la minuta");
    } finally { setCancelando(false); }
  };

  const handleCerrar = async () => {
    if (draftEntries.length > 0 || draftNotes.length > 0) { setShowReviewModal(true); return; }
    
    const pendingTasks = tareas.filter(t => t.estado?.toUpperCase() === 'PENDIENTE');
    const revisionTasks = tareas.filter(t => t.estado?.toUpperCase() === 'EN_REVISION');
    
    if (pendingTasks.length > 0 || revisionTasks.length > 0) {
      setShowForceCloseModal(true);
    } else {
      setShowCloseModal(true);
    }
  };

  const confirmCerrar = async () => {
    setCerrando(true);
    setShowCloseModal(false);
    try {
      const res = await cerrarMinuta(id);
      if (res.data?.advertencia) notify.warning(res.data.advertencia);
      const resMinuta = await getMinutaById(id);
      setMinuta(resMinuta.data?.data || resMinuta.data);
      notify.success("Minuta cerrada");
    } catch {
      notify.error("Error al cerrar la minuta");
    } finally { setCerrando(false); }
  };

  const handleReabrir = async () => {
    setReabriendo(true);
    try {
      await reabrirMinuta(id);
      const resMinuta = await getMinutaById(id);
      setMinuta(resMinuta.data?.data || resMinuta.data);
    } finally { setReabriendo(false); }
  };

  const handleFinalizar = async () => {
    if (allEntries.length === 0 && draftEntries.length === 0) {
      notify.warning('No puedes finalizar una junta sin entradas. Captura al menos un punto o cancela la minuta.');
      return;
    }
    if (draftEntries.length > 0 || draftNotes.length > 0) { setShowReviewModal(true); return; }
    setShowFinalizarModal(true);
  };

  const confirmFinalizar = async () => {
    setShowFinalizarModal(false);
    setFinalizando(true);
    try {
      const res = await finalizarMinuta(id);
      setMinuta(res.data?.data || res.data);
      notify.success(res.data?.message || "Junta finalizada");
    } catch {
      notify.error("Error al finalizar la junta");
    } finally { setFinalizando(false); }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);

  const handleDownloadPdf = async (area) => {
    setIsGeneratingPdf(area);
    try {
      const res = await generarPdfPorArea(id, area);
      let url = res?.data?.data?.pdfUrl || res?.data?.pdfUrl || res?.pdfUrl;
      
      if (!url) throw new Error("No se pudo obtener la URL del PDF");

      if (url.startsWith('/')) {
        url = `${ENV.API_URL}${url}`;
      }

      const fechaObj = new Date(minuta.fechaRealizada || minuta.fechaProgramada || minuta.createdAt);
      const fechaFormateada = `${String(fechaObj.getDate()).padStart(2, '0')}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${fechaObj.getFullYear()}`;
      
      setSharePdfData({
        url,
        area,
        fechaStr: fechaFormateada,
        minutaTitulo: minuta.titulo || 'Minuta',
      });
      
    } catch (err) {
      console.error("Error al compartir PDF:", err);
      notify.error('Error al generar y compartir el PDF');
    } finally {
      setIsGeneratingPdf(null);
    }
  };


  const handleToggleNotificado = async (tareaId) => {
    try {
      await toggleNotificadoTarea(tareaId);
      await refreshEntries();
    } catch {
      notify.error('Error al actualizar estado de notificación');
    }
  };

  if (loadingMinuta) return <div className="flex h-screen items-center justify-center bg-slate-50"><Icon name="progress_activity" className="animate-spin text-marca-primario" size="40px" /></div>;

  const politicasAcordadas = allEntries.filter(e => e.tipo === 'POLITICA');
  const recordatoriosGenerales = allEntries.filter(e => e.tipo === 'RECORDATORIO');

  const commonProps = {
    minuta, users, resumen, allEntries, filteredEntries, loadingTareas, departamento, politicasAcordadas, recordatoriosGenerales,
    activeFilter, setActiveFilter, handleFilterByStatus, handleFilterByTipo, handleResetFilter, viewMode, setViewMode: handleSetViewMode,
    handleCapture, draftEntries, draftNotes, addDraftNote, updateDraftNote, removeDraftNote,
    handleDeleteEntry, removeDraftEntry: handleRemoveDraftEntry, updateDraftEntry: handleUpdateDraftEntry, 
    organizeEntry, setOrganizeEntry, handleOrganizeSave,
    editEntry, setEditEntry, handleEditEntrySave, isSavingEntry,
    updateTarea, changeTareaStatus: handleStatusChange, fetchTareas, refreshEntries, setShowReviewModal, showReviewModal,
    handleFinalSubmit, isSubmittingFinal, showNotes, setShowNotes, handleCreateEntryNote, handleUpdateEntryNote,
    handleDeleteEntryNote, handleAddEntryImage, handleDeleteEntryImage, handleIniciar, handleCancelar, handleCerrar, handleReabrir, handleFinalizar,
    iniciando, cancelando, cerrando, reabriendo, finalizando, minutaEstado: minuta?.estado,
    clearDrafts: handleClearDrafts, handleDownloadPdf, isGeneratingPdf,
    handleToggleNotificado, currentUser
  };

  return (
    <>
      {isDesktop ? <MinutaDetailDesktopView {...commonProps} /> : <MinutaDetailMobileView {...commonProps} />}

      {showForceCloseModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-rose-100 bg-white p-6 shadow-2xl shadow-slate-950/30 animate-in zoom-in-95 duration-300 animate-out fade-out duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                <Icon name="gavel" size="20px" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Forzar Cierre de Minuta</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmación requerida</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 font-medium">
              {tareas.filter(t => t.estado?.toUpperCase() === 'PENDIENTE').length > 0 ? (
                <>
                  <p className="text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100/50">
                    Advertencia: Las siguientes tareas están PENDIENTES y no cuentan con entregas registradas. Se cerrarán forzosamente sin evidencias.
                  </p>
                  <div className="max-h-[160px] overflow-y-auto border border-slate-100 rounded-xl p-2 space-y-1.5 custom-scrollbar bg-slate-50/50">
                    {tareas.filter(t => t.estado?.toUpperCase() === 'PENDIENTE').map(task => (
                      <div key={task.id} className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded-lg border border-slate-100 shadow-xs">
                        <span className="font-bold text-slate-700 truncate max-w-[320px]">{task.descripcion}</span>
                        <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">Pendiente</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Todas las tareas de esta minuta están en revisión. Si procedes, todas las tareas pasarán a estar cerradas junto con la minuta.
                </p>
              )}

              {tareas.filter(t => t.estado?.toUpperCase() === 'EN_REVISION').length > 0 && (
                <div className="text-xs text-slate-500 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/40">
                  * Tareas en revisión ({tareas.filter(t => t.estado?.toUpperCase() === 'EN_REVISION').length}) también serán aprobadas y cerradas automáticamente.
                </div>
              )}

              <p className="text-xs text-slate-400">
                ¿Estás seguro de que deseas forzar el cierre de la minuta y de todas sus tareas asociadas? Esta acción es irreversible.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowForceCloseModal(false)}
                className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setShowForceCloseModal(false);
                  setCerrando(true);
                  try {
                    const tasksToClose = tareas.filter(t => ['PENDIENTE', 'EN_REVISION'].includes(t.estado?.toUpperCase()));
                    await Promise.all(tasksToClose.map(t => changeTareaStatus(t.id, { estado: 'CERRADA' })));
                    
                    const res = await cerrarMinuta(id);
                    if (res.data?.advertencia) notify.warning(res.data.advertencia);
                    
                    const resMinuta = await getMinutaById(id);
                    setMinuta(resMinuta.data?.data || resMinuta.data);
                    await refreshEntries();
                    notify.success('Cierre forzado completado');
                  } catch (err) {
                    notify.error('Error al forzar cierre');
                  } finally {
                    setCerrando(false);
                  }
                }}
                className="h-9 px-4 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all"
              >
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={confirmCancelar}
          title="Cancelar Minuta"
          message="¿Estás seguro de que deseas cancelar la minuta? Esta acción no se puede deshacer."
          confirmText="Cancelar Minuta"
          cancelText="Volver"
          variant="danger"
        />
      )}

      {showCloseModal && (
        <ConfirmModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          onConfirm={confirmCerrar}
          title="Cerrar Minuta"
          message="¿Estás seguro de que deseas cerrar esta minuta? Ya no podrás agregar nuevas tareas."
          confirmText="Cerrar Minuta"
          cancelText="Volver"
          variant="success"
        />
      )}

      {showFinalizarModal && (
        <ConfirmModal
          isOpen={showFinalizarModal}
          onClose={() => setShowFinalizarModal(false)}
          onConfirm={confirmFinalizar}
          title="Finalizar Sesión"
          message="¿Ya quieres finalizar la sesión y organizar las tareas?"
          confirmText="Finalizar"
          cancelText="Volver"
          variant="success"
        />
      )}

      <SharePdfModal 
        isOpen={Boolean(sharePdfData)} 
        onClose={() => setSharePdfData(null)} 
        data={sharePdfData} 
      />
    </>
  );
}
