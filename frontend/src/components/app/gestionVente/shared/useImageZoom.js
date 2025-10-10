import { useState, useCallback } from 'react';

/**
 * Hook pour gérer le zoom des images
 */
const useImageZoom = () => {
  const [zoomModal, setZoomModal] = useState({
    show: false,
    imageSrc: '',
    imageAlt: '',
    title: ''
  });

  const showZoom = useCallback(
    (imageSrc, imageAlt = '', title = 'Aperçu du produit') => {
      setZoomModal({
        show: true,
        imageSrc,
        imageAlt,
        title
      });
    },
    []
  );

  const hideZoom = useCallback(() => {
    setZoomModal(prev => ({
      ...prev,
      show: false
    }));
  }, []);

  return {
    zoomModal,
    showZoom,
    hideZoom
  };
};

export default useImageZoom;
