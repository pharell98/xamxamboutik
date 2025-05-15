import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProductForm from '../forms/ProductForm';
import UpdateStockForm from '../forms/updateStockSchema';

const ProductManagement = ({
  categories,
  selectedProduct,
  editModeProduct,
  handleSaveProduct,
  setSelectedProduct,
  setEditModeProduct
}) => {
  const [activeForm, setActiveForm] = useState('product');

  const handleCancelProductEdit = () => {
    setSelectedProduct(null);
    setEditModeProduct(false);
  };

  const handleSwitchForm = formType => {
    setActiveForm(formType);
    setSelectedProduct(null);
    setEditModeProduct(false);
  };

  const handleStockUpdateSuccess = () => {
    setActiveForm('product');
  };

  return (
    <>
      {activeForm === 'product' ? (
        <ProductForm
          categories={categories}
          onSubmit={handleSaveProduct}
          onUpdate={handleSaveProduct}
          initialValues={
            selectedProduct || {
              categorieProduit: '',
              libelle: '',
              prixAchat: '',
              prixVente: '',
              stockDisponible: '',
              seuilRuptureStock: '',
              codeProduit: '',
              imageProduit: null,
              id: null,
              currentImage: ''
            }
          }
          isEditMode={editModeProduct}
          onCancel={handleCancelProductEdit}
          onSwitchForm={handleSwitchForm}
        />
      ) : (
        <UpdateStockForm
          onSuccess={handleStockUpdateSuccess}
          onSwitchForm={handleSwitchForm}
        />
      )}
    </>
  );
};

ProductManagement.propTypes = {
  categories: PropTypes.array.isRequired,
  selectedProduct: PropTypes.shape({
    id: PropTypes.number,
    libelle: PropTypes.string
  }),
  editModeProduct: PropTypes.bool.isRequired,
  handleSaveProduct: PropTypes.func.isRequired,
  setSelectedProduct: PropTypes.func.isRequired,
  setEditModeProduct: PropTypes.func.isRequired
};

export default ProductManagement;
