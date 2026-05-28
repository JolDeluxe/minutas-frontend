// src/features/recordatorios/pages/recordatorios-page.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { useCatalogosStore } from '@/stores/catalogos-store';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { useUsers } from '@/features/usuarios/hooks/use-users';
import { notify } from '@/components/notification/adaptive-notify';
import { GlassViewToggle, Icon, Table, Tooltip, Modal, ModalHeader, ModalBody, ModalFooter, Button, TableActions, ConfirmModal } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';
import { LINEA_MAP, formatRelative } from '@/features/minutas/constants';
import { LineIconSelector, MarketingIcon, DisenoIcon } from '@/features/minutas/components/icons/line-icons';
import { useUIStore } from '@/stores/ui-store';
import { ImageViewer } from '@/features/minutas/components/timeline/entry-card';
import { cn } from '@/utils/cn';

const SCOPE_MODES = [
  { id: 'global', label: 'Global', icon: 'groups' },
  { id: 'mine', label: 'Tuyas', icon: 'person_pin' },
];

const normalizeRecordatoriosResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const getLineInfo = (recordatorio) => {
  const isMarketing =
    recordatorio.departamento === 'MARKETING' ||
    recordatorio.linea === 'MARKETING' ||
    recordatorio.area === 'MARKETING';

  if (isMarketing) {
    return { value: 'MARKETING', label: 'Marketing', color: '#8b5cf6', isMarketing: true };
  }

  const fallback = recordatorio.linea || 'DISENO';
  return {
    value: fallback,
    label: LINEA_MAP[fallback]?.label || fallback || 'General',
    color: LINEA_MAP[fallback]?.color || '#64748b',
    isMarketing: false,
  };
};

const RecordatorioMedia = ({ recordatorio, size = 'card', onOpenImages }) => {
  const images = recordatorio.imagenes || [];
  const mediaSize = size === 'table' ? 'h-24 w-24 min-w-[6rem]' : 'h-24 w-24 sm:h-28 sm:w-28';

  if (images.length > 0) {
    return (
      <button
        type="button"
        onClick={() => onOpenImages(recordatorio, 0)}
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

  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 shadow-inner', mediaSize)}>
      <Icon name="notifications" size="32px" className="text-slate-300" />
    </div>
  );
};

const LineBadge = ({ recordatorio, compact = false }) => {
  const lineInfo = getLineInfo(recordatorio);
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

const Responsables = ({ asignaciones, compact = false }) => {
  if (!asignaciones?.length) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
        <Icon name="groups" size="12px" />
        Equipo
      </span>
    );
  }

  return (
    <Tooltip text={asignaciones.map((a) => a.usuario?.nombre).filter(Boolean).join('\n')} position="top" className="whitespace-pre-line text-left">
      <div className={cn('flex -space-x-2.5', compact ? 'justify-center py-1' : '')}>
        {asignaciones.slice(0, 5).map((asig) => (
          <div
            key={asig.id}
            className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200/50"
          >
            {asig.usuario?.imagen ? (
              <img src={asig.usuario.imagen} alt={asig.usuario.nombre || ''} className="h-full w-full object-cover" />
            ) : (
              asig.usuario?.nombre?.charAt(0) || '?'
            )}
          </div>
        ))}
        {asignaciones.length > 5 && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[8px] font-black text-white shadow-sm">
            +{asignaciones.length - 5}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

const RecordatorioCard = ({ recordatorio, onDelete, onEdit, onOpenImages }) => {
  const scopeLabel = recordatorio.alcanceRecordatorio === 'PERSONAL' ? 'Personal' : 'Global';
  const hasPhoto = (recordatorio.imagenes || []).length > 0;

  return (
    <article className="group relative flex min-h-full overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:bg-slate-50/30 hover:shadow-md">
      <div className="flex w-full shrink-0 items-center justify-center border-r border-slate-100/70 bg-slate-50/50 p-2 sm:w-[125px] sm:p-3">
        <RecordatorioMedia recordatorio={recordatorio} onOpenImages={onOpenImages} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-indigo-700">
            <Icon name={recordatorio.alcanceRecordatorio === 'PERSONAL' ? 'person_pin' : 'groups'} size="10px" />
            {scopeLabel}
          </span>
          <span className="shrink-0 text-[8px] font-bold uppercase tracking-tighter text-slate-400">
            {recordatorio.createdAt ? formatRelative(recordatorio.createdAt) : ''}
          </span>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap break-words px-0.5 text-[13px] font-semibold leading-relaxed text-slate-800 flex-1">
          {recordatorio.descripcion || 'Sin descripción'}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <LineBadge recordatorio={recordatorio} />
            <Responsables asignaciones={recordatorio.asignaciones} />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {recordatorio.minuta && (
              <span className="hidden max-w-[150px] truncate text-[9px] font-bold italic text-slate-400 sm:block mr-2" title={recordatorio.minuta.titulo}>
                {recordatorio.minuta.titulo}
              </span>
            )}
            <button
              type="button"
              onClick={() => onEdit(recordatorio)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 opacity-100 shadow-xs transition-all hover:bg-slate-900 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
              title="Editar recordatorio"
            >
              <Icon name="edit" size="14px" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(recordatorio.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-400 opacity-100 shadow-xs transition-all hover:bg-rose-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
              title="Descartar recordatorio"
            >
              <Icon name="delete" size="14px" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const ModalEditarRecordatorio = ({ isOpen, onClose, reminder, onSave, submitting, lineasDisponibles, users, departamento }) => {
  const [descripcion, setDescripcion] = useState('');
  const [linea, setLinea] = useState('');
  const [responsables, setResponsables] = useState([]);

  useEffect(() => {
    if (reminder) {
      setDescripcion(reminder.descripcion || '');
      setLinea(reminder.linea || 'CALZADO');
      setResponsables(reminder.asignaciones?.map(a => a.usuarioId) || []);
    }
  }, [reminder, isOpen]);

  const toggleResponsable = (userId) => {
    setResponsables(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descripcion.trim()) return;
    onSave(reminder.id, { descripcion, linea, responsables });
  };

  const filteredUsers = users.filter(u => u.estado === 'ACTIVO' && (u.rol === 'ADMIN' || u.departamento === (departamento === 'DISEÑO' ? 'DISENO' : departamento)));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="Editar Recordatorio" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-desc">Descripción *</Label>
              <textarea
                id="r-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-marca-primario/5 resize-none"
                placeholder="Escribe el recordatorio..."
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-linea">Línea *</Label>
              <Select id="r-linea" value={linea} onChange={(e) => setLinea(e.target.value)}>
                {lineasDisponibles.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Responsables Asignados</Label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {filteredUsers.map((u) => {
                  const active = responsables.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleResponsable(u.id)}
                      className={cn(
                        "flex items-center gap-2 p-1.5 pr-3 rounded-full border text-xs font-bold transition-all",
                        active
                          ? "bg-slate-900 border-slate-800 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {u.imagen ? (
                          <img src={u.imagen} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px]">{u.nombre.charAt(0)}</span>
                        )}
                      </div>
                      <span>{u.nombre.split(' ')[0]}</span>
                    </button>
                  );
                })}
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

export default function RecordatoriosPage() {
  const { user } = useAuthStore();
  const currentUser = user?.data ?? user;
  const isAdmin = currentUser?.rol === 'ADMIN' || currentUser?.rol === 'SUPER_ADMIN';

  const { departamentoGlobal, setDepartamentoGlobal } = useUIStore();
  const { getLineasPorDepartamento, fetchCatalogos } = useCatalogosStore();
  const { users, fetchUsers } = useUsers();
  
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('recordatorios-view') || 'cards');
  const [scopeMode, setScopeMode] = useState('global');
  const [selectedLinea, setSelectedLinea] = useState('');
  const [viewer, setViewer] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const { deleteTarea, updateTarea } = useTareas();

  const selectedDepartamento = isAdmin ? (departamentoGlobal === 'DISEÑO' ? 'DISENO' : 'MARKETING') : (currentUser?.departamento || 'DISENO');

  useEffect(() => {
    fetchCatalogos();
    fetchUsers();
  }, [fetchCatalogos, fetchUsers]);

  const lineasDisponibles = useMemo(() => {
    return getLineasPorDepartamento(selectedDepartamento);
  }, [getLineasPorDepartamento, selectedDepartamento]);

  const loadRecordatorios = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      params.departamento = selectedDepartamento;
      if (selectedLinea) params.linea = selectedLinea;

      if (scopeMode === 'mine') {
        params.responsableId = currentUser?.id;
      } else {
        params.alcanceRecordatorio = 'DEPARTAMENTO';
      }

      const response = await api.get('/api/recordatorios', { params });
      setRecordatorios(normalizeRecordatoriosResponse(response));
    } catch (error) {
      console.error(error);
      notify.error('Error al cargar los recordatorios.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, scopeMode, selectedDepartamento, selectedLinea]);

  useEffect(() => {
    if (scopeMode === 'mine' && !currentUser?.id) return;
    loadRecordatorios();
  }, [currentUser?.id, loadRecordatorios, scopeMode]);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('recordatorios-view', mode);
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteTarea(id);
      notify.success('Recordatorio descartado correctamente.');
      await loadRecordatorios();
      window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
    } catch {
      notify.error('Error al descartar el recordatorio.');
    }
  };

  const handleEditReminderClick = (reminder) => {
    setEditingReminder(reminder);
    setIsEditModalOpen(true);
  };

  const handleSaveReminder = async (id, updatedFields) => {
    try {
      await updateTarea(id, updatedFields);
      notify.success('Recordatorio actualizado correctamente.');
      setIsEditModalOpen(false);
      await loadRecordatorios();
      window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
    } catch {
      notify.error('Error al actualizar el recordatorio.');
    }
  };

  const openImages = (recordatorio, index = 0) => {
    if (!recordatorio.imagenes?.length) return;
    setViewer({ images: recordatorio.imagenes, index });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-3 animate-in fade-in sm:p-5 md:p-6 md:gap-5 max-w-[1400px] mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="fuente-titulos text-2xl text-marca-primario uppercase tracking-tighter">
            Recordatorios
          </h1>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {selectedDepartamento === 'MARKETING' ? 'Marketing' : 'Diseño'} • {recordatorios.length} registrados
          </p>
        </div>

        {/* Switcher de Departamento centralizado (exacto a tareas) */}
        {isAdmin && (
            <div className="flex-shrink-0 flex justify-center py-1 animate-in fade-in duration-300">
                <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/50 shadow-inner max-w-xs backdrop-blur-md">
                    {['DISEÑO', 'MARKETING'].map(opt => {
                        const val = opt === 'DISEÑO' ? 'DISENO' : 'MARKETING';
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
            <div className="text-xl font-black leading-none text-center">{recordatorios.length}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-white/50">Recordatorios</div>
          </div>
          <GlassViewToggle
            value={viewMode}
            onChange={handleViewChange}
            options={[
              { id: 'cards', label: 'Tarjetas', icon: 'grid_view' },
              { id: 'table', label: 'Tabla', icon: 'table_rows' },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-slate-50 p-1 md:w-auto">
            {SCOPE_MODES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setScopeMode(option.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all md:flex-none',
                  scopeMode === option.id
                    ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon name={option.icon} size="16px" className={scopeMode === option.id ? 'text-marca-primario' : 'text-slate-400'} />
                {option.label}
              </button>
            ))}
          </div>
          <span className="hidden h-8 w-px bg-slate-200 md:block" />
          <div className="flex items-center gap-2">
            <Icon name="filter_list" size="18px" className="text-slate-400" />
            <select
              value={selectedLinea}
              onChange={(e) => setSelectedLinea(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-marca-primario/50 md:w-48"
            >
              <option value="">Todas las líneas</option>
              {lineasDisponibles.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Icon name="progress_activity" size="32px" className="animate-spin text-slate-300" />
        </div>
      ) : recordatorios.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white/50 py-16 text-slate-400">
          <Icon name="event_note" size="48px" className="opacity-20" />
          <p className="font-semibold">No hay recordatorios {scopeMode === 'mine' ? 'para ti' : 'registrados'}.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recordatorios.map((r) => (
            <RecordatorioCard key={r.id} recordatorio={r} onDelete={setDeleteTarget} onEdit={handleEditReminderClick} onOpenImages={openImages} />
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
                  <RecordatorioMedia recordatorio={row} size="table" onOpenImages={openImages} />
                ) : (
                  <span className="text-slate-300">-</span>
                ),
              },
              {
                header: 'Recordatorio',
                accessorKey: 'descripcion',
                headerClassName: 'w-[40%] min-w-[240px]',
                cell: (row) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{row.id}</span>
                      <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-indigo-700">
                        <Icon name={row.alcanceRecordatorio === 'PERSONAL' ? 'person_pin' : 'groups'} size="10px" />
                        {row.alcanceRecordatorio === 'PERSONAL' ? 'Personal' : 'Global'}
                      </span>
                    </div>
                    <span className="block line-clamp-3 text-[13px] font-semibold leading-relaxed text-slate-800" title={row.descripcion}>
                      {row.descripcion || 'Sin descripción'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Responsables',
                accessorKey: 'asignaciones',
                align: 'center',
                headerClassName: 'w-[12%] min-w-[130px]',
                cell: (row) => <Responsables asignaciones={row.asignaciones} compact />,
              },
              {
                header: 'Línea',
                accessorKey: 'linea',
                align: 'center',
                headerClassName: 'w-[10%] min-w-[110px]',
                cell: (row) => <LineBadge recordatorio={row} compact />,
              },
              {
                header: 'Registro',
                accessorKey: 'createdAt',
                align: 'center',
                headerClassName: 'w-[12%] min-w-[110px]',
                cell: (row) => (
                  <span className="text-[12px] font-semibold text-slate-500">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                  </span>
                ),
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
                      { key: 'editar', enabled: true, onClick: (r) => handleEditReminderClick(r) },
                      { key: 'borrar', enabled: true, onClick: (r) => setDeleteTarget(r.id), tooltip: 'Descartar' }
                    ]} 
                  />
                ),
              },
            ]} 
            data={recordatorios} 
            keyField="id" 
          />
        </div>
      )}

      {viewer && <ImageViewer images={viewer.images} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
      {isEditModalOpen && <ModalEditarRecordatorio isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} reminder={editingReminder} onSave={handleSaveReminder} lineasDisponibles={lineasDisponibles} users={users} departamento={selectedDepartamento} submitting={false} />}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await handleDeleteReminder(deleteTarget);
            setDeleteTarget(null);
          }}
          title="Descartar Recordatorio"
          message="¿Estás seguro de que deseas descartar este recordatorio? Esta acción lo removerá de tu lista."
          confirmText="Descartar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
    </div>
  );
}
