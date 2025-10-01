import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Constants
const MIN_QUANTITY = 1;
const BUTTON_WIDTH = '32px';

/**
 * Valide et normalise une quantité
 */
const validateQuantity = (value, max) => {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < MIN_QUANTITY) return MIN_QUANTITY;
  return Math.min(num, max);
};

/**
 * Styles pour les boutons et l'input
 */
const buttonStyle = {
  border: '1px solid #dee2e6',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: BUTTON_WIDTH,
  width: BUTTON_WIDTH,
  padding: '0.375rem 0.25rem',
  transition: 'all 0.2s ease'
};

const inputStyle = {
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
};

const containerStyle = {
  display: 'flex',
  alignItems: 'stretch',
  borderRadius: '6px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

/**
 * Composant de contrôle de quantité avec boutons + et -
 */
const QuantityController = ({
  quantity,
  handleChange,
  max = Infinity,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(quantity.toString());
  const [isEditing, setIsEditing] = useState(false);

  // Synchroniser l'input avec la quantité externe
  useEffect(() => {
    if (!isEditing) {
      setInputValue(quantity.toString());
    }
  }, [quantity, isEditing]);

  const updateQuantity = useCallback(
    newQuantity => {
      const validQuantity = validateQuantity(newQuantity, max);
      setInputValue(validQuantity.toString());
      handleChange(validQuantity);
    },
    [handleChange, max]
  );

  const handleDecrease = useCallback(() => {
    updateQuantity(quantity - 1);
  }, [quantity, updateQuantity]);

  const handleIncrease = useCallback(() => {
    updateQuantity(quantity + 1);
  }, [quantity, updateQuantity]);

  const handleInputChange = useCallback(
    e => {
      const value = e.target.value;
      setInputValue(value);

      if (value !== '') {
        const validQuantity = validateQuantity(value, max);
        if (validQuantity !== quantity) {
          handleChange(validQuantity);
        }
      }
    },
    [handleChange, max, quantity]
  );

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const validQuantity = validateQuantity(inputValue || '1', max);
    setInputValue(validQuantity.toString());
    if (validQuantity !== quantity) {
      handleChange(validQuantity);
    }
  }, [inputValue, handleChange, max, quantity]);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleInputBlur();
      }
    },
    [handleInputBlur]
  );

  const canDecrease = quantity > MIN_QUANTITY && !disabled;
  const canIncrease = quantity < max && !disabled;

  return (
    <div style={{ width: '100%', maxWidth: '140px', minWidth: '120px' }}>
      <InputGroup size="sm" style={containerStyle}>
        {/* Bouton diminuer */}
        <InputGroup.Text
          as={Button}
          variant="outline-secondary"
          onClick={handleDecrease}
          disabled={!canDecrease}
          style={{
            ...buttonStyle,
            borderRadius: '6px 0 0 6px',
            borderRight: 'none'
          }}
        >
          <FontAwesomeIcon icon="minus" />
        </InputGroup.Text>

        {/* Input quantité */}
        <Form.Control
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          style={inputStyle}
        />

        {/* Bouton augmenter */}
        <InputGroup.Text
          as={Button}
          variant="outline-secondary"
          onClick={handleIncrease}
          disabled={!canIncrease}
          style={{
            ...buttonStyle,
            borderRadius: '0 6px 6px 0',
            borderLeft: 'none'
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
  max: PropTypes.number,
  disabled: PropTypes.bool
};

export default QuantityController;
