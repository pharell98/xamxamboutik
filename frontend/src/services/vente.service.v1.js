import apiClient from './apiClient';

const VENTE_ENDPOINT = '/ventes';
const RETOUR_ENDPOINT = '/retours';
const ECHANGE_ENDPOINT = '/echange';

// Protection contre les appels multiples simultanés
let isCreatingVente = false;
let lastVenteData = null;
let lastVenteTimestamp = 0;
const VENTE_COOLDOWN = 2000; // 2 secondes entre deux ventes

const venteServiceV1 = {
  createVente: async venteData => {
    // Protection niveau 1 : Vérifier si une vente est déjà en cours
    if (isCreatingVente) {
      console.warn('[venteServiceV1] ⚠️ Vente déjà en cours de création, requête ignorée');
      throw new Error('Une vente est déjà en cours de traitement. Veuillez patienter.');
    }

    // Protection niveau 2 : Empêcher les ventes identiques en moins de 2 secondes
    const now = Date.now();
    const isDuplicate = 
      lastVenteData && 
      JSON.stringify(lastVenteData) === JSON.stringify(venteData) &&
      (now - lastVenteTimestamp) < VENTE_COOLDOWN;

    if (isDuplicate) {
      console.warn('[venteServiceV1] ⚠️ Vente dupliquée détectée, requête ignorée');
      throw new Error('Vente dupliquée détectée. Veuillez patienter avant de réessayer.');
    }

    try {
      isCreatingVente = true;
      lastVenteData = venteData;
      lastVenteTimestamp = now;

      const response = await apiClient.post(VENTE_ENDPOINT, venteData);
      
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] ❌ Erreur lors de la création de la vente:',
        error
      );
      throw error;
    } finally {
      // Libérer le verrou après un court délai pour éviter les clics trop rapides
      setTimeout(() => {
        isCreatingVente = false;
      }, 500);
    }
  },

  getMostSoldProducts: async (page = 1, size = 24, clientType = 'web') => {
    try {
      const response = await apiClient.get(`${VENTE_ENDPOINT}/produits`, {
        params: { page, size },
        headers: { 'X-Client-Type': clientType }
      });
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la récupération des produits :',
        error
      );
      throw error;
    }
  },

  /**
   * Recherche des produits par libellé (côté serveur)
   * @param {string} libelle - Terme de recherche
   * @param {number} page - Numéro de page (commence à 1)
   * @param {number} size - Taille de page
   * @returns {Promise<Object>} Réponse avec les produits recherchés
   */
  searchProductsByLibelle: async (libelle, page = 1, size = 24) => {
    try {
      const response = await apiClient.get(`${VENTE_ENDPOINT}/produits/search`, {
        params: { libelle, page, size }
      });
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la recherche de produits par libellé :',
        error
      );
      throw error;
    }
  },

  getPaymentModes: async () => {
    try {
      const response = await apiClient.get(`${VENTE_ENDPOINT}/paiementModes`);
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la récupération des modes de paiement :',
        error
      );
      throw error;
    }
  },

  getSalesByPeriod: async (periodEndpoint, page = 1, size = 24) => {
    try {
      const response = await apiClient.get(
        `${VENTE_ENDPOINT}/${periodEndpoint}`,
        {
          params: { page, size }
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la récupération des ventes par période:',
        error
      );
      throw error;
    }
  },

  getSalesByDate: async (dateYYYYMMDD, page = 1, size = 24) => {
    try {
      const response = await apiClient.get(`${VENTE_ENDPOINT}/by-date`, {
        params: { date: dateYYYYMMDD, page, size }
      });
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la récupération des ventes pour une date :',
        error
      );
      throw error;
    }
  },

  // Liste des produits éligibles pour échange (affichage libellé, envoi ID)
  getEchangeProductList: async () => {
    try {
      const response = await apiClient.get(`${ECHANGE_ENDPOINT}/productList`);
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la récupération des produits pour échange:',
        error
      );
      throw error;
    }
  },

  // Generic remboursement endpoint removed per v3 API contracts

  createRemboursementBonEtat: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/remboursement/avec-retour-bon-etat`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la création du remboursement bon état:',
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        'Erreur lors du remboursement bon état. Veuillez réessayer.';
      throw new Error(errorMessage);
    }
  },

  createRemboursementDefectueux: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/remboursement/defectueux`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la création du remboursement défectueux:',
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        'Erreur lors du remboursement défectueux. Veuillez réessayer.';
      throw new Error(errorMessage);
    }
  },

  // Generic echange endpoint removed per v3 API contracts

  createEchangeDefectueux: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/echange/defectueux`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'échange défectueux:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'échange défectueux. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },

  createEchangeChangementPreference: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/echange/changement-preference`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'échange changement de préférence:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'échange changement de préférence. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },

  createEchangeAjustementPrix: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/echange/ajustement-prix`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'échange ajustement de prix:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'échange ajustement de prix. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  }

  // All annulation endpoints removed per v3 API contracts
};

export default venteServiceV1;
