import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Offcanvas, Button, ButtonGroup, Form } from 'react-bootstrap';
import defaultModeImg from 'assets/img/generic/falcon-mode-default.jpg';
import darkModeImg from 'assets/img/generic/falcon-mode-dark.jpg';
import autoModeImg from 'assets/img/generic/falcon-mode-auto.jpg';
import invertedImg from 'assets/img/generic/inverted.png';
import cardImg from 'assets/img/generic/card.png';
import vibrantImg from 'assets/img/generic/vibrant.png';
import transparentImg from 'assets/img/generic/default.png';
import leftArrowFromLeft from 'assets/img/icons/left-arrow-from-left.svg';
import arrowsH from 'assets/img/icons/arrows-h.svg';
import paragraph from 'assets/img/icons/paragraph.svg';
import Flex from 'components/common/Flex';
import RadioItem from './RadioItem';
import { useAppContext } from 'providers/AppProvider';
import { useLocation } from 'react-router-dom';

const SettingsPanel = () => {
  const { pathname } = useLocation();
  const {
    config: {
      isFluid,
      isRTL,
      theme,
      navbarPosition,
      navbarStyle,
      showSettingPanel,
      disabledNavbarPosition
    },
    setConfig,
    changeTheme,
    configDispatch
  } = useAppContext();

  const [navbars] = useState([
    {
      name: 'transparent',
      image: transparentImg
    },
    {
      name: 'inverted',
      image: invertedImg
    },
    {
      name: 'card',
      image: cardImg
    },
    {
      name: 'vibrant',
      image: vibrantImg
    }
  ]);

  return (
    <Offcanvas
      show={showSettingPanel}
      onHide={() => setConfig('showSettingPanel', false)}
      placement="end"
      style={{ maxWidth: '22rem' }}
      className="border-0"
    >
      <Offcanvas.Header
        closeButton
        closeVariant="white"
        className="bg-shape settings-panel-header"
      >
        <Offcanvas.Title as="div" className="py-1 z-1 light">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h5 className="text-white">
              <FontAwesomeIcon icon="palette" className="me-2 fs-9" />
              Paramètre
            </h5>
            <Button
              variant="primary"
              size="sm"
              className="rounded-pill mt-0 mb-0"
              style={{ fontSize: '12px' }}
              onClick={() => {
                configDispatch({ type: 'RESET' });
              }}
            >
              <FontAwesomeIcon
                icon="redo-alt"
                style={{ fontSize: '10px' }}
                className="me-1"
              />
              Reset
            </Button>
          </div>
        </Offcanvas.Title>
      </Offcanvas.Header>
      {/* <ScrollBarCustom> */}
      <Offcanvas.Body className="scrollbar">
        <h5 className="fs-9">Schéma de couleurs</h5>
        <p className="fs-10">
          Choisissez le mode de couleurs idéal pour votre application.
        </p>
        <ButtonGroup className="btn-group-navbar-style">
          <RadioItem
            name="theme-mode"
            label="light"
            active={theme === 'light'}
            onChange={() => changeTheme('light')}
            image={defaultModeImg}
          />
          <RadioItem
            name="theme-mode"
            label="dark"
            active={theme === 'dark'}
            onChange={() => changeTheme('dark')}
            image={darkModeImg}
          />
          <RadioItem
            name="theme-mode"
            label="auto"
            active={theme === 'auto'}
            onChange={() => changeTheme('auto')}
            image={autoModeImg}
          />
        </ButtonGroup>
        <hr />
        <Flex justifyContent="between">
          <img
            src={leftArrowFromLeft}
            alt=""
            width={20}
            className="me-2 h-100"
          />
          <div className="flex-1">
            <h5 className="fs-9">RTL Mode</h5>
            <p className="fs-10 mb-0">Switch your language direction </p>
          </div>
          <Form.Check
            type="switch"
            id="rtl-switch"
            checked={isRTL}
            onChange={({ target }) => setConfig('isRTL', target.checked)}
          />
        </Flex>
        <hr />

        <Flex justifyContent="between">
          <img src={arrowsH} alt="" width={20} className="me-2 h-100" />
          <div className="flex-1">
            <h5 className="fs-9">Fluid Layout</h5>
            <p className="fs-10 mb-0">Toggle container layout system</p>
          </div>
          <Form.Check
            type="switch"
            id="fluid-mode-switch"
            checked={isFluid}
            onChange={({ target }) => setConfig('isFluid', target.checked)}
          />
        </Flex>
        <hr />

        <Flex>
          <img src={paragraph} alt="" width={20} className="me-2 h-100" />
          <div>
            <Flex alignItems="center" tag="h5" className="fs-9">
              Position de la navigation
            </Flex>
            <p className="fs-10 mb-2">
              Sélectionnez un système de navigation adapté à votre application
              web
            </p>
            {pathname.includes('landing') ||
            pathname.includes('authentication') ? (
              <p className="text-warning fs-10">
                You can't update the navigation position on this page
              </p>
            ) : pathname.includes('layouts') ? (
              <p className="text-warning fs-10">
                You can't update the navigation position on an example page
              </p>
            ) : (
              <Form.Select
                className="mb-3"
                size="sm"
                defaultValue={navbarPosition}
                onChange={({ target }) =>
                  setConfig('navbarPosition', target.value)
                }
              >
                {['vertical', 'double-top'].map(option => (
                  <option
                    key={option}
                    disabled={disabledNavbarPosition.includes(option)}
                    value={option}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </Form.Select>
            )}
          </div>
        </Flex>

        <hr />
        <h5 className="fs-9 d-flex align-items-center">
          Vertical Navbar Style{' '}
        </h5>
        <p className="fs-10">Switch between styles for your vertical navbar</p>
        <ButtonGroup className="btn-group-navbar-style">
          {navbars.slice(0, 2).map(item => (
            <RadioItem
              key={item.name}
              name="navbar-style"
              label={item.name}
              active={navbarStyle === item.name}
              onChange={() => setConfig('navbarStyle', item.name)}
              image={item.image}
            />
          ))}
        </ButtonGroup>
        <ButtonGroup className="btn-group-navbar-style">
          {navbars.slice(2, 4).map(item => (
            <RadioItem
              key={item.name}
              name="navbar-style"
              label={item.name}
              active={navbarStyle === item.name}
              onChange={() => setConfig('navbarStyle', item.name)}
              image={item.image}
            />
          ))}
        </ButtonGroup>
        <hr />
      </Offcanvas.Body>
      {/* </ScrollBarCustom> */}
    </Offcanvas>
  );
};

export default SettingsPanel;
