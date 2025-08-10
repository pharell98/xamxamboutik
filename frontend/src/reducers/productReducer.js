// Constants
const DEFAULT_MODAL_STATE = {
  show: false,
  product: {},
  quantity: 0,
  type: 'add'
};

/**
 * Valide et normalise une quantité
 */
const validateQuantity = (quantity) => {
  const num = Number(quantity);
  return !num || num <= 0 || !Number.isInteger(num) ? 1 : Math.max(1, num);
};

/**
 * Met à jour un produit existant dans le panier
 */
const updateExistingCartItem = (cartItems, productId, newProduct) => {
  return cartItems.map(item =>
    item.id === productId
      ? {
          ...item,
          quantity: newProduct.quantity,
          totalPrice: item.prixVente * newProduct.quantity
        }
      : item
  );
};

/**
 * Met à jour la quantité d'un article du panier
 */
const updateCartItemQuantity = (cartItems, productId, quantity) => {
  const validQuantity = validateQuantity(quantity);
  
  return cartItems.map(item =>
    item.id === productId
      ? {
          ...item,
          quantity: validQuantity,
          totalPrice: item.prixVente * validQuantity
        }
      : item
  );
};

/**
 * Ajoute un nouveau produit au panier
 */
const addNewCartItem = (cartItems, product) => [product, ...cartItems];

/**
 * Supprime un produit du panier
 */
const removeCartItem = (cartItems, productId) =>
  cartItems.filter(item => item.id !== productId);

/**
 * Actions du reducer
 */
const actions = {
  SET_PRODUCTS: (state, payload) => ({
    ...state,
    products: payload
  }),

  ADD_TO_CART: (state, { product }) => {
    const existingItem = state.cartItems.find(item => item.id === product.id);
    
    const cartItems = existingItem
      ? updateExistingCartItem(state.cartItems, product.id, product)
      : addNewCartItem(state.cartItems, product);

    return {
      ...state,
      cartItems,
      cartModal: {
        show: true,
        product,
        type: 'add'
      }
    };
  },

  REMOVE_FROM_CART: (state, { product }) => ({
    ...state,
    cartItems: removeCartItem(state.cartItems, product.id)
  }),

  UPDATE_CART_ITEM_QUANTITY: (state, { productId, quantity }) => ({
    ...state,
    cartItems: updateCartItemQuantity(state.cartItems, productId, quantity)
  }),

  SHOW_CART_MODAL: (state) => ({
    ...state,
    cartModal: { ...state.cartModal, show: true }
  }),

  HIDE_CART_MODAL: (state) => ({
    ...state,
    cartModal: { ...state.cartModal, show: false }
  }),

  CHECKOUT: (state) => ({
    ...state,
    cartItems: [],
    cartModal: DEFAULT_MODAL_STATE
  })
};

/**
 * Reducer principal pour la gestion des produits
 */
export const productReducer = (state, action) => {
  const { type, payload } = action;
  const actionHandler = actions[type];
  
  if (actionHandler) {
    return actionHandler(state, payload);
  }
  
  console.warn(`[productReducer] Action non reconnue: ${type}`);
  return state;
};