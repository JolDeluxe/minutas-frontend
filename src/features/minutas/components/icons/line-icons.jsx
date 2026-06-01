import React from 'react';
import { Icon } from '@/components/ui/z_index';
import ropaIcon from '@/assets/icons/ropa-svg.svg';
import calzadoIcon from '@/assets/icons/calzado-svg.svg';
import botaIcon from '@/assets/icons/bota-svg.svg';
import accesoriosIcon from '@/assets/icons/accesorios-svg.svg';
import marketingIcon from '@/assets/icons/marketing.svg';
import disenoIcon from '@/assets/icons/diseño-svg.svg';

const toCssSize = (size) => (typeof size === 'number' ? `${size}px` : size);

const LineAssetIcon = ({ src, size = 28, className = '', style, alt = '' }) => {
  const cssSize = toCssSize(size);

  return (
    <span
      className={className}
      style={{
        width: cssSize,
        height: cssSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        flex: '0 0 auto',
        ...style,
      }}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    </span>
  );
};

export const ZapatoIcon = (props) => (
  <LineAssetIcon src={calzadoIcon} {...props} />
);

export const BotaIcon = (props) => (
  <LineAssetIcon src={botaIcon} {...props} />
);

export const BolsaIcon = (props) => (
  <LineAssetIcon src={accesoriosIcon} {...props} />
);

export const RopaIcon = (props) => (
  <LineAssetIcon src={ropaIcon} {...props} />
);

export const MarketingIcon = (props) => (
  <LineAssetIcon src={marketingIcon} {...props} />
);

export const DisenoIcon = (props) => (
  <LineAssetIcon src={disenoIcon} {...props} />
);

/**
 * LineIconSelector — Componente centralizado para elegir el icono de línea.
 */
export const LineIconSelector = ({ type, size = 28, className = '', style }) => {
  const normalizedType = String(type || '').trim().toUpperCase();
  const iconSize = toCssSize(size);

  const renderIcon = (name) => (
    <Icon name={name} size={iconSize} weight={50} opsz={size} className={className} style={style} />
  );

  switch (normalizedType) {
    case 'CALZADO':
      return <ZapatoIcon size={size} className={className} style={style} />;
    case 'BOTA':
      return <BotaIcon size={size} className={className} style={style} />;
    case 'ACCESORIOS':
      return <BolsaIcon size={size} className={className} style={style} />;
    case 'ROPA':
      return <RopaIcon size={size} className={className} style={style} />;
    case 'MARKETING':
      return <MarketingIcon size={size} className={className} style={style} />;
    case 'DISENO':
    case 'DISEÑO':
      return <DisenoIcon size={size} className={className} style={style} />;
      
    // Iconos de las líneas de áreas externas
    case 'COMPRAS': return renderIcon('shopping_bag');
    case 'PRODUCCION': return renderIcon('precision_manufacturing');
    case 'INGENIERIA': return renderIcon('engineering');
    case 'DESARROLLO': return renderIcon('construction');
    case 'PT': return renderIcon('inventory');
    case 'TRAFICO': return renderIcon('local_shipping');
    case 'DIRECCION': return renderIcon('business');
    case 'VISUAL': return renderIcon('visibility');
    case 'ANALISIS_VENTAS': 
    case 'ANALISIS VENTAS': return renderIcon('analytics');
    case 'REDES_SOCIALES': 
    case 'REDES SOCIALES': return renderIcon('share');
    case 'PAGINA_WEB':
    case 'PAGINA WEB': return renderIcon('language');
    case 'EVENTOS': return renderIcon('event');
    case 'DISENO_GRAFICO': 
    case 'DISEÑO GRAFICO': return renderIcon('brush');
    case 'OTROS': return renderIcon('more_horiz');

    default:
      return renderIcon('category');
  }
};
