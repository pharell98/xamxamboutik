import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'react-bootstrap';

const AmountDisplay = ({ label, amount, currency = 'FCFA' }) => (
  <div className="d-flex justify-content-between align-items-center">
    <h5 className="mb-0">{label}</h5>
    <h5 className="mb-0 text-primary">
      {Number(amount || 0).toLocaleString()} {currency}
    </h5>
  </div>
);

const TotalAndValidation = ({
  totalAmount = 0,
  transportFee = '',
  handleSubmit,
  isValid = false,
  isLoading = false,
  buttonText = 'Enregistrer Approvisionnement',
  className = '',
  disableSubmit = false
}) => {
  const amounts = [
    {
      id: 'transport',
      label: 'Frais de transport:',
      amount: transportFee,
      currency: 'FCFA'
    },
    {
      id: 'total',
      label: 'Montant Total:',
      amount: totalAmount,
      currency: 'FCFA'
    }
  ];

  return (
    <div className={`border-top pt-4 mt-4 ${className}`}>
      <Row>
        {amounts.map(({ id, label, amount, currency }) => (
          <Col key={id} md={6} className="mb-3">
            <AmountDisplay label={label} amount={amount} currency={currency} />
          </Col>
        ))}

        <Col xs={12} className="text-end">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || isLoading || disableSubmit}
            className="d-flex align-items-center gap-2 ms-auto"
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                <span>Enregistrement en cours...</span>
              </>
            ) : (
              <span>{buttonText}</span>
            )}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

AmountDisplay.propTypes = {
  label: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string
};

TotalAndValidation.propTypes = {
  totalAmount: PropTypes.number,
  transportFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleSubmit: PropTypes.func.isRequired,
  isValid: PropTypes.bool,
  isLoading: PropTypes.bool,
  buttonText: PropTypes.string,
  className: PropTypes.string,
  disableSubmit: PropTypes.bool
};

export default TotalAndValidation;
