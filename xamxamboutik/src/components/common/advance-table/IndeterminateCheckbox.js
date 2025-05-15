import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, className, onChange, checked, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <Form.Check
        type="checkbox"
        className={classNames(
          'form-check mb-0 d-flex align-items-center',
          className
        )}
      >
        <Form.Check.Input
          type="checkbox"
          className="mt-0"
          ref={resolvedRef}
          onChange={onChange}
          checked={checked}
          {...rest}
        />
      </Form.Check>
    );
  }
);

IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func,
  checked: PropTypes.bool
};

export default IndeterminateCheckbox;
