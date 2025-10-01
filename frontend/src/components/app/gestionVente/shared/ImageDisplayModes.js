/**
 * Modes d'affichage d'image pour les produits
 * Permet de choisir entre différents styles d'affichage
 */

export const IMAGE_DISPLAY_MODES = {
  CONTAIN: 'contain',    // Affiche l'image entière (recommandé)
  COVER: 'cover',       // Remplit le conteneur (peut rogner)
  FILL: 'fill',         // Étire l'image
  SCALE_DOWN: 'scale-down' // Réduit si nécessaire
};

export const getImageStyle = (mode = IMAGE_DISPLAY_MODES.CONTAIN, customStyle = {}) => {
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-bs-theme') === 'dark';

  const baseStyle = {
    objectPosition: 'center',
    padding: '4px',
    backgroundColor: isDark ? '#2d3748' : '#f8f9fa',
    transition: 'all 0.3s ease',
    ...customStyle
  };

  switch (mode) {
    case IMAGE_DISPLAY_MODES.CONTAIN:
      return {
        ...baseStyle,
        objectFit: 'contain',
        padding: '8px' // Plus de padding pour contain
      };
      
    case IMAGE_DISPLAY_MODES.COVER:
      return {
        ...baseStyle,
        objectFit: 'cover',
        padding: '0px' // Pas de padding pour cover
      };
      
    case IMAGE_DISPLAY_MODES.FILL:
      return {
        ...baseStyle,
        objectFit: 'fill',
        padding: '2px'
      };
      
    case IMAGE_DISPLAY_MODES.SCALE_DOWN:
      return {
        ...baseStyle,
        objectFit: 'scale-down',
        padding: '6px'
      };
      
    default:
      return baseStyle;
  }
};

/**
 * Configuration responsive pour les images
 */
export const getResponsiveImageConfig = (layout) => {
  switch (layout) {
    case 'grid':
      return {
        sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
        loading: 'lazy'
      };
      
    case 'list':
      return {
        sizes: '100px',
        loading: 'lazy'
      };
      
    default:
      return {
        loading: 'lazy'
      };
  }
};
