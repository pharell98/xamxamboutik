import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../../../../common/IconButton';

const CardHeader = ({
  localFields,
  clearAllProducts,
  title = 'Détail Approvisionnement',
  showDeleteButton = true,
  isLoading = false,
  onToggleImport
}) => {
  const hasProducts = localFields.length > 0;

  return (
    <Card.Header
      as="h6"
      className="bg-body-tertiary d-flex justify-content-between align-items-center py-3"
    >
      <div className="d-flex align-items-center">
        <span className="text-primary">{title}</span>
        {hasProducts && (
          <span className="ms-2 badge bg-primary">
            {localFields.length} produit{localFields.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        {showDeleteButton && hasProducts && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={clearAllProducts}
            disabled={isLoading}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
            <span>Tout supprimer</span>
            {isLoading && (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            )}
          </Button>
        )}
        <IconButton
          variant="falcon-default"
          size="sm"
          icon="external-link-alt"
          transform="shrink-3"
          onClick={onToggleImport}
        >
          <span className="d-none d-sm-inline-block ms-1">
            Importer Fichier Excel
          </span>
        </IconButton>
      </div>
    </Card.Header>
  );
};

CardHeader.propTypes = {
  localFields: PropTypes.array.isRequired,
  clearAllProducts: PropTypes.func.isRequired,
  title: PropTypes.string,
  showDeleteButton: PropTypes.bool,
  isLoading: PropTypes.bool,
  onToggleImport: PropTypes.func.isRequired
};

export default React.memo(CardHeader);
