import apiClient from './apiClient';

const dashboardService = {
  /**
   * Récupère le bénéfice cumulatif depuis le début de l'activité.
   * Endpoint backend : GET /api/v1/statistiques/benefice/cumulatif
   */
  getCumulativeBenefit: async () => {
    try {
      const response = await apiClient.get(
        '/api/v1/statistiques/benefice/cumulatif'
      );
      // La réponse devrait être au format { message, data } où data contient le bénéfice.
      return response.data;
    } catch (error) {
      console.error(
        '[dashboardService] Erreur lors de la récupération du bénéfice cumulatif :',
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  /**
   * Récupère le bénéfice total entre deux dates (dates au format "yyyy-MM-dd").
   * Endpoint backend : GET /api/v1/statistiques/benefice
   * @param {string} startDate - Date de début en "yyyy-MM-dd"
   * @param {string} endDate   - Date de fin en "yyyy-MM-dd"
   */
  getBenefitBetweenDates: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/api/v1/statistiques/benefice', {
        params: {
          startDate,
          endDate
        }
      });
      // La réponse devrait contenir un objet ApiResponse avec le résultat dans data.
      return response.data;
    } catch (error) {
      console.error(
        '[dashboardService] Erreur lors de la récupération du bénéfice entre les dates :',
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  /**
   * Récupère les dates de la première et dernière vente effectuées.
   * Endpoint backend : GET /api/v1/statistiques/sales-dates
   */
  getSalesDateRange: async () => {
    try {
      const response = await apiClient.get('/api/v1/statistiques/sales-dates');
      // La réponse devrait contenir un objet ApiResponse avec data: { firstSaleDate, lastSaleDate }
      return response.data;
    } catch (error) {
      console.error(
        '[dashboardService] Erreur lors de la récupération des dates des ventes :',
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }
};

export default dashboardService;
