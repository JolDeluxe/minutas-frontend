import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMinutaById } from '../api/minutas-api';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';

import { Icon, Button, GlassViewToggle, GlassFab, ScrollToTopButton, Skeleton } from '@/components/ui/z_index';

import { TareasTable } from '@/features/tareas/components/tareas-table';
import { TareaCard } from '@/features/tareas/components/tarea-card';
import { TareaFormModal } from '@/features/tareas/components/tarea-form-modal';
import { TareaOrganizeModal } from '@/features/tareas/components/tarea-organize-modal';

export default function MinutaDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const [viewMode, setViewMode] = useState('table');
    
    // Minuta Data
    const [minuta, setMinuta] = useState(null);
    const [loadingMinuta, setLoadingMinuta] = useState(true);

    // Tareas Data
    const {
        tareas,
        meta,
        loading: loadingTareas,
        submitting,
        fetchTareas,
        createTarea,
        updateTarea,
        changeStatus,
    } = useTareas();
    
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    
    // Modals
    const [showForm, setShowForm] = useState(false);
    const [tareaToEdit, setTareaToEdit] = useState(null);
    const [showOrganize, setShowOrganize] = useState(false);
    const [tareaToOrganize, setTareaToOrganize] = useState(null);

    // Initial Load Minuta
    useEffect(() => {
        const loadMinuta = async () => {
            setLoadingMinuta(true);
            try {
                const res = await getMinutaById(id);
                setMinuta(res.data);
            } catch {
                notify.error("No se pudo cargar la minuta");
                navigate('/minutas');
            } finally {
                setLoadingMinuta(false);
            }
        };
        loadMinuta();
    }, [id, navigate]);

    // Load Tareas
    const loadTareas = useCallback(() => {
        if (!id) return;
        const params = {
            minutaId: id,
            page,
            limit: 20,
        };
        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        fetchTareas(params);
    }, [id, page, sortConfig, fetchTareas]);

    useEffect(() => {
        loadTareas();
    }, [loadTareas]);

    const handleSortChange = useCallback((key, direction) => { setSortConfig({ key, direction }); setPage(1); }, []);

    // Handlers
    const handleSaveTarea = async (payload) => {
        if (tareaToEdit) {
            // Not supported in batch form easily, just for demo
            notify.info("Edición no implementada completamente en este demo");
        } else {
            await createTarea(payload);
            notify.success('Entradas agregadas a la minuta.');
        }
        setShowForm(false);
        setTareaToEdit(null);
        await loadTareas();
    };

    const handleSaveOrganize = async (tareaId, payload, newStatus) => {
        await updateTarea(tareaId, payload);
        if (newStatus) {
            await changeStatus(tareaId, { estado: newStatus });
        }
        notify.success('Entrada organizada correctamente.');
        setShowOrganize(false);
        setTareaToOrganize(null);
        await loadTareas();
    };

    if (loadingMinuta) {
        return (
            <div className="max-w-7xl mx-auto w-full p-4 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        );
    }

    if (!minuta) return null;

    const hasContent = !loadingTareas && tareas.length > 0;

    return (
        <div className="max-w-7xl mx-auto w-full p-2 lg:p-4 pb-24">
            
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={() => navigate('/minutas')}
                    className="p-2 rounded-md hover:bg-slate-200 transition-colors text-slate-600"
                >
                    <Icon name="arrow_back" size="24px" />
                </button>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight fuente-titulos">
                        {minuta.titulo}
                    </h1>
                    <p className="text-sm text-slate-500 font-mono mt-1">
                        Minuta #{minuta.id} • Línea: {minuta.lineaDefault}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Entradas / Tareas</h2>
                    <p className="text-sm text-slate-500">{meta.totalFiltrado} registradas</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <GlassViewToggle value={viewMode} onChange={setViewMode} />
                    
                    <Button
                        variant="guardar"
                        icon="add_task"
                        onClick={() => { setTareaToEdit(null); setShowForm(true); }}
                        className={!isDesktop ? 'hidden' : ''}
                    >
                        Agregar Entrada
                    </Button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loadingTareas ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl h-40 animate-pulse" />
                        ))
                    ) : !hasContent ? (
                        <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
                            <Icon name="check_circle_outline" className="text-slate-200 text-6xl mb-3" />
                            <p className="text-slate-500 text-base font-medium">No hay entradas en esta minuta aún.</p>
                        </div>
                    ) : (
                        tareas.map(tarea => (
                            <TareaCard 
                                key={tarea.id} 
                                tarea={tarea} 
                                onOrganize={(t) => { setTareaToOrganize(t); setShowOrganize(true); }}
                                onEdit={(t) => { setTareaToEdit(t); setShowForm(true); }} 
                            />
                        ))
                    )}
                </div>
            ) : (
                <TareasTable
                    tareas={tareas}
                    loading={loadingTareas}
                    page={page}
                    limit={20}
                    totalPages={meta.totalPages}
                    totalItems={meta.totalFiltrado}
                    sortConfig={sortConfig}
                    onPageChange={setPage}
                    onSortChange={handleSortChange}
                    onOrganize={(t) => { setTareaToOrganize(t); setShowOrganize(true); }}
                    onEdit={(t) => { setTareaToEdit(t); setShowForm(true); }}
                />
            )}

            {!isDesktop && (
                <>
                    <GlassFab
                        icon="add_task"
                        onClick={() => { setTareaToEdit(null); setShowForm(true); }}
                        variant="primary"
                        size={56}
                        bottom="84px"
                        right="20px"
                    />
                    <ScrollToTopButton bottom="84px" left="20px" />
                </>
            )}

            {/* Modals */}
            <TareaFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setTareaToEdit(null); }}
                minutaId={minuta.id}
                lineaDefault={minuta.lineaDefault}
                submitting={submitting}
                onSuccess={handleSaveTarea}
            />

            <TareaOrganizeModal
                isOpen={showOrganize}
                onClose={() => { setShowOrganize(false); setTareaToOrganize(null); }}
                tareaAOrganizar={tareaToOrganize}
                submitting={submitting}
                onSuccess={handleSaveOrganize}
            />

        </div>
    );
}
