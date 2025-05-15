import apiClient from './apiClient';

const VENTE_ENDPOINT = '/ventes';
const RETOUR_ENDPOINT = '/retours';

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

  createRemboursement: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/remboursement`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        '[venteServiceV1] Erreur lors de la création du remboursement:',
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        'Erreur lors du remboursement. Veuillez réessayer.';
      throw new Error(errorMessage);
    }
  },

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

  createEchange: async data => {
    try {
      const response = await apiClient.post(`${RETOUR_ENDPOINT}/echange`, data);
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'échange:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'échange. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },

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
  },

  createAnnulation: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/annulation`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'annulation:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'annulation. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },

  createAnnulationApresLivraison: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/annulation/apres-livraison`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'annulation après livraison:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'annulation après livraison. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },

  createAnnulationPartielle: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/annulation/partielle`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'annulation partielle:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'annulation partielle. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },

  createAnnulationNonConformite: async data => {
    try {
      const response = await apiClient.post(
        `${RETOUR_ENDPOINT}/annulation/non-conformite`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[venteServiceV1] Erreur lors de la création de l'annulation pour non-conformité:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'annulation pour non-conformité. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  }
};

export default venteServiceV1;
