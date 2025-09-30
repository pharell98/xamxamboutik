import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from 'providers/AppProvider';
import useResponsiveAdvanced from './useResponsiveAdvanced';

/**
 * Hook pour la gestion intelligente du layout responsive
 * avec auto-adaptation selon le contexte et les pages
 * Version corrigée pour éviter les boucles infinies
 */
const useResponsiveLayout = () => {
  const { config, setConfig } = useAppContext();
  const responsive = useResponsiveAdvanced();
  const [layoutState, setLayoutState] = useState({
    sidebarCollapsed: false,
    sidebarVisible: false,
    contentMode: 'normal' // normal, fullscreen, compact
  });

  // Détection des pages nécessitant un layout spécial
  const getPageLayoutConfig = useCallback((pathname) => {
    const isVentePage = pathname.includes('vente') || 
                       pathname.includes('gestion-vente') || 
                       pathname.includes('allSales') ||
                       pathname.includes('customer-details') ||
                       pathname.includes('Products') ||
                       pathname.includes('product-list') ||
                       pathname.includes('product-grid') ||
                       pathname.includes('/dashboard/e-commerce') ||
                       pathname.includes('/gestion-stock/allSales');

    const isInventoryPage = pathname.includes('inventory') ||
                           pathname.includes('stock') ||
                           pathname.includes('approvisionnement');

    const isDashboardPage = pathname.includes('dashboard');

    return {
      isVentePage,
      isInventoryPage,
      isDashboardPage,
      needsFullWidth: isVentePage || isInventoryPage,
      needsCompactLayout: isVentePage && responsive.isMobile,
      shouldAutoCollapse: isVentePage || (isInventoryPage && responsive.isMobile)
    };
  }, [responsive.isMobile]);

  // Configuration automatique du layout (sans dépendances circulaires)
  const autoConfigureLayout = useCallback((pathname) => {
    const pageConfig = getPageLayoutConfig(pathname);
    
    // Utiliser un timeout pour éviter les boucles infinies
    const timeoutId = setTimeout(() => {
      if (pageConfig.shouldAutoCollapse) {
        if (responsive.isMobile) {
          setConfig('showBurgerMenu', false);
          setLayoutState(prev => ({
            ...prev,
            sidebarVisible: false,
            contentMode: 'fullscreen'
          }));
        } else {
          setConfig('isNavbarVerticalCollapsed', true);
          setLayoutState(prev => ({
            ...prev,
            sidebarCollapsed: true,
            contentMode: pageConfig.needsCompactLayout ? 'compact' : 'normal'
          }));
        }
      } else {
        // Restaurer le layout normal pour les autres pages
        if (responsive.isDesktop) {
          setLayoutState(prev => ({
            ...prev,
            sidebarCollapsed: false,
            contentMode: 'normal'
          }));
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [getPageLayoutConfig, responsive.isMobile, responsive.isDesktop, setConfig]);

  // Gestion des changements de taille d'écran
  useEffect(() => {
    const handleScreenChange = () => {
      if (responsive.isMobile) {
        setLayoutState(prev => ({
          ...prev,
          sidebarVisible: false,
          contentMode: 'fullscreen'
        }));
      } else {
        setLayoutState(prev => ({
          ...prev,
          sidebarVisible: true,
          contentMode: 'normal'
        }));
      }
    };

    handleScreenChange();
  }, [responsive.isMobile, responsive.isDesktop]);

  // Classes CSS dynamiques pour le layout
  const layoutClasses = useMemo(() => {
    const classes = ['responsive-layout'];
    
    // Classes de breakpoint
    if (responsive.isMobile) classes.push('layout-mobile');
    if (responsive.isTablet) classes.push('layout-tablet');
    if (responsive.isDesktop) classes.push('layout-desktop');
    
    // Classes de mode
    classes.push(`layout-${layoutState.contentMode}`);
    
    // Classes de sidebar
    if (layoutState.sidebarCollapsed) classes.push('sidebar-collapsed');
    if (layoutState.sidebarVisible) classes.push('sidebar-visible');
    
    // Classes de performance
    if (responsive.isLowEnd) classes.push('low-end-device');
    if (responsive.shouldReduceMotion) classes.push('reduced-motion');
    
    return classes.join(' ');
  }, [responsive, layoutState]);

  // Configuration des colonnes responsive
  const getColumnConfig = useCallback((baseConfig) => {
    if (typeof baseConfig === 'number') {
      return {
        xs: Math.min(baseConfig, 12),
        sm: Math.min(baseConfig, 6),
        md: Math.min(baseConfig, 4),
        lg: baseConfig,
        xl: baseConfig
      };
    }
    
    if (typeof baseConfig === 'object') {
      return {
        xs: baseConfig.xs || 12,
        sm: baseConfig.sm || baseConfig.xs || 6,
        md: baseConfig.md || baseConfig.sm || 4,
        lg: baseConfig.lg || baseConfig.md || 3,
        xl: baseConfig.xl || baseConfig.lg || 3
      };
    }
    
    return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
  }, []);

  // Configuration des espacements responsive
  const getSpacingConfig = useCallback((baseSpacing) => {
    if (typeof baseSpacing === 'number') {
      return {
        mobile: Math.max(baseSpacing * 0.5, 1),
        tablet: Math.max(baseSpacing * 0.75, 2),
        desktop: baseSpacing
      };
    }
    
    if (typeof baseSpacing === 'object') {
      return {
        mobile: baseSpacing.mobile || baseSpacing.xs || 1,
        tablet: baseSpacing.tablet || baseSpacing.sm || 2,
        desktop: baseSpacing.desktop || baseSpacing.lg || 3
      };
    }
    
    return { mobile: 1, tablet: 2, desktop: 3 };
  }, []);

  // Configuration des tailles de police responsive
  const getFontSizeConfig = useCallback((baseSize) => {
    if (typeof baseSize === 'number') {
      return {
        mobile: Math.max(baseSize * 0.875, 12),
        tablet: Math.max(baseSize * 0.9375, 14),
        desktop: baseSize
      };
    }
    
    if (typeof baseSize === 'object') {
      return {
        mobile: baseSize.mobile || baseSize.xs || 12,
        tablet: baseSize.tablet || baseSize.sm || 14,
        desktop: baseSize.desktop || baseSize.lg || 16
      };
    }
    
    return { mobile: 12, tablet: 14, desktop: 16 };
  }, []);

  // Utilitaires de layout
  const layoutUtils = useMemo(() => ({
    // Toggle sidebar
    toggleSidebar: () => {
      if (responsive.isMobile) {
        setConfig('showBurgerMenu', !config.showBurgerMenu);
        setLayoutState(prev => ({
          ...prev,
          sidebarVisible: !prev.sidebarVisible
        }));
      } else {
        setConfig('isNavbarVerticalCollapsed', !config.isNavbarVerticalCollapsed);
        setLayoutState(prev => ({
          ...prev,
          sidebarCollapsed: !prev.sidebarCollapsed
        }));
      }
    },

    // Changer le mode de contenu
    setContentMode: (mode) => {
      setLayoutState(prev => ({
        ...prev,
        contentMode: mode
      }));
    },

    // Obtenir la configuration optimale pour un composant
    getOptimalConfig: (componentType) => {
      const configs = {
        table: {
          mobile: { size: 'sm', striped: true, hover: false },
          tablet: { size: 'sm', striped: true, hover: true },
          desktop: { size: '', striped: true, hover: true }
        },
        card: {
          mobile: { className: 'mb-2' },
          tablet: { className: 'mb-3' },
          desktop: { className: 'mb-4' }
        },
        button: {
          mobile: { size: 'sm' },
          tablet: { size: 'sm' },
          desktop: { size: '' }
        },
        form: {
          mobile: { className: 'mb-2' },
          tablet: { className: 'mb-3' },
          desktop: { className: 'mb-4' }
        }
      };

      const deviceType = responsive.isMobile ? 'mobile' : 
                        responsive.isTablet ? 'tablet' : 'desktop';
      
      return configs[componentType]?.[deviceType] || {};
    }
  }), [responsive, config, setConfig]);

  return {
    // État du layout
    layoutState,
    layoutClasses,
    
    // Configuration automatique
    autoConfigureLayout,
    getPageLayoutConfig,
    
    // Utilitaires
    getColumnConfig,
    getSpacingConfig,
    getFontSizeConfig,
    layoutUtils,
    
    // État responsive
    ...responsive
  };
};

export default useResponsiveLayout;
