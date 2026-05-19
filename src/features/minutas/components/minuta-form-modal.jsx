import { useState, useEffect } from 'react';
import { Input, Label, Select } from '@/components/form/z_index';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';
import { LINEA_MAP } from '../constants';

export const MinutaFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    minutaAEditar,
    submitting,
}) => {
    const esEdicion = Boolean(minutaAEditar);

    const [titulo, setTitulo] = useState('');
    const [lineaDefault, setLineaDefault] = useState('CALZADO');
    const [fechaProgramada, setFechaProgramada] = useState('');
    const [iniciarInmediatamente, setIniciarInmediatamente] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [backendError, setBackendError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setTitulo(minutaAEditar.titulo || '');
            setLineaDefault(minutaAEditar.lineaDefault || 'CALZADO');
            setFechaProgramada(minutaAEditar.fechaProgramada ? new Date(minutaAEditar.fechaProgramada).toISOString().slice(0, 16) : '');
            setIniciarInmediatamente(false);
        } else {
            setTitulo('');
            setLineaDefault('CALZADO');
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setFechaProgramada(now.toISOString().slice(0, 16));
            setIniciarInmediatamente(false);
        }
    }, [isOpen, esEdicion, minutaAEditar]);

    const getFormErrors = () => {
        const e = {};
        if (!titulo.trim()) e.titulo = 'El título es obligatorio.';
        if (titulo.length < 3) e.titulo = 'Debe tener al menos 3 caracteres.';
        if (!lineaDefault) e.lineaDefault = 'Selecciona una línea por defecto.';
        if (!fechaProgramada) e.fechaProgramada = 'La fecha es obligatoria.';
        return e;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');

        const errors = getFormErrors();
        if (Object.keys(errors).length > 0) return;

        const payload = {
            titulo: titulo.trim(),
            lineaDefault,
            fechaProgramada: new Date(fechaProgramada).toISOString(),
            iniciarInmediatamente,
        };

        try {
            await onSuccess(payload);
        } catch (err) {
            const data = err?.response?.data;
            let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
            if (data?.errors && Array.isArray(data.errors)) {
                msg = data.errors[0].message;
            }
            setBackendError(msg);
        }
    };

    const fe = submitted ? getFormErrors() : {};

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalHeader title={esEdicion ? 'Editar Minuta' : 'Nueva Minuta'} onClose={onClose} />

            <ModalBody>
                <div className="space-y-6">
                    {backendError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2">
                            <Icon name="error" /> {backendError}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="m-titulo" error={!!fe.titulo}>Título de la Minuta *</Label>
                        <Input
                            id="m-titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            error={!!fe.titulo}
                            helperText={fe.titulo}
                            placeholder="Ej. Junta semanal de producción..."
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="m-linea" error={!!fe.lineaDefault}>Línea por Defecto *</Label>
                        <Select
                            id="m-linea"
                            value={lineaDefault}
                            onChange={(e) => setLineaDefault(e.target.value)}
                            error={!!fe.lineaDefault}
                            helperText={fe.lineaDefault || "Esta línea se asignará por defecto a las nuevas entradas."}
                        >
                            {Object.entries(LINEA_MAP).map(([value, config]) => (
                                <option key={value} value={value}>{config.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="m-fecha" error={!!fe.fechaProgramada}>Fecha Programada *</Label>
                        <Input
                            id="m-fecha"
                            type="datetime-local"
                            value={fechaProgramada}
                            onChange={(e) => setFechaProgramada(e.target.value)}
                            error={!!fe.fechaProgramada}
                            helperText={fe.fechaProgramada}
                        />
                    </div>

                    {!esEdicion && (
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input 
                                type="checkbox" 
                                id="m-iniciar" 
                                className="w-5 h-5 rounded text-marca-primario focus:ring-marca-primario border-slate-300"
                                checked={iniciarInmediatamente}
                                onChange={(e) => setIniciarInmediatamente(e.target.checked)}
                            />
                            <div className="flex flex-col">
                                <Label htmlFor="m-iniciar" className="mb-0 cursor-pointer text-slate-800">
                                    Iniciar Junta Inmediatamente (Junta Express)
                                </Label>
                                <span className="text-xs text-slate-500">
                                    Pasa directo a la captura. El estado será Activa automáticamente.
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    variant="guardar"
                    icon="save"
                    onClick={handleSubmit}
                    isLoading={submitting}
                >
                    {esEdicion ? 'Guardar Cambios' : 'Crear Minuta'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};
