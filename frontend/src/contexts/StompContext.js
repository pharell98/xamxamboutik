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

  useEffect(() => {
    console.log('WebSocket URL:', window._env_.REACT_APP_WS_URL);
    const client = new Client({
      brokerURL: window._env_.REACT_APP_WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    client.onConnect = () => {
      console.log('Connexion STOMP établie');
      setConnected(true);
      setIsReconnecting(false);
    };

    client.onDisconnect = () => {
      console.log('Déconnexion STOMP détectée');
      setConnected(false);
      setIsReconnecting(true);
    };

    client.onStompError = error => {
      console.error('Erreur STOMP:', error);
    };

    client.activate();
    setStompClient(client);

    return () => {
      console.log('Nettoyage: désactivation du client STOMP');
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    if (stompClient && connected && stompClient.active) {
      console.log('Souscription aux topics STOMP');

      const subscriptionUpdates = stompClient.subscribe(
        '/topic/updates',
        message => {
          const parsed = parseMessageBody(message.body);
          setData(prevData => [...prevData, parsed]);
        }
      );

      const subscriptionVentes = stompClient.subscribe(
        '/topic/ventes',
        message => {
          const parsed = parseMessageBody(message.body);
          setVenteData(prevData => [...prevData, parsed]);
          setData(prevData => [...prevData, parsed]);
        }
      );

      const subscriptionBarcode = stompClient.subscribe(
        '/topic/barcode',
        message => {
          const parsed = parseMessageBody(message.body);
          setData(prevData => [...prevData, parsed]);
        }
      );

      const subscriptionApprovisionnements = stompClient.subscribe(
        '/topic/approvisionnements',
        message => {
          const parsed = parseMessageBody(message.body);
          setApprovisionnementData(prevData => [...prevData, parsed]);
          setData(prevData => [...prevData, parsed]);
        }
      );

      const subscriptionUsers = stompClient.subscribe(
        '/topic/users',
        message => {
          const parsed = parseMessageBody(message.body);
          setUserData(prevData => [...prevData, parsed]);
          setData(prevData => [...prevData, parsed]);
        }
      );

      return () => {
        console.log('Désabonnement des topics STOMP');
        subscriptionUpdates.unsubscribe();
        subscriptionVentes.unsubscribe();
        subscriptionBarcode.unsubscribe();
        subscriptionApprovisionnements.unsubscribe();
        subscriptionUsers.unsubscribe();
      };
    }
  }, [stompClient, connected]);

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