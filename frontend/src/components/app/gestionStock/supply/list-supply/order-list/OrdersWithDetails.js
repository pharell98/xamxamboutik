import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Approvisionnements from './Approvisionnements';
import ApprovisionnementDetails from './ApprovisionnementDetails';
import { useStompClient } from 'contexts/StompContext';
import { useToast } from 'components/common/Toast';
import { useAppContext } from 'providers/AppProvider';

const OrdersWithDetails = ({ setSelectedProduct }) => {
  const [selectedApproId, setSelectedApproId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const { approvisionnementData } = useStompClient();
  const { addToast } = useToast();
  const {
    config: { isDark }
  } = useAppContext();

  // Nettoyage et écoute d'événements au montage du composant
  useEffect(() => {
    // Nettoyer les anciens messages stockés pour éviter les conflits
    const oldKeys = ['lastNotifiedApproCode', 'lastProcessedApproMessage'];
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    // Écouter les événements de création d'approvisionnement
    let lastEventTime = 0;
    const handleApprovisionnementCreated = () => {
      const now = Date.now();
      // Éviter les événements trop rapprochés (moins de 2 secondes)
      if (now - lastEventTime < 2000) {
        return;
      }
      lastEventTime = now;

      setRefresh(prev => prev + 1);
    };

    window.addEventListener(
      'approvisionnement-created',
      handleApprovisionnementCreated
    );

    return () => {
      window.removeEventListener(
        'approvisionnement-created',
        handleApprovisionnementCreated
      );
    };
  }, []);

  // Écouter les messages WebSocket pour déclencher un rafraîchissement
  useEffect(() => {
    if (
      Array.isArray(approvisionnementData) &&
      approvisionnementData.length > 0
    ) {
      const latestMessage =
        approvisionnementData[approvisionnementData.length - 1];

      // Accepter tout message d'approvisionnement (plus flexible)
      if (
        latestMessage &&
        (latestMessage.type === 'APPROVISIONNEMENT_CREATED' ||
          latestMessage.message === 'Nouvel approvisionnement créé' ||
          latestMessage === 'update')
      ) {
        // Déclencher le rafraîchissement de la table immédiatement
        setRefresh(prev => prev + 1);
      }
    }
  }, [approvisionnementData]);

  // Callback pour gérer la sélection d'un approvisionnement
  const handleOrderSelect = id => {
    setSelectedApproId(id);
    setSelectedProduct(null); // Réinitialiser le produit sélectionné si nécessaire
  };

  return (
    <Row
      className={`mb-3 g-3 ${
        isDark ? 'bg-dark text-light' : 'bg-white text-dark'
      }`}
      style={{ borderRadius: 8 }}
    >
      <Col xs={12} className="mb-3">
        <Approvisionnements
          onOrderSelect={handleOrderSelect}
          refresh={refresh}
          selectedApproId={selectedApproId}
        />
      </Col>
      <Col xs={12}>
        {selectedApproId ? (
          <ApprovisionnementDetails approId={selectedApproId} />
        ) : (
          <div className="alert alert-warning" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Sélectionnez un approvisionnement dans la liste pour voir ses
            détails.
          </div>
        )}
      </Col>
    </Row>
  );
};

export default OrdersWithDetails;
