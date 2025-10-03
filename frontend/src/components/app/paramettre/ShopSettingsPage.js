import React from 'react';
import { Col, Container, Row, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faStore,
  faInfoCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import ShopSettingsForm from './ShopSettingsForm';
import useShopSettings from './useShopSettings';
import PageHeader from '../../common/PageHeader';
import Background from '../../common/Background';
import corner4 from '../../../assets/img/illustrations/corner-4.png';

const ShopSettingsPage = () => {
  const {
    selectedSettings,
    editModeSettings,
    handleSaveSettings,
    refreshKey,
    isLoading
  } = useShopSettings();

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow-sm border-0 rounded-3 text-center p-5">
              <div className="mb-4">
                <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-primary fa-spin"
                    style={{ fontSize: '2rem' }}
                  />
                </div>
                <h5 className="text-primary fw-bold mb-2">
                  Chargement des paramètres
                </h5>
                <p className="text-muted mb-0">
                  Récupération des informations de votre boutique...
                </p>
              </div>
              <Spinner animation="border" variant="primary" />
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
            <Background
              image={corner4}
              className="bg-card d-none d-sm-block"
              style={{
                borderTopRightRadius: '0.375rem',
                borderBottomRightRadius: '0.375rem'
              }}
            />
            <Card.Body className="position-relative p-3">
              <Row className="align-items-center">
                <Col lg={8}>
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-2">
                      <FontAwesomeIcon
                        icon={faCog}
                        className="text-primary"
                        style={{ width: '18px', height: '18px' }}
                      />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold text-primary">
                        Paramètres de la boutique
                      </h5>
                      <small className="text-muted">
                        Gérez les informations de votre boutique
                      </small>
                    </div>
                  </div>
                </Col>
                <Col lg={4} className="text-lg-end">
                  <div className="d-flex align-items-center justify-content-lg-end">
                    <FontAwesomeIcon
                      icon={faStore}
                      className="text-success me-1"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <small className="text-success fw-semibold">
                      {editModeSettings
                        ? 'Configuration active'
                        : 'Nouvelle configuration'}
                    </small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col xs={12}>
          <ShopSettingsForm
            initialValues={selectedSettings}
            onSubmit={handleSaveSettings}
            isEditMode={editModeSettings}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ShopSettingsPage;
