import React, { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import BulkActionsAndSearchBar from 'components/common/advance-table/BulkActionsAndSearchBar';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import apiServiceV1 from 'services/api.service.v1';
import { getApprovisionnementDetailsColumns } from './approvisionnementDetailsColumnsConfig';
import { useToast } from 'components/common/Toast';
import { useStompClient } from 'contexts/StompContext';

const ApprovisionnementDetails = ({ approId }) => {
  const [refresh, setRefresh] = useState(0);
  const { addToast } = useToast();
  const { approvisionnementData } = useStompClient();

  // Écouter les messages WebSocket pour rafraîchir les détails si nécessaire
  useEffect(() => {
    if (approvisionnementData.length > 0) {
      const latestMessage =
        approvisionnementData[approvisionnementData.length - 1];
      if (latestMessage.id === approId && latestMessage.type !== 'ERROR') {
        setRefresh(prev => prev + 1); // Rafraîchir les détails si l'approvisionnement correspond
      }
    }
  }, [approvisionnementData, approId]);

  // Fonction de récupération des produits liés à l'approvisionnement
  const fetchApprovisionnementDetails = useCallback(
    async (pageIndex, pageSize) => {
      try {
        const response = await apiServiceV1.getProductsByApprovisionnement(
          approId,
          pageIndex + 1,
          pageSize
        );
        const result = response.data || {};
        const data = result.content || [];
        const pageCount = result.totalPages || 0;
        return { data, pageCount };
      } catch (error) {
        const serverMessage =
          error.response?.data?.message ||
          "Erreur lors de la récupération des détails de l'approvisionnement.";
        addToast({
          title: 'Erreur',
          message: serverMessage,
          type: 'error'
        });
        return { data: [], pageCount: 0 };
      }
    },
    [approId, addToast]
  );

  // Configuration des colonnes pour le tableau des produits
  const columns = getApprovisionnementDetailsColumns();

  // Hook de gestion du tableau avec pagination côté serveur
  const table = useAdvanceTable({
    data: [],
    columns,
    selection: false,
    sortable: true,
    pagination: true,
    perPage: 10,
    serverPagination: true,
    fetchData: fetchApprovisionnementDetails,
    refreshKey: refresh
  });

  return (
    <Row className="mb-3">
      <Col md={12}>
        <AdvanceTableProvider {...table}>
          <Card className="mb-3">
            <Card.Header className="bg-body-tertiary">
              <h5 className="mb-0">Détails de l'approvisionnement</h5>
            </Card.Header>
            <Card.Body className="p-1">
              <BulkActionsAndSearchBar
                searchPlaceholder="Rechercher dans les détails..."
                onSearch={() => {}}
                hideSearchBar={true}
                onBulkDelete={() => {}}
              />
              <AdvanceTable
                headerClassName="bg-200 text-nowrap align-middle"
                rowClassName="align-middle white-space-nowrap"
                tableProps={{
                  size: 'sm',
                  striped: true,
                  className: 'fs-10 mb-0 overflow-hidden'
                }}
              />
            </Card.Body>
            <Card.Footer
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <AdvanceTablePagination />
            </Card.Footer>
          </Card>
        </AdvanceTableProvider>
      </Col>
    </Row>
  );
};

export default ApprovisionnementDetails;
