// /reducers/productReducer.js

export const productReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: payload
      };

    case 'ADD_TO_CART': {
      const existingItem = state.cartItems.find(
        item => item.id === payload.product.id
      );
      if (existingItem) {
        // Si le produit existe déjà, mettre à jour la quantité
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: payload.product.quantity,
                  totalPrice: item.prixVente * payload.product.quantity
                }
              : item
          ),
          cartModal: {
            show: true,
            product: payload.product,
            type: 'add'
          }
        };
      }
      // Nouveau produit : l'ajouter en haut du panier
      return {
        ...state,
        cartItems: [payload.product, ...state.cartItems],
        cartModal: {
          show: true,
          product: payload.product,
          type: 'add'
        }
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(
          product => product.id !== payload.product.id
        )
      };

    case 'UPDATE_CART_ITEM_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === payload.productId
            ? {
                ...item,
                quantity: payload.quantity,
                totalPrice: item.prixVente * payload.quantity
              }
            : item
        )
      };

    case 'SHOW_CART_MODAL':
      return {
        ...state,
        cartModal: {
          ...state.cartModal,
          show: true
        }
      };

    case 'HIDE_CART_MODAL':
      return {
        ...state,
        cartModal: {
          ...state.cartModal,
          show: false
        }
      };

    // Ajout de l'action CHECKOUT pour vider le panier et réinitialiser le modal
    case 'CHECKOUT':
      return {
        ...state,
        cartItems: [],
        cartModal: {
          show: false,
          product: {},
          quantity: 0,
          type: 'add'
        }
      };

    default:
      return state;
  }
};
