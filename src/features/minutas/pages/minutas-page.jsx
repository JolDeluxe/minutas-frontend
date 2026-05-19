import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutas } from '../hooks/use-minutas';
import { MinutasDesktop } from '../views/minutas-desktop';
import { MinutasMobile } from '../views/minutas-mobile';
import { MinutaFormModal } from '../components/minuta-form-modal';

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
    } = useMinutas();

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });
    
    // Filtros de periodo rápido
    const [periodo, setPeriodo] = useState('all');
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);
    
    // DEFAULT: ACTIVAS — el dueño llega y ve las que importan
    const [estadoFilter, setEstadoFilter] = useState('ACTIVA');
    
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

    const loadMinutas = useCallback(() => {
        const params = { page, limit: LIMIT };
        if (query) params.q = query;
        if (sortConfig?.key) {
            params.sort = JSON.stringify([{ [sortConfig.key]: sortConfig.direction }]);
        }
        
        // Estado filter (ACTIVA/CERRADA/TODAS) — prioridad sobre filtro avanzado
        if (estadoFilter) {
            params.estado = estadoFilter;
        } else if (filters.estado) {
            params.estado = filters.estado;
        }

        // Quick Navigate: si hay fecha seleccionada, filtra por ese día exacto
        if (selectedDate) {
            const d = new Date(selectedDate);
            params.fechaDesde = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
            params.fechaHasta = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString();
        } else if (periodo && periodo !== 'all') {
            // Filtros de periodo rápido 
            params.periodo = periodo;
            if (year) params.year = year;
            if (month) params.month = month;
        } else {
            // Filtros legacy de fecha
            if (filters.fechaDesde) params.fechaDesde = new Date(filters.fechaDesde + 'T00:00:00').toISOString();
            if (filters.fechaHasta) params.fechaHasta = new Date(filters.fechaHasta + 'T23:59:59').toISOString();
            if (year) params.year = year;
            if (month) params.month = month;
        }

        if (filters.lineaDefault) params.lineaDefault = filters.lineaDefault;
        if (filters.creadoPorId) params.creadoPorId = filters.creadoPorId;

        return fetchMinutas(params).catch(() => notify.error('Error al cargar minutas.'));
    }, [page, query, sortConfig, filters, periodo, year, month, estadoFilter, selectedDate, fetchMinutas]);

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
        if (minutaToEdit) {
            await updateMinuta(minutaToEdit.id, payload);
            notify.success('Minuta actualizada correctamente.');
        } else {
            await createMinuta(payload);
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
        navigate(`/minutas/${minuta.id}`);
    };

    const sharedProps = {
        minutas,
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
    };

    return (
        <div className="max-w-full mx-auto w-full">
            <div className="p-2 lg:p-4">
                {isDesktop
                    ? <MinutasDesktop {...sharedProps} />
                    : <MinutasMobile  {...sharedProps} />
                }
            </div>

            <MinutaFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setMinutaToEdit(null); }}
                minutaAEditar={minutaToEdit}
                submitting={submitting}
                onSuccess={handleSaveMinuta}
            />
        </div>
    );
};

export default MinutasPage;
