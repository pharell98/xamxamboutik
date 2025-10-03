import React, { useState, useMemo } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from 'providers/AppProvider';

const CalculatorModal = ({ show, onClose, totalCost }) => {
  const {
    config: { isDark }
  } = useAppContext();
  const [montantRecu, setMontantRecu] = useState('');

  const montantRendu = useMemo(() => {
    const recu = parseFloat(montantRecu) || 0;
    return Math.max(0, recu - totalCost);
  }, [montantRecu, totalCost]);

  const handleMontantChange = e => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setMontantRecu(value);
    }
  };

  const handleClose = () => {
    setMontantRecu('');
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      centered
      contentClassName={isDark ? 'bg-dark text-light' : ''}
    >
      <Modal.Header
        closeButton
        className={isDark ? 'bg-dark text-light border-secondary' : ''}
      >
        <Modal.Title>
          <FontAwesomeIcon icon={faCalculator} className="me-2" />
          Calculatrice
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={isDark ? 'bg-dark text-light' : ''}>
        <div className="mb-3">
          <Form.Label className="fw-semibold">Total à payer</Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={`${totalCost.toLocaleString()} XOF`}
            className={`fw-bold ${
              isDark ? 'bg-secondary text-light' : 'bg-light'
            }`}
          />
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Montant reçu</Form.Label>
          <Form.Control
            type="number"
            min="0"
            step="0.01"
            value={montantRecu}
            onChange={handleMontantChange}
            placeholder="Entrez le montant payé"
            autoFocus
            className={isDark ? 'bg-dark text-light border-secondary' : ''}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label className="fw-semibold">Montant à rendre</Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={`${montantRendu.toLocaleString()} XOF`}
            className={`fw-bold ${montantRendu > 0 ? 'text-success' : ''} ${
              isDark ? 'bg-secondary text-light' : ''
            }`}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className={isDark ? 'bg-dark border-secondary' : ''}>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CalculatorModal;
