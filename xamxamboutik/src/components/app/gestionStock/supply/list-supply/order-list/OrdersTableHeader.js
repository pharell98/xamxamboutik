// src/views/OrdersTableHeader.js
import React from 'react';
import IconButton from 'components/common/IconButton';
import { Col, Row } from 'react-bootstrap';
import AdvanceTableSearchBox from 'components/common/advance-table/AdvanceTableSearchBox';

const CustomersTableHeader = () => {
  return (
    <Row className="g-0 flex-between-center">
      <Col xs={4} sm="auto" className="d-flex align-items-center pe-0">
        <Col xs="auto">
          <AdvanceTableSearchBox
            className="input-search-width"
            placeholder="Recherche approvisionnement"
          />
        </Col>
      </Col>
      <Col xs={8} sm="auto" className="ms-auto text-end ps-0">
        <div id="orders-actions">
          <IconButton
            variant="falcon-default"
            size="sm"
            icon="filter"
            transform="shrink-3"
            className="mx-2"
          >
            <span className="d-none d-sm-inline-block ms-1">Filter</span>
          </IconButton>
          <IconButton
            variant="falcon-default"
            size="sm"
            icon="external-link-alt"
            transform="shrink-3"
          >
            <span className="d-none d-sm-inline-block ms-1">Export</span>
          </IconButton>
        </div>
      </Col>
    </Row>
  );
};

export default CustomersTableHeader;
