import React, { createContext, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useResponsiveLayout from 'hooks/useResponsiveLayout';
import { useLocation } from 'react-router-dom';

// Contexte pour la responsivité
const ResponsiveContext = createContext();

/**
 * Provider pour la gestion globale de la responsivité
 * Version corrigée pour éviter les boucles infinies
 */
const ResponsiveProvider = ({ children }) => {
  const responsive = useResponsiveLayout();
  const location = useLocation();
  const lastPathnameRef = useRef(location.pathname);
  const isConfiguringRef = useRef(false);

  // Configuration automatique du layout selon la page (avec protection contre les boucles)
  useEffect(() => {
    // Éviter les re-configurations inutiles
    if (
      lastPathnameRef.current === location.pathname ||
      isConfiguringRef.current
    ) {
      return;
    }

    lastPathnameRef.current = location.pathname;
    isConfiguringRef.current = true;

    // Utiliser un timeout pour éviter les boucles infinies
    const timeoutId = setTimeout(() => {
      try {
        responsive.autoConfigureLayout(location.pathname);
      } catch (error) {
        console.warn(
          'Erreur lors de la configuration automatique du layout:',
          error
        );
      } finally {
        isConfiguringRef.current = false;
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      isConfiguringRef.current = false;
    };
  }, [location.pathname]); // Seulement pathname comme dépendance

  // Valeurs du contexte
  const contextValue = {
    ...responsive,
    // Méthodes utilitaires globales
    getResponsiveValue: values => {
      if (typeof values === 'function') {
        return values(responsive);
      }
      if (typeof values === 'object') {
        if (responsive.isMobile)
          return values.mobile || values.xs || values.default;
        if (responsive.isTablet)
          return values.tablet || values.sm || values.default;
        if (responsive.isDesktop)
          return values.desktop || values.lg || values.default;
        return values.default;
      }
      return values;
    },

    // Configuration des composants
    getComponentConfig: (componentType, customConfig = {}) => {
      const baseConfigs = {
        table: {
          mobile: {
            size: 'sm',
            striped: true,
            hover: false,
            className: 'table-mobile'
          },
          tablet: {
            size: 'sm',
            striped: true,
            hover: true,
            className: 'table-tablet'
          },
          desktop: {
            size: '',
            striped: true,
            hover: true,
            className: 'table-desktop'
          }
        },
        card: {
          mobile: {
            className: 'mb-2 card-mobile',
            style: { borderRadius: 0 }
          },
          tablet: {
            className: 'mb-3 card-tablet',
            style: { borderRadius: '0.375rem' }
          },
          desktop: {
            className: 'mb-4 card-desktop',
            style: { borderRadius: '0.5rem' }
          }
        },
        button: {
          mobile: {
            size: 'sm',
            className: 'btn-mobile'
          },
          tablet: {
            size: 'sm',
            className: 'btn-tablet'
          },
          desktop: {
            size: '',
            className: 'btn-desktop'
          }
        },
        form: {
          mobile: {
            className: 'mb-2 form-mobile'
          },
          tablet: {
            className: 'mb-3 form-tablet'
          },
          desktop: {
            className: 'mb-4 form-desktop'
          }
        },
        modal: {
          mobile: {
            className: 'modal-mobile',
            style: { margin: '0.5rem' }
          },
          tablet: {
            className: 'modal-tablet',
            style: { margin: '1rem' }
          },
          desktop: {
            className: 'modal-desktop',
            style: { margin: '1.75rem' }
          }
        }
      };

      const deviceType = responsive.isMobile
        ? 'mobile'
        : responsive.isTablet
        ? 'tablet'
        : 'desktop';

      const baseConfig = baseConfigs[componentType]?.[deviceType] || {};

      return {
        ...baseConfig,
        ...customConfig
      };
    },

    // Configuration des breakpoints
    getBreakpointConfig: config => {
      if (typeof config === 'function') {
        return config(responsive);
      }

      if (typeof config === 'object') {
        const currentBreakpoint = responsive.responsive.currentBreakpoint();
        return config[currentBreakpoint] || config.default || config;
      }

      return config;
    },

    // Classes CSS conditionnelles
    getConditionalClasses: classes => {
      if (typeof classes === 'string') return classes;

      if (typeof classes === 'object') {
        return Object.entries(classes)
          .filter(([condition, value]) => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
              // Évaluer les conditions
              switch (condition) {
                case 'mobile':
                  return responsive.isMobile;
                case 'tablet':
                  return responsive.isTablet;
                case 'desktop':
                  return responsive.isDesktop;
                case 'xs':
                  return responsive.isXs;
                case 'sm':
                  return responsive.isSm;
                case 'md':
                  return responsive.isMd;
                case 'lg':
                  return responsive.isLg;
                case 'xl':
                  return responsive.isXl;
                case 'xxl':
                  return responsive.isXxl;
                case 'landscape':
                  return responsive.isLandscape;
                case 'portrait':
                  return responsive.isPortrait;
                case 'touch':
                  return responsive.capabilities.hasTouch;
                case 'hover':
                  return responsive.capabilities.hasHover;
                case 'lowEnd':
                  return responsive.isLowEnd;
                case 'reducedMotion':
                  return responsive.shouldReduceMotion;
                default:
                  return false;
              }
            }
            return false;
          })
          .map(([, value]) => value)
          .join(' ');
      }

      return '';
    }
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte responsive
 */
const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

// PropTypes
ResponsiveProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { ResponsiveProvider, useResponsive };
export default ResponsiveProvider;
