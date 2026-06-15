import { useState, useEffect, useMemo } from 'react';
import { Input, Label, Select } from '@/components/form/z_index';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';
import { LINEA_MAP } from '../constants';
import { useAuthStore } from '@/stores/auth-store';

export const MinutaFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    minutaAEditar,
    submitting,
    departamentoGlobal,
    isExterna = false,
}) => {
    const { user } = useAuthStore();
    const esEdicion = Boolean(minutaAEditar);

    const [departamento, setDepartamento] = useState(user?.departamento || 'DISEÑO');
    const [lineaDefault, setLineaDefault] = useState('CALZADO');
    const [fechaProgramada, setFechaProgramada] = useState('');
    
    const [tituloManual, setTituloManual] = useState('');
    const [tituloModificado, setTituloModificado] = useState(false);
    
    const [iniciarInmediatamente, setIniciarInmediatamente] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [backendError, setBackendError] = useState('');

    // Estados para Minuta Externa
    const [temaExterno, setTemaExterno] = useState('');
    const [areaExterna, setAreaExterna] = useState('DIRECCION_MBC');
    const [departamentoExterno, setDepartamentoExterno] = useState('');
    const [objetivoExterno, setObjetivoExterno] = useState('');
    const [integrantesExterno, setIntegrantesExterno] = useState('');
    const [asistentesExterno, setAsistentesExterno] = useState('');

    const formatToMexicanDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
    };

    const minDate = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('sv-SE');
        const originalDateStr = minutaAEditar && minutaAEditar.fechaProgramada 
            ? new Date(minutaAEditar.fechaProgramada).toISOString().slice(0, 10) 
            : '';
        if (originalDateStr && originalDateStr < todayStr) {
            return originalDateStr;
        }
        return todayStr;
    }, [minutaAEditar]);

    const tituloAuto = useMemo(() => {
        const d = fechaProgramada || new Date().toISOString().slice(0, 10);
        const formattedDate = formatToMexicanDate(d);
        const l = LINEA_MAP[lineaDefault]?.label || lineaDefault;
        return `${departamento} - ${formattedDate} - ${l}`.toUpperCase();
    }, [departamento, fechaProgramada, lineaDefault]);

    const tituloActual = tituloModificado ? tituloManual : tituloAuto;

    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setTituloManual(minutaAEditar.titulo || '');
            setTituloModificado(true);
            setLineaDefault(minutaAEditar.lineaDefault || 'CALZADO');
            setFechaProgramada(minutaAEditar.fechaProgramada ? new Date(minutaAEditar.fechaProgramada).toISOString().slice(0, 10) : '');
            setIniciarInmediatamente(false);
            if (minutaAEditar.departamento || minutaAEditar.creadoPor?.departamento) {
                const dep = minutaAEditar.departamento || minutaAEditar.creadoPor.departamento;
                setDepartamento(dep === 'DISENO' ? 'DISEÑO' : dep);
            }
            if ('tema' in minutaAEditar) {
                setTemaExterno(minutaAEditar.tema || '');
                setAreaExterna(minutaAEditar.area || 'DIRECCION_MBC');
                setDepartamentoExterno(minutaAEditar.departamento || '');
                setObjetivoExterno(minutaAEditar.objetivo || '');
                setIntegrantesExterno(minutaAEditar.integrantes || '');
                setAsistentesExterno(minutaAEditar.asistentes || '');
            } else {
                setTemaExterno('');
                setAreaExterna('DIRECCION_MBC');
                setDepartamentoExterno('');
                setObjetivoExterno('');
                setIntegrantesExterno('');
                setAsistentesExterno('');
            }
        } else {
            setTituloManual('');
            setTituloModificado(false);
            setIniciarInmediatamente(false);
            
            // Default active department from outside modal
            let deptDefault = 'DISEÑO';
            if (departamentoGlobal && departamentoGlobal !== 'TODAS') {
                deptDefault = departamentoGlobal === 'DISENO' ? 'DISEÑO' : departamentoGlobal;
            } else if (user?.departamento && user.departamento !== 'ADMIN') {
                deptDefault = user.departamento === 'DISENO' ? 'DISEÑO' : user.departamento;
            }
            
            setDepartamento(deptDefault);
            setLineaDefault(deptDefault === 'MARKETING' ? 'MARKETING' : 'CALZADO');
            
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setFechaProgramada(now.toISOString().slice(0, 10));

            // Reset externas
            setTemaExterno('');
            setAreaExterna('DIRECCION_MBC');
            setDepartamentoExterno('');
            setObjetivoExterno('');
            setIntegrantesExterno('');
            setAsistentesExterno('');
        }
    }, [isOpen, esEdicion, minutaAEditar, user, departamentoGlobal, isExterna]);

    const getFormErrors = () => {
        const e = {};
        if (isExterna) {
            if (!temaExterno.trim()) e.temaExterno = 'El tema es obligatorio.';
            if (temaExterno.trim().length < 3) e.temaExterno = 'Debe tener al menos 3 caracteres.';
            if (!areaExterna) e.areaExterna = 'Selecciona un área.';
            if (!fechaProgramada) e.fechaProgramada = 'La fecha es obligatoria.';
        } else {
            if (!tituloActual.trim()) e.titulo = 'El título es obligatorio.';
            if (tituloActual.length < 3) e.titulo = 'Debe tener al menos 3 caracteres.';
            if (!lineaDefault) e.lineaDefault = 'Selecciona una línea por defecto.';
            if (!fechaProgramada) {
                e.fechaProgramada = 'La fecha es obligatoria.';
            } else {
                const todayStr = new Date().toLocaleDateString('sv-SE');
                const originalDateStr = minutaAEditar && minutaAEditar.fechaProgramada 
                    ? new Date(minutaAEditar.fechaProgramada).toISOString().slice(0, 10) 
                    : '';
                
                if (fechaProgramada < todayStr) {
                    if (originalDateStr) {
                        if (fechaProgramada < originalDateStr) {
                            e.fechaProgramada = 'La fecha no puede ser menor a la fecha original de la minuta.';
                        }
                    } else {
                        e.fechaProgramada = 'La fecha no puede ser menor a hoy.';
                    }
                }
            }
        }
        return e;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');

        const errors = getFormErrors();
        if (Object.keys(errors).length > 0) return;

        const payload = isExterna ? {
            tema: temaExterno.trim(),
            area: areaExterna,
            departamento: departamentoExterno.trim() || undefined,
            objetivo: objetivoExterno.trim() || undefined,
            integrantes: integrantesExterno.trim() || undefined,
            asistentes: asistentesExterno.trim() || undefined,
            fechaProgramada: new Date(`${fechaProgramada}T12:00:00Z`).toISOString(),
        } : {
            titulo: tituloActual.trim(),
            lineaDefault,
            fechaProgramada: new Date(`${fechaProgramada}T12:00:00Z`).toISOString(),
            iniciarInmediatamente,
            departamento: departamento === 'DISEÑO' ? 'DISENO' : departamento,
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

                    {isExterna ? (
                        <>
                            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                                <Label htmlFor="me-tema" error={!!fe.temaExterno}>Tema *</Label>
                                <Input
                                    id="me-tema"
                                    value={temaExterno}
                                    onChange={(e) => setTemaExterno(e.target.value)}
                                    error={!!fe.temaExterno}
                                    helperText={fe.temaExterno}
                                    placeholder="Ej. Revisión de Políticas Generales"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="me-area" error={!!fe.areaExterna}>Área *</Label>
                                    <Select
                                        id="me-area"
                                        value={areaExterna}
                                        onChange={(e) => setAreaExterna(e.target.value)}
                                        error={!!fe.areaExterna}
                                    >
                                        <option value="DIRECCION_MBC">Dirección MBC</option>
                                        <option value="DIRECCION_CFI">Dirección CFI</option>
                                        <option value="DIRECCION_ADJUNTA">Dirección Adjunta</option>
                                        <option value="DIRECCION_TIENDAS">Dirección Tiendas</option>
                                        <option value="DIRECCION_MKT">Dirección MKT</option>
                                        <option value="DIRECCION_ALTA_CALIDAD">Dirección Alta Calidad</option>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="me-departamento">Departamento / Línea</Label>
                                    <Input
                                        id="me-departamento"
                                        value={departamentoExterno}
                                        onChange={(e) => setDepartamentoExterno(e.target.value)}
                                        placeholder="Ej. Compras, Visual..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="me-objetivo">Objetivo</Label>
                                    <Input
                                        id="me-objetivo"
                                        value={objetivoExterno}
                                        onChange={(e) => setObjetivoExterno(e.target.value)}
                                        placeholder="Objetivo principal de la minuta"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="me-fecha" error={!!fe.fechaProgramada}>Fecha Programada *</Label>
                                    <Input
                                        id="me-fecha"
                                        type="date"
                                        value={fechaProgramada}
                                        onChange={(e) => setFechaProgramada(e.target.value)}
                                        error={!!fe.fechaProgramada}
                                        helperText={fe.fechaProgramada}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="me-integrantes">Participantes (separados por coma)</Label>
                                <Input
                                    id="me-integrantes"
                                    value={integrantesExterno}
                                    onChange={(e) => setIntegrantesExterno(e.target.value)}
                                    placeholder="Juan, Pedro, Ana"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="m-departamento">Departamento *</Label>
                                    <Select
                                        id="m-departamento"
                                        value={departamento}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDepartamento(val);
                                            setTituloModificado(false);
                                            if (val === 'MARKETING') {
                                                setLineaDefault('MARKETING');
                                            } else {
                                                setLineaDefault('CALZADO');
                                            }
                                        }}
                                    >
                                        <option value="DISEÑO">Diseño</option>
                                        <option value="MARKETING">Marketing</option>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="m-linea" error={!!fe.lineaDefault}>Línea *</Label>
                                    <Select
                                        id="m-linea"
                                        value={lineaDefault}
                                        onChange={(e) => {
                                            setLineaDefault(e.target.value);
                                            setTituloModificado(false);
                                        }}
                                        error={!!fe.lineaDefault}
                                    >
                                        {departamento === 'MARKETING' ? (
                                            <option value="MARKETING">Marketing</option>
                                        ) : (
                                            Object.entries(LINEA_MAP)
                                                .filter(([value]) => value !== 'MARKETING')
                                                .map(([value, config]) => (
                                                    <option key={value} value={value}>{config.label}</option>
                                                ))
                                        )}
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="m-fecha" error={!!fe.fechaProgramada}>Fecha Programada *</Label>
                                <Input
                                    id="m-fecha"
                                    type="date"
                                    value={fechaProgramada}
                                    min={minDate}
                                    onChange={(e) => {
                                        setFechaProgramada(e.target.value);
                                        setTituloModificado(false);
                                    }}
                                    error={!!fe.fechaProgramada}
                                    helperText={fe.fechaProgramada}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                                <Label htmlFor="m-titulo" error={!!fe.titulo}>Título de la Minuta *</Label>
                                <Input
                                    id="m-titulo"
                                    value={tituloActual}
                                    onChange={(e) => {
                                        setTituloModificado(true);
                                        setTituloManual(e.target.value);
                                    }}
                                    error={!!fe.titulo}
                                    helperText={fe.titulo || "Autogenerado. Puedes modificarlo si lo deseas."}
                                    placeholder="Ej. DISEÑO - 19-05-2026 - CALZADO"
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
                                        <Label htmlFor="m-iniciar" className="mb-0 cursor-pointer font-extrabold text-slate-800">
                                            <Icon name="play_circle" size="16px" className="inline-block mr-1 text-marca-primario" />
                                            Iniciar Junta Ahora
                                        </Label>
                                        <span className="text-xs text-slate-500 font-medium">
                                            Pasa directo a la captura. El estado será Activa automáticamente.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
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
