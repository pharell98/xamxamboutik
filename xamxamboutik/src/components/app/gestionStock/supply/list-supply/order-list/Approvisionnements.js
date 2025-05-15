import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import BulkActionsAndSearchBar from 'components/common/advance-table/BulkActionsAndSearchBar';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import apiServiceV1 from 'services/api.service.v1';
import { getApprovisionnementColumns } from './approvisionnementColumnsConfig';
import { useToast } from 'components/common/Toast';
import ApprovisionnementDetails from './ApprovisionnementDetails';

const Approvisionnements = ({ onOrderSelect, refresh }) => {
  const [selectedApproId, setSelectedApproId] = useState(null);
  const { addToast } = useToast();

  // Callback pour gérer l'action "Détail"
  const handleDetail = useCallback(
    approvisionnement => {
      console.log("Détail de l'approvisionnement :", approvisionnement);
      addToast({
        title: 'Détail',
        message: `Affichage du détail pour l'approvisionnement ${approvisionnement.codeAppro}.`,
        type: 'info'
      });
      // Si un callback onOrderSelect est passé en props, on l'appelle :
      if (onOrderSelect) {
        onOrderSelect(approvisionnement.id);
      } else {
        setSelectedApproId(approvisionnement.id);
      }
    },
    [addToast, onOrderSelect]
  );

  // Fonction pour récupérer la liste des approvisionnements
  const fetchApprovisionnements = useCallback(
    async (pageIndex, pageSize) => {
      try {
        const response = await apiServiceV1.getApprovisionnements(
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
          'Erreur lors de la récupération des approvisionnements.';
        addToast({
          title: 'Erreur',
          message: serverMessage,
          type: 'error'
        });
        return { data: [], pageCount: 0 };
      }
    },
    [addToast]
  );

  // Configuration des colonnes avec le callback handleDetail
  const columns = getApprovisionnementColumns(handleDetail);

  // Hook de gestion du tableau avec pagination côté serveur
  const table = useAdvanceTable({
    data: [],
    columns,
    selection: false,
    sortable: true,
    pagination: true,
    perPage: 10,
    serverPagination: true,
    fetchData: fetchApprovisionnements,
    refreshKey: refresh
  });

  return (
    <>
      {/* Tableau de la liste des approvisionnements */}
      <Row className="mb-3">
        <Col md={12}>
          <AdvanceTableProvider {...table}>
            <Card className="mb-3">
              <Card.Header className="bg-body-tertiary">
                <h5 className="mb-0">Liste des approvisionnements</h5>
              </Card.Header>
              <Card.Body className="p-1">
                <BulkActionsAndSearchBar
                  searchPlaceholder="Rechercher un approvisionnement..."
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

      {/* Tableau des détails de l'approvisionnement sélectionné (si aucun callback externe n'est fourni) */}
      {!onOrderSelect && selectedApproId && (
        <Row className="mb-3">
          <Col md={12}>
            <Card className="mb-3">
              <Card.Header className="bg-body-tertiary">
                <h5 className="mb-0">Détails de l'approvisionnement</h5>
              </Card.Header>
              <Card.Body className="p-1">
                <ApprovisionnementDetails approId={selectedApproId} />
              </Card.Body>
              <Card.Footer
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Button
                  variant="secondary"
                  onClick={() => setSelectedApproId(null)}
                >
                  Fermer les détails
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Approvisionnements;
