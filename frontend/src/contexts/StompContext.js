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
  const [userData, setUserData] = useState([]);
  const [venteData, setVenteData] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const pendingSubscriptionsRef = useRef([]);
  const retryIntervalRef = useRef(null);

  useEffect(() => {
    // Nettoyer périodiquement les anciens messages pour éviter l'accumulation
    const cleanupInterval = setInterval(() => {
      setApprovisionnementData(prevData => {
        if (prevData.length > 20) {
          return prevData.slice(-10);
        }
        return prevData;
      });
      setData(prevData => {
        if (prevData.length > 20) {
          return prevData.slice(-10);
        }
        return prevData;
      });
      setVenteData(prevData => {
        if (prevData.length > 20) {
          return prevData.slice(-10);
        }
        return prevData;
      });
    }, 60000); // Nettoyer toutes les minutes

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  useEffect(() => {
    // URL WebSocket depuis .env ou valeur par défaut
    const brokerURL =
      process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';

    // S'assurer que l'URL se termine par /websocket pour SockJS
    const finalBrokerURL = brokerURL.endsWith('/websocket')
      ? brokerURL
      : brokerURL.replace(/\/?$/, '/websocket');

    const client = new Client({
      brokerURL: finalBrokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onWebSocketError: () => {
        console.error('[StompContext] Erreur WebSocket');
        setConnected(false);
        setIsReconnecting(true);
        setIsSubscribed(false);
      },
      onWebSocketClose: () => {
        console.warn('[StompContext] Connexion WebSocket fermée');
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
        setData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
      });
      subscribeWithErrorHandling('/topic/barcode', parsed => {
        setData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
      });
      subscribeWithErrorHandling('/topic/stock-updates', parsed => {
        console.log('[StompContext] Mise à jour de stock reçue:', parsed);
        setData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
      });
      subscribeWithErrorHandling('/topic/approvisionnements', parsed => {
        // Accepter les messages sous forme d'objet ou de string
        let messageToStore = parsed;

        // Si c'est une string simple, la convertir en objet
        if (typeof parsed === 'string') {
          messageToStore = {
            type: 'APPROVISIONNEMENT_CREATED',
            message: parsed,
            timestamp: new Date().toISOString()
          };
        }

        // S'assurer que le message est valide
        if (messageToStore) {
          setApprovisionnementData(prevData => {
            // Garder seulement les 5 derniers messages pour éviter l'accumulation
            const newData = [...prevData, messageToStore];
            return newData.slice(-5);
          });
          setData(prevData => {
            const newData = [...prevData, messageToStore];
            return newData.slice(-5);
          });
        }
      });
      subscribeWithErrorHandling('/topic/users', parsed => {
        setUserData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
        setData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
      });
      subscribeWithErrorHandling('/topic/categories', parsed => {
        // Accepter les messages sous forme d'objet ou de string
        let messageToStore = parsed;
        // Si c'est une string simple, la convertir en objet
        if (typeof parsed === 'string') {
          messageToStore = {
            type: 'CATEGORY_UPDATED',
            message: parsed,
            timestamp: new Date().toISOString()
          };
        }
        setData(prevData => {
          const newData = [...prevData, messageToStore];
          return newData.slice(-5);
        });
      });
      subscribeWithErrorHandling('/topic/retours', parsed => {
        setData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
      });
      subscribeWithErrorHandling('/topic/ventes', parsed => {
        console.log('[StompContext] Message de vente reçu:', parsed);
        console.log('[StompContext] Type de message:', typeof parsed);
        console.log('[StompContext] Structure du message:', JSON.stringify(parsed, null, 2));
        
        setVenteData(prevData => {
          const newData = [...prevData, parsed];
          console.log('[StompContext] VenteData mis à jour, total:', newData.length);
          return newData.slice(-5);
        });
        setData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
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

    client.onConnect = () => {
      console.log('[StompContext] Connexion WebSocket établie');
      setConnected(true);
      setIsReconnecting(false);
      setIsSubscribed(false);

      // Ajouter un léger délai pour s'assurer que la connexion est stable
      setTimeout(() => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          console.log('[StompContext] Souscription aux topics...');
          subscribeToTopics();
          startRetrySubscriptions();
        }
      }, 100); // Délai de 100ms
    };

    client.onDisconnect = () => {
      setConnected(false);
      setIsReconnecting(true);
      setIsSubscribed(false);
      startRetrySubscriptions();
    };

    client.onStompError = error => {
      console.error('Erreur STOMP:', error);
      setConnected(false);
      setIsReconnecting(true);
      setIsSubscribed(false);
      startRetrySubscriptions();
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
      pendingSubscriptionsRef.current.push({ topic, callback });
      return false;
    }
    try {
      const subscription = stompClientRef.current.subscribe(topic, message => {
        const parsed = parseMessageBody(message.body);
        callback(parsed);
      });
      subscriptionsRef.current.push(subscription);
      return subscription;
    } catch (error) {
      console.error(`Erreur lors de la souscription au topic ${topic}:`, error);
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
        userData,
        venteData,
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
