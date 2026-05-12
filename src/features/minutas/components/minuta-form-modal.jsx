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
        } else {
            setTitulo('');
            setLineaDefault('CALZADO');
        }
    }, [isOpen, esEdicion, minutaAEditar]);

    const getFormErrors = () => {
        const e = {};
        if (!titulo.trim()) e.titulo = 'El título es obligatorio.';
        if (titulo.length < 3) e.titulo = 'Debe tener al menos 3 caracteres.';
        if (!lineaDefault) e.lineaDefault = 'Selecciona una línea por defecto.';
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
