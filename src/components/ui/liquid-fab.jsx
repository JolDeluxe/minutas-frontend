import LiquidGlass from 'liquid-glass-react';
import { Icon } from './icon';
import { cn } from '@/utils/cn';

/**
 * Botón de acción flotante con efecto Liquid Glass estilo iOS.
 * Optimizado para renderizado circular perfecto.
 */
export const LiquidFab = ({
    icon,
    onClick,
    disabled = false,
    isLoading = false,
    bottom,
    right,
    left,
    size = 56,
    displacementScale = 60,
    blurAmount = 0.07,
    saturation = 140,
    zIndex = 50,
    className,
    style: customStyle = {},
}) => {
    // Convertimos los rem-based shorthand a píxeles reales para inline style
    const positionStyle = {
        position: 'fixed',
        zIndex,
        bottom: bottom ? `${Number(bottom) * 4}px` : undefined,
        right: right ? `${Number(right) * 4}px` : undefined,
        left: left ? `${Number(left) * 4}px` : undefined,
    };

    return (
        <div style={positionStyle} className={cn('touch-none flex items-center justify-center', className)}>
            <LiquidGlass
                cornerRadius={size}
                padding="0"
                displacementScale={disabled ? 0 : displacementScale}
                blurAmount={blurAmount}
                saturation={saturation}
                aberrationIntensity={1.5}
                elasticity={0.18}
                overLight={false}
                onClick={!disabled && !isLoading ? onClick : undefined}
                style={{
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%', // Forzamos círculo
                    overflow: 'hidden',   // Evitamos que el efecto se salga
                    opacity: disabled ? 0.45 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                    ...customStyle
                }}
            >
                <Icon
                    name={isLoading ? 'progress_activity' : icon}
                    size="md"
                    className={cn(
                        'text-white drop-shadow-md select-none relative z-10',
                        isLoading && 'animate-spin'
                    )}
                />
            </LiquidGlass>
        </div>
    );
};

export const LiquidPaginationPill = ({
    page,
    totalPages,
    totalItems,
    onPageChange,
    loading = false,
}) => {
    if (!totalPages || totalPages <= 1) return null;

    const isFirst = page <= 1;
    const isLast = page >= totalPages;

    const goTo = (newPage) => {
        if (loading || newPage < 1 || newPage > totalPages) return;
        onPageChange(newPage);
    };

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pb-2">
            <LiquidGlass
                cornerRadius={100}
                padding="8px 16px"
                displacementScale={50}
                blurAmount={0.06}
                saturation={140}
                aberrationIntensity={1}
                elasticity={0.12}
                overLight={false}
                style={{ borderRadius: 100, overflow: 'hidden' }}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => goTo(page - 1)}
                        disabled={isFirst || loading}
                        className="flex items-center justify-center w-7 h-7 rounded-full text-white active:scale-90 transition-all disabled:opacity-30"
                        aria-label="Página anterior"
                    >
                        <Icon name="chevron_left" size="sm" className="text-white" />
                    </button>

                    <div className="text-center min-w-16">
                        <p className="text-xs font-bold text-white leading-tight">
                            {page} / {totalPages}
                        </p>
                        {totalItems > 0 && (
                            <p className="text-[10px] text-white/70 leading-tight">
                                {totalItems} registros
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => goTo(page + 1)}
                        disabled={isLast || loading}
                        className="flex items-center justify-center w-7 h-7 rounded-full text-white active:scale-90 transition-all disabled:opacity-30"
                        aria-label="Página siguiente"
                    >
                        <Icon name="chevron_right" size="sm" className="text-white" />
                    </button>
                </div>
            </LiquidGlass>
        </div>
    );
};