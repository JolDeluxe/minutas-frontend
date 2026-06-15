import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutas } from '../hooks/use-minutas';
import { MinutasDesktop } from '../views/minutas-desktop';
import { MinutasMobile } from '../views/minutas-mobile';
import { MinutaFormModal } from '../components/minuta-form-modal';
import { SharePdfModal } from '../components/share-pdf-modal';
import { generarPdfMinutaExterna } from '../api/minutas-api';
import { ENV } from '@/config/env';

import { useUIStore } from '@/stores/ui-store';
import { ConfirmModal } from '@/components/ui/z_index';

const LIMIT = 50; // Más alto para que el agrupamiento por fecha funcione bien

const MinutasPage = () => {
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();

    const {
        minutas,
        meta,
        navegacionEjecutiva,
        loading,
        submitting,
        fetchMinutas,
        createMinuta,
        updateMinuta,
        cancelMinuta,
    } = useMinutas();

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });
    
    // Filtros de periodo rápido
    const [periodo, setPeriodo] = useState('all');
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);
    
    // DEFAULT: TODAS — el dueño pidió TODAS por defecto en la vista general
    const [estadoFilter, setEstadoFilter] = useState('TODAS');
    
    // Filtro Global de Departamento (ADMIN) desde el UI Store
    const { departamentoGlobal, setDepartamentoGlobal } = useUIStore();
    
    // Quick Navigate — fecha seleccionada en el calendario
    const [selectedDate, setSelectedDate] = useState(null);

    const [filters, setFilters] = useState({
        estado: '',
        lineaDefault: '',
        fechaDesde: '',
        fechaHasta: '',
        creadoPorId: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    
    const [showForm, setShowForm] = useState(false);
    const [minutaToEdit, setMinutaToEdit] = useState(null);

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
    const [sharePdfData, setSharePdfData] = useState(null);

    const handleDownloadPdf = async (minutaExterna) => {
        setIsGeneratingPdf(minutaExterna.id);
        try {
            const res = await generarPdfMinutaExterna(minutaExterna.id);
            let url = res?.data?.data?.pdfUrl || res?.data?.pdfUrl || res?.pdfUrl;
            
            if (!url) throw new Error("No se pudo obtener la URL del PDF");

            if (url.startsWith('/')) {
                url = `${ENV.API_URL}${url}`;
            }

            const fechaObj = new Date(minutaExterna.fechaRealizada || minutaExterna.fechaProgramada || minutaExterna.createdAt);
            const fechaFormateada = `${String(fechaObj.getDate()).padStart(2, '0')}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${fechaObj.getFullYear()}`;
            
            setSharePdfData({
                url,
                area: minutaExterna.area || 'Externo',
                fechaStr: fechaFormateada,
                minutaTitulo: minutaExterna.tema || 'Minuta',
            });
            
        } catch (err) {
            console.error("Error al compartir PDF:", err);
            notify.error('Error al generar y compartir el PDF');
        } finally {
            setIsGeneratingPdf(null);
        }
    };

    const loadMinutas = useCallback(() => {
        const params = { page, limit: LIMIT };
        if (query) params.q = query;
        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        
        // Estado filter (ACTIVA/CERRADA/TODAS) — prioridad sobre filtro avanzado
        if (estadoFilter && estadoFilter !== 'TODAS') {
            params.estado = estadoFilter;
        } else if (filters.estado && filters.estado !== 'TODAS') {
            params.estado = filters.estado;
        }

        if (periodo && periodo !== 'all') {
            params.periodo = periodo;
        }
        if (year) params.year = year;
        if (month) params.month = month;
        if (filters.fechaDesde) params.fechaDesde = new Date(filters.fechaDesde + 'T00:00:00').toISOString();
        if (filters.fechaHasta) params.fechaHasta = new Date(filters.fechaHasta + 'T23:59:59').toISOString();

        if (filters.lineaDefault) params.lineaDefault = filters.lineaDefault;
        if (filters.creadoPorId) params.creadoPorId = filters.creadoPorId;
        
        if (departamentoGlobal !== 'TODAS') {
            params.departamentoGlobal = departamentoGlobal;
        }

        return fetchMinutas(params).catch(() => notify.error('Error al cargar minutas.'));
    }, [page, query, sortConfig, filters, periodo, year, month, estadoFilter, selectedDate, departamentoGlobal, fetchMinutas]);

    useEffect(() => { loadMinutas(); }, [loadMinutas]);

    // Extraer años disponibles de las minutas cargadas
    const availableYears = useMemo(() => {
        const yearsSet = new Set();
        minutas.forEach(m => {
            const d = new Date(m.fechaRealizada || m.fechaProgramada || m.createdAt);
            if (!isNaN(d.getTime())) yearsSet.add(d.getFullYear());
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [minutas]);

    const handleSearchChange = useCallback((q) => { setQuery(q); setPage(1); }, []);
    const handleSortChange = useCallback((key, direction) => { setSortConfig({ key, direction }); setPage(1); }, []);

    const handlePeriodoChange = useCallback((p) => {
        setPeriodo(p);
        setSelectedDate(null); // Limpiar selección de fecha al cambiar periodo
        setPage(1);
        if (p === 'all' || p === 'today' || p === 'week') {
            setYear(null);
            setMonth(null);
        }
    }, []);

    const handleYearChange = useCallback((y) => {
        setYear(y);
        setSelectedDate(null);
        setPage(1);
    }, []);

    const handleMonthChange = useCallback((m) => {
        setMonth(m);
        setSelectedDate(null);
        setPage(1);
    }, []);

    const handleEstadoChange = useCallback((estado) => {
        setEstadoFilter(estado);
        setSelectedDate(null);
        setPage(1);
    }, []);

    const handleSelectDate = useCallback((date) => {
        if (!date) {
            setSelectedDate(null);
            setPage(1);
            return;
        }
        // Si tocas la misma fecha, deselecciona
        if (selectedDate && new Date(selectedDate).toDateString() === date.toDateString()) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date.toISOString());
        }
        // Limpiar periodo cuando se selecciona fecha directa
        setPeriodo('all');
        setPage(1);
    }, [selectedDate]);

    const handleSaveMinuta = async (payload) => {
        const isExterna = departamentoGlobal === 'EXTERNO';
        if (minutaToEdit) {
            await updateMinuta(minutaToEdit.id, payload, isExterna);
            notify.success('Minuta actualizada correctamente.');
        } else {
            await createMinuta(payload, isExterna);
            notify.success('Minuta creada correctamente.');
        }
        setShowForm(false);
        setMinutaToEdit(null);
        await loadMinutas();
    };

    const handleOpenCreate = () => {
        setMinutaToEdit(null);
        setShowForm(true);
    };

    const handleEdit = (minuta) => {
        setMinutaToEdit(minuta);
        setShowForm(true);
    };

    const handleViewDetail = (minuta) => {
        if (departamentoGlobal === 'EXTERNO') {
            navigate(`/minutas-externas/${minuta.id}`);
        } else {
            navigate(`/minutas/${minuta.id}`);
        }
    };

    const [minutaToCancel, setMinutaToCancel] = useState(null);

    const handleCancelMinuta = (minuta) => {
        setMinutaToCancel(minuta);
    };

    const confirmCancelMinuta = async () => {
        if (!minutaToCancel) return;
        const isExterna = departamentoGlobal === 'EXTERNO';
        try {
            await cancelMinuta(minutaToCancel.id, isExterna);
            notify.success('Minuta cancelada correctamente.');
            await loadMinutas();
        } catch (err) {
            notify.error(err.response?.data?.error || 'Error al cancelar la minuta.');
        } finally {
            setMinutaToCancel(null);
        }
    };

    // Ordenar minutas por Estado y Fecha:
    // 1. EN_CURSO (azul) - En curso
    // 2. EN_ORGANIZACION (naranja) - En organización
    // 3. ACTIVA (verde) - Activa
    // 4. PROGRAMADA (gris) - Programada
    // 5. CERRADA (neutral) - Cerrada
    // 6. CANCELADA (rojo) - Cancelada
    const sortedMinutas = useMemo(() => {
        if (!minutas) return [];
        
        const minutasCopy = [...minutas];
        
        const STATUS_ORDER = {
            'EN_CURSO': 1,
            'EN_ORGANIZACION': 2,
            'ACTIVA': 3,
            'PROGRAMADA': 4,
            'CERRADA': 5,
            'CANCELADA': 6
        };
        
        return minutasCopy.sort((a, b) => {
            const statusA = a.estado?.toUpperCase() || '';
            const statusB = b.estado?.toUpperCase() || '';
            
            const orderA = STATUS_ORDER[statusA] ?? 99;
            const orderB = STATUS_ORDER[statusB] ?? 99;
            
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            
            // Secundario: Orden por fecha desc o segun sortConfig
            const key = sortConfig?.key || 'fecha';
            let valA, valB;
            
            if (key === 'fecha') {
                valA = new Date(a.fechaRealizada || a.fechaProgramada || a.fecha || a.createdAt || 0).getTime();
                valB = new Date(b.fechaRealizada || b.fechaProgramada || b.fecha || b.createdAt || 0).getTime();
            } else {
                valA = a[key];
                valB = b[key];
            }
            
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;
            
            const direction = sortConfig?.direction || 'desc';
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [minutas, sortConfig]);

    const sharedProps = {
        minutas: sortedMinutas,
        loading,
        page,
        limit: LIMIT,
        totalPages: meta.totalPages,
        totalItems: meta.totalFiltrado,
        sortConfig,
        query,
        filters,
        showFilters,
        activeFiltersCount: Object.values(filters).reduce((acc, val) => acc + (val ? 1 : 0), 0),
        onPageChange: setPage,
        onSortChange: handleSortChange,
        onSearchChange: handleSearchChange,
        onViewDetail: handleViewDetail,
        onOpenCreate: handleOpenCreate,
        onEdit: handleEdit,
        onCancel: handleCancelMinuta,
        onToggleFilters: () => setShowFilters(!showFilters),
        onApplyFilters: (f) => { setFilters(f); setPage(1); },
        // Periodo
        periodo,
        year,
        // Navegación ejecutiva (del backend, GLOBAL)
        navegacionEjecutiva,
        month,
        estadoFilter,
        availableYears,
        onPeriodoChange: handlePeriodoChange,
        onYearChange: handleYearChange,
        onMonthChange: handleMonthChange,
        onEstadoChange: handleEstadoChange,
        // Quick navigate
        selectedDate,
        onSelectDate: handleSelectDate,
        // Global Filter
        departamentoGlobal,
        setDepartamentoGlobal: (val) => {
            setDepartamentoGlobal(val);
            setPage(1);
        },
        isExterna: departamentoGlobal === 'EXTERNO',
        onDownloadPdf: handleDownloadPdf,
        isGeneratingPdf,
    };

    return (
        <div className="max-w-full mx-auto w-full">
            <div className="p-2 lg:p-4">
                {isDesktop
                    ? <MinutasDesktop {...sharedProps} />
                    : <MinutasMobile  {...sharedProps} />
                }
            </div>

            {departamentoGlobal === 'EXTERNO' ? (
                // Aquí irá el ModalNuevaMinuta extendido para minutas externas
                <MinutaFormModal
                    isOpen={showForm}
                    onClose={() => { setShowForm(false); setMinutaToEdit(null); }}
                    minutaAEditar={minutaToEdit}
                    submitting={submitting}
                    onSuccess={handleSaveMinuta}
                    departamentoGlobal={departamentoGlobal}
                    isExterna={true}
                />
            ) : (
                <MinutaFormModal
                    isOpen={showForm}
                    onClose={() => { setShowForm(false); setMinutaToEdit(null); }}
                    minutaAEditar={minutaToEdit}
                    submitting={submitting}
                    onSuccess={handleSaveMinuta}
                    departamentoGlobal={departamentoGlobal}
                />
            )}

            {minutaToCancel && (
                <ConfirmModal
                    isOpen={Boolean(minutaToCancel)}
                    onClose={() => setMinutaToCancel(null)}
                    onConfirm={confirmCancelMinuta}
                    title="Cancelar Minuta"
                    message={`¿Estás seguro de que deseas cancelar la minuta "${minutaToCancel.titulo || minutaToCancel.tema}"? Esta acción no se puede deshacer.`}
                    confirmText="Cancelar Minuta"
                    cancelText="Volver"
                    variant="danger"
                />
            )}

            <SharePdfModal 
                isOpen={Boolean(sharePdfData)} 
                onClose={() => setSharePdfData(null)} 
                data={sharePdfData} 
            />
        </div>
    );
};

export default MinutasPage;
