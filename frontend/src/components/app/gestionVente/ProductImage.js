import React, { useState, useEffect, useCallback } from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import apiServiceSettings from '../../../services/api.service.settings';
import {
  IMAGE_DISPLAY_MODES,
  getImageStyle,
  getResponsiveImageConfig
} from './shared/ImageDisplayModes';
import ImageZoomModal from './shared/ImageZoomModal';
import useImageZoom from './shared/useImageZoom';
import './ProductImage.css';

// Constants
const FALLBACK_IMAGE = '/no-image.svg';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

// Cache global pour le logo
let logoCache = null;

/**
 * Vérifie si une URL est une image valide
 */
const isValidImageUrl = url => {
  if (!url) return false;

  // URL complète
  if (url.startsWith('http://') || url.startsWith('https://')) return true;

  // Data URL
  if (url.toLowerCase().startsWith('data:image')) return true;

  // Extension d'image
  const lowerUrl = url.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lowerUrl.endsWith(ext));
};

/**
 * Styles par layout (simplifiés car CSS gère les effets)
 */
const getLayoutStyle = (layout, containerStyle = {}) => {
  const baseStyle = { ...containerStyle };

  switch (layout) {
    case 'grid':
      return { ...baseStyle, height: '150px', width: '100%' };
    case 'list':
      return { ...baseStyle, height: '100px', width: '100px', flexShrink: 0 };
    default:
      return baseStyle;
  }
};

/**
 * Composant de placeholder pendant le chargement
 */
const LoadingPlaceholder = ({ layout, containerStyle }) => (
  <div
    style={getLayoutStyle(layout, containerStyle)}
    className={classNames(
      'bg-light d-flex align-items-center justify-content-center',
      { 'h-sm-100': layout === 'list' }
    )}
  >
    <div className="text-center text-muted">
      <i className="fas fa-image fa-2x mb-2" />
      <div className="small">Chargement...</div>
    </div>
  </div>
);

/**
 * Hook pour gérer le logo de fallback
 */
const useLogoFallback = shouldUseFallback => {
  const [logoUrl, setLogoUrl] = useState(logoCache || FALLBACK_IMAGE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!shouldUseFallback || logoCache) return;

    const fetchLogo = async () => {
      setIsLoading(true);
      try {
        const settings = await apiServiceSettings.getSettings();
        const logo =
          settings?.logo && settings.logo !== 'blob'
            ? settings.logo
            : FALLBACK_IMAGE;

        logoCache = logo;
        setLogoUrl(logo);
      } catch (error) {
        console.error('[ProductImage] Erreur récupération logo:', error);
        setLogoUrl(FALLBACK_IMAGE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [shouldUseFallback]);

  return { logoUrl, isLoading };
};

/**
 * Composant d'image de produit avec fallback intelligent
 */
const ProductImage = ({
  libelle,
  id,
  image,
  layout,
  containerStyle,
  displayMode = IMAGE_DISPLAY_MODES.CONTAIN,
  enableZoom = false
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState('');
  const { zoomModal, showZoom, hideZoom } = useImageZoom();

  const shouldUseFallback = !image || !isValidImageUrl(image) || imageFailed;
  const { logoUrl, isLoading } = useLogoFallback(shouldUseFallback);

  // Détermine l'image à afficher
  useEffect(() => {
    if (image && isValidImageUrl(image) && !imageFailed) {
      setCurrentImageSrc(image);
    } else {
      setCurrentImageSrc(logoUrl);
    }
  }, [image, logoUrl, imageFailed]);

  const handleImageError = useCallback(() => {
    console.warn('[ProductImage] Échec chargement:', currentImageSrc);
    setImageFailed(true);
    setCurrentImageSrc(FALLBACK_IMAGE);
  }, [currentImageSrc]);

  const handleImageLoad = useCallback(() => {
    setImageFailed(false);
  }, []);

  const handleImageClick = useCallback(() => {
    if (enableZoom && currentImageSrc && currentImageSrc !== FALLBACK_IMAGE) {
      showZoom(currentImageSrc, libelle, `Aperçu de ${libelle}`);
    }
  }, [enableZoom, currentImageSrc, libelle, showZoom]);

  // Affichage du placeholder pendant le chargement
  if (isLoading && shouldUseFallback) {
    return (
      <LoadingPlaceholder layout={layout} containerStyle={containerStyle} />
    );
  }

  return (
    <>
      <div
        style={getLayoutStyle(layout, containerStyle)}
        className={classNames('product-image-container', {
          'h-sm-100': layout === 'list',
          'grid-layout': layout === 'grid',
          'list-layout': layout === 'list'
        })}
      >
        <Image
          rounded
          src={currentImageSrc}
          className={classNames('h-100 w-100 product-image', {
            'clickable-image': enableZoom && currentImageSrc !== FALLBACK_IMAGE
          })}
          style={{
            ...getImageStyle(displayMode),
            cursor:
              enableZoom && currentImageSrc !== FALLBACK_IMAGE
                ? 'zoom-in'
                : 'default'
          }}
          alt={libelle || 'Image produit'}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onClick={handleImageClick}
          {...getResponsiveImageConfig(layout)}
        />

        {/* Overlay subtil pour améliorer la visibilité */}
        <div className="image-overlay" />

        {/* Icône de zoom si activé */}
        {enableZoom && currentImageSrc !== FALLBACK_IMAGE && (
          <div
            className="zoom-icon"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <i
              className="fas fa-search-plus"
              style={{ color: 'white', fontSize: '12px' }}
            />
          </div>
        )}
      </div>

      {/* Modal de zoom */}
      {enableZoom && (
        <ImageZoomModal
          show={zoomModal.show}
          onHide={hideZoom}
          imageSrc={zoomModal.imageSrc}
          imageAlt={zoomModal.imageAlt}
          title={zoomModal.title}
        />
      )}
    </>
  );
};

ProductImage.propTypes = {
  libelle: PropTypes.string.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  image: PropTypes.string,
  layout: PropTypes.oneOf(['grid', 'list']).isRequired,
  containerStyle: PropTypes.object,
  displayMode: PropTypes.oneOf(Object.values(IMAGE_DISPLAY_MODES)),
  enableZoom: PropTypes.bool
};

export default ProductImage;
