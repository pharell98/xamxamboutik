// src/components/filters/DateFilter.js
import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTimes } from '@fortawesome/free-solid-svg-icons';

const CustomDateInput = forwardRef(function CustomDateInput(
  {
    value = '',
    onClick,
    style = {},
    placeholder = 'Date',
    resetEnabled = false,
    onReset = () => {}
  },
  ref
) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Form.Control
        ref={ref}
        onClick={onClick || undefined}
        value={value}
        placeholder={placeholder}
        readOnly
        style={{ ...style, paddingRight: '30px', lineHeight: style.height }}
        className="form-control-sm shadow-none border-300"
      />
      {resetEnabled ? (
        <FontAwesomeIcon
          icon={faTimes}
          onClick={onReset}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer'
          }}
          className="fs-10"
        />
      ) : (
        <FontAwesomeIcon
          icon={faCalendar}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
          className="fs-10"
        />
      )}
    </div>
  );
});

const DateFilter = ({
  name,
  value = '',
  onChange,
  placeholder = 'Date',
  minDate = null,
  maxDate = null
}) => {
  const [date, setDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      onChange(name, `${yyyy}-${mm}-${dd}`);
    } else {
      onChange(name, '');
    }
  }, [date, name, onChange]);

  const H = 28;
  const inputStyle = {
    height: `${H}px`,
    fontSize: '13px',
    cursor: 'pointer',
    lineHeight: `${H}px`,
    width: '145px'
  };

  return (
    <div className="me-2 mb-2" style={{ width: '145px' }}>
      <DatePicker
        selected={date}
        onChange={setDate}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        customInput={
          <CustomDateInput
            style={inputStyle}
            placeholder={placeholder}
            resetEnabled={!!date}
            onReset={() => setDate(null)}
          />
        }
        popperPlacement="bottom-end"
      />
    </div>
  );
};

DateFilter.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date)
};

export default DateFilter;
