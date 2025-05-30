// src/components/common/BulkActionsAndSearchBar.js
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import AdvanceTableSearchBox from './AdvanceTableSearchBox';
import DynamicFilters from './DynamicFilters';
import DateFilter from './DateFilter';

const BulkActionsAndSearchBar = ({
  searchPlaceholder,
  filtersConfig = [],
  filtersValues = {},
  onFiltersChange = () => {},
  onSearch = () => {},
  hideSearchBar = false,
  minDate = null,
  maxDate = null
}) => {
  return (
    <Row className="mb-3 align-items-center">
      <Col md={8} className="d-flex flex-wrap">
        {filtersConfig.map((f, i) => {
          const filterValue =
            filtersValues[f.name] !== undefined
              ? filtersValues[f.name]
              : f.defaultValue || '';
          return f.type === 'date' ? (
            <DateFilter
              key={`${f.name}-${i}`}
              name={f.name}
              value={filterValue}
              onChange={onFiltersChange}
              placeholder={f.label}
              minDate={minDate}
              maxDate={maxDate}
            />
          ) : (
            <DynamicFilters
              key={`${f.name}-${i}`}
              filtersConfig={[f]}
              filtersValues={{ [f.name]: filterValue }}
              onFiltersChange={onFiltersChange}
            />
          );
        })}
      </Col>
      {!hideSearchBar && (
        <Col md={4} className="text-end">
          <AdvanceTableSearchBox
            placeholder={searchPlaceholder}
            onSearch={onSearch}
          />
        </Col>
      )}
    </Row>
  );
};

BulkActionsAndSearchBar.propTypes = {
  searchPlaceholder: PropTypes.string.isRequired,
  filtersConfig: PropTypes.array,
  filtersValues: PropTypes.object,
  onFiltersChange: PropTypes.func,
  onSearch: PropTypes.func,
  hideSearchBar: PropTypes.bool,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date)
};

export default BulkActionsAndSearchBar;
