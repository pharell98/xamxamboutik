import React from 'react';
import { Card } from 'react-bootstrap';
import { useAppContext } from 'providers/AppProvider';
import Sales from './Sales';

const SaleList = () => {
  const {
    config: { isDark }
  } = useAppContext();
  return (
    <Card.Body className={`p-0 ${isDark ? 'bg-dark text-light' : ''}`}>
      <Sales />
    </Card.Body>
  );
};

export default SaleList;
