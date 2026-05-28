// src/features/recordatorios/pages/recordatorios-page.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { useCatalogosStore } from '@/stores/catalogos-store';
import { useTareas } from '@/features/tareas/hooks/use-tareas';
import { notify } from '@/components/notification/adaptive-notify';
import { GlassViewToggle, Icon, Skeleton, Table, Tooltip } from '@/components/ui/z_index';
import { CLASIFICACION_MAP, LINEA_MAP, formatRelative } from '@/features/minutas/constants';
import { LineIconSelector, MarketingIcon, DisenoIcon } from '@/features/minutas/components/icons/line-icons';
import { useUIStore } from '@/stores/ui-store';
import { ImageViewer } from '@/features/minutas/components/timeline/entry-card';
import { cn } from '@/utils/cn';

const SCOPE_MODES = [
  { id: 'global', label: 'Global', icon: 'groups' },
  { id: 'mine', label: 'Tuyas', icon: 'person_pin' },
];

const DEPARTAMENTO_OPTIONS = [
  { value: 'DISENO', label: 'DISEÑO', icon: 'draw' },
  { value: 'MARKETING', label: 'MARKETING', icon: 'campaign' },
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
  const lineInfo = getLineInfo(recordatorio);
  const mediaSize = size === 'table' ? 'h-28 w-28 min-w-[7rem]' : 'h-24 w-24 sm:h-28 sm:w-28';

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
    <div className={cn('flex shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 shadow-inner', mediaSize)}>
      <div
        className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border shadow-sm sm:h-20 sm:w-20"
        style={{ backgroundColor: `${lineInfo.color}0f`, borderColor: `${lineInfo.color}25` }}
      >
        {lineInfo.isMarketing ? (
          <MarketingIcon size={36} style={{ color: lineInfo.color }} />
        ) : (
          <LineIconSelector type={lineInfo.value} size={50} style={{ color: lineInfo.color }} />
        )}
      </div>
      <span className="max-w-[90px] truncate text-center font-mono text-[7px] font-black uppercase tracking-widest" style={{ color: lineInfo.color }}>
        {lineInfo.label}
      </span>
    </div>
  );
};

const LineBadge = ({ recordatorio, compact = false }) => {
  const lineInfo = getLineInfo(recordatorio);
  return (
    <div className={cn('flex items-center gap-2', compact ? 'justify-center' : '')}>
      {lineInfo.isMarketing ? (
        <MarketingIcon size={compact ? 34 : 18} style={{ color: lineInfo.color }} />
      ) : (
        <LineIconSelector type={lineInfo.value} size={compact ? 44 : 22} style={{ color: lineInfo.color }} />
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
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
        <Icon name="groups" size="13px" />
        Departamento
      </span>
    );
  }

  return (
    <Tooltip text={asignaciones.map((a) => a.usuario?.nombre).filter(Boolean).join('\n')} position="top" className="whitespace-pre-line text-left">
      <div className={cn('flex -space-x-3', compact ? 'justify-center py-1' : '')}>
        {asignaciones.slice(0, 5).map((asig) => (
          <div
            key={asig.id}
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200"
          >
            {asig.usuario?.imagen ? (
              <img src={asig.usuario.imagen} alt={asig.usuario.nombre || ''} className="h-full w-full object-cover" />
            ) : (
              asig.usuario?.nombre?.charAt(0) || '?'
            )}
          </div>
        ))}
        {asignaciones.length > 5 && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-black text-white shadow-sm">
            +{asignaciones.length - 5}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

const RecordatorioCard = ({ recordatorio, onDelete, onOpenImages }) => {
  const clasif = CLASIFICACION_MAP[recordatorio.clasificacion];
  const notes = recordatorio.notas || [];
  const scopeLabel = recordatorio.alcanceRecordatorio === 'PERSONAL' ? 'Personal' : 'Global';

  return (
    <article className="group relative flex min-h-full flow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:bg-slate-50/30 hover:shadow-md">
      <div className="flex w-full shrink-0 items-center justify-center border-r border-slate-100/70 bg-slate-50/50 p-2 sm:w-[135px] sm:p-3">
        <RecordatorioMedia recordatorio={recordatorio} onOpenImages={onOpenImages} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-indigo-700">
              <Icon name={recordatorio.alcanceRecordatorio === 'PERSONAL' ? 'person_pin' : 'groups'} size="10px" />
              {scopeLabel}
            </span>
            {clasif && (
              <span
                className="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest"
                style={{ backgroundColor: `${clasif.color}08`, borderColor: `${clasif.color}20`, color: clasif.color }}
              >
                <Icon name={clasif.icon} size="10px" />
                {clasif.label}
              </span>
            )}
          </div>
          <span className="shrink-0 text-[8px] font-bold uppercase tracking-tighter text-slate-400">
            {recordatorio.createdAt ? formatRelative(recordatorio.createdAt) : ''}
          </span>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap break-words px-0.5 text-[13px] font-semibold leading-relaxed text-slate-800">
          {recordatorio.descripcion || 'Sin descripcion'}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <LineBadge recordatorio={recordatorio} />
            <Responsables asignaciones={recordatorio.asignaciones} />
            {notes.length > 0 && (
              <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 text-[10px] font-black text-amber-700">
                <Icon name="sticky_note_2" size="14px" />
                {notes.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {recordatorio.minuta && (
              <span className="hidden max-w-[190px] truncate text-[9px] font-bold italic text-slate-400 sm:block" title={recordatorio.minuta.titulo}>
                {recordatorio.minuta.titulo}
              </span>
            )}
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

const RecordatoriosTable = ({ recordatorios, onDelete, onOpenImages }) => {
  const columns = [
    {
      header: 'Adjuntos',
      accessorKey: 'imagenes',
      align: 'center',
      headerClassName: 'w-[10%] min-w-[150px]',
      cell: (row) => <RecordatorioMedia recordatorio={row} size="table" onOpenImages={onOpenImages} />,
    },
    {
      header: 'Recordatorio',
      accessorKey: 'descripcion',
      headerClassName: 'w-[35%] min-w-[240px]',
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
            {row.descripcion || 'Sin descripcion'}
          </span>
          {row.notas?.length > 0 && (
            <span className="line-clamp-1 text-[11px] font-medium italic text-amber-700">
              Nota: {row.notas[0].contenido}
            </span>
          )}
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
      cell: (row) => (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <LineBadge recordatorio={row} compact />
        </div>
      ),
    },
    {
      header: 'Origen',
      accessorKey: 'minuta',
      headerClassName: 'w-[18%] min-w-[180px]',
      cell: (row) => row.minuta ? (
        <div className="max-w-[220px]">
          <p className="truncate text-xs font-bold text-slate-700">{row.minuta.titulo}</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{row.minuta.estado}</p>
        </div>
      ) : (
        <span className="text-[11px] text-slate-300">Directo</span>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: 'acciones',
      align: 'center',
      headerClassName: 'w-[10%] min-w-[90px]',
      cell: (row) => (
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-400 shadow-sm transition-all hover:bg-rose-500 hover:text-white"
          title="Descartar"
        >
          <Icon name="delete" size="16px" />
        </button>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <Table columns={columns} data={recordatorios} keyField="id" loading={false} emptyMessage="No hay recordatorios registrados." />
    </div>
  );
};

const RecordatoriosPage = () => {
  const { user } = useAuthStore();
  const currentUser = user?.data ?? user;
  const userDepto = currentUser?.departamento;
  const isAdmin = currentUser?.rol === 'ADMIN';

  const { fetchCatalogos, getLineasPorDepartamento } = useCatalogosStore();
  const { deleteTarea } = useTareas();

  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scopeMode, setScopeMode] = useState('global');
  
  // Consumir departamento global desde el UI store
  const { departamentoGlobal, setDepartamentoGlobal } = useUIStore();
  const selectedDepartamento = departamentoGlobal === 'DISEÑO' ? 'DISENO' : 'MARKETING';
  
  const [selectedLinea, setSelectedLinea] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('recordatorios-view') || 'cards');
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  useEffect(() => {
    if (isAdmin) return;
    const targetDept = userDepto === 'MARKETING' ? 'MARKETING' : 'DISEÑO';
    if (departamentoGlobal !== targetDept) {
      setDepartamentoGlobal(targetDept);
    }
  }, [isAdmin, userDepto, departamentoGlobal, setDepartamentoGlobal]);

  const lineasDisponibles = useMemo(() => {
    if (selectedDepartamento === 'MARKETING') return [];
    return getLineasPorDepartamento(selectedDepartamento);
  }, [getLineasPorDepartamento, selectedDepartamento]);

  const handleDepartamentoChange = (dept) => {
    setDepartamentoGlobal(dept === 'DISENO' ? 'DISEÑO' : 'MARKETING');
    setSelectedLinea('');
  };

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
    if (!window.confirm('Deseas descartar este recordatorio?')) return;
    try {
      await deleteTarea(id);
      notify.success('Recordatorio descartado correctamente.');
      await loadRecordatorios();
      window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
    } catch {
      notify.error('Error al descartar el recordatorio.');
    }
  };

  const openImages = (recordatorio, index = 0) => {
    if (!recordatorio.imagenes?.length) return;
    setViewer({ images: recordatorio.imagenes, index });
  };

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-5 p-2 md:p-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="fuente-titulos text-3xl font-black tracking-tight text-slate-900">
            Recordatorios
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Tareas de tipo recordatorio {scopeMode === 'mine' ? 'asignadas a ti' : 'globales del departamento'}.
          </p>
        </div>

        {/* Centralized Department Switcher for ADMIN */}
        {isAdmin && (
          <div className="flex-shrink-0 flex justify-center py-1 animate-in fade-in duration-300">
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/50 shadow-inner max-w-xs backdrop-blur-md">
              {['DISEÑO', 'MARKETING'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleDepartamentoChange(opt === 'DISEÑO' ? 'DISENO' : 'MARKETING')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    departamentoGlobal === opt 
                      ? 'bg-white text-marca-primario shadow-sm ring-1 ring-slate-200/50 font-bold' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  {opt === 'DISEÑO' && <DisenoIcon size={14} />}
                  {opt === 'MARKETING' && <MarketingIcon size={14} />}
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="rounded-2xl bg-slate-900 px-4 py-2 text-white shadow-lg">
            <div className="text-xl font-black leading-none">{recordatorios.length}</div>
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
                  'flex h-9 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all md:flex-none',
                  scopeMode === option.id
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-700'
                )}
              >
                <Icon name={option.icon} size="16px" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {selectedDepartamento === 'MARKETING' ? (
          <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:w-auto">
            <MarketingIcon size={22} style={{ color: '#8b5cf6' }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">Marketing</span>
          </div>
        ) : (
          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <LineIconSelector
                type={selectedLinea || 'DISENO'}
                size={26}
                style={{ color: selectedLinea ? LINEA_MAP[selectedLinea]?.color || '#64748b' : '#94a3b8' }}
              />
            </div>
            <select
              value={selectedLinea}
              onChange={(event) => setSelectedLinea(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition-all focus:border-marca-primario/30 focus:ring-4 focus:ring-marca-primario/10 md:w-56"
            >
              <option value="">Todas las líneas</option>
              {lineasDisponibles.map((linea) => (
                <option key={linea.value} value={linea.value}>
                  {linea.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-[1.5rem] bg-white" />
            ))}
          </div>
        ) : (
          <Skeleton className="h-96 rounded-3xl bg-white" />
        )
      ) : recordatorios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
          <Icon name="notification_important" size="64px" className="mb-4 text-slate-200" />
          <h3 className="text-lg font-black text-slate-800">Sin recordatorios</h3>
          <p className="mt-1 max-w-sm text-sm font-medium text-slate-400">
            No hay tareas de tipo recordatorio para esta vista.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {recordatorios.map((recordatorio) => (
            <RecordatorioCard
              key={recordatorio.id}
              recordatorio={recordatorio}
              onDelete={handleDeleteReminder}
              onOpenImages={openImages}
            />
          ))}
        </div>
      ) : (
        <RecordatoriosTable recordatorios={recordatorios} onDelete={handleDeleteReminder} onOpenImages={openImages} />
      )}

      {viewer && (
        <ImageViewer
          images={viewer.images}
          initialIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
};

export default RecordatoriosPage;
