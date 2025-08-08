import { useState, useEffect } from 'react';

const useImageLoader = (imageUrl, fallbackUrl = '/no-image.svg') => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fonction pour vérifier si une URL semble être une image valide
  const isValidImageUrl = url => {
    if (!url) return false;
    
    // Vérifier si c'est une URL complète
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    
    // Vérifier les extensions d'image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return (
      imageExtensions.some(ext => lowerUrl.endsWith(ext)) ||
      lowerUrl.startsWith('data:image')
    );
  };

  useEffect(() => {
    if (!imageUrl || !isValidImageUrl(imageUrl)) {
      setImageSrc(fallbackUrl);
      setHasError(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(imageUrl);
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      console.warn(`[useImageLoader] Échec du chargement de l'image: ${imageUrl}`);
      setImageSrc(fallbackUrl);
      setIsLoading(false);
      setHasError(true);
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, fallbackUrl]);

  return {
    imageSrc,
    isLoading,
    hasError,
    isValidImageUrl
  };
};

export default useImageLoader;
