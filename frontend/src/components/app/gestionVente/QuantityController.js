import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, InputGroup } from 'react-bootstrap';
import classNames from 'classnames';

const QuantityController = ({
  quantity,
  handleChange,
  handleIncrease,
  handleDecrease,
  btnClassName,
  max = Infinity
}) => {
  return (
    <InputGroup size="sm" className="align-items-center">
      <Button
        variant="outline-secondary"
        size="sm"
        className={classNames(btnClassName, 'border-300')}
        onClick={handleDecrease}
        disabled={quantity <= 1}
      >
        -
      </Button>
      <Form.Control
        className="text-center px-2 input-spin-none"
        type="number"
        min="1"
        max={max}
        value={quantity}
        onChange={e =>
          handleChange(
            Math.max(1, Math.min(parseInt(e.target.value, 10) || 1, max))
          )
        }
        style={{ width: '25px' }}
      />
      <Button
        variant="outline-secondary"
        size="sm"
        className={classNames(btnClassName, 'border-300')}
        onClick={handleIncrease}
        disabled={quantity >= max}
      >
        +
      </Button>
    </InputGroup>
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
