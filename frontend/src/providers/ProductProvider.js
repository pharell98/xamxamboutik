import React, { createContext, useContext, useReducer, useMemo } from 'react';
import PropTypes from 'prop-types';
import { productReducer } from 'reducers/productReducer';

// Constantes
const INITIAL_STATE = {
  products: [],
  cartItems: [],
  cartModal: {
    show: false,
    product: {},
    quantity: 0,
    type: 'add'
  }
};

// Contexte
export const ProductContext = createContext(INITIAL_STATE);

/**
 * Hook pour utiliser le contexte des produits
 */
export const useProductContext = () => {
  const context = useContext(ProductContext);
  
  if (!context) {
    throw new Error('useProductContext doit être utilisé dans un ProductProvider');
  }
  
  return context;
};

/**
 * Provider pour la gestion des produits et du panier
 */
const ProductProvider = ({ children }) => {
  const [productsState, productsDispatch] = useReducer(productReducer, INITIAL_STATE);

  // Fonctions utilitaires mémoïsées
  const contextValue = useMemo(() => {
    const isInShoppingCart = (id) =>
      productsState.cartItems.some(cartItem => cartItem.id === id);

    const getCartItemById = (id) =>
      productsState.cartItems.find(cartItem => cartItem.id === id);

    const getCartTotal = () =>
      productsState.cartItems.reduce((total, item) => 
        total + (item.totalPrice || (item.prixVente * item.quantity)), 0
      );

    const getCartItemsCount = () =>
      productsState.cartItems.reduce((count, item) => count + item.quantity, 0);

    return {
      productsState,
      productsDispatch,
      isInShoppingCart,
      getCartItemById,
      getCartTotal,
      getCartItemsCount
    };
  }, [productsState]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProductProvider;