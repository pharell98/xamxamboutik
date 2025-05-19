// src/services/apiClient.js
import axios from 'axios';
import localForage from 'localforage';
import { authService } from './auth.service';

console.log('window._env_:', window._env_);
console.log('process.env:', process.env);
const apiClient = axios.create({
  baseURL:
    window._env_?.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE_URL
});

// ---------------- Intercepteur REQUEST ----------------
apiClient.interceptors.request.use(
  async config => {
    const token = await localForage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ---------------- Intercepteur RESPONSE ----------------
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si on reçoit un 401 et qu'on n'a pas déjà réessayé
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Appel de la méthode refresh
        const data = await authService.refreshToken();
        const newAccessToken = data.access_token || data.accessToken;
        if (newAccessToken) {
          await localForage.setItem('accessToken', newAccessToken);
          // On met à jour l'Authorization
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // On rejoue la requête initiale
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, on supprime les tokens et on redirige vers login
        await localForage.removeItem('accessToken');
        await localForage.removeItem('refreshToken');
        window.location.href = '/authentication/card/login';
        return Promise.reject(refreshError);
      }
    }

    // Si le token a déjà été rafraîchi et qu'on est toujours en 401 => on redirige
    if (error.response?.status === 401 && originalRequest._retry) {
      await localForage.removeItem('accessToken');
      await localForage.removeItem('refreshToken');
      window.location.href = '/authentication/card/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
