// src/components/filters/DynamicFilters.js
import React from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

const DynamicFilters = ({
  filtersConfig = [],
  filtersValues = {},
  onFiltersChange = () => {},
  className = ''
}) => {
  const selectFilters = Array.isArray(filtersConfig)
    ? filtersConfig.filter(f => f.type === 'select')
    : [];

  const handleChange = (name, val) => {
    if (filtersValues[name] !== val) {
      onFiltersChange(name, val);
    }
  };

  const H = 28;
  const containerStyle = { width: '200px', marginRight: '10px' };
  const selectStyle = {
    height: `${H}px`,
    fontSize: '13px',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  };
  const iconStyle = {
    height: `${H}px`,
    padding: '0 8px',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: '-1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div
      className={classNames(className, 'd-flex align-items-center flex-wrap')}
    >
      {selectFilters.map((f, i) => {
        const value =
          filtersValues[f.name] !== undefined
            ? filtersValues[f.name]
            : f.defaultValue || '';
        return (
          <div key={i} className="me-2 mb-2" style={containerStyle}>
            <InputGroup size="sm">
              <Form.Select
                className="shadow-none border-300"
                style={selectStyle}
                value={value}
                onChange={e => handleChange(f.name, e.target.value)}
              >
                {(f.options || []).map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
              <InputGroup.Text className="border-300" style={iconStyle}>
                <FontAwesomeIcon icon={faFilter} className="fs-10" />
              </InputGroup.Text>
            </InputGroup>
          </div>
        );
      })}
    </div>
  );
};

DynamicFilters.propTypes = {
  filtersConfig: PropTypes.array.isRequired,
  filtersValues: PropTypes.object,
  onFiltersChange: PropTypes.func,
  className: PropTypes.string
};

export default DynamicFilters;
