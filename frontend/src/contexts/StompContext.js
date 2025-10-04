import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef
} from 'react';
import { Client } from '@stomp/stompjs';
import PropTypes from 'prop-types';

const StompContext = createContext();

const parseMessageBody = body => {
  if (body && (body.trim().startsWith('{') || body.trim().startsWith('['))) {
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error('Erreur lors du parsing JSON du message:', e);
      return body;
    }
  }
  return body;
};

export const StompProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [data, setData] = useState([]);
  const [approvisionnementData, setApprovisionnementData] = useState([]);
  const [venteData, setVenteData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const pendingSubscriptionsRef = useRef([]);
  const retryIntervalRef = useRef(null);

  useEffect(() => {
    const brokerURL =
      window._env_?.REACT_APP_WS_URL || process.env.REACT_APP_WS_URL;
    if (!brokerURL) {
      console.error('Erreur : brokerURL non défini. Vérifiez env-config.js.');
      return;
    }

    const client = new Client({
      brokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onWebSocketError: error => {
        console.error('Erreur WebSocket:', error);
        setConnected(false);
        setIsReconnecting(true);
        setIsSubscribed(false);
      },
      onWebSocketClose: event => {
        setConnected(false);
        setIsReconnecting(true);
        setIsSubscribed(false);
      }
    });

    const subscribeToTopics = () => {
      if (isSubscribed) {
        return true;
      }

      if (subscriptionsRef.current.length > 0) {
        subscriptionsRef.current.forEach(sub => {
          try {
            sub?.unsubscribe();
          } catch (error) {
            console.warn('Erreur lors de la désinscription:', error);
          }
        });
      }
      subscriptionsRef.current = [];

      // Souscriptions par défaut
      subscribeWithErrorHandling('/topic/updates', parsed => {
        setData(prevData => [...prevData, parsed]);
        // Ajouter aussi dans venteData pour que Products.js puisse les traiter
        setVenteData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/ventes', parsed => {
        setVenteData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/barcode', parsed => {
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/stock-updates', parsed => {
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/approvisionnements', parsed => {
        setApprovisionnementData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/users', parsed => {
        setUserData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/settings', parsed => {
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/categories', parsed => {
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/retours', parsed => {
        setData(prevData => [...prevData, parsed]);
      });

      // Réessayer les souscriptions en attente
      pendingSubscriptionsRef.current.forEach(({ topic, callback }) => {
        subscribeWithErrorHandling(topic, callback);
      });

      setIsSubscribed(true);
      return true;
    };

    const startRetrySubscriptions = () => {
      if (retryIntervalRef.current) return;

      retryIntervalRef.current = setInterval(() => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
          return;
        }

        if (pendingSubscriptionsRef.current.length > 0) {
          const pending = [...pendingSubscriptionsRef.current];
          pendingSubscriptionsRef.current = [];
          pending.forEach(({ topic, callback }) => {
            const success = subscribeWithErrorHandling(topic, callback);
            if (!success) {
              pendingSubscriptionsRef.current.push({ topic, callback });
            } else {
            }
          });

          if (pendingSubscriptionsRef.current.length === 0) {
            clearInterval(retryIntervalRef.current);
            retryIntervalRef.current = null;
          }
        } else {
          clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
      }, 500); // Réessayer toutes les 500ms
    };

    client.onConnect = frame => {
      console.log('[StompContext] Connexion établie:', frame);
      setConnected(true);
      setIsReconnecting(false);
      setIsSubscribed(false);

      // Ajouter un délai pour s'assurer que la connexion est stable
      setTimeout(() => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          const success = subscribeToTopics();
          if (success) {
            startRetrySubscriptions();
          }
        } else {
          console.warn(
            '[StompContext] Connexion STOMP non stable après délai'
          );
        }
      }, 200); // Délai de 200ms pour plus de stabilité
    };

    client.onDisconnect = () => {
      console.log('[StompContext] Déconnexion détectée');
      setConnected(false);
      setIsReconnecting(false); // Ne pas forcer la reconnexion immédiate
      setIsSubscribed(false);
      // Nettoyer les intervalles existants
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    };

    client.onStompError = error => {
      console.error('[StompContext] Erreur STOMP:', error);
      setConnected(false);
      setIsReconnecting(false); // Éviter les reconnexions en boucle
      setIsSubscribed(false);
      // Ne pas démarrer immédiatement les tentatives de reconnexion
    };

    client.activate();
    stompClientRef.current = client;

    const handleBeforeUnload = () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        subscriptionsRef.current.forEach(sub => {
          try {
            sub?.unsubscribe();
          } catch (error) {
            console.warn('Erreur lors de la désinscription:', error);
          }
        });
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      subscriptionsRef.current = [];
      pendingSubscriptionsRef.current = [];
      setIsSubscribed(false);
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const subscribeWithErrorHandling = (topic, callback, subscriptionId) => {
    if (!subscriptionId) {
      subscriptionId = `${topic}-${Date.now()}`; // Générer un ID unique si non fourni
    }

    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn(
        `Connexion STOMP non active pour ${topic}, ajout à la file d'attente`
      );
      pendingSubscriptionsRef.current.push({ topic, callback });
      return false;
    }
    try {
      const subscription = stompClientRef.current.subscribe(topic, message => {
        try {
          const parsed = parseMessageBody(message.body);
          callback(parsed);
        } catch (parseError) {
          console.warn(`[StompContext] Erreur parsing message pour ${topic}:`, parseError);
        }
      });
      subscriptionsRef.current.push(subscription);
      console.log(`[StompContext] Souscription réussie à ${topic}`);
      return true; // Retourner true pour indiquer le succès
    } catch (error) {
      console.error(`[StompContext] Erreur lors de la souscription au topic ${topic}:`, error);
      setIsSubscribed(false);
      pendingSubscriptionsRef.current.push({ topic, callback });
      return false;
    }
  };

  const unsubscribe = subscriptionId => {
    const index = subscriptionsRef.current.findIndex(
      sub => sub.id === subscriptionId
    );
    if (index !== -1) {
      try {
        subscriptionsRef.current[index].unsubscribe();
        subscriptionsRef.current.splice(index, 1);
      } catch (error) {
        console.warn(
          `Erreur lors de la désinscription pour ${subscriptionId}:`,
          error
        );
      }
    }
  };

  const isConnected = () => {
    return stompClientRef.current && stompClientRef.current.connected;
  };

  return (
    <StompContext.Provider
      value={{
        stompClient: stompClientRef.current,
        connected,
        isReconnecting,
        data,
        approvisionnementData,
        venteData,
        userData,
        subscribe: subscribeWithErrorHandling,
        unsubscribe,
        isConnected
      }}
    >
      {children}
    </StompContext.Provider>
  );
};

StompProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useStompClient = () => useContext(StompContext);
