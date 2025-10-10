import React, { Fragment, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Col, Nav, Navbar, Row } from 'react-bootstrap';
import { navbarBreakPoint, topNavbarBreakpoint } from 'config';
import Flex from 'components/common/Flex';
import Logo from 'components/common/Logo';
import NavbarVerticalMenu from './NavbarVerticalMenu';
import ToggleButton from './ToggleButton';
import routes from 'routes/siteMaps';
import { capitalize } from 'helpers/utils';
import bgNavbar from 'assets/img/generic/bg-navbar.png';
import { useAppContext } from 'providers/AppProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NavbarVertical = () => {
  const {
    config: {
      navbarPosition,
      navbarStyle,
      isNavbarVerticalCollapsed,
      showBurgerMenu
    },
    setConfig,
    responsive
  } = useAppContext();

  const HTMLClassList = document.getElementsByTagName('html')[0].classList;

  useEffect(() => {
    if (isNavbarVerticalCollapsed) {
      HTMLClassList.add('navbar-vertical-collapsed');
    } else {
      HTMLClassList.remove('navbar-vertical-collapsed');
    }
    return () => {
      HTMLClassList.remove('navbar-vertical-collapsed-hover');
    };
  }, [isNavbarVerticalCollapsed, HTMLClassList]);

  let time = null;
  const handleMouseEnter = () => {
    if (isNavbarVerticalCollapsed) {
      time = setTimeout(() => {
        HTMLClassList.add('navbar-vertical-collapsed-hover');
      }, 100);
    }
  };
  const handleMouseLeave = () => {
    clearTimeout(time);
    HTMLClassList.remove('navbar-vertical-collapsed-hover');
  };

  const NavbarLabel = ({ label, labelIcon }) => (
    <Nav.Item as="li">
      <Row className="mt-3 mb-2 navbar-vertical-label-wrapper">
        <Col xs="auto" className="navbar-vertical-label navbar-vertical-label">
          {labelIcon && <FontAwesomeIcon icon={labelIcon} className="me-2" />}
          {label}
        </Col>
        <Col className="ps-0">
          <hr className="mb-0 navbar-vertical-divider"></hr>
        </Col>
      </Row>
    </Nav.Item>
  );

  // Fermer la sidebar quand on clique sur le backdrop (mobile uniquement)
  const handleBackdropClick = useCallback(() => {
    if (responsive.isMobile && showBurgerMenu) {
      setConfig('showBurgerMenu', false);
    }
  }, [responsive.isMobile, showBurgerMenu, setConfig]);

  return (
    <>
      {/* Backdrop pour mobile - clic pour fermer */}
      {responsive.isMobile && showBurgerMenu && (
        <div
          className="navbar-vertical-backdrop"
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1019,
            cursor: 'pointer',
            transition: 'opacity 0.3s ease-out'
          }}
        />
      )}

      <Navbar
        expand={navbarBreakPoint}
        className={classNames('navbar-vertical', {
          [`navbar-${navbarStyle}`]: navbarStyle !== 'transparent'
        })}
        variant="light"
      >
        <Flex alignItems="center">
          <ToggleButton />
          <Logo at="navbar-vertical" textClass="text-primary" width={30} />
        </Flex>
        <Navbar.Collapse
          in={showBurgerMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            backgroundImage:
              navbarStyle === 'vibrant'
                ? `linear-gradient(-45deg, rgba(0, 160, 255, 0.86), #0048a2),url(${bgNavbar})`
                : 'none'
          }}
        >
          <div className="navbar-vertical-content scrollbar">
            <Nav className="flex-column" as="ul">
              {routes.map(route => (
                <Fragment key={route.label}>
                  {!route.labelDisable && (
                    <NavbarLabel
                      label={capitalize(route.label)}
                      labelIcon={route.labelIcon}
                    />
                  )}
                  <NavbarVerticalMenu routes={route.children} />
                </Fragment>
              ))}
            </Nav>

            {navbarPosition === 'combo' && (
              <div className={`d-${topNavbarBreakpoint}-none`}>
                <div className="navbar-vertical-divider">
                  <hr className="navbar-vertical-hr my-2" />
                </div>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

NavbarVertical.propTypes = {
  label: PropTypes.string
};

export default NavbarVertical;
