import apiClient from './apiClient';

const PRODUCT_ENDPOINT = '/produits';
const CATEGORY_ENDPOINT = '/categories';
const STOCK_ENDPOINT = '/stock';
const APPROVISIONNEMENT_ENDPOINT = '/approvisionnement';

const apiServiceV1 = {
  // PRODUITS
  getAllProducts: async (page = 1, size = 10, filters = {}) => {
    try {
      const response = await apiClient.get(PRODUCT_ENDPOINT, {
        params: { page, size, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getAllProducts:', error);
      throw error;
    }
  },

  getDeletedProducts: async (page = 1, size = 10) => {
    try {
      const response = await apiClient.get(`${PRODUCT_ENDPOINT}/deleted`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getDeletedProducts:', error);
      throw error;
    }
  },

  getProductSuggestions: async (query, page = 1, size = 10) => {
    try {
      const response = await apiClient.get(`${PRODUCT_ENDPOINT}/suggestions`, {
        params: { query, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getProductSuggestions:', error);
      throw error;
    }
  },

  getApprovisionnementSuggestions: async (query, page = 1, size = 10) => {
    try {
      const response = await apiClient.get(
        `${PRODUCT_ENDPOINT}/approvisionnement/suggestions`,
        { params: { query, page, size } }
      );
      return response.data;
    } catch (error) {
      console.error(
        '[apiServiceV1] Erreur approvisionnement suggestions:',
        error
      );
      throw error;
    }
  },

  getProductsByCategory: async (categorieId, page = 1, size = 10) => {
    try {
      const response = await apiClient.get(
        `${PRODUCT_ENDPOINT}/category/${categorieId}`,
        { params: { page, size } }
      );
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getProductsByCategory:', error);
      throw error;
    }
  },

  getProductByBarcode: async barcode => {
    try {
      const response = await apiClient.get(`/api/products/barcode/${barcode}`, {
        headers: { 'X-Client-Type': 'web' }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getProductByBarcode:', error);
      throw error;
    }
  },

  saveProduct: async (formData, isEditMode = false, id = null) => {
    try {
      console.log('[apiServiceV1] Debug: Vérif URL image...');
      const rawProduit = formData.get('produit');
      if (rawProduit) {
        const text = rawProduit.text ? await rawProduit.text() : rawProduit;
        let produitObj;
        try {
          produitObj = JSON.parse(text);
          console.log(
            '[apiServiceV1] imageURL =',
            produitObj.imageURL || 'Aucune URL'
          );
        } catch (parseErr) {
          console.warn('[apiServiceV1] parse JSON produit error:', parseErr);
        }
      }

      console.log('[apiServiceV1] Contenu du formData avant envoi:');
      for (const [key, value] of formData.entries()) {
        console.log(`→ Champ "${key}":`, value);
      }

      const method = isEditMode ? 'put' : 'post';
      const url = isEditMode ? `${PRODUCT_ENDPOINT}/${id}` : PRODUCT_ENDPOINT;
      const response = await apiClient[method](url, formData);

      console.log('[apiServiceV1] Réponse serveur:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur saveProduct:', error);
      throw error;
    }
  },

  bulkImportProducts: async products => {
    try {
      // Vérifier et préparer les données pour le backend
      const preparedProducts = products.map((product, index) => {
        const preparedProduct = {
          id: product.id || null,
          codeProduit: product.codeProduit || '',
          libelle: product.libelle || '',
          prixAchat: product.prixAchat || 0,
          prixVente: product.prixVente || 0,
          stockDisponible: product.stockDisponible || 0,
          seuilRuptureStock: product.seuilRuptureStock || 0,
          categorieId: product.categorieId || 0,
          categorieName: product.categorieName || '',
          imageURL: product.imageURL || '',
          useImageURL: product.useImageURL || false,
          image: null
        };

        console.log(
          `[bulkImportProducts] Produit ${index + 1} envoyé au backend:`,
          preparedProduct,
          `imageURL: ${preparedProduct.imageURL}, useImageURL: ${preparedProduct.useImageURL}`
        );

        return preparedProduct;
      });

      const response = await apiClient.post(
        `${PRODUCT_ENDPOINT}/import/excel`,
        preparedProducts
      );
      console.log('[bulkImportProducts] Réponse serveur:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur bulkImportProducts:', error);
      throw error;
    }
  },

  deleteProduct: async id => {
    try {
      const response = await apiClient.delete(`${PRODUCT_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur deleteProduct:', error);
      throw error;
    }
  },

  restoreProduct: async id => {
    try {
      const response = await apiClient.put(`${PRODUCT_ENDPOINT}/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur restoreProduct:', error);
      throw error;
    }
  },

  updateStock: async payload => {
    try {
      const response = await apiClient.post(
        `${PRODUCT_ENDPOINT}/update-stock`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur updateStock:', error);
      throw error;
    }
  },

  // CATEGORIES
  getAllCategories: async (page = 1, size = 3) => {
    try {
      const response = await apiClient.get(CATEGORY_ENDPOINT, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getAllCategories:', error);
      throw error;
    }
  },

  getDeletedCategories: async (page = 1, size = 3) => {
    try {
      const response = await apiClient.get(`${CATEGORY_ENDPOINT}/deleted`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getDeletedCategories:', error);
      throw error;
    }
  },

  suggestionsCategories: async (query, page = 1, size = 10) => {
    try {
      const response = await apiClient.get(`${CATEGORY_ENDPOINT}/suggestions`, {
        params: { query, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur suggestionsCategories:', error);
      throw error;
    }
  },

  categorieSearch: async (query, page = 1, size = 1) => {
    try {
      const response = await apiClient.get(`${CATEGORY_ENDPOINT}/search`, {
        params: { query, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur categorieSearch:', error);
      throw error;
    }
  },

  saveCategory: async data => {
    try {
      const method = data.id ? 'put' : 'post';
      const url = data.id
        ? `${CATEGORY_ENDPOINT}/${data.id}`
        : CATEGORY_ENDPOINT;
      const response = await apiClient[method](url, data);
      return response.data;
    } catch (error) {
      consolePreference('[apiServiceV1] Erreur saveCategory:', error);
      throw error;
    }
  },

  deleteCategory: async id => {
    try {
      const response = await apiClient.delete(`${CATEGORY_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur deleteCategory:', error);
      throw error;
    }
  },

  restoreCategory: async id => {
    try {
      const response = await apiClient.put(
        `${CATEGORY_ENDPOINT}/${id}/restore`
      );
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur restoreCategory:', error);
      throw error;
    }
  },

  // STOCK
  getRuptureStockProducts: async (page = 1, size = 10) => {
    try {
      const response = await apiClient.get(`${STOCK_ENDPOINT}/rupture`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur rupture stock:', error);
      throw error;
    }
  },

  // APPROVISIONNEMENT
  createApprovisionnement: async formData => {
    try {
      const response = await apiClient.post(
        `${APPROVISIONNEMENT_ENDPOINT}/supply`,
        formData
      );
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur createApprovisionnement:', error);
      throw error;
    }
  },

  getApprovisionnements: async (page = 1, size = 10) => {
    try {
      const response = await apiClient.get('/approvisionnements', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[apiServiceV1] Erreur getApprovisionnements:', error);
      throw error;
    }
  },

  getProductsByApprovisionnement: async (approId, page = 1, size = 10) => {
    try {
      const response = await apiClient.get(
        `/approvisionnements/${approId}/products`,
        { params: { page, size } }
      );
      return response.data;
    } catch (error) {
      console.error(
        '[apiServiceV1] Erreur getProductsByApprovisionnement:',
        error
      );
      throw error;
    }
  }
};

export default apiServiceV1;
