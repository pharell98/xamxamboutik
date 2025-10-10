import apiClient from './apiClient';

/**
 * Service pour gérer les factures
 */
class FactureService {
  /**
   * Récupère les factures du jour
   * @param {number} page - Numéro de page (défaut: 0)
   * @param {number} size - Taille de page (défaut: 20)
   * @returns {Promise<Object>} Réponse avec les factures
   */
  async getFacturesDuJour(page = 0, size = 20) {
    try {
      const response = await apiClient.get('/factures/today', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des factures du jour:',
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les factures par période
   * @param {string} periode - Période (today, month, etc.)
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de page
   * @returns {Promise<Object>} Réponse avec les factures
   */
  async getFacturesByPeriod(periode, page = 0, size = 20) {
    try {
      let endpoint;
      switch (periode) {
        case 'today':
          endpoint = '/factures/today';
          break;
        case 'month':
        case 'current-month':
          endpoint = '/factures/month';
          break;
        default:
          endpoint = '/factures/today';
      }

      const response = await apiClient.get(endpoint, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des factures par période:',
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les factures par date spécifique
   * @param {string} date - Date au format YYYY-MM-DD
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de page
   * @returns {Promise<Object>} Réponse avec les factures
   */
  async getFacturesByDate(date, page = 0, size = 20) {
    try {
      const response = await apiClient.get(`/factures/date/${date}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des factures par date:',
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les détails d'une facture
   * @param {string} numeroFacture - Numéro de la facture
   * @returns {Promise<Object>} Détails de la facture
   */
  async getFactureDetails(numeroFacture) {
    try {
      const response = await apiClient.get(`/factures/${numeroFacture}`);
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des détails de la facture:',
        error
      );
      throw error;
    }
  }

  /**
   * Récupère toutes les factures
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de page
   * @returns {Promise<Object>} Réponse avec les factures
   */
  async getAllFactures(page = 0, size = 20) {
    try {
      const response = await apiClient.get('/factures/all', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération de toutes les factures:',
        error
      );
      throw error;
    }
  }

  /**
   * Génère une facture PDF
   * @param {string} numeroFacture - Numéro de la facture
   * @returns {Promise<Blob>} PDF de la facture
   */
  async generateFacturePDF(numeroFacture) {
    try {
      const response = await apiClient.get(`/factures/${numeroFacture}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }

  /**
   * Données fictives pour les tests
   * @returns {Object} Données fictives
   */
  getMockData() {
    return {
      success: true,
      message: 'Factures du jour récupérées avec succès',
      data: {
        factures: [
          {
            numeroFacture: 'FAC-18-09-25-0004',
            dateVente: '2025-09-18T10:46:36.152069',
            nomClient: null,
            telephoneClient: null,
            modePaiement: 'espece',
            montantTotal: 20,
            montantPayer: 20,
            montantRestant: 0,
            estCredit: false,
            detailFacture: [
              {
                libelle: 'style black',
                quantite: 1,
                prix: 10,
                montantTotal: 10
              },
              {
                libelle: 'dove orange',
                quantite: 1,
                prix: 10,
                montantTotal: 10
              }
            ],
            utilisateurId: 1,
            utilisateurNom: 'Admin Gestionnaire'
          },
          {
            numeroFacture: 'FAC-18-09-25-0003',
            dateVente: '2025-09-18T09:49:16.550608',
            nomClient: null,
            telephoneClient: null,
            modePaiement: 'espece',
            montantTotal: 10,
            montantPayer: 10,
            montantRestant: 0,
            estCredit: false,
            detailFacture: [
              {
                libelle: 'style silver',
                quantite: 1,
                prix: 10,
                montantTotal: 10
              }
            ],
            utilisateurId: null,
            utilisateurNom: null
          },
          {
            numeroFacture: 'FAC-18-09-25-0002',
            dateVente: '2025-09-18T09:48:22.933505',
            nomClient: 'Mouhamadou bobo sow',
            telephoneClient: '777930609',
            modePaiement: 'mobile_money',
            montantTotal: 20,
            montantPayer: 20,
            montantRestant: 0,
            estCredit: false,
            detailFacture: [
              {
                libelle: 'style sport',
                quantite: 1,
                prix: 10,
                montantTotal: 10
              },
              {
                libelle: 'dove orange',
                quantite: 1,
                prix: 10,
                montantTotal: 10
              }
            ],
            utilisateurId: 2,
            utilisateurNom: 'Vendeur Principal'
          },
          {
            numeroFacture: 'FAC-18-09-25-0001',
            dateVente: '2025-09-18T09:38:41.314358',
            nomClient: null,
            telephoneClient: null,
            modePaiement: 'espece',
            montantTotal: 1001,
            montantPayer: 1001,
            montantRestant: 0,
            estCredit: false,
            detailFacture: [
              {
                libelle: 'style black',
                quantite: 1,
                prix: 1001,
                montantTotal: 1001
              }
            ],
            utilisateurId: null,
            utilisateurNom: null
          }
        ],
        totalElements: 4,
        totalPages: 1,
        currentPage: 0,
        pageSize: 20
      },
      timestamp: '2025-09-15T16:23:54.01889'
    };
  }
}

export default new FactureService();
