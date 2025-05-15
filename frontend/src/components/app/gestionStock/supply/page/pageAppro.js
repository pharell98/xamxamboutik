import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import PageHeader from 'components/common/PageHeader';
import OrdersWithDetails from '../list-supply/order-list/OrdersWithDetails';
import ApproDetail from '../add-supply/ApproDetail';

const PageAppro = () => {
  const methods = useForm({
    defaultValues: {
      products: [] // Initialisation des valeurs par défaut
    }
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <FormProvider {...methods}>
      <PageHeader
        title="Enregistrer Approvisionnement et liste"
        titleTag="h5"
        className="mb-3"
      />
      <Row className="mb-3">
        <Col md={6}>
          <ApproDetail selectedProduct={selectedProduct} />
        </Col>
        <Col md={6}>
          <OrdersWithDetails setSelectedProduct={setSelectedProduct} />
        </Col>
      </Row>
    </FormProvider>
  );
};

export default PageAppro;
