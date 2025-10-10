import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import logo from 'assets/img/illustrations/falcon.png';
import paths from '../../routes/paths';
import apiServiceSettings from '../../services/api.service.settings';

// Cache global pour éviter les requêtes multiples
let settingsCache = null;
let settingsFetchPromise = null;

const Logo = ({ at = 'auth', width = 58, className, textClass, ...rest }) => {
  const [settings, setSettings] = useState(
    settingsCache || {
      shopName: 'XamXamBoutik',
      logo: null
    }
  );

  useEffect(() => {
    // Si déjà en cache, ne rien faire
    if (settingsCache) {
      setSettings(settingsCache);
      return;
    }

    // Si une requête est en cours, attendre son résultat
    if (settingsFetchPromise) {
      settingsFetchPromise
        .then(data => setSettings(data))
        .catch(() => {});
      return;
    }

    // Sinon, lancer une nouvelle requête
    const fetchSettings = async () => {
      try {
        const data = await apiServiceSettings.getSettings();
        const newSettings = {
          shopName: data.shopName || 'XamXamBoutik',
          logo: data.logo || logo
        };
        settingsCache = newSettings;
        return newSettings;
      } catch (error) {
        console.error('[Logo] Erreur récupération paramètres (une seule fois):', error);
        const defaultSettings = {
          shopName: 'XamXamBoutik',
          logo: logo
        };
        settingsCache = defaultSettings;
        return defaultSettings;
      }
    };

    settingsFetchPromise = fetchSettings();
    settingsFetchPromise
      .then(data => {
        setSettings(data);
        settingsFetchPromise = null;
      })
      .catch(() => {
        settingsFetchPromise = null;
      });
  }, []);

  return (
    <Link
      to={paths.products('product-grid')}
      className={classNames(
        'text-decoration-none',
        { 'navbar-brand text-left': at === 'navbar-vertical' },
        { 'navbar-brand text-left': at === 'navbar-top' }
      )}
      {...rest}
    >
      <div
        className={classNames(
          'd-flex',
          {
            'align-items-center py-3': at === 'navbar-vertical',
            'align-items-center': at === 'navbar-top',
            'flex-center fw-bolder fs-4 mb-4': at === 'auth'
          },
          className
        )}
      >
        <img
          className="me-2"
          src={settings.logo || logo}
          alt="Logo"
          width={width}
        />
        <span className={classNames('font-sans-serif', textClass)}>
          {settings.shopName}
        </span>
      </div>
    </Link>
  );
};

Logo.propTypes = {
  at: PropTypes.oneOf(['navbar-vertical', 'navbar-top', 'auth']),
  width: PropTypes.number,
  className: PropTypes.string,
  textClass: PropTypes.string
};

export default Logo;
