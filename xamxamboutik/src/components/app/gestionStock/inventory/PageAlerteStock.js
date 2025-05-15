// src/components/PageAlerteStock.js
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import RuptureStock from './RuptureStock';
import PageHeader from '../../../common/PageHeader';

const PageAlerteStock = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col md={12}>
          <PageHeader
            title="Liste produit Rupture/Faible Stock"
            titleTag="h5"
            className="mb-3"
          />
          <RuptureStock />
        </Col>
      </Row>
    </Container>
  );
};

export default PageAlerteStock;
