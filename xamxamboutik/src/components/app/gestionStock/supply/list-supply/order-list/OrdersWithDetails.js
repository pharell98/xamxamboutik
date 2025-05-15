import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Approvisionnements from './Approvisionnements';
import ApprovisionnementDetails from './ApprovisionnementDetails';
import { useStompClient } from 'contexts/StompContext';
import { useToast } from 'components/common/Toast';

const OrdersWithDetails = ({ setSelectedProduct }) => {
  const [selectedApproId, setSelectedApproId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const { approvisionnementData } = useStompClient();
  const { addToast } = useToast();

  // Écouter les messages WebSocket pour déclencher un rafraîchissement
  useEffect(() => {
    if (
      Array.isArray(approvisionnementData) &&
      approvisionnementData.length > 0
    ) {
      const latestMessage =
        approvisionnementData[approvisionnementData.length - 1];
      if (latestMessage && latestMessage.type !== 'ERROR') {
        setRefresh(prev => prev + 1); // Incrémenter pour rafraîchir Approvisionnements
        addToast({
          title: 'Nouvel approvisionnement',
          message: `Approvisionnement ${
            latestMessage.codeAppro || 'inconnu'
          } créé.`,
          type: 'success'
        });
      }
    }
  }, [approvisionnementData, addToast]);

  // Callback pour gérer la sélection d'un approvisionnement
  const handleOrderSelect = id => {
    setSelectedApproId(id);
    setSelectedProduct(null); // Réinitialiser le produit sélectionné si nécessaire
  };

  return (
    <Row className="mb-3">
      <Col md={11}>
        {/* Passer la clé refresh à Approvisionnements */}
        <Approvisionnements
          onOrderSelect={handleOrderSelect}
          refresh={refresh}
        />
      </Col>

      <Col md={11}>
        {selectedApproId ? (
          <ApprovisionnementDetails approId={selectedApproId} />
        ) : (
          <p>Sélectionnez une commande pour voir les détails.</p>
        )}
      </Col>
    </Row>
  );
};

export default OrdersWithDetails;
