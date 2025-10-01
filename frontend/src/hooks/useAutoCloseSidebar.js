import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from 'providers/AppProvider';

const useAutoCloseSidebar = () => {
  const { pathname } = useLocation();
  const { config, setConfig } = useAppContext();
  const previousPathRef = useRef(pathname);
  const autoClosedRef = useRef(false);

  // Ce hook ferme automatiquement la sidebar sur les pages de vente
  // mais permet toujours l'ouverture manuelle via les boutons toggle

  useEffect(() => {
    // Vérifier si on est sur une page de vente
    const isVentePage =
      pathname.includes('vente') ||
      pathname.includes('gestion-vente') ||
      pathname.includes('allSales') ||
      pathname.includes('customer-details') ||
      pathname.includes('Products') ||
      pathname.includes('product-list') ||
      pathname.includes('product-grid') ||
      pathname.includes('/dashboard/e-commerce') ||
      pathname.includes('/gestion-stock/allSales');

    const wasVentePage =
      previousPathRef.current.includes('vente') ||
      previousPathRef.current.includes('gestion-vente') ||
      previousPathRef.current.includes('allSales') ||
      previousPathRef.current.includes('customer-details') ||
      previousPathRef.current.includes('Products') ||
      previousPathRef.current.includes('product-list') ||
      previousPathRef.current.includes('product-grid') ||
      previousPathRef.current.includes('/dashboard/e-commerce') ||
      previousPathRef.current.includes('/gestion-stock/allSales');

    // Fermer automatiquement la sidebar si on entre sur une page de vente
    // Note: Les boutons toggle peuvent toujours ouvrir/fermer manuellement
    if (isVentePage && !wasVentePage) {
      // Sur mobile, fermer le menu burger
      if (window.innerWidth < 768) {
        setConfig('showBurgerMenu', false);
        autoClosedRef.current = true;
      }

      // Sur desktop, réduire la sidebar si elle est étendue
      if (window.innerWidth >= 768 && !config.isNavbarVerticalCollapsed) {
        setConfig('isNavbarVerticalCollapsed', true);
        autoClosedRef.current = true;
      }
    }

    // Réinitialiser le flag quand on change de page
    if (!isVentePage && wasVentePage) {
      autoClosedRef.current = false;
    }

    previousPathRef.current = pathname;
  }, [pathname, setConfig, config.isNavbarVerticalCollapsed]);

  // Écouter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const isVentePage =
        pathname.includes('vente') ||
        pathname.includes('gestion-vente') ||
        pathname.includes('allSales') ||
        pathname.includes('customer-details') ||
        pathname.includes('Products') ||
        pathname.includes('product-list') ||
        pathname.includes('product-grid') ||
        pathname.includes('/dashboard/e-commerce') ||
        pathname.includes('/gestion-stock/allSales');

      if (isVentePage) {
        if (window.innerWidth < 768) {
          setConfig('showBurgerMenu', false);
          autoClosedRef.current = true;
        } else if (window.innerWidth >= 768) {
          setConfig('isNavbarVerticalCollapsed', true);
          autoClosedRef.current = true;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname, setConfig]);

  // Pour le débogage (optionnel) - peut être supprimé en production
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const isVentePage =
        pathname.includes('vente') ||
        pathname.includes('gestion-vente') ||
        pathname.includes('allSales') ||
        pathname.includes('customer-details') ||
        pathname.includes('Products') ||
        pathname.includes('product-list') ||
        pathname.includes('product-grid') ||
        pathname.includes('/dashboard/e-commerce') ||
        pathname.includes('/gestion-stock/allSales');

      if (isVentePage) {
        console.log('🔄 Auto-close sidebar: Page de vente détectée');
      }
    }
  }, [pathname]);

  return null;
};

export default useAutoCloseSidebar;
