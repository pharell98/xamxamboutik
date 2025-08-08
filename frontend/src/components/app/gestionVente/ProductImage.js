// DOCUMENT filename="ProductImage.js"
import React, { useState, useEffect } from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import apiServiceSettings from '../../../services/api.service.settings';

// Variable statique pour stocker le logo et éviter des appels API répétés
let cachedLogo = null;

const ProductImage = ({ libelle, id, image, layout, containerStyle }) => {
  // État pour l'image de secours et le statut de chargement
  const [fallbackImage, setFallbackImage] = useState(
    '/no-image.svg'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState('');

  // Fonction pour vérifier si une URL semble être une image valide
  const isValidImageUrl = url => {
    if (!url) return false;
    
    // Vérifier si c'est une URL complète
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    
    // Vérifier les extensions d'image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowerUrl = url.toLowerCase();
    return (
      imageExtensions.some(ext => lowerUrl.endsWith(ext)) ||
      lowerUrl.startsWith('data:image')
    );
  };

  // Fonction pour obtenir une image de fallback appropriée
  const getFallbackImage = () => {
    // Utiliser une image SVG générique
    return '/no-image.svg';
  };

  // Récupérer le logo depuis l'API si nécessaire
  useEffect(() => {
    const fetchLogo = async () => {
      // Ne rien faire si le logo est déjà en cache
      if (cachedLogo) {
        setFallbackImage(cachedLogo);
        return;
      }

      setIsLoading(true);
      try {
        const settings = await apiServiceSettings.getSettings();
        if (settings?.logo && settings.logo !== 'blob') {
          cachedLogo = settings.logo; // Stocker le logo dans le cache
          setFallbackImage(settings.logo);
        } else {
          console.warn('[ProductImage] Aucun logo trouvé dans les paramètres.');
          setFallbackImage(getFallbackImage());
        }
      } catch (error) {
        console.error(
          '[ProductImage] Erreur lors de la récupération du logo:',
          error
        );
        // Utiliser l'image de fallback en cas d'erreur
        setFallbackImage(getFallbackImage());
      } finally {
        setIsLoading(false);
      }
    };

    // Déclencher la récupération du logo si aucune image valide n'est fournie ou si l'image a échoué
    if (!image || !isValidImageUrl(image) || imageFailed) {
      fetchLogo();
    }
  }, [image, imageFailed]);

  // Déterminer l'image finale à afficher
  useEffect(() => {
    if (image && isValidImageUrl(image) && !imageFailed) {
      setCurrentImageSrc(image);
    } else {
      setCurrentImageSrc(fallbackImage);
    }
  }, [image, fallbackImage, imageFailed]);

  // Afficher un placeholder pendant le chargement
  if (isLoading && (!image || !isValidImageUrl(image) || imageFailed)) {
    return (
      <div
        style={
          layout === 'grid'
            ? { height: '150px', width: '100%', ...containerStyle }
            : layout === 'list'
            ? {
                height: '100px',
                width: '100px',
                flexShrink: 0,
                ...containerStyle
              }
            : { ...containerStyle }
        }
        className={classNames('position-relative rounded overflow-hidden bg-light d-flex align-items-center justify-content-center', {
          'h-sm-100': layout === 'list'
        })}
      >
        <div className="text-center text-muted">
          <i className="fas fa-image fa-2x mb-2"></i>
          <div className="small">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={
        layout === 'grid'
          ? { height: '150px', width: '100%', ...containerStyle }
          : layout === 'list'
          ? {
              height: '100px',
              width: '100px',
              flexShrink: 0,
              ...containerStyle
            }
          : { ...containerStyle }
      }
      className={classNames('position-relative rounded overflow-hidden', {
        'h-sm-100': layout === 'list'
      })}
    >
      <Image
        rounded
        src={currentImageSrc}
        className="h-100 w-100"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        alt={libelle || 'Image produit'}
        onError={() => {
          console.warn(
            '[ProductImage] Échec du chargement de l\'image:',
            currentImageSrc
          );
          setImageFailed(true);
          // Essayer l'image de fallback
          setCurrentImageSrc(getFallbackImage());
        }}
        onLoad={() => {
          setImageFailed(false);
        }}
      />
    </div>
  );
};

ProductImage.propTypes = {
  libelle: PropTypes.string.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  image: PropTypes.string,
  layout: PropTypes.string.isRequired,
  containerStyle: PropTypes.object
};

export default ProductImage;
