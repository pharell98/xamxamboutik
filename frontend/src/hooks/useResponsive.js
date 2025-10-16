import { useState, useEffect, useCallback } from 'react';
import { breakpoints } from 'helpers/utils';

/**
 * Hook de responsivité simple et performant
 * Utilise les breakpoints Bootstrap standards
 */
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Gestionnaire de resize optimisé avec debounce
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  useEffect(() => {
    // Initialisation
    handleResize();

    // Debounce pour optimiser les performances
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
  }, [handleResize]);

  const { width } = windowSize;

  // Breakpoints individuels
  const isXs = width < breakpoints.sm; // < 576px
  const isSm = width >= breakpoints.sm && width < breakpoints.md; // 576-767px
  const isMd = width >= breakpoints.md && width < breakpoints.lg; // 768-991px
  const isLg = width >= breakpoints.lg && width < breakpoints.xl; // 992-1199px
  const isXl = width >= breakpoints.xl && width < breakpoints.xxl; // 1200-1539px
  const isXxl = width >= breakpoints.xxl; // >= 1540px

  // Catégories principales
  const isMobile = width < breakpoints.md; // < 768px
  const isTablet = width >= breakpoints.md && width < breakpoints.lg; // 768-991px
  const isDesktop = width >= breakpoints.lg; // >= 992px

  // Helpers supplémentaires
  const isSmallScreen = width < breakpoints.sm; // < 576px
  const isMediumScreen = width >= breakpoints.sm && width < breakpoints.md; // 576-767px
  const isLargeScreen = width >= breakpoints.md && width < breakpoints.lg; // 768-991px
  const isExtraLargeScreen = width >= breakpoints.lg; // >= 992px

  // Orientation
  const isLandscape = windowSize.width > windowSize.height;
  const isPortrait = windowSize.width <= windowSize.height;

  // Breakpoint actuel
  const getCurrentBreakpoint = () => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    return 'xxl';
  };

  // Helper pour obtenir une valeur responsive
  const getResponsiveValue = values => {
    if (typeof values !== 'object') return values;

    const currentBp = getCurrentBreakpoint();
    return (
      values[currentBp] ||
      values.default ||
      (isMobile && values.mobile) ||
      (isTablet && values.tablet) ||
      (isDesktop && values.desktop) ||
      values
    );
  };

  return {
    // Dimensions
    width: windowSize.width,
    height: windowSize.height,
    screenSize: windowSize,

    // Breakpoints individuels
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,

    // Catégories
    isMobile,
    isTablet,
    isDesktop,

    // Helpers
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreen,

    // Orientation
    isLandscape,
    isPortrait,

    // Utilitaires
    getCurrentBreakpoint,
    getResponsiveValue
  };
};

export default useResponsive;
