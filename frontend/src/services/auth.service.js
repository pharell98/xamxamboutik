import axios from 'axios';
import localForage from 'localforage';

console.log('window._env_:', window._env_);
const API_URL =
  (window._env_?.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE_URL) +
  '/auth';

export const authService = {
  login: async (username, password) => {
    console.log('Tentative de connexion à:', API_URL);
    const response = await axios.post(`${API_URL}/login`, {
      login: username,
      password
    });

    const { access_token, refresh_token } = response.data;

    if (access_token) {
      await localForage.setItem('accessToken', access_token);
    }
    if (refresh_token) {
      await localForage.setItem('refreshToken', refresh_token);
    }

    return response.data;
  },

  refreshToken: async () => {
    const storedRefreshToken = await localForage.getItem('refreshToken');
    if (!storedRefreshToken) {
      throw new Error(
        'Aucun refresh token en stockage, impossible de rafraîchir'
      );
    }

    const response = await axios.post(`${API_URL}/refresh`, null, {
      headers: { Authorization: `Bearer ${storedRefreshToken}` }
    });

    const { access_token, refresh_token } = response.data;

    if (access_token) {
      await localForage.setItem('accessToken', access_token);
    }
    if (refresh_token) {
      await localForage.setItem('refreshToken', refresh_token);
    }

    return response.data;
  },

  logout: async () => {
    const storedRefreshToken = await localForage.getItem('refreshToken');
    if (storedRefreshToken) {
      await axios.post(
        `${API_URL}/logout`,
        {},
        { headers: { Authorization: `Bearer ${storedRefreshToken}` } }
      );
    }

    await localForage.removeItem('accessToken');
    await localForage.removeItem('refreshToken');
  },

  register: userData => axios.post(`${API_URL}/register`, userData)
};
