import { useProductContext } from 'providers/ProductProvider';
import venteServiceV1 from 'services/api.service.v1';

const useProductHook = product => {
  const {
    productsState: { cartItems },
    productsDispatch,
    isInShoppingCart
  } = useProductContext();

  const handleAddToCart = (quantity, showModal = true) => {
    const productToAdd = {
      ...product,
      quantity,
      totalPrice: quantity * product.prixVente
    };

    productsDispatch({
      type: 'ADD_TO_CART',
      payload: {
        product: productToAdd
      }
    });
  };

  const getProductByBarcode = async barcode => {
    try {
      const response = await venteServiceV1.getProductByBarcode(barcode);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération du produit par barcode:',
        error
      );
      return null;
    }
  };

  return { handleAddToCart, getProductByBarcode };
};

export default useProductHook;
