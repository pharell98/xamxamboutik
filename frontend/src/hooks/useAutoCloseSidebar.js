import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from 'providers/AppProvider';

// Auto-collapse the vertical navbar on sales-related pages
export default function useAutoCloseSidebar() {
  const { pathname } = useLocation();
  const { config, setConfig } = useAppContext();

  useEffect(() => {
    const isSalesPage =
      pathname.startsWith('/gestion-stock/product') ||
      pathname.startsWith('/gestion-stock/allSales');

    if (isSalesPage && !config.isNavbarVerticalCollapsed) {
      setConfig('isNavbarVerticalCollapsed', true);
    }
  }, [pathname, config.isNavbarVerticalCollapsed, setConfig]);
}


