import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const getInitialImages = useCallback(() => [
    { url: minuta?.imagenUrl1 || '', publicId: minuta?.publicId1 || '' },
    { url: minuta?.imagenUrl2 || '', publicId: minuta?.publicId2 || '' },
    { url: minuta?.imagenUrl3 || '', publicId: minuta?.publicId3 || '' },
    { url: minuta?.imagenUrl4 || '', publicId: minuta?.publicId4 || '' },
    { url: minuta?.imagenUrl5 || '', publicId: minuta?.publicId5 || '' },
    { url: minuta?.imagenUrl6 || '', publicId: minuta?.publicId6 || '' },
  ], [minuta]);

  const [imagenes, setImagenes] = useState(getInitialImages());
  const [loadingSlots, setLoadingSlots] = useState([false, false, false, false, false, false]);

  useEffect(() => {
    setImagenes(getInitialImages());
  }, [getInitialImages]);

  const subirArchivoASlot = async (index, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && !/\.(heic|heif|png|jpe?g|webp|gif)$/i.test(file.name)) {
      notify.error('El archivo debe ser una imagen válida.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      notify.error('La imagen no debe superar los 20MB.');
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
        setImagenes(prev => {
          const copy = [...prev];
          copy[index] = { url: response.url, publicId: response.publicId };
          return copy;
        });
        notify.success(`Imagen ${index + 1} subida.`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      notify.error(`Error al subir imagen ${index + 1}.`);
    } finally {
      setLoadingSlots(prev => {
        const copy = [...prev];
        copy[index] = false;
        return copy;
      });
    }
  };

  const handleMultipleFiles = async (files) => {
    const fileList = Array.from(files).filter(f => f.type.startsWith('image/') || /\.(heic|heif|png|jpe?g|webp|gif)$/i.test(f.name));
    if (fileList.length === 0) return;

    // Encontrar slots vacíos
    const emptyIndices = [];
    imagenes.forEach((img, idx) => {
      if (!img.url && !loadingSlots[idx]) emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) {
      notify.warning('Todos los 6 espacios de imágenes ya están ocupados.');
      return;
    }

    const filesToUpload = fileList.slice(0, emptyIndices.length);
    if (fileList.length > emptyIndices.length) {
      notify.info(`Solo hay ${emptyIndices.length} espacios libres. Se subirán las primeras ${emptyIndices.length} imágenes.`);
    }

    // Subir concurrentemente a cada slot libre
    await Promise.all(
      filesToUpload.map((file, i) => subirArchivoASlot(emptyIndices[i], file))
    );
  };

  // Manejo de Pegar (Ctrl+V) cuando se está editando
  useEffect(() => {
    if (!editando) return;

    const handlePaste = (e) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      const files = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        handleMultipleFiles(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editando, imagenes, loadingSlots]);

  // Drag and Drop
  const handleDragOver = (e) => {
    if (!editando) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!editando) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    if (!editando) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files) {
      handleMultipleFiles(e.dataTransfer.files);
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
        imagenUrl1: imagenes[0]?.url || null,
        publicId1:  imagenes[0]?.publicId || null,
        imagenUrl2: imagenes[1]?.url || null,
        publicId2:  imagenes[1]?.publicId || null,
        imagenUrl3: imagenes[2]?.url || null,
        publicId3:  imagenes[2]?.publicId || null,
        imagenUrl4: imagenes[3]?.url || null,
        publicId4:  imagenes[3]?.publicId || null,
        imagenUrl5: imagenes[4]?.url || null,
        publicId5:  imagenes[4]?.publicId || null,
        imagenUrl6: imagenes[5]?.url || null,
        publicId6:  imagenes[5]?.publicId || null,
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
    <div 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "rounded-2xl border bg-white shadow-sm overflow-hidden transition-all",
        isDragging ? "border-blue-500 ring-4 ring-blue-500/10 bg-blue-50/20" : "border-slate-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50 border-slate-200">
        <div className="flex items-center gap-2">
          <Icon name="photo_library" size="18px" className="text-slate-400" />
          <h3 className="fuente-titulos text-[11px] font-black tracking-widest uppercase text-slate-700">
            Imágenes de la Reunión
          </h3>
          <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold">
            {imagenesValidas.length} / 6
          </span>
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

      {/* Banner flotante de Drag & Drop cuando se arrastran archivos */}
      {isDragging && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-center gap-2 text-blue-700 text-xs font-bold animate-pulse">
          <Icon name="cloud_upload" size="18px" />
          Suelta tus imágenes aquí para subirlas directamente
        </div>
      )}

      {/* Body */}
      <div className="px-4 py-3">
        {colapsado ? (
          /* Vista Colapsada (Miniaturas compactas con visor en pantalla completa) */
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
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/img/no-image.avif';
                    }}
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
          /* Vista Expandida */
          !editando && !tieneImagenes ? (
            <p className="text-sm text-slate-400 italic text-center py-2">
              No se han agregado imágenes de referencia aún.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {editando && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1 font-semibold text-slate-500">
                    <Icon name="content_paste" size="14px" className="text-slate-400" />
                    Puedes arrastrar imágenes o pegar con <b>Ctrl+V</b> directamente
                  </span>
                  <span className="font-bold text-slate-400">
                    {imagenesValidas.length} de 6 usadas
                  </span>
                </div>
              )}

              {/* Grid adaptable de hasta 6 imágenes (2x3 o 3x2 según pantalla) */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {imagenes.map((img, idx) => {
                  const isLoading = loadingSlots[idx];
                  const hasImage = !!img.url;
                  const validIdx = imagenesValidas.findIndex(i => i.url === img.url);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "relative w-full aspect-square rounded-2xl border flex items-center justify-center overflow-hidden transition-all bg-slate-50/50",
                        hasImage ? "border-slate-200 shadow-xs" : "border-dashed border-slate-300 hover:border-slate-400"
                      )}
                    >
                      {isLoading ? (
                        <div className="flex flex-col items-center gap-1.5 p-2">
                          <Icon name="progress_activity" size="18px" className="animate-spin text-slate-400" />
                          <span className="text-[8px] text-slate-400 font-semibold text-center leading-tight">Subiendo...</span>
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
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/img/no-image.avif';
                            }}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                            <Icon name="zoom_in" size="18px" />
                          </div>

                          {/* Botón de eliminar en modo edición */}
                          {editando && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 active:scale-90 transition-all z-20 cursor-pointer"
                              title="Eliminar imagen"
                            >
                              <Icon name="close" size="12px" weight={700} />
                            </button>
                          )}
                        </div>
                      ) : editando ? (
                        <label className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer p-2 select-none hover:bg-slate-100/50 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleMultipleFiles(e.target.files);
                              }
                            }}
                          />
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                            <Icon name="add_a_photo" size="14px" />
                          </div>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider text-center">
                            Foto {idx + 1}
                          </span>
                        </label>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 p-2 text-slate-300 select-none">
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
