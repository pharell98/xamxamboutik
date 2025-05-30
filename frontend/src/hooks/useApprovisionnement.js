import { useCallback, useState } from 'react';
import apiServiceV1 from '../services/api.service.v1';

// Types d'erreurs simples (facultatif, pour personnaliser les messages)
const ERROR_TYPES = {
  API_ERROR: 'API_ERROR'
};

const ERROR_MESSAGES = {
  [ERROR_TYPES.API_ERROR]: "Erreur lors de l'envoi des données"
};

export const useApprovisionnement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Soumission de l'supply sous forme de FormData
   * @param {FormData} formData - Le FormData contenant le DTO (clé "dto") et éventuellement les images (clé "newproduitImages")
   */
  const submitApprovisionnement = useCallback(async formData => {
    setIsLoading(true);
    setError(null);

    try {
      // Petit log pour voir le contenu dans la console (remarque : console.log n'affiche pas toujours le FormData)
      // Envoi du FormData à l'API via apiServiceV1
      const response = await apiServiceV1.createApprovisionnement(formData);
      return response;
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
      setError(ERROR_MESSAGES.API_ERROR);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    submitApprovisionnement,
    isLoading,
    error
  };
};
