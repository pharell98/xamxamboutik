import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [data, setData] = useState([]);
  const [approvisionnementData, setApprovisionnementData] = useState([]);
  const [venteData, setVenteData] = useState([]);
  const [userData, setUserData] = useState([]);
  let subscriptions = [];

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
      reconnectDelay: 10000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onWebSocketError: error => {
        console.error('Erreur WebSocket:', error);
      },
      onWebSocketClose: event => {
        console.log('WebSocket fermé:', event);
        setConnected(false);
        setIsReconnecting(true);
      }
    });

    const subscribeToTopics = () => {
      subscribeWithErrorHandling('/topic/updates', parsed => {
        console.log('Mise à jour reçue:', parsed);
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
    };

    client.onConnect = frame => {
      console.log('Connexion STOMP établie:', { brokerURL, frame });
      setConnected(true);
      setIsReconnecting(false);
      subscriptions.forEach(sub => sub?.unsubscribe());
      subscriptions = [];
      subscribeToTopics();
    };

    client.onDisconnect = () => {
      console.log('Déconnexion STOMP détectée');
      setConnected(false);
      setIsReconnecting(true);
    };

    client.onStompError = error => {
      console.error('Erreur STOMP:', error);
      setConnected(false);
      setIsReconnecting(true);
    };

    client.activate();
    setStompClient(client);

    return () => {
      console.log('Nettoyage: désactivation du client STOMP');
      subscriptions.forEach(sub => sub?.unsubscribe());
      client.deactivate();
    };
  }, []);

  const subscribeWithErrorHandling = (topic, callback) => {
    try {
      const subscription = stompClient.subscribe(topic, message => {
        const parsed = parseMessageBody(message.body);
        callback(parsed);
      });
      subscriptions.push(subscription);
    } catch (error) {
      console.error(`Erreur lors de la souscription au topic ${topic}:`, error);
    }
  };

  return (
    <StompContext.Provider
      value={{
        stompClient,
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
