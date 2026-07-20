import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { uploadResumenImagen } from '../../api/minutas-api';
import { notify } from '@/components/notification/adaptive-notify';
import { ImageViewer } from '@/features/tareas/components/comun/image-viewer';

export const SeccionImagenes = ({
  minuta,
  isAdmin,
  onGuardar,
}) => {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [colapsado, setColapsado] = useState(true); // Colapsado por defecto
  const [viewerState, setViewerState] = useState(null);

  const getInitialImages = () => [
    { url: minuta?.imagenUrl1 || '', publicId: minuta?.publicId1 || '' },
    { url: minuta?.imagenUrl2 || '', publicId: minuta?.publicId2 || '' },
    { url: minuta?.imagenUrl3 || '', publicId: minuta?.publicId3 || '' },
  ];

  const [imagenes, setImagenes] = useState(getInitialImages());
  const [loadingSlots, setLoadingSlots] = useState([false, false, false]);

  useEffect(() => {
    setImagenes(getInitialImages());
  }, [minuta]);

  const handleFileChange = async (index, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.error('El archivo seleccionado debe ser una imagen.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      notify.error('La imagen no debe superar los 15MB.');
      return;
    }

    setLoadingSlots(prev => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });

    try {
      const response = await uploadResumenImagen(file);
      if (response?.status === 'success' || response?.url) {
        const data = response;
        setImagenes(prev => {
          const copy = [...prev];
          copy[index] = { url: data.url, publicId: data.publicId };
          return copy;
        });
        notify.success('Imagen subida correctamente.');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      notify.error('Error al subir la imagen.');
    } finally {
      setLoadingSlots(prev => {
        const copy = [...prev];
        copy[index] = false;
        return copy;
      });
    }
  };

  const handleRemoveImage = (index) => {
    setImagenes(prev => {
      const copy = [...prev];
      copy[index] = { url: '', publicId: '' };
      return copy;
    });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await onGuardar({
        imagenUrl1: imagenes[0].url || null,
        publicId1:  imagenes[0].publicId || null,
        imagenUrl2: imagenes[1].url || null,
        publicId2:  imagenes[1].publicId || null,
        imagenUrl3: imagenes[2].url || null,
        publicId3:  imagenes[2].publicId || null,
      });
      setEditando(false);
    } catch (error) {
      console.error('Error al guardar sección imágenes:', error);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setImagenes(getInitialImages());
    setEditando(false);
  };

  const tieneImagenes = imagenes.some(img => img.url);
  const imagenesValidas = imagenes.filter(img => img.url);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50 border-slate-200">
        <div className="flex items-center gap-2">
          <Icon name="photo_library" size="18px" className="text-slate-400" />
          <h3 className="fuente-titulos text-[11px] font-black tracking-widest uppercase text-slate-700">
            Imágenes de la Reunión
          </h3>
          {tieneImagenes && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold">
              {imagenesValidas.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de colapsar */}
          <button
            type="button"
            onClick={() => setColapsado(!colapsado)}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title={colapsado ? 'Expandir' : 'Colapsar'}
          >
            <Icon name={colapsado ? 'expand_more' : 'expand_less'} size="18px" />
          </button>

          {!editando && isAdmin && (
            <Button
              variant="soft"
              size="sm"
              icon="edit"
              onClick={() => {
                setEditando(true);
                setColapsado(false); // Auto expandir al editar
              }}
              className="h-6 px-2 text-[9px]"
            >
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {colapsado ? (
          /* Vista Colapsada (Miniaturas súper compactas con click para ver en pantalla completa) */
          tieneImagenes ? (
            <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar py-0.5">
              {imagenesValidas.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setViewerState({ images: imagenesValidas, index: idx })}
                  className="relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-95 group shrink-0"
                >
                  <img
                    src={img.url}
                    alt={`Evidencia ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                    <Icon name="zoom_in" size="16px" />
                  </div>
                </div>
              ))}
              <span className="text-[10px] text-slate-400 font-semibold italic ml-1 shrink-0">
                Toca una imagen para verla en grande
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic py-1">
              No se han agregado imágenes de referencia aún.
            </p>
          )
        ) : (
          /* Vista Expandida (Grid estándar con acciones claras e independientes) */
          !editando && !tieneImagenes ? (
            <p className="text-sm text-slate-400 italic text-center py-2">
              No se han agregado imágenes de referencia aún.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                {imagenes.map((img, idx) => {
                  const isLoading = loadingSlots[idx];
                  const hasImage = !!img.url;
                  const validIdx = imagenesValidas.findIndex(i => i.url === img.url);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border flex items-center justify-center overflow-hidden transition-all bg-slate-50/50 shrink-0",
                        hasImage ? "border-slate-200" : "border-dashed border-slate-300 hover:border-slate-400"
                      )}
                    >
                      {isLoading ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <Icon name="progress_activity" size="18px" className="animate-spin text-slate-400" />
                          <span className="text-[9px] text-slate-400 font-semibold">Subiendo...</span>
                        </div>
                      ) : hasImage ? (
                        <div
                          className="relative w-full h-full cursor-pointer group"
                          onClick={() => {
                            setViewerState({ images: imagenesValidas, index: validIdx >= 0 ? validIdx : 0 });
                          }}
                        >
                          <img
                            src={img.url}
                            alt={`Evidencia ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                            <Icon name="zoom_in" size="20px" />
                          </div>

                          {/* Botón de eliminar aislado en modo edición */}
                          {editando && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 active:scale-90 transition-all z-20 cursor-pointer"
                              title="Eliminar imagen"
                            >
                              <Icon name="close" size="12px" weight={700} />
                            </button>
                          )}
                        </div>
                      ) : editando ? (
                        <label className="w-full h-full flex flex-col items-center justify-center gap-1.5 cursor-pointer p-3 select-none">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(idx, e.target.files?.[0])}
                          />
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                            <Icon name="add_a_photo" size="14px" />
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                            Añadir
                          </span>
                        </label>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 p-3 text-slate-300 select-none">
                          <Icon name="image" size="18px" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-center">
                            Vacío
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {editando && (
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-2.5">
                  <Button
                    variant="cancelar"
                    size="sm"
                    onClick={handleCancelar}
                    disabled={guardando}
                    className="h-7 px-3 text-[11px]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="guardar"
                    size="sm"
                    icon={guardando ? 'progress_activity' : 'check'}
                    onClick={handleGuardar}
                    loading={guardando}
                    disabled={guardando || loadingSlots.some(Boolean)}
                    className="h-7 px-4 text-[11px]"
                  >
                    {guardando ? 'Guardando…' : 'Guardar'}
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Visor de imágenes en pantalla completa */}
      {viewerState !== null && (
        <ImageViewer
          images={viewerState.images}
          initialIndex={viewerState.index}
          onClose={() => setViewerState(null)}
        />
      )}
    </div>
  );
};
