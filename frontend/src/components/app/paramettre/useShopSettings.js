import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../common/Toast';
import apiServiceSettings from '../../../services/api.service.settings';

const useShopSettings = () => {
  const [selectedSettings, setSelectedSettings] = useState(null);
  const [editModeSettings, setEditModeSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { addToast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiServiceSettings.getSettings();
      if (response) {
        // Normaliser les données reçues
        const normalizedSettings = {
          id: response.id,
          shopName: response.shopName || '',
          logo:
            response.logo && response.logo !== 'blob'
              ? { preview: response.logo }
              : null,
          email: response.email || '',
          phone: response.phone || '',
          country: response.country || '',
          region: response.region || '',
          department: response.department || '',
          neighborhood: response.neighborhood || '',
          street: response.street || ''
        };
        setSelectedSettings(normalizedSettings);
        setEditModeSettings(true);
      } else {
        setSelectedSettings(null);
        setEditModeSettings(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      addToast({
        title: 'Erreur',
        message: 'Erreur lors du chargement des paramètres',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings, refreshKey]);

  const handleSaveSettings = useCallback(
    async formData => {
      try {
        setIsLoading(true);

        // Notification de début de sauvegarde
        addToast({
          title: 'Enregistrement en cours',
          message: 'Enregistrement des paramètres en cours...',
          type: 'info',
          duration: 3000
        });

        const response = await apiServiceSettings.saveSettings(
          formData,
          editModeSettings,
          selectedSettings?.id
        );

        if (response) {
          // Notification de succès
          addToast({
            title: 'Succès !',
            message: editModeSettings
              ? 'Les paramètres ont été mis à jour avec succès.'
              : 'Les paramètres ont été créés avec succès.',
            type: 'success'
          });

          setRefreshKey(prev => prev + 1);
          setEditModeSettings(true);
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des paramètres:', error);

        // Notification d'erreur
        addToast({
          title: 'Erreur !',
          message:
            error.message || "Erreur lors de l'enregistrement des paramètres",
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, editModeSettings, selectedSettings?.id]
  );

  const resetSettings = useCallback(() => {
    setSelectedSettings(null);
    setEditModeSettings(false);
    setRefreshKey(prev => prev + 1);

    addToast({
      title: 'Réinitialisation',
      message: 'Les paramètres ont été réinitialisés.',
      type: 'info'
    });
  }, [addToast]);

  return {
    selectedSettings,
    editModeSettings,
    isLoading,
    refreshKey,
    handleSaveSettings,
    resetSettings,
    fetchSettings
  };
};

export default useShopSettings;
