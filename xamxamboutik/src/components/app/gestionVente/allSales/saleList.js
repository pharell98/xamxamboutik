import React from 'react';
import { Card } from 'react-bootstrap';
import Sales from './Sales';

const SaleList = () => {
  return (
    <Card.Body className="p-0">
      <Sales />
    </Card.Body>
  );
};

export default SaleList;
