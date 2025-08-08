import React from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faCamera } from '@fortawesome/free-solid-svg-icons';

const ScannerToggle = ({ scannerMode, setScannerMode }) => {
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    console.log('[ScannerToggle] Changement de mode:', newMode);
    setScannerMode(newMode);
  };

  const handleClick = (e) => {
    // Empêcher la propagation pour éviter les conflits avec la navbar
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseDown = (e) => {
    // Empêcher la propagation des événements de souris
    e.stopPropagation();
  };

  return (
    <Form.Group 
      className="d-flex align-items-center mb-0"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
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
          onChange={handleModeChange}
          className="me-3"
          inline
          onClick={(e) => {
            // Empêcher la propagation pour éviter les conflits
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
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
          onChange={handleModeChange}
          inline
          onClick={(e) => {
            // Empêcher la propagation pour éviter les conflits
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        />
      </div>
    </Form.Group>
  );
};

export default ScannerToggle;
