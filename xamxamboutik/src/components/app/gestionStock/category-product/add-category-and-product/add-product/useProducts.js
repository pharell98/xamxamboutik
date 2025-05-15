import { useState } from 'react';
import apiServiceV1 from 'services/api.service.v1';
import { useToast } from 'components/common/Toast';

const useProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editModeProduct, setEditModeProduct] = useState(false);
  const { addToast } = useToast();

  const handleSaveProduct = async formData => {
    try {
      if (editModeProduct) {
        const produitBlob = formData.get('produit');
        const produitText = await produitBlob.text();
        let produit;
        try {
          produit = JSON.parse(produitText);
        } catch (parseError) {
          console.error(
            '[useProducts] Erreur parsing blob produit:',
            parseError
          );
          throw new Error("Erreur lors de l'analyse des données du produit.");
        }
        // Ex: logic pour corriger la catégorie si manquante
        if (!produit.categorieId && produit.categorieLibelle) {
          // ...
        }
      }

      const response = await apiServiceV1.saveProduct(
        formData,
        editModeProduct,
        selectedProduct?.id
      );
      const createdOrUpdatedProduct = response.data || response;

      addToast({
        title: 'Succès',
        message: `Produit "${
          createdOrUpdatedProduct.libelle || 'Nom non défini'
        }" ${editModeProduct ? 'mis à jour' : 'créé'} avec succès.`,
        type: 'success'
      });
      setSelectedProduct(null);
      setEditModeProduct(false);
    } catch (error) {
      console.error('[useProducts] Erreur lors de la sauvegarde:', error);
      const serverMessage =
        error.response?.data?.message ||
        'Une erreur est survenue lors de la création ou de la mise à jour du produit.';
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error'
      });
    }
  };

  return {
    selectedProduct,
    editModeProduct,
    setSelectedProduct,
    setEditModeProduct,
    handleSaveProduct
  };
};

export default useProducts;
