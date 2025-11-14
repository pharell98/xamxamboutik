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
const SUPPRESSED_DEBUG_MESSAGES = [
  'WebSocket is already in CLOSING or CLOSED state',
  'Connection closed before CONNECT frame was received'
];

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
  const wsCloseLoggedRef = useRef(false);

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
    const brokerURL =
      window._env_?.REACT_APP_WS_URL || process.env.REACT_APP_WS_URL;
    if (!brokerURL) {
      console.error('Erreur : brokerURL non défini. Vérifiez env-config.js.');
      return;
    }

    // Protection contre boucle infinie de reconnexion
    let errorCount = 0;
    const MAX_ERRORS = 3;  // Maximum 3 tentatives

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000, // 5 secondes entre tentatives
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: str => {
        if (SUPPRESSED_DEBUG_MESSAGES.some(msg => str.includes(msg))) {
          return;
        }
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[STOMP]', str);
        }
      },
      onWebSocketError: error => {
        errorCount++;
        
        // Arrêter complètement après MAX_ERRORS
        if (errorCount >= MAX_ERRORS) {
          console.warn(`[StompContext] ⚠️ ${MAX_ERRORS} erreurs WebSocket - ARRÊT des tentatives de reconnexion`);
          if (stompClientRef.current?.active) {
            try {
              stompClientRef.current.deactivate();
            } catch (e) {
              // Ignore
            }
          }
          return;
        }
        
        console.error(`[StompContext] Erreur WebSocket (${errorCount}/${MAX_ERRORS}):`, error.message || error);
        setConnected(false);
        setIsReconnecting(true);
        setIsSubscribed(false);
      },
      onWebSocketClose: event => {
        // Ne log que si on n'a pas atteint MAX_ERRORS
        if (errorCount < MAX_ERRORS && !wsCloseLoggedRef.current) {
          console.warn('[StompContext] Connexion WebSocket fermée');
          wsCloseLoggedRef.current = true;
          setConnected(false);
          setIsReconnecting(true);
          setIsSubscribed(false);
        }
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
      subscribeWithErrorHandling('/topic/ventes', parsed => {
        setVenteData(prevData => {
          const newData = [...prevData, parsed];
          return newData.slice(-5);
        });
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
      subscribeWithErrorHandling('/topic/settings', parsed => {
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

    client.onConnect = frame => {
      setConnected(true);
      setIsReconnecting(false);
      setIsSubscribed(false);
      wsCloseLoggedRef.current = false;
      errorCount = 0;

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
      setConnected(false);
      setIsReconnecting(false);
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
      setIsReconnecting(false);
      setIsSubscribed(false);
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
      subscriptionId = `${topic}-${Date.now()}`;
    }

    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn(
        `[StompContext] Connexion non active pour ${topic}, ajout à la file d'attente`
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
      return true;
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
