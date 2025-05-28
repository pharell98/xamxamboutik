import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const timeoutRef = useRef(null);

  useEffect(() => {
    const brokerURL =
      window._env_?.REACT_APP_WS_URL || process.env.REACT_APP_WS_URL;
    if (!brokerURL) {
      console.error('Erreur : brokerURL non défini. Vérifiez env-config.js.');
      return;
    }

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000, // Délai de reconnexion
      heartbeatIncoming: 10000, // Augmenté pour éviter les déconnexions dues à l'inactivité
      heartbeatOutgoing: 10000, // Augmenté pour maintenir la connexion active
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

      // Désabonner uniquement si la connexion est active
      if (stompClientRef.current && stompClientRef.current.connected) {
        subscriptionsRef.current.forEach(sub => {
          try {
            sub?.unsubscribe();
          } catch (error) {
            console.warn('Erreur lors de la désinscription:', error);
          }
        });
      }
      subscriptionsRef.current = [];

      subscribeWithErrorHandling('/topic/updates', parsed => {
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/ventes', parsed => {
        setVenteData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling('/topic/barcode', parsed => {
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

      setIsSubscribed(true);
      return true;
    };

    client.onConnect = frame => {
      setConnected(true);
      setIsReconnecting(false);

      // S'assurer que les souscriptions sont effectuées après un délai
      timeoutRef.current = setTimeout(() => {
        subscribeToTopics();
      }, 1000);
    };

    client.onDisconnect = () => {
      setConnected(false);
      setIsReconnecting(true);
      setIsSubscribed(false);
    };

    client.onStompError = error => {
      console.error('Erreur STOMP:', error);
      setConnected(false);
      setIsReconnecting(true);
      setIsSubscribed(false);
    };

    client.activate();
    stompClientRef.current = client;

    // Ajouter un écouteur pour fermer la connexion uniquement à la fermeture complète de l'application
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
      setIsSubscribed(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Ne pas désactiver la connexion ici, sauf si nécessaire
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const subscribeWithErrorHandling = (topic, callback) => {
    if (!stompClientRef.current) {
      console.error(`Client STOMP non défini pour le topic ${topic}`);
      return;
    }
    try {
      const subscription = stompClientRef.current.subscribe(topic, message => {
        const parsed = parseMessageBody(message.body);
        callback(parsed);
      });
      subscriptionsRef.current.push(subscription);
    } catch (error) {
      console.error(`Erreur lors de la souscription au topic ${topic}:`, error);
      setIsSubscribed(false);
    }
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
        userData
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