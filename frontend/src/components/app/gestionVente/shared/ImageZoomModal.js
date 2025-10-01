import React from 'react';
import { Modal, Image } from 'react-bootstrap';
import { useAppContext } from 'providers/AppProvider';
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
  const { config: { isDark } } = useAppContext();
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      className="image-zoom-modal"
      contentClassName={isDark ? 'bg-dark text-light' : ''}
    >
      <Modal.Header closeButton className={isDark ? 'bg-dark text-light border-secondary' : ''}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={`text-center p-0 ${isDark ? 'bg-dark' : ''}`}>
        <div 
          style={{
            maxHeight: '70vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#2d3748' : '#f8f9fa'
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
      
      <Modal.Footer className={`justify-content-center ${isDark ? 'bg-dark border-secondary' : ''}`}>
        <small className={isDark ? 'text-secondary' : 'text-muted'}>
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
