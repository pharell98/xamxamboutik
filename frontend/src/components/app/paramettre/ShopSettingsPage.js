import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import ShopSettingsForm from './ShopSettingsForm';
import useShopSettings from './useShopSettings';
import PageHeader from '../../common/PageHeader';

const ShopSettingsPage = () => {
  const { selectedSettings, editModeSettings, handleSaveSettings, refreshKey } =
    useShopSettings();

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <PageHeader
            title="Paramètres de la boutique"
            titleTag="h5"
            className="mb-0 text-primary"
          />
          <p className="text-muted mt-2">
            Configurez les informations générales et de contact de votre
            boutique.
          </p>
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
