import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from 'providers/AppProvider';

/**
 * Hook UNIFIÉ pour la gestion complète de la sidebar
 * Combine :
 * - Fermeture automatique sur pages de vente
 * - Fermeture au scroll sur mobile
 * - Blocage scroll body sur mobile
 */
const useSidebarBehavior = () => {
  const { pathname } = useLocation();
  const { config, setConfig, responsive } = useAppContext();
  const { showBurgerMenu } = config;
  const previousPathRef = useRef(pathname);
  const hasInitializedRef = useRef(false);

  // Liste des pages nécessitant la fermeture auto de la sidebar
  const isVentePage = useCallback(path => {
    return (
      path.includes('vente') ||
      path.includes('gestion-vente') ||
      path.includes('allSales') ||
      path.includes('customer-details') ||
      path.includes('Products') ||
      path.includes('product-list') ||
      path.includes('product-grid') ||
      path.includes('/dashboard/e-commerce') ||
      path.includes('/gestion-stock/allSales')
    );
  }, []);

  // ===== 1. FERMETURE AU SCROLL (Mobile uniquement) =====
  const handleScroll = useCallback(() => {
    if (responsive.isMobile && showBurgerMenu) {
      setConfig('showBurgerMenu', false);
    }
  }, [responsive.isMobile, showBurgerMenu, setConfig]);

  useEffect(() => {
    if (!responsive.isMobile) return;

    // Ajouter event listener scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, responsive.isMobile]);

  // ===== 2. BLOCAGE SCROLL BODY (Mobile quand sidebar ouverte) =====
  useEffect(() => {
    if (!responsive.isMobile) return;

    // Bloquer le scroll du body quand sidebar ouverte
    if (showBurgerMenu) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Nettoyage
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showBurgerMenu, responsive.isMobile]);

  // ===== 3. FERMETURE AUTO SUR PAGES DE VENTE =====
  useEffect(() => {
    const currentIsVentePage = isVentePage(pathname);
    const previousWasVentePage = isVentePage(previousPathRef.current);

    // Ne rien faire si on reste sur le même type de page
    if (
      currentIsVentePage === previousWasVentePage &&
      hasInitializedRef.current
    ) {
      return;
    }

    hasInitializedRef.current = true;

    // Entrer sur une page de vente : fermer/réduire la sidebar
    if (currentIsVentePage) {
      if (responsive.isMobile) {
        // Mobile : fermer le menu burger
        setConfig('showBurgerMenu', false);
      } else if (responsive.isDesktop) {
        // Desktop : réduire la sidebar
        setConfig('isNavbarVerticalCollapsed', true);
      }
    }
    // Quitter une page de vente : restaurer la sidebar si desktop
    else if (previousWasVentePage && responsive.isDesktop) {
      setConfig('isNavbarVerticalCollapsed', false);
    }

    previousPathRef.current = pathname;
  }, [
    pathname,
    responsive.isMobile,
    responsive.isDesktop,
    setConfig,
    isVentePage
  ]);

  return null;
};

export default useSidebarBehavior;
