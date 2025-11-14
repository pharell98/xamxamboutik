import apiClient from './apiClient';

const dashboardService = {
  /**
   * Récupère le bénéfice cumulatif depuis le début de l'activité.
   * Endpoint backend : GET /statistiques/benefice/cumulatif
   */
  getCumulativeBenefit: async () => {
    try {
      const response = await apiClient.get('/statistiques/benefice/cumulatif');
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
   * Endpoint backend : GET /statistiques/benefice
   * @param {string} startDate - Date de début en "yyyy-MM-dd"
   * @param {string} endDate   - Date de fin en "yyyy-MM-dd"
   */
  getBenefitBetweenDates: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/statistiques/benefice', {
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
   * Endpoint backend : GET /statistiques/sales-dates
   */
  getSalesDateRange: async () => {
    try {
      const response = await apiClient.get('/statistiques/sales-dates');
      // La réponse devrait contenir un objet ApiResponse avec data: { firstSaleDate, lastSaleDate }
      return response.data;
    } catch (error) {
      console.error(
        '[dashboardService] Erreur lors de la récupération des dates des ventes :',
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  /**
   * Récupère les KPIs complémentaires (panier moyen, tickets, produits vendus, alertes stock)
   * Endpoint backend : GET /statistiques/ventes/kpis-complementaires
   * @param {string} period - Période : today, 7days, month, year
   */
  getKpisComplementaires: async (period = 'today') => {
    try {
      const response = await apiClient.get(
        '/statistiques/ventes/kpis-complementaires',
        {
          params: { period }
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        '[dashboardService] Erreur lors de la récupération des KPIs complémentaires :',
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  /**
   * Récupère la répartition des ventes par mode de paiement
   * Endpoint backend : GET /statistiques/ventes/by-payment-mode
   * @param {string} period - Période : today, 7days, month, year
   */
  getPaymentModeBreakdown: async (period = 'today') => {
    try {
      const response = await apiClient.get(
        '/statistiques/ventes/by-payment-mode',
        {
          params: { period }
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        '[dashboardService] Erreur lors de la récupération de la répartition des paiements :',
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  /**
   * Récupère l'évolution du CA sur les N derniers jours
   * Endpoint backend : GET /statistiques/ventes/evolution-ca
   * @param {number} days - Nombre de jours (ex: 7, 15, 30)
   */
  getSalesEvolution: async (days = 7) => {
    try {
      const response = await apiClient.get(
        '/statistiques/ventes/evolution-ca',
        {
          params: { days }
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "[dashboardService] Erreur lors de la récupération de l'évolution des ventes :",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }
};

export default dashboardService;
