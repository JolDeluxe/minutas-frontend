// src/features/usuarios/components/users-table.jsx
import { useState } from "react";
import { Table } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { notify } from "@/components/notification/adaptive-notify";
import { UserStatusBadge } from "./user-status-badge";
import { UserFormModal } from "./user-form-modal";
import { UserStatusModal } from "./user-status-modal";
import { UserDetailModal } from "./user-detail-modal";
import { UserActions } from "./user-actions";
import { updateUserStatus } from "../api/users-api";
import { cn } from "@/utils/cn";
import { LineIconSelector, MarketingIcon } from "../../minutas/components/icons/line-icons";
import { LINEA_MAP } from "../../minutas/constants";

const DEPARTAMENTO_LABEL = {
  DISENO: 'Diseño',
  MARKETING: 'Marketing',
};

const ROL_LABEL = {
  GERENCIA: 'Gerencia',
  JEFE: 'Jefatura',
  COORDINADOR: 'Coordinador',
};

export const UsersTable = ({
  usuarios,
  loading,
  onRecargar,
  currentUser,
  page,
  totalPages,
  totalItems,
  // limit = 20,
  onPageChange,
  sortConfig,
  onSortChange,
  onSave,
  submitting,
  hidePagination = false,
}) => {
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalDetalle, setOpenModalDetalle] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioAConfirmar, setUsuarioAConfirmar] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmarEstatus = async () => {
    if (!usuarioAConfirmar) return;
    setIsConfirming(true);

    const currentStatus = usuarioAConfirmar.estado || usuarioAConfirmar.estatus;
    const nuevoEstatus = currentStatus === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    try {
      await updateUserStatus(usuarioAConfirmar.id, nuevoEstatus);
      notify.success("Estatus actualizado exitosamente.");
      onRecargar?.();
      setOpenModalConfirm(false);
    } catch (error) {
      notify.error(error.response?.data?.error || "Error al procesar la solicitud.");
    } finally {
      setIsConfirming(false);
    }
  };

  const columns = [
    {
      header: "Perfil",
      accessorKey: "imagen",
      sortable: false,
      align: "center",
      headerClassName: "w-[5%] min-w-[60px]",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-10 w-10 rounded-full mx-auto" />;
        if (!row.imagen) {
          return (
            <div className="w-10 h-10 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario font-bold border border-marca-primario/20 shadow-sm mx-auto">
              {row.nombre?.charAt(0).toUpperCase() ?? "?"}
            </div>
          );
        }
        return (
          <img
            src={row.imagen}
            alt={`Avatar de ${row.nombre}`}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm mx-auto"
          />
        );
      },
    },
    {
      header: "Usuario",
      accessorKey: "nombre",
      sortable: true,
      headerClassName: "w-[28%] min-w-[180px]",
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex flex-col gap-2 py-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        );
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{row.nombre}</span>
            <span className="font-mono text-slate-500 text-xs">{row.username}</span>
          </div>
        );
      },
    },
    {
      header: "Departamento",
      accessorKey: "departamento",
      sortable: true,
      headerClassName: "w-[18%] min-w-[130px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-4 w-full max-w-30" />;
        return (
          <span className="text-sm font-medium text-slate-700">
            {DEPARTAMENTO_LABEL[row.departamento] || row.departamento || <span className="text-slate-400 italic">Global (Sin departamento)</span>}
          </span>
        );
      },
    },
    {
      header: "Líneas a Cargo",
      accessorKey: "linea",
      sortable: true,
      headerClassName: "w-[15%] min-w-[150px]",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-4 w-24" />;
        
        const isMarketing = row.departamento === 'MARKETING';
        
        if (row.rol === 'ADMIN') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 text-[9px] font-black uppercase tracking-widest text-white shadow-sm border border-slate-700">
                    <Icon name="public" size="14px" />
                    Acceso Total
                </span>
            );
        }

        if (row.rol === 'GERENCIA') {
            return (
                <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    isMarketing ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                    <Icon name="domain_verification" size="14px" />
                    Todo {isMarketing ? 'Marketing' : 'Diseño'}
                </span>
            );
        }

        if (!row.linea) return <span className="text-slate-300 font-medium italic text-xs pl-2">—</span>;

        return (
          <div className="flex flex-wrap gap-1.5">
            {row.linea.split(',').map((lKey, i) => {
               const lInfo = isMarketing 
                 ? { label: 'Marketing', color: '#7c3aed' } 
                 : (LINEA_MAP[lKey] || { label: lKey, color: '#64748b' });
               
               return (
                  <div 
                    key={i} 
                    className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all group/line"
                    title={lInfo.label}
                  >
                    <div className="bg-slate-50 p-0.5 rounded-full flex items-center justify-center shrink-0">
                        {isMarketing ? (
                            <MarketingIcon size={16} style={{ color: lInfo.color }} />
                        ) : (
                            <LineIconSelector type={lKey} size={18} style={{ color: lInfo.color }} />
                        )}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-600">
                        {lInfo.label}
                    </span>
                  </div>
               );
            })}
          </div>
        );
      },
    },
    {
      header: "Rol",
      accessorKey: "rol",
      sortable: true,
      align: "center",
      headerClassName: "w-[15%] min-w-[120px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-6 w-24 mx-auto rounded-md" />;
        return (
          <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 uppercase tracking-wide whitespace-nowrap">
            {ROL_LABEL[row.rol] || row.rol}
          </span>
        );
      },
    },
    {
      header: "Estatus",
      accessorKey: "estado",
      sortable: false,
      align: "center",
      headerClassName: "w-[12%] min-w-[100px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return <Skeleton className="h-6 w-20 mx-auto rounded-full" />;
        return <UserStatusBadge estado={row.estado} estatus={row.estatus} />;
      },
    },
    {
      header: "Acciones",
      accessorKey: "acciones",
      align: "center",
      headerClassName: "w-[16%] min-w-[130px] whitespace-nowrap",
      cell: (row) => {
        if (row.isSkeleton) return (
          <div className="flex gap-2 justify-center">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        );
        return (
          <UserActions
            usuario={row}
            currentUser={currentUser}
            onViewDetail={(r) => { setUsuarioSeleccionado(r); setOpenModalDetalle(true); }}
            onEdit={(r) => { setUsuarioSeleccionado(r); setOpenModalEditar(true); }}
            onToggleStatus={(r) => { setUsuarioAConfirmar(r); setOpenModalConfirm(true); }}
          />
        );
      },
    },
  ];

  const tableData = loading
    ? Array.from({ length: 10 }).map((_, i) => ({ isSkeleton: true, id: `skel-${i}` }))
    : usuarios;

  return (
    <div className="w-full">
      <Table
        columns={columns}
        data={tableData}
        keyField="id"
        loading={false}
        emptyMessage="No hay usuarios que coincidan con los filtros."
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
        sortConfig={sortConfig}
        hidePagination={hidePagination}
        onSortChange={(key) => {
          const direction =
            sortConfig?.key === key && sortConfig?.direction === "asc" ? "desc" : "asc";
          onSortChange(key, direction);
        }}
      />

      <UserFormModal
        isOpen={openModalEditar}
        onClose={() => { setOpenModalEditar(false); setUsuarioSeleccionado(null); }}
        usuarioAEditar={usuarioSeleccionado}
        currentUser={currentUser}
        submitting={submitting}
        onSuccess={async (payload) => {
          if (usuarioSeleccionado) {
            await onSave(usuarioSeleccionado.id, payload);
            setOpenModalEditar(false);
            setUsuarioSeleccionado(null);
          }
        }}
      />

      <UserStatusModal
        isOpen={openModalConfirm}
        onClose={() => { setOpenModalConfirm(false); setUsuarioAConfirmar(null); }}
        onConfirm={handleConfirmarEstatus}
        usuario={usuarioAConfirmar}
        isSubmitting={isConfirming}
      />

      <UserDetailModal
        isOpen={openModalDetalle}
        onClose={() => { setOpenModalDetalle(false); setUsuarioSeleccionado(null); }}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
};