// src/components/ui/modal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { Icon } from './icon'; 

export const Modal = ({
  isOpen,
  onClose,
  children,
  className = ""
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-2xl relative flex flex-col max-h-[90vh] w-full max-w-2xl animate-in zoom-in-95 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const ModalHeader = ({ title, onClose, className = "" }) => (
  <div className={cn("shrink-0 p-6 pb-4 border-b border-slate-100 relative", className)}>
    <h2 className="text-lg font-bold text-marca-primario text-center uppercase tracking-wider fuente-titulos">
      {title}
    </h2>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-marca-primario transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
      >
        <Icon name="close" size="24px" weight={600} />
      </button>
    )}
  </div>
);

export const ModalBody = ({ children, className = "" }) => (
  <div className={cn("grow overflow-y-auto p-6 font-lectura", className)}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = "" }) => (
  <div className={cn("shrink-0 flex justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50 rounded-b-lg", className)}>
    {children}
  </div>
);

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger", // danger, warning, success, info
  submitting = false
}) => {
  const variantStyles = {
    danger: {
      icon: "warning",
      iconBg: "bg-red-50 text-red-500 border-red-100",
      btnClass: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
    },
    warning: {
      icon: "warning",
      iconBg: "bg-amber-50 text-amber-500 border-amber-100",
      btnClass: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
    },
    success: {
      icon: "verified",
      iconBg: "bg-emerald-50 text-emerald-500 border-emerald-100",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
    },
    info: {
      icon: "info",
      iconBg: "bg-blue-50 text-blue-500 border-blue-100",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md rounded-[2rem] overflow-hidden border border-slate-100">
      <div className="p-6 pb-2 flex gap-4 items-start text-left">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border", currentVariant.iconBg)}>
          <Icon name={currentVariant.icon} size="24px" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wide font-titulos leading-snug mb-1">{title}</h3>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">{message}</p>
        </div>
      </div>
      <ModalFooter className="mt-4">
        <button
          onClick={onClose}
          disabled={submitting}
          className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 outline-none"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          className={cn(
            "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50 outline-none",
            currentVariant.btnClass
          )}
        >
          {submitting && <Icon name="progress_activity" size="14px" className="animate-spin" />}
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};