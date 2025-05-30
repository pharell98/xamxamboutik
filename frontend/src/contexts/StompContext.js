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
    console.log('window._env_:', window._env_);
    console.log(
      'WebSocket URL:',
      window._env_?.REACT_APP_WS_URL || process.env.REACT_APP_WS_URL
    );
    const brokerURL =
      window._env_?.REACT_APP_WS_URL || process.env.REACT_APP_WS_URL;
    if (!brokerURL) {
      console.error('Erreur : brokerURL non défini. Vérifiez env-config.js.');
      return;
    }

    console.log('Tentative de connexion au WebSocket:', brokerURL);
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
        console.log('WebSocket fermé:', event);
        setConnected(false);
        setIsReconnecting(true);
        setIsSubscribed(false);
      }
    });

    const subscribeToTopics = () => {
      if (isSubscribed) {
        console.log('Souscriptions déjà effectuées, pas de nouvelle tentative');
        return true;
      }

      console.log('Début des souscriptions aux topics...');

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
        console.log('Message reçu sur /topic/updates:', parsed);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/ventes', parsed => {
        console.log('Message reçu sur /topic/ventes:', parsed);
        setVenteData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/barcode', parsed => {
        console.log('Message reçu sur /topic/barcode:', parsed);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/approvisionnements', parsed => {
        console.log('Message reçu sur /topic/approvisionnements:', parsed);
        setApprovisionnementData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/users', parsed => {
        console.log('Message reçu sur /topic/users:', parsed);
        setUserData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/settings', parsed => {
        console.log('Message reçu sur /topic/settings:', parsed);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/categories', parsed => {
        console.log('Message reçu sur /topic/categories:', parsed);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/retours', parsed => {
        console.log('Message reçu sur /topic/retours:', parsed);
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
          console.log(
            'Connexion STOMP non active, en attente de reconnexion...'
          );
          return;
        }

        if (pendingSubscriptionsRef.current.length > 0) {
          console.log('Réessai des souscriptions en attente...');
          const pending = [...pendingSubscriptionsRef.current];
          pendingSubscriptionsRef.current = [];
          pending.forEach(({ topic, callback }) => {
            const success = subscribeWithErrorHandling(topic, callback);
            if (!success) {
              pendingSubscriptionsRef.current.push({ topic, callback });
            } else {
              console.log(`Souscription réussie pour ${topic} après réessai`);
            }
          });

          if (pendingSubscriptionsRef.current.length === 0) {
            console.log(
              "Toutes les souscriptions en attente ont réussi, arrêt de l'intervalle."
            );
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
      console.log('Connexion STOMP établie:', { brokerURL, frame });
      setConnected(true);
      setIsReconnecting(false);
      setIsSubscribed(false);

      // Ajouter un léger délai pour s'assurer que la connexion est stable
      setTimeout(() => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          subscribeToTopics();
          startRetrySubscriptions();
        } else {
          console.warn(
            'Connexion STOMP non stable après délai, en attente de reconnexion...'
          );
        }
      }, 100); // Délai de 100ms
    };

    client.onDisconnect = () => {
      console.log('Déconnexion STOMP détectée');
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
      console.log('Nettoyage: composant démonté, mais connexion maintenue');
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
        const parsed = parseMessageBody(message.body);
        console.log(`Message reçu sur ${topic}:`, parsed);
        callback(parsed);
      });
      subscriptionsRef.current.push(subscription);
      console.log(`Souscription réussie au topic ${topic}`);
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
        console.log(`Désinscription réussie pour ${subscriptionId}`);
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
