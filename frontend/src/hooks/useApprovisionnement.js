import { useCallback, useState } from 'react';
import apiServiceV1 from '../services/api.service.v1';

// Types d'erreurs simples (facultatif, pour personnaliser les messages)
const ERROR_TYPES = {
  API_ERROR: 'API_ERROR'
};

const ERROR_MESSAGES = {
  [ERROR_TYPES.API_ERROR]: "Erreur lors de l'envoi des données"
};

/**
 * Hook pour gérer la soumission d'un approvisionnement.
 * @returns {Object} { submitApprovisionnement, isLoading, error, resetError }
 * - submitApprovisionnement(formData, { onSuccess, onError }) : Promise
 * - isLoading : booléen
 * - error : message d'erreur ou null
 * - resetError : fonction pour réinitialiser l'erreur
 */
export const useApprovisionnement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Soumission de l'approvisionnement sous forme de FormData
   * @param {FormData} formData - Le FormData contenant le DTO (clé "dto") et éventuellement les images (clé "newproduitImages")
   * @param {Object} options - { onSuccess, onError }
   */
  const submitApprovisionnement = useCallback(
    async (formData, options = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiServiceV1.createApprovisionnement(formData);
        if (options.onSuccess) options.onSuccess(response);
        return response;
      } catch (err) {
        setError(ERROR_MESSAGES.API_ERROR);
        if (options.onError) options.onError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    submitApprovisionnement,
    isLoading,
    error,
    resetError
  };
};
