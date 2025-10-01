import apiClient from './apiClient';

const caisseService = {
  getEtat: async () => {
    try {
      const response = await apiClient.get('/caisse/etat');
      return response.data;
    } catch (error) {
      console.error(
        "[caisseService] Erreur lors de la récupération de l'état de la caisse:",
        error
      );
      throw error;
    }
  },

  fermer: async () => {
    try {
      const response = await apiClient.post('/caisse/fermer');
      return response.data;
    } catch (error) {
      console.error(
        '[caisseService] Erreur lors de la fermeture de la caisse:',
        error
      );
      throw error;
    }
  },

  refresh: async () => {
    try {
      const response = await apiClient.post('/caisse/refresh');
      return response.data;
    } catch (error) {
      console.error(
        '[caisseService] Erreur lors du rafraîchissement de la caisse:',
        error
      );
      throw error;
    }
  },

  isOuverte: async () => {
    try {
      const response = await apiClient.get('/caisse/is-ouverte');
      return response.data;
    } catch (error) {
      console.error(
        "[caisseService] Erreur lors de la vérification de l'état de la caisse:",
        error
      );
      throw error;
    }
  }
};

export default caisseService;
