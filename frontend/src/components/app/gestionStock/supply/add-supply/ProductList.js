import React from 'react';
import PropTypes from 'prop-types';
import ProductListItem from './ProductListItem';

const ProductList = ({
  localFields,
  handleRemoveProduct,
  handleUpdateProduct,
  handleEditProduct,
  handleCompleteProduct,
  currentEditProduct
}) => {
  if (!localFields.length) {
    return null;
  }

  return (
    <div className="mb-4">
      {localFields.map((product, index) => (
        <ProductListItem
          key={String(product.id)}
          product={product}
          index={index}
          handleUpdateProduct={handleUpdateProduct}
          handleEditProduct={handleEditProduct}
          handleRemoveProduct={handleRemoveProduct}
          handleCompleteProduct={handleCompleteProduct}
          isEditing={currentEditProduct && currentEditProduct.id === product.id}
        />
      ))}
    </div>
  );
};

ProductList.propTypes = {
  localFields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

      // Renommage : on utilise libelle, prixAchat, stockDisponible
      libelle: PropTypes.string.isRequired,
      prixAchat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      stockDisponible: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),

      originalData: PropTypes.object,
      isValidated: PropTypes.bool,
      isEditing: PropTypes.bool
    })
  ).isRequired,
  handleRemoveProduct: PropTypes.func.isRequired,
  handleUpdateProduct: PropTypes.func.isRequired,
  handleEditProduct: PropTypes.func.isRequired,
  handleCompleteProduct: PropTypes.func.isRequired,
  currentEditProduct: PropTypes.object
};

export default ProductList;
