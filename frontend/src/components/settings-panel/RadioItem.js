import PropTypes from 'prop-types';
import React from 'react';

import classNames from 'classnames';
import { Button, Form } from 'react-bootstrap';

const RadioItem = ({ name, label, active = false, onChange, image }) => {
  return (
    <Button 
      variant="theme-default" 
      className={classNames('p-1 p-sm-2', { active: active })}
      style={{ borderRadius: 8 }}
    >
      <Form.Label
        htmlFor={`${name}-${label}`}
        className="cursor-pointer hover-overlay d-block"
        style={{ marginBottom: 4 }}
      >
        <img className="w-100" src={image} alt="" style={{ borderRadius: 6 }} />
      </Form.Label>
      <Form.Check
        type="radio"
        id={`${name}-${label}`}
        label={<span className="fs-10 fs-sm-9">{label.charAt(0).toUpperCase() + label.slice(1)}</span>}
        name={name}
        onChange={onChange}
        checked={active}
      />
    </Button>
  );
};

RadioItem.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  image: PropTypes.string.isRequired
};

export default RadioItem;
