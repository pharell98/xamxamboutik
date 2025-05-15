import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import NewProductDetails from './NewProductDetails';

// Style inline pour les champs en lecture seule (gris très léger via rgba)
const readOnlyStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  cursor: 'not-allowed'
};

const ProductListItem = ({
  product,
  index,
  handleUpdateProduct,
  handleEditProduct,
  handleRemoveProduct,
  handleCompleteProduct
}) => {
  // Détermine si le champ "libelle" est en lecture seule
  const libelleReadOnly =
    product.originalData || (product.isValidated && !product.isEditing);

  // De même pour prixAchat / stockDisponible
  const priceQuantityReadOnly = product.originalData
    ? false
    : product.isValidated && !product.isEditing;

  const baseClass = 'form-control form-control-sm';

  return (
    <>
      <Row className="gx-2 flex-between-center mb-3">
        {/* Libellé */}
        <Col sm={4}>
          <input
            type="text"
            className={baseClass}
            value={product.libelle}
            readOnly={libelleReadOnly}
            style={libelleReadOnly ? readOnlyStyle : {}}
            onChange={e =>
              handleUpdateProduct(index, 'libelle', e.target.value)
            }
          />
        </Col>

        {/* Prix d'achat */}
        <Col sm={3}>
          <input
            type="text"
            className={baseClass}
            placeholder="Prix d'achat (FCFA)"
            value={product.prixAchat || ''}
            readOnly={priceQuantityReadOnly}
            style={priceQuantityReadOnly ? readOnlyStyle : {}}
            onChange={e =>
              handleUpdateProduct(index, 'prixAchat', e.target.value)
            }
          />
        </Col>

        {/* Stock disponible */}
        <Col sm={3}>
          <input
            type="text"
            className={baseClass}
            placeholder="Stock"
            value={product.stockDisponible || ''}
            readOnly={priceQuantityReadOnly}
            style={priceQuantityReadOnly ? readOnlyStyle : {}}
            onChange={e =>
              handleUpdateProduct(index, 'stockDisponible', e.target.value)
            }
          />
        </Col>

        {/* Actions */}
        <Col sm={2} className="d-flex justify-content-end gap-2">
          {
            // Pour les nouveaux produits validés, on affiche l'icône de modification
            !product.originalData && product.isValidated && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleEditProduct(product)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )
          }
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRemoveProduct(index)}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </Col>
      </Row>

      {/* Si le produit est en édition, on affiche le composant NewProductDetails */}
      {product.isEditing && (
        <Row>
          <Col>
            <NewProductDetails
              currentProduct={product}
              editMode={true}
              onCompleteProduct={handleCompleteProduct}
            />
          </Col>
        </Row>
      )}
    </>
  );
};

ProductListItem.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    // On utilise libelle, prixAchat, stockDisponible
    libelle: PropTypes.string.isRequired,
    prixAchat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stockDisponible: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    originalData: PropTypes.object,
    isValidated: PropTypes.bool,
    isEditing: PropTypes.bool
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleUpdateProduct: PropTypes.func.isRequired,
  handleEditProduct: PropTypes.func.isRequired,
  handleRemoveProduct: PropTypes.func.isRequired,
  handleCompleteProduct: PropTypes.func.isRequired
};

export default ProductListItem;
