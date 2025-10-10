import apiClient from './apiClient';

const VENTE_ENDPOINT = '/ventes';
const RETOUR_ENDPOINT = '/retours';
const ECHANGE_ENDPOINT = '/echange';

const venteServiceV1 = {
  createVente: async venteData => {
    try {
      const response = await apiClient.post(VENTE_ENDPOINT, venteData);
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la création de la vente:',
        error
      );
      throw error;
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
