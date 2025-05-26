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
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [data, setData] = useState([]);
  const [approvisionnementData, setApprovisionnementData] = useState([]);
  const [venteData, setVenteData] = useState([]);
  const [userData, setUserData] = useState([]);
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    console.log('window._env_:', window._env_);
    console.log('WebSocket URL:', process.env.REACT_APP_WS_URL);
    const brokerURL = process.env.REACT_APP_WS_URL;
    if (!brokerURL) {
      console.error('Erreur : brokerURL non défini. Vérifiez .env.');
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
        setConnected(false);
        setIsReconnecting(true);
      },
      onWebSocketClose: event => {
        console.log('WebSocket fermé:', event);
        setConnected(false);
        setIsReconnecting(true);
      }
    });

    const subscribeToTopics = client => {
      if (!client || !client.active) {
        console.error(
          'Client STOMP non initialisé ou non actif, abonnement annulé'
        );
        return;
      }
      subscribeWithErrorHandling(client, '/topic/updates', parsed => {
        console.log('Mise à jour reçue:', parsed);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling(client, '/topic/ventes', parsed => {
        setVenteData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling(client, '/topic/barcode', parsed => {
        setData(prevData => [...prevData, parsed]);
      });
      subscribeWithErrorHandling(
        client,
        '/topic/approvisionnements',
        parsed => {
          setApprovisionnementData(prevData => [...prevData, parsed]);
          setData(prevData => [...prevData, parsed]);
        }
      );
      subscribeWithErrorHandling(client, '/topic/users', parsed => {
        setUserData(prevData => [...prevData, parsed]);
        setData(prevData => [...prevData, parsed]);
      });
    };

    const subscribeWithErrorHandling = (client, topic, callback) => {
      if (!client || !client.active) {
        console.error(
          `Client STOMP non initialisé ou non actif pour le topic ${topic}`
        );
        return;
      }
      try {
        console.log('Client avant abonnement:', client);
        const subscription = client.subscribe(topic, message => {
          const parsed = parseMessageBody(message.body);
          callback(parsed);
        });
        subscriptionsRef.current.push(subscription);
        console.log(`Souscription réussie au topic ${topic}`);
      } catch (error) {
        console.error(
          `Erreur lors de la souscription au topic ${topic}:`,
          error
        );
      }
    };

    client.onConnect = frame => {
      console.log('Connexion STOMP établie:', { brokerURL, frame });
      setConnected(true);
      setIsReconnecting(false);
      subscriptionsRef.current.forEach(sub => sub?.unsubscribe());
      subscriptionsRef.current = [];
      subscribeToTopics(client);
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
      subscriptionsRef.current.forEach(sub => sub?.unsubscribe());
      subscriptionsRef.current = [];
      client.deactivate();
      setStompClient(null);
    };
  }, []);

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
