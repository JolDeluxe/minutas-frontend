import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import { useMinutas } from '../hooks/use-minutas';
import { MinutasDesktop } from '../views/minutas-desktop';
import { MinutasMobile } from '../views/minutas-mobile';
import { MinutaFormModal } from '../components/minuta-form-modal';

const LIMIT = 10;

const MinutasPage = () => {
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();

    const {
        minutas,
        meta,
        loading,
        submitting,
        fetchMinutas,
        createMinuta,
        updateMinuta,
    } = useMinutas();

    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    
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
        if (filters.estado) params.estado = filters.estado;
        if (filters.lineaDefault) params.lineaDefault = filters.lineaDefault;
        if (filters.fechaDesde) params.fechaDesde = new Date(filters.fechaDesde + 'T00:00:00').toISOString();
        if (filters.fechaHasta) params.fechaHasta = new Date(filters.fechaHasta + 'T23:59:59').toISOString();
        if (filters.creadoPorId) params.creadoPorId = filters.creadoPorId;

        return fetchMinutas(params).catch(() => notify.error('Error al cargar minutas.'));
    }, [page, query, sortConfig, filters, fetchMinutas]);

    useEffect(() => { loadMinutas(); }, [loadMinutas]);

    const handleSearchChange = useCallback((q) => { setQuery(q); setPage(1); }, []);
    const handleSortChange = useCallback((key, direction) => { setSortConfig({ key, direction }); setPage(1); }, []);

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
