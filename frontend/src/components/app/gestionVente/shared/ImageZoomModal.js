import React from 'react';
import { Modal, Image } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Modal pour afficher une image en grand avec zoom
 */
const ImageZoomModal = ({ 
  show, 
  onHide, 
  imageSrc, 
  imageAlt = 'Image agrandie',
  title = 'Aperçu du produit'
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      className="image-zoom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center p-0">
        <div 
          style={{
            maxHeight: '70vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fluid
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              cursor: 'zoom-in'
            }}
            onClick={(e) => {
              // Toggle zoom on click
              const img = e.target;
              if (img.style.transform === 'scale(2)') {
                img.style.transform = 'scale(1)';
                img.style.cursor = 'zoom-in';
              } else {
                img.style.transform = 'scale(2)';
                img.style.cursor = 'zoom-out';
              }
            }}
          />
        </div>
      </Modal.Body>
      
      <Modal.Footer className="justify-content-center">
        <small className="text-muted">
          Cliquez sur l'image pour zoomer/dézoomer
        </small>
      </Modal.Footer>
    </Modal>
  );
};

ImageZoomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  imageSrc: PropTypes.string.isRequired,
  imageAlt: PropTypes.string,
  title: PropTypes.string
};

export default ImageZoomModal;
