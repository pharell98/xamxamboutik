import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import logo from 'assets/img/illustrations/falcon.png';
import paths from '../../routes/paths';
import apiServiceSettings from '../../services/api.service.settings';

const Logo = ({ at = 'auth', width = 58, className, textClass, ...rest }) => {
  const [settings, setSettings] = useState({
    shopName: 'XamXamBoutik',
    logo: null
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiServiceSettings.getSettings();
        setSettings({
          shopName: data.shopName || 'XamXamBoutik',
          logo: data.logo || logo
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error);
      }
    };
    fetchSettings();
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
