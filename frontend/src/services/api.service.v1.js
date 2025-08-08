import apiClient from './apiClient';

const PRODUCT_ENDPOINT = '/produits';
const CATEGORY_ENDPOINT = '/categories';
const STOCK_ENDPOINT = '/stock';
const APPROVISIONNEMENT_ENDPOINT = '/approvisionnement';

/**
 * Utilitaire pour exécuter une requête API avec gestion d'erreur et log.
 * @param {Function} fn - Fonction asynchrone à exécuter
 * @param {string} logPrefix - Préfixe pour les logs d'erreur
 * @returns {Promise<any>} Résultat de la fonction ou throw l'erreur
 */
async function safeApiCall(fn, logPrefix) {
  try {
    return await fn();
  } catch (error) {
    console.error(`[apiServiceV1] Erreur ${logPrefix}:`, error);
    throw error;
  }
}

const apiServiceV1 = {
  // PRODUITS
  /**
   * Récupère tous les produits avec pagination et filtres.
   * @param {number} page
   * @param {number} size
   * @param {object} filters
   */
  getAllProducts: async (page = 1, size = 10, filters = {}) =>
    safeApiCall(
      () =>
        apiClient
          .get(PRODUCT_ENDPOINT, { params: { page, size, ...filters } })
          .then(r => r.data),
      'getAllProducts'
    ),

  /**
   * Récupère les produits supprimés.
   */
  getDeletedProducts: async (page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${PRODUCT_ENDPOINT}/deleted`, { params: { page, size } })
          .then(r => r.data),
      'getDeletedProducts'
    ),

  /**
   * Suggestions de produits par nom.
   */
  getProductSuggestions: async (query, page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${PRODUCT_ENDPOINT}/suggestions`, {
            params: { query, page, size }
          })
          .then(r => r.data),
      'getProductSuggestions'
    ),

  /**
   * Suggestions d'approvisionnement.
   */
  getApprovisionnementSuggestions: async (query, page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${PRODUCT_ENDPOINT}/approvisionnement/suggestions`, {
            params: { query, page, size }
          })
          .then(r => r.data),
      'getApprovisionnementSuggestions'
    ),

  /**
   * Récupère les produits d'une catégorie.
   */
  getProductsByCategory: async (categorieId, page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${PRODUCT_ENDPOINT}/category/${categorieId}`, {
            params: { page, size }
          })
          .then(r => r.data),
      'getProductsByCategory'
    ),

  /**
   * Récupère un produit par code-barres.
   */
  getProductByBarcode: async barcode =>
    safeApiCall(
      () =>
        apiClient
          .get(`${PRODUCT_ENDPOINT}/barcode/${barcode}`)
          .then(r => r.data),
      'getProductByBarcode'
    ),

  /**
   * Importation en masse de produits via Excel pour l'approvisionnement.
   */
  bulkImportProducts: async products =>
    safeApiCall(() => {
      // === LOG AVANCÉ DU SERVICE API ===
      if (Array.isArray(products) && products.length > 0) {
      }

      return apiClient
        .post(`${APPROVISIONNEMENT_ENDPOINT}/import/excel`, products)
        .then(r => r.data);
    }, 'bulkImportProducts'),

  /**
   * Supprime un produit.
   */
  deleteProduct: async id =>
    safeApiCall(
      () => apiClient.delete(`${PRODUCT_ENDPOINT}/${id}`).then(r => r.data),
      'deleteProduct'
    ),

  /**
   * Restaure un produit supprimé.
   */
  restoreProduct: async id =>
    safeApiCall(
      () =>
        apiClient.put(`${PRODUCT_ENDPOINT}/${id}/restore`).then(r => r.data),
      'restoreProduct'
    ),

  /**
   * Met à jour le stock d'un produit.
   */
  updateStock: async payload =>
    safeApiCall(
      () =>
        apiClient
          .post(`${PRODUCT_ENDPOINT}/update-stock`, payload)
          .then(r => r.data),
      'updateStock'
    ),

  // CATEGORIES
  /**
   * Récupère toutes les catégories.
   */
  getAllCategories: async (page = 1, size = 3) =>
    safeApiCall(
      () =>
        apiClient
          .get(CATEGORY_ENDPOINT, { params: { page, size } })
          .then(r => r.data),
      'getAllCategories'
    ),

  /**
   * Récupère les catégories supprimées.
   */
  getDeletedCategories: async (page = 1, size = 3) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${CATEGORY_ENDPOINT}/deleted`, { params: { page, size } })
          .then(r => r.data),
      'getDeletedCategories'
    ),

  /**
   * Suggestions de catégories.
   */
  suggestionsCategories: async (query, page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${CATEGORY_ENDPOINT}/suggestions`, {
            params: { query, page, size }
          })
          .then(r => r.data),
      'suggestionsCategories'
    ),

  /**
   * Recherche de catégories.
   */
  categorieSearch: async (query, page = 1, size = 1) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${CATEGORY_ENDPOINT}/search`, { params: { query, page, size } })
          .then(r => r.data),
      'categorieSearch'
    ),

  /**
   * Crée ou modifie une catégorie.
   */
  saveCategory: async data =>
    safeApiCall(() => {
      const method = data.id ? 'put' : 'post';
      const url = data.id
        ? `${CATEGORY_ENDPOINT}/${data.id}`
        : CATEGORY_ENDPOINT;
      return apiClient[method](url, data).then(r => r.data);
    }, 'saveCategory'),

  /**
   * Crée un produit.
   */
  createProduct: async data =>
    safeApiCall(
      () => apiClient.post(PRODUCT_ENDPOINT, data).then(r => r.data),
      'createProduct'
    ),

  /**
   * Met à jour un produit.
   */
  updateProduct: async (id, data) =>
    safeApiCall(
      () => apiClient.put(`${PRODUCT_ENDPOINT}/${id}`, data).then(r => r.data),
      'updateProduct'
    ),

  /**
   * Crée ou met à jour un produit.
   */
  saveProduct: async (formData, isEditMode = false, productId = null) =>
    safeApiCall(() => {
      const method = isEditMode ? 'put' : 'post';
      const url = isEditMode
        ? `${PRODUCT_ENDPOINT}/${productId}`
        : PRODUCT_ENDPOINT;
      return apiClient[method](url, formData).then(r => r.data);
    }, 'saveProduct'),

  /**
   * Supprime une catégorie.
   */
  deleteCategory: async id =>
    safeApiCall(
      () => apiClient.delete(`${CATEGORY_ENDPOINT}/${id}`).then(r => r.data),
      'deleteCategory'
    ),

  /**
   * Restaure une catégorie supprimée.
   */
  restoreCategory: async id =>
    safeApiCall(
      () =>
        apiClient.put(`${CATEGORY_ENDPOINT}/${id}/restore`).then(r => r.data),
      'restoreCategory'
    ),

  // STOCK
  /**
   * Récupère les produits en rupture de stock.
   */
  getRuptureStockProducts: async (page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get(`${STOCK_ENDPOINT}/rupture`, { params: { page, size } })
          .then(r => r.data),
      'getRuptureStockProducts'
    ),

  // APPROVISIONNEMENT
  /**
   * Crée un approvisionnement.
   */
  createApprovisionnement: async formData =>
    safeApiCall(
      () =>
        apiClient
          .post(`${APPROVISIONNEMENT_ENDPOINT}/supply`, formData)
          .then(r => r.data),
      'createApprovisionnement'
    ),

  /**
   * Récupère la liste des approvisionnements.
   */
  getApprovisionnements: async (page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get('/approvisionnements', { params: { page, size } })
          .then(r => r.data),
      'getApprovisionnements'
    ),

  /**
   * Récupère les produits d'un approvisionnement.
   */
  getProductsByApprovisionnement: async (approId, page = 1, size = 10) =>
    safeApiCall(
      () =>
        apiClient
          .get(`/approvisionnements/${approId}/products`, {
            params: { page, size }
          })
          .then(r => r.data),
      'getProductsByApprovisionnement'
    )
};

export default apiServiceV1;
