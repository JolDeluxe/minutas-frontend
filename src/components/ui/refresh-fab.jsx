// src/components/ui/refresh-fab.jsx
import { useState, useEffect } from 'react';
import { Icon } from './icon';
import { cn } from '@/utils/cn';
import { hardReload } from '@/utils/hard-reload';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { GlassFab } from './liquid-glass-mobile';

const glassStyle = {
    background: 'rgba(100, 116, 139, 0.62)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.48) inset, 0 -1px 0 rgba(0,0,0,0.08) inset',
};

const GlassSheen = () => (
    <div
        aria-hidden="true"
        style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: 'linear-gradient(148deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 60%)',
            pointerEvents: 'none',
        }}
    />
);

export const RefreshFab = ({
    bottom,
    right,
    left,
    size = 50,
    zIndex = 49,
    className,
}) => {
    const [spinning, setSpinning] = useState(false);
    const isDesktop = useIsDesktop();
    const [hasAddButton, setHasAddButton] = useState(false);
    const [hasPaginator, setHasPaginator] = useState(false);

    useEffect(() => {
        if (isDesktop) return;

        const checkDOM = () => {
            const addBtn = document.querySelector('button[aria-label="add"]');
            const paginator = document.querySelector('[aria-label="Página anterior"], .pagination');
            setHasAddButton(!!addBtn);
            setHasPaginator(!!paginator);
        };

        checkDOM();
        // Escuchar cambios en el DOM para actualizar la posición dinámicamente según la vista activa
        const observer = new MutationObserver(checkDOM);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [isDesktop]);

    const handleClick = async () => {
        if (spinning) return;
        setSpinning(true);
        await new Promise((r) => setTimeout(r, 300));
        await hardReload();
        setSpinning(false);
    };

    // Ajuste dinámico inteligente de la posición en móviles
    let resolvedBottom;
    if (isDesktop) {
        resolvedBottom = bottom || '32px';
    } else {
        if (bottom) {
            resolvedBottom = bottom;
        } else {
            if (hasAddButton) {
                resolvedBottom = hasPaginator ? '170px' : '150px';
            } else {
                resolvedBottom = hasPaginator ? '146px' : '84px';
            }
        }
    }

    const resolvedRight = right || (isDesktop ? '32px' : '20px');

    if (!isDesktop) {
        // En móvil usamos el componente nativo de UI premium GlassFab de forma limpia,
        // evitando el WebGL canvas que producía el bug de los "dos círculos separados".
        return (
            <GlassFab
                icon="refresh"
                onClick={handleClick}
                isLoading={spinning}
                variant="neutral"
                size={size}
                bottom={resolvedBottom}
                right={resolvedRight}
                left={left}
                zIndex={zIndex}
                className={className}
            />
        );
    }

    // En Desktop usamos Glassmorphism normal
    return (
        <button
            onClick={handleClick}
            disabled={spinning}
            style={{
                position: 'fixed',
                bottom: resolvedBottom,
                zIndex,
                width: size,
                height: size,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: spinning ? 0.7 : 1,
                transition: 'transform 0.15s ease, opacity 0.2s',
                ...(left ? { left } : { right: resolvedRight }),
                ...glassStyle,
            }}
            className={cn(
                'active:scale-90 transition-transform select-none outline-none touch-none hover:scale-105',
                className
            )}
            aria-label="Recargar aplicación"
        >
            <GlassSheen />
            <Icon
                name="refresh"
                size="md"
                weight={500}
                className={cn('text-white drop-shadow-sm relative', spinning && 'animate-spin')}
            />
        </button>
    );
};