import apiClient from './apiClient';

const SETTINGS_ENDPOINT = '/settings';

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
