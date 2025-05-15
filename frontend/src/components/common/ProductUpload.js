import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faImage,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

/**
 * Composant permettant de sélectionner une image (drag&drop ou clic),
 * de la redimensionner à 98x76 (optionnel), et de renvoyer le fichier via onImageUpload().
 */
const ProductUpload = ({
  onImageUpload = () => {},
  currentImage = null,
  disabled = false,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_FILE_TYPES
}) => {
  const [file, setFile] = useState(currentImage);
  const [error, setError] = useState(null);

  // Synchroniser l'état interne avec la prop currentImage
  useEffect(() => {
    setFile(currentImage);
  }, [currentImage]);

  // Redimensionner l'image en 98x76 via Canvas
  const resizeImage = (file, targetWidth, targetHeight, callback) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(blob => {
          const resizedFile = Object.assign(blob, {
            name: file.name,
            preview: URL.createObjectURL(blob)
          });
          callback(resizedFile);
        }, file.type);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Vérifier format + taille
  const validateFile = useCallback(
    file => {
      if (file.size > maxSize) {
        return "L'image ne doit pas dépasser 5MB";
      }
      if (!Object.keys(acceptedTypes).includes(file.type)) {
        return "Format d'image non supporté. Utilisez JPG ou PNG.";
      }
      return null;
    },
    [maxSize, acceptedTypes]
  );

  // Quand on "drop" un fichier
  const onDrop = useCallback(
    acceptedFiles => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      // Vérification
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);

      // Redimension (peut être retiré si non désiré)
      resizeImage(selectedFile, 98, 76, resizedFile => {
        setFile(resizedFile);
        onImageUpload(resizedFile);
      });
    },
    [onImageUpload, validateFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes,
    onDrop,
    disabled,
    maxSize,
    multiple: false
  });

  // Supprimer le fichier sélectionné
  const handleRemove = useCallback(() => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
    setError(null);
    onImageUpload(null);
  }, [file, onImageUpload]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  const dropzoneClasses = `
    border rounded p-3
    ${isDragActive ? 'bg-light border-primary' : ''}
    ${error ? 'border-danger' : ''}
    ${disabled ? 'opacity-50' : ''}
    ${!file ? 'cursor-pointer' : ''}
  `.trim();

  return (
    <div className={dropzoneClasses}>
      {/* Si aucun fichier, afficher la zone de drag/drop */}
      {!file ? (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="text-center">
            <FontAwesomeIcon
              icon={error ? faExclamationTriangle : faImage}
              className={`fa-2x mb-2 ${error ? 'text-danger' : 'text-primary'}`}
            />
            <p className={`mb-1 ${error ? 'text-danger' : 'text-muted'}`}>
              {error ||
                (isDragActive
                  ? "Déposez l'image ici..."
                  : 'Glisser-déposer une image ou cliquer pour sélectionner')}
            </p>
            <small className="text-muted">
              Formats acceptés : JPG, PNG (max 5MB)
            </small>
          </div>
        </div>
      ) : (
        // Aperçu du fichier sélectionné
        <div className="d-flex align-items-center">
          <div style={{ width: 40, height: 40 }}>
            <img
              className="rounded w-100 h-100 object-fit-cover"
              src={file.preview}
              alt={file.name}
            />
          </div>
          <div className="ms-2 flex-grow-1">
            <div className="text-truncate">{file.name}</div>
            <small className="text-muted">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </small>
          </div>
          <Button
            variant="link"
            className="text-danger p-0 ms-2"
            onClick={handleRemove}
            title="Supprimer l'image"
          >
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </div>
      )}
    </div>
  );
};

ProductUpload.propTypes = {
  onImageUpload: PropTypes.func,
  currentImage: PropTypes.object,
  disabled: PropTypes.bool,
  maxSize: PropTypes.number,
  acceptedTypes: PropTypes.object
};

export default ProductUpload;
