// CalculatorModal.js
import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const CalculatorModal = ({ show, onClose, totalCost }) => {
  const [montantRecu, setMontantRecu] = useState('');

  const montantRendu = Math.max(
    0,
    (parseInt(montantRecu, 10) || 0) - totalCost
  );

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Calculatrice</Modal.Title>
      </Modal.Header>

      {/* AJOUT d'un style pour le scroll dans le Modal.Body */}
      <Modal.Body style={{ maxHeight: '50vh', overflowY: 'auto' }}>
        <Form.Group className="mb-3">
          <Form.Label>Montant Reçu</Form.Label>
          <Form.Control
            type="number"
            min="0"
            value={montantRecu}
            onChange={e => setMontantRecu(e.target.value)}
            placeholder="Entrez le montant payé"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Montant à Rendre</Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={montantRendu}
            className="fw-bold"
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CalculatorModal;
