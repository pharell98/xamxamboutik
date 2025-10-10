import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useCallback
} from 'react';
import PropTypes from 'prop-types';
import { settings } from 'config';
import { getColor, getItemFromStore, breakpoints } from 'helpers/utils';
import useToggleStyle from 'hooks/useToggleStyle';
import useResponsive from 'hooks/useResponsive';
import { configReducer } from 'reducers/configReducer';

export const AppContext = createContext(settings);

const AppProvider = ({ children }) => {
  // Hook de responsivité centralisé
  const responsive = useResponsive();

  const initialIsMobile =
    typeof window !== 'undefined' && window.innerWidth < breakpoints.md;

  const configState = {
    isFluid: initialIsMobile
      ? true
      : getItemFromStore('isFluid', settings.isFluid),
    isRTL: getItemFromStore('isRTL', settings.isRTL),
    isDark: getItemFromStore('isDark', settings.isDark),
    theme: getItemFromStore('theme', settings.theme),
    navbarPosition: getItemFromStore('navbarPosition', settings.navbarPosition),
    disabledNavbarPosition: [],
    isNavbarVerticalCollapsed: getItemFromStore(
      'isNavbarVerticalCollapsed',
      settings.isNavbarVerticalCollapsed
    ),
    navbarStyle: getItemFromStore('navbarStyle', settings.navbarStyle),
    currency: settings.currency,
    showBurgerMenu: settings.showBurgerMenu,
    showSettingPanel: false,
    navbarCollapsed: false,
    openAuthModal: false
  };

  const [config, configDispatch] = useReducer(configReducer, configState);

  // Utiliser useCallback pour que setConfig ne change jamais
  const setConfig = useCallback((key, value) => {
    configDispatch({
      type: 'SET_CONFIG',
      payload: {
        key,
        value,
        setInStore: [
          'isFluid',
          'isRTL',
          'isDark',
          'theme',
          'navbarPosition',
          'isNavbarVerticalCollapsed',
          'navbarStyle'
        ].includes(key)
      }
    });
  }, []);

  const { isLoaded } = useToggleStyle(config.isRTL, config.isDark);

  useEffect(() => {
    const isDark =
      config.theme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : config.theme === 'dark';

    setConfig('isDark', isDark);
  }, [config.theme, setConfig]);

  const changeTheme = useCallback(
    theme => {
      const isDark =
        theme === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : theme === 'dark';

      document.documentElement.setAttribute(
        'data-bs-theme',
        isDark ? 'dark' : 'light'
      );

      setConfig('theme', theme);
      setConfig('isDark', isDark);
    },
    [setConfig]
  );

  const getThemeColor = useCallback(name => getColor(name), []);

  // Gestion automatique de isFluid selon la taille d'écran
  useEffect(() => {
    if (responsive.isMobile && !config.isFluid) {
      setConfig('isFluid', true);
    }
  }, [responsive.isMobile, config.isFluid, setConfig]);

  // Valeur contextuelle enrichie avec responsive
  // IMPORTANT: Ne pas mettre config dans les dépendances du useMemo
  // car il change à chaque setConfig, ce qui causerait des boucles infinies
  const contextValue = useMemo(
    () => ({
      config,
      setConfig,
      configDispatch,
      changeTheme,
      getThemeColor,
      // Ajout du responsive dans le contexte
      responsive
    }),
    [config, setConfig, configDispatch, changeTheme, getThemeColor, responsive]
  );

  if (!isLoaded) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: config.isDark
            ? getThemeColor('dark')
            : getThemeColor('light')
        }}
      />
    );
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

AppProvider.propTypes = { children: PropTypes.node };

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
