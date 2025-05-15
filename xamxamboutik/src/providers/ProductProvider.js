import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import { productReducer } from 'reducers/productReducer';

export const ProductContext = createContext({ products: [] });

const ProductProvider = ({ children }) => {
  const initData = {
    products: [],
    cartItems: [],
    cartModal: {
      show: false,
      product: {},
      quantity: 0,
      type: 'add'
    }
  };

  const [productsState, productsDispatch] = useReducer(
    productReducer,
    initData
  );

  // Fonctions utilitaires pour le panier
  const isInShoppingCart = id =>
    !!productsState.cartItems.find(cartItem => cartItem.id === id);

  return (
    <ProductContext.Provider
      value={{
        productsState,
        productsDispatch,
        isInShoppingCart
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useProductContext = () => useContext(ProductContext);
export default ProductProvider;
