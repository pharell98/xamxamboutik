// src/components/PageAlerteStock.js
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import RuptureStock from './RuptureStock';
import PageHeader from '../../../common/PageHeader';

const PageAlerteStock = () => {
  return (
    <div className="inventory-mobile">
      <Container fluid className="px-0 px-md-2">
        <Row className="mb-2 mb-md-3 g-0">
          <Col xs={12}>
            <PageHeader
              title="Liste produit Rupture/Faible Stock"
              titleTag="h5"
              className="mb-2 mb-md-3 px-2"
            />
            <RuptureStock />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PageAlerteStock;
