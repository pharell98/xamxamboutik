import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Collapse, Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import NavbarVerticalMenuItem from './NavbarVerticalMenuItem';
import { useAppContext } from 'providers/AppProvider';
import localForage from 'localforage';

const CollapseItems = ({ route }) => {
  const { pathname } = useLocation();

  const openCollapse = childrens => {
    const checkLink = children => {
      if (children.to === pathname) {
        return true;
      }
      return (
        Object.prototype.hasOwnProperty.call(children, 'children') &&
        children.children.some(checkLink)
      );
    };
    return childrens.some(checkLink);
  };

  const [open, setOpen] = useState(openCollapse(route.children || []));

  // Vérifier si la route a des enfants valides avant de rendre
  if (!route.children || route.children.length === 0) {
    return null;
  }

  return (
    <Nav.Item as="li">
      <Nav.Link
        onClick={() => setOpen(!open)}
        className={classNames('dropdown-indicator cursor-pointer', {
          'text-500': !route.active
        })}
        aria-expanded={open}
      >
        <NavbarVerticalMenuItem route={route} />
      </Nav.Link>
      <Collapse in={open}>
        <Nav className="flex-column nav" as="ul">
          <NavbarVerticalMenu routes={route.children} />
        </Nav>
      </Collapse>
    </Nav.Item>
  );
};

CollapseItems.propTypes = {
  route: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    children: PropTypes.array,
    active: PropTypes.bool
  }).isRequired
};

const NavbarVerticalMenu = ({ routes }) => {
  const {
    config: { showBurgerMenu },
    setConfig
  } = useAppContext();
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    localForage
      .getItem('userRoles')
      .then(roles => {
        if (roles) {
          setUserRoles(roles);
        }
      })
      .catch(err => {
        console.error('Erreur lors de la récupération des rôles:', err);
      });
  }, []);

  // Vérifier que routes est un tableau valide
  if (!Array.isArray(routes)) {
    console.error('NavbarVerticalMenu: routes prop is not an array', routes);
    return null;
  }

  // Filtrer les routes pour masquer les éléments pour les vendeurs
  const filteredRoutes = routes.filter(route => {
    if (
      userRoles.includes('ROLE_VENDEUR') &&
      !userRoles.includes('ROLE_GESTIONNAIRE')
    ) {
      // Masquer les éléments spécifiques à la gestion de stock et au dashboard
      return ![
        'Dashboard',
        'gestion stock',
        'Approvisionnement',
        'Alertes Stock',
        'ajouter produit',
        'Enregistrer appr.',
        'Utilisateur'
      ].includes(route.name);
    }
    return true;
  });

  const handleNavItemClick = () => {
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
  };

  return filteredRoutes.map(route => {
    const isAlertesStock = route.name === 'Alertes Stock';

    if (!route.children || route.children.length === 0) {
      return (
        <Nav.Item as="li" key={route.name} onClick={handleNavItemClick}>
          <NavLink
            end={route.exact}
            to={route.to}
            target={route?.newtab && '_blank'}
            onClick={() =>
              route.name === 'Modal'
                ? setConfig('openAuthModal', true)
                : undefined
            }
            className={({ isActive }) =>
              classNames('nav-link', {
                active: isActive && route.to !== '#!',
                'text-warning': isAlertesStock
              })
            }
          >
            <NavbarVerticalMenuItem route={route} />
          </NavLink>
        </Nav.Item>
      );
    }
    return <CollapseItems route={route} key={route.name} />;
  });
};

NavbarVerticalMenu.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.shape(NavbarVerticalMenuItem.propTypes))
    .isRequired
};

export default NavbarVerticalMenu;
