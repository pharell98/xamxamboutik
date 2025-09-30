import { useState, useEffect, useCallback, useMemo } from 'react';
import { breakpoints } from 'helpers/utils';

/**
 * Hook de responsivité avancé avec gestion optimisée des performances
 * et détection intelligente des breakpoints
 */
const useResponsiveAdvanced = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const [isClient, setIsClient] = useState(false);

  // Détection du type d'appareil
  const deviceType = useMemo(() => {
    if (!isClient) return 'unknown';
    
    const { width } = screenSize;
    if (width < breakpoints.sm) return 'mobile';
    if (width < breakpoints.md) return 'mobile-large';
    if (width < breakpoints.lg) return 'tablet';
    if (width < breakpoints.xl) return 'desktop';
    if (width < breakpoints.xxl) return 'desktop-large';
    return 'desktop-ultra';
  }, [screenSize, isClient]);

  // Détection de l'orientation
  const orientation = useMemo(() => {
    if (!isClient) return 'unknown';
    return screenSize.width > screenSize.height ? 'landscape' : 'portrait';
  }, [screenSize, isClient]);

  // Breakpoints booléens
  const breakpointFlags = useMemo(() => ({
    isXs: screenSize.width < breakpoints.sm,
    isSm: screenSize.width >= breakpoints.sm && screenSize.width < breakpoints.md,
    isMd: screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg,
    isLg: screenSize.width >= breakpoints.lg && screenSize.width < breakpoints.xl,
    isXl: screenSize.width >= breakpoints.xl && screenSize.width < breakpoints.xxl,
    isXxl: screenSize.width >= breakpoints.xxl,
    
    // Aliases pour compatibilité
    isMobile: screenSize.width < breakpoints.md,
    isTablet: screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg,
    isDesktop: screenSize.width >= breakpoints.lg,
    
    // Breakpoints spécifiques
    isSmallScreen: screenSize.width < breakpoints.sm,
    isMediumScreen: screenSize.width >= breakpoints.sm && screenSize.width < breakpoints.md,
    isLargeScreen: screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg,
    isExtraLargeScreen: screenSize.width >= breakpoints.lg
  }), [screenSize]);

  // Détection des capacités de l'appareil
  const capabilities = useMemo(() => {
    if (!isClient) return {};
    
    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hasHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
      hasDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      isRetina: window.devicePixelRatio > 1,
      isLowEnd: navigator.hardwareConcurrency <= 2
    };
  }, [isClient]);

  // Gestionnaire de redimensionnement optimisé
  const handleResize = useCallback(() => {
    const newSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    setScreenSize(prevSize => {
      // Éviter les re-renders inutiles
      if (prevSize.width === newSize.width && prevSize.height === newSize.height) {
        return prevSize;
      }
      return newSize;
    });
  }, []);

  // Détection du client (SSR)
  useEffect(() => {
    setIsClient(true);
    handleResize();
  }, [handleResize]);

  // Event listener optimisé
  useEffect(() => {
    if (!isClient) return;

    let timeoutId;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedHandleResize, { passive: true });
    window.addEventListener('orientationchange', debouncedHandleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', debouncedHandleResize);
    };
  }, [isClient, handleResize]);

  // Utilitaires de responsive
  const responsive = useMemo(() => ({
    // Classes CSS conditionnelles
    getClasses: (classes) => {
      if (typeof classes === 'string') return classes;
      if (typeof classes === 'object') {
        return Object.entries(classes)
          .filter(([breakpoint, value]) => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') return breakpointFlags[breakpoint];
            return false;
          })
          .map(([, value]) => value)
          .join(' ');
      }
      return '';
    },

    // Media queries dynamiques
    matches: (query) => {
      if (!isClient) return false;
      return window.matchMedia(query).matches;
    },

    // Breakpoint actuel
    currentBreakpoint: () => {
      const { width } = screenSize;
      if (width < breakpoints.sm) return 'xs';
      if (width < breakpoints.md) return 'sm';
      if (width < breakpoints.lg) return 'md';
      if (width < breakpoints.xl) return 'lg';
      if (width < breakpoints.xxl) return 'xl';
      return 'xxl';
    },

    // Configuration responsive
    getConfig: (config) => {
      if (typeof config === 'function') {
        return config(breakpointFlags, deviceType, capabilities);
      }
      if (typeof config === 'object') {
        // Chercher la configuration pour le breakpoint actuel
        const current = responsive.currentBreakpoint();
        return config[current] || config.default || config;
      }
      return config;
    }
  }), [breakpointFlags, deviceType, capabilities, screenSize, isClient]);

  return {
    // État de base
    screenSize,
    deviceType,
    orientation,
    isClient,
    
    // Breakpoints
    ...breakpointFlags,
    
    // Capacités
    capabilities,
    
    // Utilitaires
    responsive,
    
    // Helpers
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    
    // Performance
    isLowEnd: capabilities.isLowEnd,
    shouldReduceMotion: capabilities.hasReducedMotion
  };
};

export default useResponsiveAdvanced;
