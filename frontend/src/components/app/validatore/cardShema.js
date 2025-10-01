import * as Yup from 'yup';

// ========================
// VALIDATION UTILITIES
// ========================

/**
 * Valide qu'une quantité est un entier positif non vide
 */
export const isValidQuantity = (quantity) => {
  return quantity !== null && 
         quantity !== undefined && 
         quantity !== '' && 
         quantity !== 0 &&
         Number.isInteger(quantity) && 
         !isNaN(quantity) && 
         quantity > 0;
};

/**
 * Normalise une quantité invalide vers 1
 */
export const normalizeQuantity = (quantity, max = Infinity) => {
  if (!isValidQuantity(quantity)) {
    return 1;
  }
  return Math.min(Math.max(1, quantity), max);
};

/**
 * Valide qu'un prix est un nombre positif
 */
export const isValidPrice = (price) => {
  const num = Number(price);
  return !isNaN(num) && num >= 0;
};

// ========================
// YUP SCHEMAS
// ========================

/**
 * Schéma de validation pour un item du panier
 */
export const cartItemSchema = Yup.object().shape({
  id: Yup.number().required('ID produit requis'),
  libelle: Yup.string().required('Libellé produit requis'),
  quantity: Yup.number()
    .integer('La quantité doit être un nombre entier')
    .min(1, 'La quantité doit être supérieure à 0')
    .required('La quantité est requise')
    .test('is-valid-quantity', 'Quantité invalide', isValidQuantity),
  prixVente: Yup.number()
    .min(0, 'Le prix doit être positif')
    .required('Prix de vente requis'),
  quantiteDisponible: Yup.number()
    .min(0, 'Stock disponible invalide')
    .nullable()
});

/**
 * Schéma de validation pour le panier complet
 */
export const cartSchema = Yup.object().shape({
  items: Yup.array()
    .of(cartItemSchema)
    .min(1, 'Le panier ne peut pas être vide'),
  modePaiement: Yup.string().required('Mode de paiement requis'),
  montantTotal: Yup.number()
    .min(0, 'Le montant total doit être positif')
    .required('Montant total requis')
});

/**
 * Schéma de validation pour les informations client
 */
export const customerInfoSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .when('required', {
      is: true,
      then: schema => schema.required('Le nom complet est requis')
    }),
  phoneNumber: Yup.string()
    .trim()
    .matches(/^[\d\s\-+()]+$/, 'Numéro de téléphone invalide')
    .when('required', {
      is: true,
      then: schema => schema.required('Le numéro de téléphone est requis')
    })
});

/**
 * Schéma pour la validation de quantité simple
 */
export const quantitySchema = Yup.number()
  .integer('Doit être un nombre entier')
  .min(1, 'Minimum 1')
  .max(999999, 'Maximum 999999')
  .required('Quantité requise');

// ========================
// VALIDATION FUNCTIONS
// ========================

/**
 * Valide un item du panier et retourne les erreurs
 */
export const validateCartItem = async (item) => {
  try {
    await cartItemSchema.validate(item, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    };
  }
};

/**
 * Valide le panier complet
 */
export const validateCart = async (cartData) => {
  try {
    await cartSchema.validate(cartData, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    };
  }
};

/**
 * Valide les informations client
 */
export const validateCustomerInfo = async (customerInfo, isRequired = false) => {
  try {
    await customerInfoSchema.validate(
      { ...customerInfo, required: isRequired }, 
      { abortEarly: false }
    );
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    };
  }
};

// ========================
// VALIDATION HELPERS
// ========================

/**
 * Filtre les items invalides du panier avec diagnostic
 */
export const getInvalidCartItems = (cartItems) => {
  return cartItems.filter(item => {
    const hasInvalidQuantity = !isValidQuantity(item.quantity);
    const exceedsStock = item.quantity > (item.quantiteDisponible || Infinity);
    
    if (hasInvalidQuantity) {
      console.warn('[Validation] Item avec quantité invalide:', {
        libelle: item.libelle,
        quantity: item.quantity,
        type: typeof item.quantity
      });
    }
    
    return hasInvalidQuantity || exceedsStock;
  });
};

/**
 * Génère un message d'erreur détaillé pour les items invalides
 */
export const getValidationErrorMessage = (invalidItems) => {
  const itemDescriptions = invalidItems.map(item => {
    const issues = [];
    
    if (!isValidQuantity(item.quantity)) {
      issues.push('quantité invalide');
    }
    if (item.quantity > (item.quantiteDisponible || Infinity)) {
      issues.push('stock insuffisant');
    }
    
    return `${item.libelle} (${issues.join(', ')})`;
  });
  
  return `Problèmes détectés : ${itemDescriptions.join(', ')}. Veuillez corriger avant de continuer.`;
};
