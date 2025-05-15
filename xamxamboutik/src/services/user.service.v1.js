import apiClient from './apiClient';

const USER_ENDPOINT = '/users';
const userServiceV1 = {
  getAllUsers: async (page = 0, size = 10, clientType = 'web') => {
    try {
      const response = await apiClient.get(USER_ENDPOINT, {
        params: { page, size, clientType }
      });
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur getAllUsers:', error);
      throw error;
    }
  },

  getDeletedUsers: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINT}/deleted`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur getDeletedUsers:', error);
      throw error;
    }
  },

  getUserById: async (id, clientType = 'web') => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINT}/${id}`, {
        params: { clientType }
      });
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur getUserById:', error);
      throw error;
    }
  },

  saveUser: async userData => {
    try {
      const response = await apiClient.post(USER_ENDPOINT, userData);
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur saveUser:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`${USER_ENDPOINT}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur updateUser:', error);
      throw error;
    }
  },

  deleteUser: async id => {
    try {
      const response = await apiClient.delete(`${USER_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur deleteUser:', error);
      throw error;
    }
  },

  updatePassword: async (id, newPassword) => {
    try {
      const response = await apiClient.patch(
        `${USER_ENDPOINT}/${id}/password`,
        { newPassword }, // Envoyer un objet avec la propriété newPassword
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur updatePassword:', error);
      throw error;
    }
  },

  restoreUser: async id => {
    try {
      const response = await apiClient.put(`${USER_ENDPOINT}/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur restoreUser:', error);
      throw error;
    }
  },

  getRoles: async () => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINT}/roles`);
      return response.data;
    } catch (error) {
      console.error('[userServiceV1] Erreur getRoles:', error);
      throw error;
    }
  }
};

export default userServiceV1;
