import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import FalconCloseButton from 'components/common/FalconCloseButton';

const DeleteConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirmation de suppression',
  message = 'Voulez-vous vraiment supprimer cet élément ?'
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      style={{ top: '20px' }}
      backdrop="static"
      keyboard={false}
      className="border-0"
    >
      <Modal.Header className="border-0">
        <Modal.Title id="contained-modal-title-vcenter" className="fs-5">
          {title}
        </Modal.Title>
        <FalconCloseButton onClick={onHide} />
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 bg-light">
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Supprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

DeleteConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string
};

export default DeleteConfirmationModal;
