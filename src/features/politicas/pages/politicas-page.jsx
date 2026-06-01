// src/features/politicas/pages/politicas-page.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { useCatalogosStore } from '@/stores/catalogos-store';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { notify } from '@/components/notification/adaptive-notify';
import { GlassViewToggle, Icon, Table, Modal, ModalHeader, ModalBody, ModalFooter, Button, TableActions, ConfirmModal } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { LINEA_MAP, formatRelative } from '@/features/minutas/constants';
import { LineIconSelector, MarketingIcon, DisenoIcon } from '@/features/minutas/components/icons/line-icons';
import { useUIStore } from '@/stores/ui-store';
import { ImageViewer } from '@/features/minutas/components/timeline/entry-card';
import { cn } from '@/utils/cn';

const PAGE_SIZE = 24;

const getTareasPayload = (response) => {
  if (response?.data?.tareas) return response.data;
  if (response?.data?.data?.tareas) return response.data.data;
  return null;
};

const getLineInfo = (politica) => {
  const isMarketing =
    politica.departamento === 'MARKETING' ||
    politica.linea === 'MARKETING' ||
    politica.area === 'MARKETING';

  if (isMarketing) {
    return { value: 'MARKETING', label: 'Marketing', color: '#7c3aed', isMarketing: true };
  }

  const fallback = politica.linea || 'DISENO';
  return {
    value: fallback,
    label: LINEA_MAP[fallback]?.label || fallback || 'General',
    color: LINEA_MAP[fallback]?.color || '#64748b',
    isMarketing: false,
  };
};

const PoliticaMedia = ({ politica, size = 'card', onOpenImages }) => {
  const images = politica.imagenes || [];
  const mediaSize = size === 'table' ? 'h-24 w-24 min-w-[6rem]' : 'h-24 w-24 sm:h-28 sm:w-28';

  if (images.length > 0) {
    return (
      <button
        type="button"
        onClick={() => onOpenImages(politica, 0)}
        className={cn(
          'group relative shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-1 shadow-sm transition-all hover:border-marca-primario/30 active:scale-95',
          mediaSize
        )}
        title="Ver imagenes"
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-50">
          <img
            src={images[0].preview || images[0].url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {images.length > 1 && (
          <span className="absolute right-2 top-2 rounded-lg bg-slate-900/80 px-2 py-1 text-[9px] font-black text-white shadow-sm">
            {images.length}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
          <Icon name="zoom_in" size="22px" className="text-white drop-shadow-md" />
        </span>
      </button>
    );
  }

  // Sin foto, mostrar placeholder simple (el usuario indicó "si no tiene foto no le pongas el icono de la linea no es necesario", así que mostramos algo genérico y sutil)
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 shadow-inner', mediaSize)}>
      <Icon name="gavel" size="32px" className="text-slate-300" />
    </div>
  );
};

const LineBadge = ({ politica, compact = false }) => {
  const lineInfo = getLineInfo(politica);
  return (
    <div className={cn('flex items-center gap-1.5', compact ? 'justify-center' : '')}>
      {lineInfo.isMarketing ? (
        <MarketingIcon size={compact ? 28 : 16} style={{ color: lineInfo.color }} />
      ) : (
        <LineIconSelector type={lineInfo.value} size={compact ? 32 : 18} style={{ color: lineInfo.color }} />
      )}
      <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: lineInfo.color }}>
        {lineInfo.label}
      </span>
    </div>
  );
};

const PoliticaCard = ({ politica, onDelete, onEdit, onOpenImages }) => {
  return (
    <article className="group relative flex min-h-full overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:bg-slate-50/30 hover:shadow-md">
      <div className="flex w-full shrink-0 items-center justify-center border-r border-slate-100/70 bg-slate-50/50 p-2 sm:w-[125px] sm:p-3">
        <PoliticaMedia politica={politica} onOpenImages={onOpenImages} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="shrink-0 text-[8px] font-bold uppercase tracking-tighter text-slate-400">
            {politica.createdAt ? formatRelative(politica.createdAt) : ''}
          </span>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap break-words px-0.5 text-[13px] font-semibold leading-relaxed text-slate-800 flex-1">
          {politica.descripcion || 'Sin descripción'}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <LineBadge politica={politica} />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => onEdit(politica)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 opacity-100 shadow-xs transition-all hover:bg-slate-900 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
              title="Editar política"
            >
              <Icon name="edit" size="14px" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(politica.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-400 opacity-100 shadow-xs transition-all hover:bg-rose-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
              title="Eliminar política"
            >
              <Icon name="delete" size="14px" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const ModalEditarPolitica = ({ isOpen, onClose, policy, onSave, submitting, lineasDisponibles }) => {
  const [descripcion, setDescripcion] = useState('');
  const [linea, setLinea] = useState('');

  useEffect(() => {
    if (policy) {
      setDescripcion(policy.descripcion || '');
      setLinea(policy.linea || 'CALZADO');
    }
  }, [policy, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descripcion.trim()) return;
    onSave(policy.id, { descripcion, linea });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="Editar Política" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-desc">Descripción *</Label>
              <textarea
                id="p-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-marca-primario/5 resize-none"
                placeholder="Escribe la política..."
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-linea">Línea *</Label>
              <Select id="p-linea" value={linea} onChange={(e) => setLinea(e.target.value)}>
                {lineasDisponibles.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="cancelar" type="button" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button variant="guardar" icon="save" type="submit" isLoading={submitting}>Guardar Cambios</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default function PoliticasPage() {
  const { user } = useAuthStore();
  const currentUser = user?.data ?? user;
  const isAdmin = currentUser?.rol === 'ADMIN' || currentUser?.rol === 'SUPER_ADMIN';

  const { departamentoGlobal, setDepartamentoGlobal } = useUIStore();
  const { getLineasPorDepartamento, fetchCatalogos } = useCatalogosStore();

  const [politicas, setPoliticas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('politicas-view') || 'cards');
  const [viewer, setViewer] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { deleteTarea, updateTarea } = useTareas();

  const activeDept = isAdmin ? (departamentoGlobal === 'DISEÑO' ? 'DISENO' : 'MARKETING') : (currentUser?.departamento || 'DISENO');

  const lineasDisponibles = useMemo(() => getLineasPorDepartamento(activeDept), [getLineasPorDepartamento, activeDept]);

  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  const loadPoliticas = useCallback(async (nextPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = {
        tipo: 'POLITICA',
        todo: true,
        departamento: activeDept,
        page: nextPage,
        limit: PAGE_SIZE,
      };
      const response = await api.get('/api/tareas', { params });
      const payload = getTareasPayload(response);
      let list = [];
      if (Array.isArray(payload?.tareas)) {
        list = payload.tareas;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response)) {
        list = response;
      }

      setPoliticas(prev => append ? [...prev, ...list] : list);
      setPagination({
        page: payload?.page ?? nextPage,
        totalPages: payload?.totalPages ?? 1,
        total: payload?.total ?? list.length,
      });
    } catch (error) {
      console.error(error);
      notify.error('Error al cargar las políticas.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeDept]);

  useEffect(() => {
    loadPoliticas(1, false);
  }, [loadPoliticas]);

  const handleLoadMore = () => {
    if (loading || loadingMore || pagination.page >= pagination.totalPages) return;
    loadPoliticas(pagination.page + 1, true);
  };

  const handleDeletePolicy = async (id) => {
    try {
      await deleteTarea(id);
      notify.success('Política eliminada correctamente.');
      await loadPoliticas();
      window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
    } catch {
      notify.error('Error al eliminar la política.');
    }
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setIsEditModalOpen(true);
  };

  const handleSavePolicy = async (id, updatedFields) => {
    try {
      await updateTarea(id, updatedFields);
      notify.success('Política actualizada correctamente.');
      setIsEditModalOpen(false);
      await loadPoliticas();
      window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
    } catch {
      notify.error('Error al actualizar la política.');
    }
  };

  const openImages = (politica, index = 0) => {
    if (!politica.imagenes?.length) return;
    setViewer({ images: politica.imagenes, index });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-3 animate-in fade-in sm:p-5 md:p-6 md:gap-5 max-w-full mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-tighter">
            Políticas y Lineamientos
          </h1>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {activeDept === 'MARKETING' ? 'Marketing' : 'Diseño'} • {pagination.total || politicas.length} registradas
          </p>
        </div>

        {/* Switcher de Departamento centralizado (exacto a tareas) */}
        {isAdmin && (
            <div className="flex-shrink-0 flex justify-center py-1 animate-in fade-in duration-300">
                <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/50 shadow-inner max-w-xs backdrop-blur-md">
                    {['DISEÑO', 'MARKETING'].map(opt => {
                        const isActive = departamentoGlobal === opt;
                        return (
                            <button
                                key={opt}
                                onClick={() => setDepartamentoGlobal(opt)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                                    isActive 
                                        ? "bg-white text-marca-primario shadow-sm ring-1 ring-slate-200/50 font-black" 
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                                )}
                            >
                                {opt === 'DISEÑO' && <DisenoIcon size={14} />}
                                {opt === 'MARKETING' && <MarketingIcon size={14} />}
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="rounded-2xl bg-slate-900 px-4 py-2 text-white shadow-lg hidden sm:block">
            <div className="text-xl font-black leading-none text-center">{pagination.total || politicas.length}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-white/50">Políticas</div>
          </div>
          <GlassViewToggle
            value={viewMode}
            onChange={(m) => { setViewMode(m); localStorage.setItem('politicas-view', m); }}
            options={[
              { id: 'cards', label: 'Tarjetas', icon: 'grid_view' },
              { id: 'table', label: 'Tabla', icon: 'table_rows' },
            ]}
          />
        </div>
      </div>

      {/* Grid de Políticas */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Icon name="progress_activity" size="32px" className="animate-spin text-slate-300" />
        </div>
      ) : politicas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white/50 py-16 text-slate-400">
          <Icon name="gavel" size="48px" className="opacity-20" />
          <p className="font-semibold">No hay políticas registradas.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {politicas.map((p) => (
            <PoliticaCard key={p.id} politica={p} onDelete={setDeleteTarget} onEdit={handleEditPolicy} onOpenImages={openImages} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Table 
            columns={[
              {
                header: 'Adjuntos',
                accessorKey: 'imagenes',
                align: 'center',
                headerClassName: 'w-[10%] min-w-[130px]',
                cell: (row) => (row.imagenes?.length > 0) ? (
                  <PoliticaMedia politica={row} size="table" onOpenImages={openImages} />
                ) : (
                  <span className="text-slate-300">-</span>
                ),
              },
              {
                header: 'Política',
                accessorKey: 'descripcion',
                cell: (row) => (
                  <p className="line-clamp-3 text-[13px] font-semibold leading-relaxed text-slate-800" title={row.descripcion}>
                    {row.descripcion}
                  </p>
                )
              },
              {
                header: 'Línea',
                accessorKey: 'linea',
                align: 'center',
                headerClassName: 'w-[10%] min-w-[110px]',
                cell: (row) => <LineBadge politica={row} compact />,
              },
              {
                header: 'Acciones',
                accessorKey: 'acciones',
                align: 'center',
                headerClassName: 'w-[12%] min-w-[110px]',
                cell: (row) => (
                  <TableActions 
                    row={row} 
                    actions={[
                      { key: 'editar', enabled: true, onClick: (r) => handleEditPolicy(r) },
                      { key: 'borrar', enabled: true, onClick: (r) => setDeleteTarget(r.id), tooltip: 'Eliminar' }
                    ]} 
                  />
                ),
              }
            ]} 
            data={politicas} 
            keyField="id" 
          />
        </div>
      )}

      {!loading && politicas.length > 0 && pagination.page < pagination.totalPages && (
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            icon="expand_more"
            onClick={handleLoadMore}
            isLoading={loadingMore}
            className="w-full max-w-sm justify-center rounded-2xl py-3 text-[11px] font-black uppercase tracking-widest md:w-auto md:px-8"
          >
            Cargar más
          </Button>
        </div>
      )}

      {viewer && <ImageViewer images={viewer.images} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
      {isEditModalOpen && <ModalEditarPolitica isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} policy={editingPolicy} onSave={handleSavePolicy} lineasDisponibles={lineasDisponibles} submitting={false} />}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await handleDeletePolicy(deleteTarget);
            setDeleteTarget(null);
          }}
          title="Eliminar Política"
          message="¿Estás seguro de que deseas eliminar esta política? Esta acción la removerá permanentemente."
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
    </div>
  );
}
