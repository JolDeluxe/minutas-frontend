import { useState, useEffect } from 'react';
import { Input, Label, Select } from '@/components/form/z_index';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';

// Simplificado para el demo. En un caso real podrías requerir seleccionar usuarios reales.
const PRIORIDAD_MAP = {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    URGENTE: 'Urgente',
};

const ESTADO_MAP = {
    NUEVO: 'Nueva',
    PENDIENTE: 'Pendiente',
    EN_PROGRESO: 'En Progreso',
    COMPLETADO: 'Completada',
    CANCELADO: 'Cancelada',
};

export const TareaOrganizeModal = ({
    isOpen,
    onClose,
    onSuccess,
    tareaAOrganizar,
    submitting,
}) => {
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [estado, setEstado] = useState('PENDIENTE');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [backendError, setBackendError] = useState('');

    useEffect(() => {
        if (!isOpen || !tareaAOrganizar) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBackendError('');

        setPrioridad(tareaAOrganizar.prioridad || 'MEDIA');
        setEstado(tareaAOrganizar.estado || 'PENDIENTE');
        setFechaVencimiento(
            tareaAOrganizar.fechaVencimiento 
                ? new Date(tareaAOrganizar.fechaVencimiento).toISOString().split('T')[0] 
                : ''
        );
    }, [isOpen, tareaAOrganizar]);

    const handleSubmit = async () => {
        setBackendError('');

        const payload = {
            prioridad,
            estadoOperativo: estado === 'EN_PROGRESO' || estado === 'COMPLETADO' ? estado : undefined,
            // changeEstado se usa si quieres cambiar el estado conceptual/operativo principal
        };

        if (fechaVencimiento) {
            payload.fechaVencimiento = new Date(fechaVencimiento).toISOString();
        }

        try {
            // onSuccess debería llamar a updateTarea(id, payload) y luego opcionalmente changeTareaStatus
            await onSuccess(tareaAOrganizar.id, payload, estado);
        } catch (err) {
            const data = err?.response?.data;
            let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
            setBackendError(msg);
        }
    };

    if (!tareaAOrganizar) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalHeader title="Organizar Entrada" onClose={onClose} />

            <ModalBody>
                <div className="space-y-6">
                    {backendError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2">
                            <Icon name="error" /> {backendError}
                        </div>
                    )}

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Descripción</p>
                        <p className="text-sm font-medium text-slate-900">{tareaAOrganizar.descripcion}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="to-prio">Prioridad</Label>
                            <Select
                                id="to-prio"
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                            >
                                {Object.entries(PRIORIDAD_MAP).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="to-estado">Estado</Label>
                            <Select
                                id="to-estado"
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                            >
                                {Object.entries(ESTADO_MAP).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="to-fecha">Fecha de Vencimiento (Opcional)</Label>
                        <Input
                            id="to-fecha"
                            type="date"
                            value={fechaVencimiento}
                            onChange={(e) => setFechaVencimiento(e.target.value)}
                        />
                    </div>
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    variant="guardar"
                    icon="done_all"
                    onClick={handleSubmit}
                    isLoading={submitting}
                >
                    Guardar Organización
                </Button>
            </ModalFooter>
        </Modal>
    );
};
