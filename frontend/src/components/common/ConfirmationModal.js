import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCloseButton from './FalconCloseButton';
import { useAppContext } from 'providers/AppProvider';

/**
 * Modal de confirmation générique et réutilisable
 * Peut être utilisé pour supprimer, fermer boutique, annuler action, etc.
 */
const ConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirmation',
  message = 'Voulez-vous vraiment effectuer cette action ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'primary',
  icon = 'question-circle',
  iconColor = 'primary',
  size = 'md',
  loading = false
}) => {
  const {
    config: { isDark },
    responsive
  } = useAppContext();

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered
      backdrop="static"
      keyboard={false}
      className="border-0"
    >
      <Modal.Header
        className={`border-0 ${isDark ? 'bg-dark text-light' : 'bg-light'}`}
      >
        <Modal.Title className={responsive.isMobile ? 'fs-6' : 'fs-5'}>
          <FontAwesomeIcon icon={icon} className={`me-2 text-${iconColor}`} />
          {title}
        </Modal.Title>
        <FalconCloseButton onClick={onHide} />
      </Modal.Header>

      <Modal.Body
        className={`${responsive.isMobile ? 'p-3' : 'p-4'} ${
          isDark ? 'bg-dark text-light' : ''
        }`}
      >
        <p className="mb-0">{message}</p>
      </Modal.Body>

      <Modal.Footer className={`border-0 ${isDark ? 'bg-dark' : 'bg-light'}`}>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={loading}
          size={responsive.isMobile ? 'sm' : ''}
        >
          <FontAwesomeIcon icon="times" className="me-1" />
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={loading}
          size={responsive.isMobile ? 'sm' : ''}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              />
              Traitement...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon="check" className="me-1" />
              {confirmText}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmVariant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info'
  ]),
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'lg', 'xl']),
  loading: PropTypes.bool
};

export default ConfirmationModal;
