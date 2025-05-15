// src/App.js
import React, { useEffect } from 'react';
import is from 'is_js';
import { Outlet } from 'react-router-dom';
import { Chart as ChartJS, registerables } from 'chart.js';
import SettingsToggle from 'components/settings-panel/SettingsToggle';
import SettingsPanel from 'components/settings-panel/SettingsPanel';
import { useAppContext } from 'providers/AppProvider';
import { ToastProvider } from './components/common/Toast'; // Chemin correct// Importez votre SocketProvider
import 'react-datepicker/dist/react-datepicker.css';
import { StompProvider } from './contexts/StompContext';

ChartJS.register(...registerables);

const App = () => {
  const HTMLClassList = document.getElementsByTagName('html')[0].classList;
  const {
    config: { navbarPosition }
  } = useAppContext();

  useEffect(() => {
    if (is.windows()) {
      HTMLClassList.add('windows');
    }
    if (is.chrome()) {
      HTMLClassList.add('chrome');
    }
    if (is.firefox()) {
      HTMLClassList.add('firefox');
    }
    if (is.safari()) {
      HTMLClassList.add('safari');
    }
  }, [HTMLClassList]);

  useEffect(() => {
    if (navbarPosition === 'double-top') {
      HTMLClassList.add('double-top-nav-layout');
    }
    return () => HTMLClassList.remove('double-top-nav-layout');
  }, [navbarPosition]);

  return (
    <ToastProvider>
      <StompProvider>
        <Outlet />
      </StompProvider>
      <SettingsToggle />
      <SettingsPanel />
    </ToastProvider>
  );
};

export default App;
