import React, { forwardRef } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ActionInput = forwardRef(
  (
    {
      label,
      name,
      type,
      options,
      placeholder,
      errors,
      formGroupProps,
      formControlProps
    },
    ref
  ) => {
    const error = errors[name];
    const safeOptions = Array.isArray(options) ? options : [];

    return (
      <Form.Group {...formGroupProps}>
        {label && (
          <Form.Label className="fw-medium text-dark">{label}</Form.Label>
        )}
        {type === 'select' ? (
          <Form.Select
            ref={ref}
            name={name}
            isInvalid={!!error}
            {...formControlProps}
            style={{
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            onFocus={e =>
              (e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)')
            }
            onBlur={e =>
              (e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)')
            }
          >
            <option value="">{placeholder}</option>
            {safeOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        ) : (
          <Form.Control
            ref={ref}
            type={type}
            name={name}
            placeholder={placeholder}
            isInvalid={!!error}
            {...formControlProps}
            style={{
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            onFocus={e =>
              (e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)')
            }
            onBlur={e =>
              (e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)')
            }
          />
        )}
        {error && (
          <Form.Control.Feedback type="invalid">
            {error.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  }
);

ActionInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  errors: PropTypes.object.isRequired,
  formGroupProps: PropTypes.object,
  formControlProps: PropTypes.object
};

ActionInput.defaultProps = {
  options: [],
  formGroupProps: {},
  formControlProps: {}
};

export default ActionInput;
