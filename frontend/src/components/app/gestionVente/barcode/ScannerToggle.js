import React, { useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faCamera } from '@fortawesome/free-solid-svg-icons';

const SCANNER_OPTIONS = [
  { 
    value: 'usb', 
    label: 'Scanner USB', 
    icon: faBarcode 
  },
  { 
    value: 'camera', 
    label: 'Scanner Caméra', 
    icon: faCamera 
  }
];

const ScannerToggle = ({ scannerMode, setScannerMode }) => {
  const handleModeChange = useCallback((e) => {
    setScannerMode(e.target.value);
  }, [setScannerMode]);

  const preventPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <Form.Group 
      className="d-flex align-items-center mb-0"
      onClick={preventPropagation}
      onMouseDown={preventPropagation}
    >
      <Form.Label className="mb-0 me-2">Mode de Scan:</Form.Label>
      <div className="d-flex">
        {SCANNER_OPTIONS.map((option) => (
          <Form.Check
            key={option.value}
            type="radio"
            id={`${option.value}-scanner`}
            label={
              <span>
                <FontAwesomeIcon icon={option.icon} className="me-1" />
                {option.label}
              </span>
            }
            name="scannerMode"
            value={option.value}
            checked={scannerMode === option.value}
            onChange={handleModeChange}
            className="me-3"
            inline
            onClick={preventPropagation}
            onMouseDown={preventPropagation}
          />
        ))}
      </div>
    </Form.Group>
  );
};

export default ScannerToggle;