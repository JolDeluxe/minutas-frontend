// src/features/politicas/pages/politicas-page.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { useCatalogosStore } from '@/stores/catalogos-store';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { notify } from '@/components/notification/adaptive-notify';
import { GlassViewToggle, Icon, Table, Modal, ModalHeader, ModalBody, ModalFooter, Button, TableActions, ConfirmModal, Tooltip } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { formatRelative, AREA_MAP, getCatalogos } from '@/features/minutas/constants';
import { formatFecha } from '@/lib/date';
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

const PoliticaMedia = ({ politica, size = 'card', onOpenImages }) => {
  const images = politica.imagenes || [];
  const mediaSize = size === 'table' ? 'h-28 w-28 min-w-[7rem]' : 'h-24 w-24 min-[360px]:h-28 min-[360px]:w-28';

  if (images.length > 0) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpenImages(politica, 0); }}
        className={cn(
          'group relative shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-1 shadow-sm transition-all hover:border-marca-primario/30 active:scale-95',
          mediaSize
        )}
        title="Ver imágenes"
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

  return null;
};

const AreaBadge = ({ politica, compact = false }) => {
  const label = AREA_MAP[politica.area] || politica.area || 'General';
  // El diseño de TareaCard para áreas externas: bg-marca-primario/10 text-marca-primario border-marca-primario/20 con icon "output"
  // Pero aquí usamos LineIconSelector para los iconos ya definidos
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 transition-all shadow-xs',
      compact ? 'border-slate-100 bg-slate-50/50' : 'bg-white border-slate-200 text-slate-700'
    )}>
      <div className="shrink-0 scale-90 opacity-70">
        <LineIconSelector type={politica.area} size={16} />
      </div>
      <span className="text-[9px] min-[360px]:text-[10px] font-black uppercase tracking-tight leading-none whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

const MinutaBadge = ({ minuta, compact = false }) => {
  if (!minuta) return null;
  // Diseño exacto de TareaCard/entry-table: Icon description 10px, text-slate-400 font-bold, wrap sin clamp
  return (
    <div className="flex items-center gap-1.5 mt-1 flex-wrap" title={minuta.titulo}>
        <Icon name="description" size="10px" className="text-slate-300 shrink-0" />
        <span className="text-[10px] text-slate-400 font-bold break-words whitespace-normal leading-tight max-w-[320px]">
            {minuta.titulo || `Minuta #${minuta.id}`}
        </span>
    </div>
  );
};

const PoliticaCard = ({ politica, onDelete, onEdit, onOpenImages, currentUser }) => {
  const hasImages = (politica.imagenes || []).length > 0;

  return (
    <article className={cn(
      "group relative flex flex-col min-h-full overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300/50",
      hasImages ? "sm:flex-row" : ""
    )}>
      {hasImages && (
        <div className="flex shrink-0 items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50 p-3 sm:w-[135px]">
          <PoliticaMedia politica={politica} onOpenImages={onOpenImages} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col p-4 min-[360px]:p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none">
              {politica.createdAt ? formatRelative(politica.createdAt) : ''}
            </span>
            <span className="text-[8px] font-bold font-mono text-slate-300 uppercase leading-none mt-1">
              {politica.createdAt ? formatFecha(politica.createdAt) : ''}
            </span>
          </div>
          <AreaBadge politica={politica} />
        </div>

        <div className="flex-1 min-h-0">
          <p className="whitespace-pre-wrap break-words text-[13px] min-[360px]:text-[14px] font-semibold leading-relaxed text-slate-800">
            {politica.descripcion || 'Sin descripción'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-3">
          {politica.minuta ? (
            <MinutaBadge minuta={politica.minuta} />
          ) : (
            <div className="flex items-center gap-1.5 opacity-30">
               <Icon name="link_off" size="10px" className="text-slate-400" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sin Minuta de Origen</span>
            </div>
          )}

          <div className="flex items-center justify-end scale-90 sm:scale-100 origin-right transition-transform" onClick={e => e.stopPropagation()}>
             <TableActions 
                row={politica} 
                actions={[
                  { key: 'editar', enabled: true, onClick: (r) => onEdit(r) },
                  { key: 'borrar', enabled: true, onClick: (r) => onDelete(r.id), tooltip: 'Eliminar política' }
                ]} 
             />
          </div>
        </div>
      </div>
    </article>
  );
};

const ModalEditarPolitica = ({ isOpen, onClose, policy, onSave, submitting, lineasDisponibles, areasDisponibles }) => {
  const [descripcion, setDescripcion] = useState('');
  const [linea, setLinea] = useState('');
  const [area, setArea] = useState('');

  useEffect(() => {
    if (policy) {
      setDescripcion(policy.descripcion || '');
      setLinea(policy.linea || 'CALZADO');
      setArea(policy.area || 'DISENO');
    }
  }, [policy, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descripcion.trim()) return;
    onSave(policy.id, { descripcion, linea, area });
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-area">Área *</Label>
                <Select id="p-area" value={area} onChange={(e) => setArea(e.target.value)}>
                  {areasDisponibles.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </Select>
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
  const areasDisponibles = useMemo(() => getCatalogos(activeDept).areas, [activeDept]);

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

        {/* Switcher de Departamento centralizado */}
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
            <PoliticaCard 
              key={p.id} 
              politica={p} 
              onDelete={setDeleteTarget} 
              onEdit={handleEditPolicy} 
              onOpenImages={openImages}
              currentUser={currentUser}
            />
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
                cell: (row) => (row.imagenes?.filter(img => img.tipo !== 'EVIDENCIA').length > 0) ? (
                  <PoliticaMedia politica={row} size="table" onOpenImages={openImages} />
                ) : (
                  <span className="text-slate-300">-</span>
                ),
              },
              {
                header: 'Política',
                accessorKey: 'descripcion',
                headerClassName: 'w-[45%]',
                cell: (row) => (
                  <p className="whitespace-pre-wrap text-[13px] font-semibold leading-relaxed text-slate-800" title={row.descripcion}>
                    {row.descripcion}
                  </p>
                )
              },
              {
                header: 'Área',
                accessorKey: 'area',
                align: 'center',
                headerClassName: 'w-[12%] min-w-[130px]',
                cell: (row) => <AreaBadge politica={row} compact />,
              },
              {
                header: 'Minuta Origen',
                accessorKey: 'minuta',
                align: 'center',
                headerClassName: 'w-[15%] min-w-[160px]',
                cell: (row) => row.minuta ? <MinutaBadge minuta={row.minuta} compact /> : <span className="text-slate-300 text-[10px] font-black uppercase">Sin Origen</span>,
              },
              {
                header: 'Fecha',
                accessorKey: 'createdAt',
                align: 'center',
                headerClassName: 'w-[10%] min-w-[110px]',
                cell: (row) => (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-700">{formatFecha(row.createdAt)}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{formatRelative(row.createdAt)}</span>
                  </div>
                ),
              },
              {
                header: 'Acciones',
                accessorKey: 'acciones',
                align: 'center',
                headerClassName: 'w-[8%] min-w-[100px]',
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
      {isEditModalOpen && <ModalEditarPolitica isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} policy={editingPolicy} onSave={handleSavePolicy} lineasDisponibles={lineasDisponibles} areasDisponibles={areasDisponibles} submitting={false} />}
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
