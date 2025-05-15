import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const WizardInput = ({
  label,
  name,
  errors,
  type = 'text',
  options = [],
  placeholder,
  formControlProps,
  formGroupProps
}) => {
  if (type === 'select') {
    return (
      <Form.Group {...formGroupProps}>
        <Form.Label>{label}</Form.Label>
        <Form.Select
          {...formControlProps}
          isInvalid={errors[name]}
          isValid={Object.keys(errors).length > 0 && !errors[name]}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors[name]?.message}
        </Form.Control.Feedback>
      </Form.Group>
    );
  }

  return (
    <Form.Group {...formGroupProps}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        {...formControlProps}
        isInvalid={errors[name]}
        isValid={Object.keys(errors).length > 0 && !errors[name]}
      />
      <Form.Control.Feedback type="invalid">
        {errors[name]?.message}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

WizardInput.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  name: PropTypes.string.isRequired,
  errors: PropTypes.object,
  type: PropTypes.string,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  formControlProps: PropTypes.object,
  formGroupProps: PropTypes.object
};

export default WizardInput;
