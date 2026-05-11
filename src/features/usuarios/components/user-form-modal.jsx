// src/features/usuarios/components/user-form-modal.jsx

import { useState, useEffect, useRef } from 'react';
import { Input, Label, Select } from '@/components/form/z_index';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';

const ROL_MAP = {
    COORDINADOR: 'Coordinador',
    JEFE: 'Jefatura',
    GERENCIA: 'Gerencia',
};

const AREA_MAP = {
    DISENO: 'Diseño',
    ADMON: 'Administración',
    CONTABILIDAD: 'Contabilidad',
    DIRECCION: 'Dirección',
    PRODUCCION: 'Producción',
    CALIDAD: 'Calidad',
    ALMACEN: 'Almacén',
    EXTERNA: 'Externa',
};

const LINEA_MAP = {
    CUADRA: 'Cuadra',
    FRANCO_CUADRA: 'Franco Cuadra',
    VESTIGIO: 'Vestigio',
    GENERAL: 'General',
};

const sanitizeUsername = (text) =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

const MAX_NOMBRE = 60;

export const UserFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    usuarioAEditar,
    currentUser,
    submitting,
}) => {
    const esEdicion = Boolean(usuarioAEditar);
    const esGerencia = currentUser?.rol === 'GERENCIA';
    const fileInputRef = useRef(null);

    const [nombre, setNombre] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('');
    const [area, setArea] = useState('DISENO');
    const [linea, setLinea] = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(undefined);
    const [usernameEdited, setUsernameEdited] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [backendError, setBackendError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setNombre(usuarioAEditar.nombre || '');
            setUsername(usuarioAEditar.username || '');
            setEmail(usuarioAEditar.email || '');
            setPassword('');
            setRol(usuarioAEditar.rol || '');
            setArea(usuarioAEditar.area || 'DISENO');
            setLinea(usuarioAEditar.linea || '');
            setImagenPreview(usuarioAEditar.imagen || null);
            setImagenFile(undefined);
            setUsernameEdited(true);
        } else {
            setNombre('');
            setUsername('');
            setEmail('');
            setPassword('');
            setRol('');
            setArea('DISENO');
            setLinea('');
            setImagenPreview(null);
            setImagenFile(undefined);
            setUsernameEdited(false);
        }
    }, [isOpen, esEdicion, usuarioAEditar]);

    const rolesDisponibles = [
        { value: 'COORDINADOR', label: ROL_MAP.COORDINADOR, visible: true },
        { value: 'JEFE', label: ROL_MAP.JEFE, visible: esGerencia || usuarioAEditar?.rol === 'JEFE' },
        { value: 'GERENCIA', label: ROL_MAP.GERENCIA, visible: esGerencia || usuarioAEditar?.rol === 'GERENCIA' },
    ].filter((r) => r.visible);

    const handleNombreChange = (e) => {
        const val = e.target.value;
        if (val.length > MAX_NOMBRE) return;
        setNombre(val);
        if (!esEdicion && !usernameEdited) {
            const parts = val.trim().split(/\s+/);
            const base = parts.length >= 2 ? parts[0] + parts[1] : parts[0] ?? '';
            setUsername(sanitizeUsername(base));
            setBackendError('');
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagenFile(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveFoto = () => {
        setImagenFile(null);
        setImagenPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getFormErrors = () => {
        const e = {};
        if (!nombre.trim()) e.nombre = 'El nombre es obligatorio.';
        if (!esEdicion && !password.trim()) e.password = 'Contraseña obligatoria (Mínimo 6 chars).';
        if (password && password.length < 6) e.password = 'Mínimo 6 caracteres.';
        if (!rol) e.rol = 'Selecciona un rol.';
        if (!area) e.area = 'Selecciona un área.';
        return e;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');

        const errors = getFormErrors();
        if (Object.keys(errors).length > 0) return;

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('rol', rol);
        formData.append('area', area);

        if (username) formData.append('username', username);
        if (email) formData.append('email', email);
        if (password) formData.append('password', password);
        if (linea) formData.append('linea', linea);

        if (imagenFile) {
            formData.append('imagen', imagenFile, imagenFile.name);
        } else if (imagenFile === null && esEdicion) {
            formData.append('imagen', 'null');
        }

        try {
            await onSuccess(formData);
        } catch (err) {
            const data = err?.response?.data;
            let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
            if (data?.errors && Array.isArray(data.errors)) {
                msg = data.errors[0].message;
            }
            const lc = msg.toLowerCase();
            if (lc.includes('username') && (lc.includes('existe') || lc.includes('uso'))) {
                setBackendError(`El usuario "${username}" ya está en uso.`);
            } else {
                setBackendError(msg);
            }
        }
    };

    const fe = submitted ? getFormErrors() : {};

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalHeader title={esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={onClose} />

            <ModalBody>
                <div className="space-y-6">

                    {backendError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2">
                            <Icon name="error" /> {backendError}
                        </div>
                    )}

                    {/* ── FOTO Y NOMBRE ── */}
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                        <div className="flex flex-col items-center gap-2 shrink-0 w-full md:w-auto">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFotoChange}
                            />
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer group shadow-sm hover:border-marca-primario transition-colors"
                            >
                                {imagenPreview ? (
                                    <img src={imagenPreview} className="w-full h-full object-cover" alt="Perfil" />
                                ) : (
                                    <Icon name="add_a_photo" className="text-slate-400 text-3xl group-hover:text-marca-primario" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                                    <Icon name="upload" className="text-xl mb-1" />
                                    Subir
                                </div>
                            </div>
                            {imagenPreview && (
                                <button onClick={handleRemoveFoto} className="text-xs text-rose-600 hover:text-rose-800 font-bold">
                                    Quitar Foto
                                </button>
                            )}
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="u-nombre" error={!!fe.nombre}>Nombre Completo *</Label>
                                    <span className={`text-[10px] font-bold ${nombre.length >= MAX_NOMBRE ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                        {nombre.length}/{MAX_NOMBRE}
                                    </span>
                                </div>
                                <Input
                                    id="u-nombre"
                                    value={nombre}
                                    onChange={handleNombreChange}
                                    error={!!fe.nombre}
                                    helperText={fe.nombre}
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-username">Usuario (Opcional)</Label>
                                <Input
                                    id="u-username"
                                    value={username}
                                    onChange={(e) => { setUsername(sanitizeUsername(e.target.value)); setUsernameEdited(true); }}
                                    placeholder="Autogenerado si se deja en blanco"
                                    className="font-codigo"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── ROL, ÁREA Y LÍNEA ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-rol" error={!!fe.rol}>Rol *</Label>
                            <Select
                                id="u-rol"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                error={!!fe.rol}
                                helperText={fe.rol}
                            >
                                <option value="" disabled>Selecciona un rol…</option>
                                {rolesDisponibles.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-area" error={!!fe.area}>Área *</Label>
                            <Select
                                id="u-area"
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
                            <Label htmlFor="u-linea">Línea (Opcional)</Label>
                            <Select
                                id="u-linea"
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

                    {/* ── CONTACTO Y SEGURIDAD ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-email">Correo Electrónico</Label>
                            <Input
                                id="u-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                                placeholder="usuario@cuadra.com.mx"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-pass" error={!!fe.password}>
                                Contraseña {esEdicion ? <span className="font-normal text-slate-400 normal-case text-[10px]">(Dejar vacío para conservar)</span> : '*'}
                            </Label>
                            <Input
                                id="u-pass"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!fe.password}
                                helperText={fe.password}
                                placeholder={esEdicion ? '••••••••' : 'Mínimo 6 caracteres'}
                                autoComplete="new-password"
                            />
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
                    icon="save"
                    onClick={handleSubmit}
                    isLoading={submitting}
                >
                    {esEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};