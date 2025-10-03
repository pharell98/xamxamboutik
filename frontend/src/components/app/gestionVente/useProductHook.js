import { useCallback } from 'react';
import { useProductContext } from 'providers/ProductProvider';
import apiServiceV1 from 'services/api.service.v1';

/**
 * Hook personnalisé pour gérer les actions sur les produits
 * @param {Object} product - Le produit concerné
 */
const useProductHook = product => {
  const { productsDispatch } = useProductContext();

  const handleAddToCart = useCallback(
    (quantity = 1) => {
      if (!product || !product.prixVente) {
        console.warn('[useProductHook] Produit invalide ou prix manquant');
        return;
      }

      const productToAdd = {
        ...product,
        quantity: Math.max(1, Number(quantity)),
        totalPrice: Math.max(1, Number(quantity)) * Number(product.prixVente)
      };

      productsDispatch({
        type: 'ADD_TO_CART',
        payload: { product: productToAdd }
      });
    },
    [product, productsDispatch]
  );

  const getProductByBarcode = useCallback(async barcode => {
    try {
      const response = await apiServiceV1.getProductByBarcode(barcode);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('[useProductHook] Erreur récupération produit:', error);
      return null;
    }
  }, []);

  return { handleAddToCart, getProductByBarcode };
};

export default useProductHook;
