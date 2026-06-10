// src/features/tareas_generales/pages/tareas-generales-page.jsx
import { useState, useCallback, useEffect, useMemo } from 'react';
import { notify } from '@/components/notification/adaptive-notify';
import { useAuthStore } from '@/stores/auth-store';
import { useTareasGenerales } from '../hooks/use-tareas-generales';
import { ModalNuevaGeneral } from '../components/modal-nueva-general';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { PanelDetalleTarea } from '../../tareas/components/comun/panel-detalle-tarea';
import api from '@/lib/axios';
import { TareasGeneralesDesktop } from '../views/tareas-generales-desktop';
import { TareasGeneralesMobile } from '../views/tareas-generales-mobile';
import { ShareTareaModal } from '../components/share-tarea-modal';

const LIMIT = 25;

const AREA_MAP_LABEL = {
    DISENO: 'Diseño',
    MARKETING: 'Marketing',
    DIRECCION_MBC: 'Dir. MBC',
    DIRECCION_CFI: 'Dir. CFI',
    DIRECCION_ADJUNTA: 'Dir. Adjunta',
    DIRECCION_TIENDAS: 'Dir. Tiendas',
    DIRECCION_MKT: 'Dir. MKT',
    DIRECCION_ALTA_CALIDAD: 'Dir. Alta Calidad',
};

const TIPOS_LABELS = {
    SIN_ORGANIZAR: 'Sin Clasificar',
    TAREA: 'Tareas',
    RECORDATORIO: 'Recordatorios',
    POLITICA: 'Políticas',
};

export default function TareasGeneralesPage() {
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    const {
        tareas,
        meta,
        loading,
        submitting,
        fetchTareas,
        createTarea,
        updateTarea,
        changeStatus,
        deleteTarea,
        createNota,
        updateNota,
        deleteNota,
    } = useTareasGenerales();

    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [detailTarea, setDetailTarea] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const isDesktop = useIsDesktop();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
    const [sharePdfData, setSharePdfData] = useState(null);

    const [filters, setFilters] = useState({
        q: '',
        tipo: '',
        area: '',
        estado: '',
        notificado: '',
        page: 1,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Cargar usuarios para el selector de responsables
    useEffect(() => {
        api.get('/api/usuarios?limit=100')
            .then(res => {
                const data = res.data?.data?.usuarios || res.data?.usuarios || res.data || [];
                setUsers(Array.isArray(data) ? data : []);
            })
            .catch(() => {});
    }, []);

    const handleDownloadPdf = async (idOrArea) => {
        let tareaId = null;
        let area = null;
        if (typeof idOrArea === 'number') {
            tareaId = idOrArea;
            const t = tareas.find(x => x.id === tareaId);
            if (t) area = t.area;
        } else {
            area = idOrArea;
            const t = tareas.find(x => x.area === area);
            if (t) tareaId = t.id;
        }

        if (!tareaId) {
            notify.error('No se pudo encontrar la tarea.');
            return;
        }

        setIsGeneratingPdf(area || idOrArea);
        try {
            const { data } = await api.get(`/api/tareas/${tareaId}/pdf`);
            const pdfUrl = data?.data?.pdfUrl || data?.pdfUrl;
            if (pdfUrl) {
                const targetTarea = tareas.find(x => x.id === tareaId);
                setSharePdfData({
                    url: pdfUrl,
                    id: tareaId,
                    area: area,
                    descripcion: targetTarea?.descripcion,
                    fechaVencimiento: targetTarea?.fechaVencimiento
                });
            } else {
                notify.error('No se pudo obtener la URL del PDF.');
            }
        } catch (err) {
            notify.error('Error al generar el PDF.');
        } finally {
            setIsGeneratingPdf(null);
        }
    };

    const handleToggleNotificado = async (tareaId) => {
        try {
            await api.patch(`/api/tareas/${tareaId}/notificado`);
            loadTareas();
            notify.success('Estado de notificación actualizado.');
        } catch {
            notify.error('Error al actualizar estado de notificación.');
        }
    };

    const loadTareas = useCallback(() => {
        const params = {
            page: filters.page,
            limit: LIMIT,
            onlyGeneral: true,
            todo: true,
        };
        if (filters.q) params.q = filters.q;
        if (filters.tipo) params.tipo = filters.tipo;
        if (filters.area) params.area = filters.area;
        if (filters.estado) params.estado = filters.estado;
        if (filters.notificado !== '') params.notificado = filters.notificado;

        fetchTareas(params).catch(() => notify.error('Error al cargar tareas generales.'));
    }, [filters, fetchTareas]);

    useEffect(() => { loadTareas(); }, [loadTareas]);

    // Unified Resumen for TareasGeneralesExecutiveSummary
    const resumen = useMemo(() => {
        let total = meta.total ?? 0;
        let TAREA = 0;
        let RECORDATORIO = 0;
        let POLITICA = 0;
        let SIN_ORGANIZAR = 0;

        tareas.forEach(t => {
            if (t.tipo === 'TAREA') TAREA++;
            else if (t.tipo === 'RECORDATORIO') RECORDATORIO++;
            else if (t.tipo === 'POLITICA') POLITICA++;
            else SIN_ORGANIZAR++;
        });

        const notificados = meta.totalNotificados || 0;
        const sinNotificar = meta.totalSinNotificar || 0;

        return {
            total,
            TAREA,
            RECORDATORIO,
            POLITICA,
            SIN_ORGANIZAR,
            notificados,
            sinNotificar
        };
    }, [tareas, meta]);

    const handleOpenCreate = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (tarea) => {
        setEditData(tarea);
        setIsModalOpen(true);
    };

    const handleSave = async (payload, tareaId) => {
        try {
            if (tareaId) {
                // Edición
                const updatePayload = {
                    descripcion: payload.descripcion,
                    area: payload.area,
                    linea: payload.linea,
                    clasificacion: payload.clasificacion,
                    prioridad: payload.prioridad,
                    fechaVencimiento: payload.fechaVencimiento,
                    alcanceRecordatorio: payload.alcanceRecordatorio,
                    responsables: payload.responsables,
                    tipo: payload.tipo,
                };
                await updateTarea(tareaId, updatePayload);
                notify.success('Tarea actualizada correctamente.');
            } else {
                // Creación
                await createTarea({ tareas: [payload] });
                notify.success('Tarea general creada correctamente.');
            }
            setIsModalOpen(false);
            setEditData(null);
            loadTareas();
        } catch (err) {
            notify.error(err?.response?.data?.error || 'Error al guardar la tarea.');
            throw err;
        }
    };

    const handleDelete = async (tareaId) => {
        try {
            await deleteTarea(tareaId);
            notify.success('Tarea eliminada correctamente.');
            loadTareas();
        } catch {
            notify.error('Error al eliminar la tarea.');
        }
    };

    const handleChangeStatus = async (tareaId, data, silent = false) => {
        try {
            await changeStatus(tareaId, data);
            if (!silent) notify.success('Estado actualizado.');
            if (isDetailOpen && detailTarea?.id === tareaId) setIsDetailOpen(false);
            loadTareas();
        } catch {
            notify.error('Error al actualizar estado.');
        }
    };

    const handleViewDetail = (tarea) => {
        setDetailTarea(tarea);
        setIsDetailOpen(true);
    };

    const setFilter = (key, val) => {
        setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ q: '', tipo: '', area: '', estado: '', notificado: '', page: 1 });
    };

    const handleSearchChange = (val) => {
        setFilters(prev => ({ ...prev, q: val, page: 1 }));
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            area: newFilters.area,
            page: 1
        }));
    };

    const activeFilterCount = [filters.area].filter(Boolean).length;

    const sharedProps = {
        tareas,
        meta,
        loading,
        filters,
        showFilters,
        activeFilterCount,
        resumen,
        onSearchChange: handleSearchChange,
        onApplyFilters: handleApplyFilters,
        onToggleFilters: () => setShowFilters(!showFilters),
        onFilterByNotificado: (status) => setFilter('notificado', filters.notificado === status ? '' : status),
        onFilterByTipo: (tipo) => setFilter('tipo', filters.tipo === tipo ? '' : tipo),
        onResetFilter: clearFilters,
        onPageChange: (p) => setFilters(prev => ({ ...prev, page: p })),
        onRefresh: loadTareas,
        onOpenCreate: handleOpenCreate,
        onEdit: handleOpenEdit,
        onRemove: handleDelete,
        onCreateNota: createNota,
        onUpdateNota: updateNota,
        onDeleteNote: deleteNota,
        onDownloadPdf: handleDownloadPdf,
        onToggleNotificado: handleToggleNotificado,
        onViewDetail: handleViewDetail,
        currentUser,
        onChangeStatus: handleChangeStatus,
        isGeneratingPdf,
    };

    return (
        <div className="flex flex-col gap-4 p-2 lg:p-4 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {isDesktop ? (
                <TareasGeneralesDesktop {...sharedProps} />
            ) : (
                <TareasGeneralesMobile {...sharedProps} />
            )}

            {/* Modal Crear/Editar */}
            <ModalNuevaGeneral
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditData(null); }}
                onSave={handleSave}
                users={users}
                editData={editData}
                submitting={submitting}
            />

            {/* Panel Detalle */}
            <PanelDetalleTarea
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                tarea={detailTarea}
                onChangeStatus={handleChangeStatus}
                onUpdate={async (id, payload) => {
                    try {
                        await updateTarea(id, payload);
                        notify.success('Actualizado.');
                        loadTareas();
                    } catch {
                        notify.error('Error al actualizar.');
                    }
                }}
                onDelete={handleDelete}
                submitting={submitting}
                currentUser={currentUser}
                users={users}
                hideMinutaInfo={true}
                onCreateNota={async (id, content) => {
                    await createNota({ tareaId: id, contenido: content });
                    loadTareas();
                    setDetailTarea(prev => {
                        if (!prev) return prev;
                        const newNotes = [...(prev.notas || prev.notes || [])];
                        newNotes.unshift({
                            id: Date.now(),
                            contenido: content,
                            creadoPorId: currentUser?.id,
                            creadoPor: currentUser,
                            createdAt: new Date().toISOString(),
                            esEntrega: false
                        });
                        return { ...prev, notas: newNotes };
                    });
                }}
                onDeleteNota={async (id) => {
                    await deleteNota(id);
                    loadTareas();
                    setDetailTarea(prev => {
                        if (!prev) return prev;
                        const oldNotes = prev.notas || prev.notes || [];
                        return { ...prev, notas: oldNotes.filter(n => n.id !== id) };
                    });
                }}
            />

            {/* Modal Compartir PDF Tarea */}
            <ShareTareaModal
                isOpen={Boolean(sharePdfData)}
                onClose={() => setSharePdfData(null)}
                data={sharePdfData}
            />
        </div>
    );
}
