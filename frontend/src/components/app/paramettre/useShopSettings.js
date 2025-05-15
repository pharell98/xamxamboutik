import { useEffect, useState } from 'react';
import { useToast } from 'components/common/Toast';
import apiServiceSettings from '../../../services/api.service.settings';
import { useStompClient } from '../../../contexts/StompContext';

const useShopSettings = () => {
  const [selectedSettings, setSelectedSettings] = useState(null);
  const [editModeSettings, setEditModeSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { addToast } = useToast();
  const { stompClient, connected } = useStompClient();

  // Normalize settings data
  const normalizeSettings = settings => ({
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
    street: settings.street || '',
    facebookUrl: settings.facebookUrl || '',
    instagramUrl: settings.instagramUrl || '',
    twitterUrl: settings.twitterUrl || '',
    websiteUrl: settings.websiteUrl || ''
  });

  // Initial fetch of settings
  useEffect(() => {
    const fetchExistingSettings = async () => {
      try {
        const response = await apiServiceSettings.getSettings();
        if (response) {
          const normalizedSettings = normalizeSettings(response);
          setSelectedSettings(normalizedSettings);
          setEditModeSettings(true);
        } else {
          setSelectedSettings(null);
          setEditModeSettings(false);
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error(
            '[useShopSettings] Erreur lors de la récupération initiale:',
            error
          );
        }
      }
    };
    fetchExistingSettings();
  }, []);

  // Subscribe to STOMP /topic/settings
  useEffect(() => {
    let subscription;
    if (stompClient && connected && stompClient.active) {
      console.log('[useShopSettings] Souscription au topic /topic/settings');
      subscription = stompClient.subscribe('/topic/settings', message => {
        try {
          const settings = JSON.parse(message.body);
          console.log(
            '[useShopSettings] Message reçu sur /topic/settings:',
            settings
          );
          const normalizedSettings = normalizeSettings(settings);
          setSelectedSettings(normalizedSettings);
          setEditModeSettings(true);
          addToast({
            title: 'Paramètres mis à jour',
            message: `Les paramètres de "${settings.shopName}" ont été ${
              normalizedSettings.id ? 'mis à jour' : 'créés'
            }.`,
            type: 'success'
          });
        } catch (error) {
          console.error(
            '[useShopSettings] Erreur lors du traitement du message STOMP:',
            error
          );
        }
      });
    }
    return () => {
      if (subscription) {
        console.log('[useShopSettings] Désabonnement du topic /topic/settings');
        subscription.unsubscribe();
      }
    };
  }, [stompClient, connected, addToast]);

  const handleSaveSettings = async formData => {
    try {
      const response = await apiServiceSettings.saveSettings(
        formData,
        editModeSettings,
        selectedSettings?.id
      );
      // No need to update state here; STOMP message will handle it
      setRefreshKey(prev => prev + 1);
      return response;
    } catch (error) {
      console.error('[useShopSettings] Erreur lors de la sauvegarde:', error);
      const serverMessage =
        typeof error === 'string'
          ? error
          : error.response?.data?.message ||
            'Une erreur est survenue lors de la création ou de la mise à jour des paramètres.';
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error'
      });
      throw error;
    }
  };

  return {
    selectedSettings,
    editModeSettings,
    handleSaveSettings,
    refreshKey
  };
};

export default useShopSettings;
