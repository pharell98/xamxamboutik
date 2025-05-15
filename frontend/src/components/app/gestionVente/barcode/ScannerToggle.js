import React from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faCamera } from '@fortawesome/free-solid-svg-icons';

const ScannerToggle = ({ scannerMode, setScannerMode }) => {
  return (
    <Form.Group className="d-flex align-items-center mb-0">
      <Form.Label className="mb-0 me-2">Mode de Scan:</Form.Label>
      <div className="d-flex">
        <Form.Check
          type="radio"
          id="usb-scanner"
          label={
            <span>
              <FontAwesomeIcon icon={faBarcode} className="me-1" />
              Scanner USB
            </span>
          }
          name="scannerMode"
          value="usb"
          checked={scannerMode === 'usb'}
          onChange={e => setScannerMode(e.target.value)}
          className="me-3"
          inline
        />
        <Form.Check
          type="radio"
          id="camera-scanner"
          label={
            <span>
              <FontAwesomeIcon icon={faCamera} className="me-1" />
              Scanner Caméra
            </span>
          }
          name="scannerMode"
          value="camera"
          checked={scannerMode === 'camera'}
          onChange={e => setScannerMode(e.target.value)}
          inline
        />
      </div>
    </Form.Group>
  );
};

export default ScannerToggle;
