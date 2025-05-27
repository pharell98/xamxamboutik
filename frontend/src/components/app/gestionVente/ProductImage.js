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
    '/assets/img/no-image.png'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Fonction pour vérifier si une URL semble être une image valide
  const isValidImageUrl = url => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowerUrl = url.toLowerCase();
    return (
      imageExtensions.some(ext => lowerUrl.endsWith(ext)) ||
      lowerUrl.startsWith('data:image')
    );
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
        console.log('[ProductImage] Récupération du logo via API...');
        const settings = await apiServiceSettings.getSettings();
        console.log('[ProductImage] Réponse API:', settings);
        if (settings?.logo) {
          cachedLogo = settings.logo; // Stocker le logo dans le cache
          setFallbackImage(settings.logo);
          console.log('[ProductImage] Logo récupéré:', settings.logo);
        } else {
          console.warn('[ProductImage] Aucun logo trouvé dans les paramètres.');
        }
      } catch (error) {
        console.error(
          '[ProductImage] Erreur lors de la récupération du logo:',
          error
        );
        // Conserver l'image statique en cas d'erreur
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
  const finalImageSrc =
    image && isValidImageUrl(image) && !imageFailed ? image : fallbackImage;

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
        className={classNames('position-relative rounded overflow-hidden', {
          'h-sm-100': layout === 'list'
        })}
      >
        <div className="text-center py-5">Chargement...</div>
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
        src={finalImageSrc}
        className="h-100 w-100"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        alt={libelle}
        onError={() => {
          console.warn(
            '[ProductImage] Échec du chargement de l’image:',
            finalImageSrc
          );
          setImageFailed(true); // Marquer l'image comme ayant échoué
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
