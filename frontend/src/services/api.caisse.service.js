import apiClient from './apiClient';

const CAISSE_ENDPOINT = '/caisse';

export const caisseService = {
  /**
   * Récupère l'état actuel de la caisse en temps réel
   * GET /caisse/etat
   */
  getEtat: async () => {
    try {
      const response = await apiClient.get(`${CAISSE_ENDPOINT}/etat`);
      return response.data;
    } catch (error) {
      console.error(
        "[caisseService] Erreur lors de la récupération de l'état de la caisse:",
        error
      );
      throw error;
    }
  },

  /**
   * Ferme manuellement la caisse avant 23h59
   * POST /caisse/fermer
   */
  fermerManuellement: async () => {
    try {
      const response = await apiClient.post(`${CAISSE_ENDPOINT}/fermer`);
      return response.data;
    } catch (error) {
      console.error(
        '[caisseService] Erreur lors de la fermeture manuelle de la caisse:',
        error
      );
      throw error;
    }
  },

  /**
   * Force la mise à jour des ventes en temps réel
   * POST /caisse/refresh
   */
  refreshVentesRealtime: async () => {
    try {
      const response = await apiClient.post(`${CAISSE_ENDPOINT}/refresh`);
      return response.data;
    } catch (error) {
      console.error(
        '[caisseService] Erreur lors du rafraîchissement des ventes en temps réel:',
        error
      );
      throw error;
    }
  },

  /**
   * Vérifie si la caisse est ouverte
   * GET /caisse/is-ouverte
   */
  isOuverte: async () => {
    try {
      const response = await apiClient.get(`${CAISSE_ENDPOINT}/is-ouverte`);
      return response.data; // ex: { estOuverte: true }
    } catch (error) {
      console.error(
        "[caisseService] Erreur lors de la vérification de l'état d'ouverture de la caisse:",
        error
      );
      throw error;
    }
  }
};

export default caisseService;
