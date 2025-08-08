import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, InputGroup } from 'react-bootstrap';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const QuantityController = ({
  quantity,
  handleChange,
  handleIncrease,
  handleDecrease,
  btnClassName,
  max = Infinity
}) => {
  return (
    <div 
      className="quantity-controller-wrapper"
      style={{
        width: '100%',
        maxWidth: '140px',
        minWidth: '120px'
      }}
    >
      <InputGroup 
        size="sm" 
        className="quantity-controller"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <InputGroup.Text 
          as={Button}
          variant="outline-secondary"
          size="sm"
          className={classNames(btnClassName, 'quantity-btn quantity-btn-decrease')}
          onClick={handleDecrease}
          disabled={quantity <= 1}
          style={{
            border: '1px solid #dee2e6',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px 0 0 6px',
            borderRight: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            width: '32px',
            padding: '0.375rem 0.25rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FontAwesomeIcon icon="minus" />
        </InputGroup.Text>
        <Form.Control
          className="quantity-input input-spin-none"
          type="number"
          min="1"
          max={max}
          value={quantity}
          onChange={e =>
            handleChange(
              Math.max(1, Math.min(parseInt(e.target.value, 10) || 1, max))
            )
          }
          style={{
            border: '1px solid #dee2e6',
            textAlign: 'center',
            fontWeight: '600',
            borderRadius: '0',
            borderLeft: 'none',
            borderRight: 'none',
            flex: '1',
            minWidth: '50px',
            maxWidth: '60px',
            padding: '0.375rem 0.5rem',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            appearance: 'none'
          }}
        />
        <InputGroup.Text 
          as={Button}
          variant="outline-secondary"
          size="sm"
          className={classNames(btnClassName, 'quantity-btn quantity-btn-increase')}
          onClick={handleIncrease}
          disabled={quantity >= max}
          style={{
            border: '1px solid #dee2e6',
            backgroundColor: '#f8f9fa',
            borderRadius: '0 6px 6px 0',
            borderLeft: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            width: '32px',
            padding: '0.375rem 0.25rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FontAwesomeIcon icon="plus" />
        </InputGroup.Text>
      </InputGroup>
    </div>
  );
};

QuantityController.propTypes = {
  quantity: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleIncrease: PropTypes.func.isRequired,
  handleDecrease: PropTypes.func.isRequired,
  btnClassName: PropTypes.string,
  max: PropTypes.number
};

export default QuantityController;
