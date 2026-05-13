import { useState } from 'react';
import { Input, Label, Select } from '@/components/form/z_index';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';

import { AREA_MAP, LINEA_MAP } from '../../../minutas/constants';

export const TareaFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    minutaId,
    lineaDefault,
    submitting,
}) => {
    const [descripcion, setDescripcion] = useState('');
    const [area, setArea] = useState('DISENO');
    const [linea, setLinea] = useState(lineaDefault || '');
    const [submitted, setSubmitted] = useState(false);
    const [backendError, setBackendError] = useState('');
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    // Sincronización síncrona para resetear formulario al abrir
    if (isOpen && !prevIsOpen) {
        setSubmitted(false);
        setBackendError('');
        setDescripcion('');
        setArea('DISENO');
        setLinea(lineaDefault || '');
        setPrevIsOpen(true);
    } else if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false);
    }

    const getFormErrors = () => {
        const e = {};
        if (!descripcion.trim()) e.descripcion = 'La descripción es obligatoria.';
        if (descripcion.length < 3) e.descripcion = 'Debe tener al menos 3 caracteres.';
        if (!area) e.area = 'Selecciona un área.';
        return e;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');

        const errors = getFormErrors();
        if (Object.keys(errors).length > 0) return;

        // El backend espera un objeto con { tareas: [{...}] }
        const payload = {
            tareas: [
                {
                    descripcion: descripcion.trim(),
                    area,
                    linea: linea || undefined,
                    minutaId: minutaId ? Number(minutaId) : undefined,
                }
            ]
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
            <ModalHeader title="Nueva Entrada (Tarea)" onClose={onClose} />

            <ModalBody>
                <div className="space-y-6">
                    {backendError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2">
                            <Icon name="error" /> {backendError}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="t-desc" error={!!fe.descripcion}>Descripción *</Label>
                        <Input
                            id="t-desc"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            error={!!fe.descripcion}
                            helperText={fe.descripcion}
                            placeholder="Ej. Revisar diseño de horma..."
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="t-area" error={!!fe.area}>Área *</Label>
                            <Select
                                id="t-area"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                error={!!fe.area}
                                helperText={fe.area}
                            >
                                {Object.entries(AREA_MAP).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="t-linea">Línea (Opcional)</Label>
                            <Select
                                id="t-linea"
                                value={linea}
                                onChange={(e) => setLinea(e.target.value)}
                            >
                                <option value="">Sin línea</option>
                                {Object.entries(LINEA_MAP).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    variant="guardar"
                    icon="add_task"
                    onClick={handleSubmit}
                    isLoading={submitting}
                >
                    Registrar Entrada
                </Button>
            </ModalFooter>
        </Modal>
    );
};
