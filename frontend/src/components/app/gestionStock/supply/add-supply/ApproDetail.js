import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import CardHeader from './CardHeader';
import TransportFeeForm from './TransportFeeForm';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import NewProductDetails from './NewProductDetails';
import TotalAndValidation from './TotalAndValidation';
import { useApproDetail } from './hooks/useApproDetail';
import ExcelProductImport from '../excelSupply/ExcelProductImport';

const ApproDetail = () => {
  const { control } = useFormContext();
  const [showImport, setShowImport] = useState(false);

  const {
    isLoading,
    localFields,
    transportFee,
    totalAmount,
    showAdditionalFields,
    currentNewProduct,
    currentEditProduct,
    shouldResetBaseFields,
    setShouldResetBaseFields,
    setTransportFee,
    handleUpdateProduct,
    handleAddProduct,
    handleSelectSuggestedProduct,
    handleRemoveProduct,
    handleEditProduct,
    handleCompleteProduct,
    handleSubmitAppro,
    clearAllProducts
  } = useApproDetail({ control });

  const handleImportSuccess = importedProducts => {
    importedProducts.forEach(product => {
      handleAddProduct({
        codeProduit: product.codeProduit,
        libelle: product.libelle,
        prixAchat: product.prixAchat,
        prixVente: product.prixVente,
        stockDisponible: product.stockDisponible,
        seuilRuptureStock: product.seuilRuptureStock,
        categorieName: product.categorieName,
        imageURL: product.imageURL
      });
    });
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (showImport) {
    return (
      <ExcelProductImport
        onClose={() => setShowImport(false)}
        onImportSuccess={handleImportSuccess}
      />
    );
  }

  return (
    <Card className="mb-3">
      <CardHeader
        localFields={localFields}
        clearAllProducts={clearAllProducts}
        isLoading={isLoading}
        onToggleImport={() => setShowImport(true)}
      />

      <Card.Body>
        <TransportFeeForm
          initialFee={transportFee}
          onFeeChange={value => setTransportFee(value)}
        />

        <ProductList
          localFields={localFields}
          handleRemoveProduct={handleRemoveProduct}
          handleUpdateProduct={handleUpdateProduct}
          handleEditProduct={handleEditProduct}
          handleCompleteProduct={handleCompleteProduct}
          currentEditProduct={currentEditProduct}
        />

        <ProductForm
          onAddProduct={handleAddProduct}
          onSelectExistingProduct={handleSelectSuggestedProduct}
          showAdditionalFields={showAdditionalFields}
          shouldResetBaseFields={shouldResetBaseFields}
          onResetDone={() => setShouldResetBaseFields(false)}
        />

        {showAdditionalFields && currentNewProduct && !currentEditProduct && (
          <NewProductDetails
            currentProduct={currentNewProduct}
            editMode={false}
            onCompleteProduct={handleCompleteProduct}
          />
        )}

        <TotalAndValidation
          totalAmount={totalAmount}
          transportFee={transportFee}
          handleSubmit={handleSubmitAppro}
          isValid={localFields.length > 0}
          disableSubmit={showAdditionalFields}
        />
      </Card.Body>
    </Card>
  );
};

export default ApproDetail;
