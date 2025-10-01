import apiClient from './apiClient';

const SETTINGS_ENDPOINT = '/settings';

// Service amélioré pour les paramètres de la boutique
export const shopSettingsService = {
  getShopSettings: async () => {
    try {
      const response = await apiClient.get(SETTINGS_ENDPOINT);

      // Normaliser les données reçues
      const settings = response.data.data || response.data;

      return {
        success: true,
        data: {
          id: settings.id,
          shopName: settings.shopName || '',
          logo:
            settings.logo && settings.logo !== 'blob'
              ? { preview: settings.logo }
              : null,
          email: settings.email || '',
          phone: settings.phone || '',
          country: settings.country || '',
          region: settings.region || '',
          department: settings.department || '',
          neighborhood: settings.neighborhood || '',
          street: settings.street || ''
        },
        message: 'Paramètres récupérés avec succès'
      };
    } catch (error) {
      console.error('Erreur API getShopSettings:', error);

      if (error.response?.status === 404) {
        return {
          success: false,
          data: null,
          message: 'Aucun paramètre trouvé'
        };
      }

      throw new Error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des paramètres'
      );
    }
  },

  saveShopSettings: async formData => {
    try {
      // Vérifier si c'est une mise à jour ou une création
      const settingsData = formData.get('settings');
      const settings = JSON.parse(settingsData);
      const isEditMode = settings.id;

      const method = isEditMode ? 'put' : 'post';
      const url = isEditMode
        ? `${SETTINGS_ENDPOINT}/${settings.id}`
        : SETTINGS_ENDPOINT;

      const response = await apiClient[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const savedSettings = response.data.data || response.data;

      return {
        success: true,
        data: {
          id: savedSettings.id,
          shopName: savedSettings.shopName || '',
          logo:
            savedSettings.logo && savedSettings.logo !== 'blob'
              ? { preview: savedSettings.logo }
              : null,
          email: savedSettings.email || '',
          phone: savedSettings.phone || '',
          country: savedSettings.country || '',
          region: savedSettings.region || '',
          department: savedSettings.department || '',
          neighborhood: savedSettings.neighborhood || '',
          street: savedSettings.street || ''
        },
        message: isEditMode
          ? 'Paramètres mis à jour avec succès'
          : 'Paramètres créés avec succès'
      };
    } catch (error) {
      console.error('Erreur API saveShopSettings:', error);

      let errorMessage = 'Erreur lors de la sauvegarde des paramètres';

      if (error.response?.status === 400) {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Un paramètre avec ces informations existe déjà.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Le fichier est trop volumineux. Taille maximale : 5MB.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      throw new Error(errorMessage);
    }
  },

  deleteShopSettings: async id => {
    try {
      await apiClient.delete(`${SETTINGS_ENDPOINT}/${id}`);

      return {
        success: true,
        message: 'Paramètres supprimés avec succès'
      };
    } catch (error) {
      console.error('Erreur API deleteShopSettings:', error);

      throw new Error(
        error.response?.data?.message ||
          'Erreur lors de la suppression des paramètres'
      );
    }
  }
};

// Service legacy pour compatibilité
const apiServiceSettings = {
  getSettings: async () => {
    try {
      const response = await apiClient.get(SETTINGS_ENDPOINT);
      return response.data.data; // Accéder à response.data.data
    } catch (error) {
      throw (
        error.response?.data?.message ||
        'Erreur lors de la récupération des paramètres'
      );
    }
  },

  saveSettings: async (formData, isEditMode, id) => {
    try {
      // Vérifier la présence du champ file
      const file = formData.get('file');
      const method = isEditMode ? 'put' : 'post';
      const url = isEditMode ? `${SETTINGS_ENDPOINT}/${id}` : SETTINGS_ENDPOINT;
      const response = await apiClient[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.data; // Accéder à response.data.data
    } catch (error) {
      throw (
        error.response?.data?.message ||
        'Erreur lors de la sauvegarde des paramètres'
      );
    }
  }
};

export default apiServiceSettings;
