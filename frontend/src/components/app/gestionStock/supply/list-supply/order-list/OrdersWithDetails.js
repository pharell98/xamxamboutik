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
  const [lastNotifiedCode, setLastNotifiedCode] = useState(() => {
    // On lit le dernier code notifié depuis le localStorage au montage
    return localStorage.getItem('lastNotifiedApproCode') || null;
  });
  const {
    config: { isDark }
  } = useAppContext();

  // Écouter les messages WebSocket pour déclencher un rafraîchissement
  useEffect(() => {
    if (
      Array.isArray(approvisionnementData) &&
      approvisionnementData.length > 0
    ) {
      const latestMessage =
        approvisionnementData[approvisionnementData.length - 1];
      const code = latestMessage.codeAppro || 'inconnu';
      if (
        latestMessage &&
        latestMessage.type !== 'ERROR' &&
        code !== lastNotifiedCode &&
        code !== 'inconnu'
      ) {
        setRefresh(prev => prev + 1);
        addToast({
          title: 'Nouvel approvisionnement',
          message: `Approvisionnement ${code} créé.`,
          type: 'success'
        });
        setLastNotifiedCode(code);
        localStorage.setItem('lastNotifiedApproCode', code);
      }
    }
  }, [approvisionnementData, addToast, lastNotifiedCode]);

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
        />
      </Col>
      <Col xs={12}>
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
