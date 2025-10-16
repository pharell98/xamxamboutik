import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Modal } from 'react-bootstrap';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import BulkActionsAndSearchBar from 'components/common/advance-table/BulkActionsAndSearchBar';
import { useToast } from 'components/common/Toast';
import { getSalesColumns } from './salesColumnsConfig';
import { getSalesFiltersConfig } from './salesFiltersConfig';
import IconButton from '../../../common/IconButton';
import venteServiceV1 from 'services/vente.service.v1';
import dashboardService from 'services/dashboardService';
import PageHeader from '../../../common/PageHeader';
import SaleActionForm from './SaleActionForm';
import { useAppContext } from 'providers/AppProvider';

const Sales = ({ onEdit }) => {
  // IMPORTANT: Tous les hooks DOIVENT être appelés dans le même ordre à chaque render
  // Ne JAMAIS appeler de hooks conditionnellement
  
  // 1. Contexts en premier
  const {
    config: { isDark },
    responsive
  } = useAppContext();
  const { addToast } = useToast();
  
  // 2. Tous les useState ensemble
  const [filters, setFilters] = useState({ period: 'daily', specificDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [dateRange, setDateRange] = useState({
    firstSaleDate: null,
    lastSaleDate: null
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [showActionForm, setShowActionForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    const fetchDateRange = async () => {
      try {
        const response = await dashboardService.getSalesDateRange();
        setDateRange({
          firstSaleDate: response.data.firstSaleDate
            ? new Date(response.data.firstSaleDate)
            : null,
          lastSaleDate: response.data.lastSaleDate
            ? new Date(response.data.lastSaleDate)
            : null
        });
      } catch (error) {
        console.error('[Sales] Error fetching sales date range:', error);
        addToast({
          title: 'Erreur',
          message: 'Impossible de récupérer les dates des ventes.',
          type: 'error'
        });
      }
    };
    fetchDateRange();
  }, [addToast]);

  const fetchSales = useCallback(
    async (pageIndex, pageSize) => {
      const page = pageIndex + 1;
      try {
        let responseData;
        if (filters.specificDate && filters.specificDate.trim()) {
          responseData = await venteServiceV1.getSalesByDate(
            filters.specificDate,
            page,
            pageSize
          );
        } else {
          const periodEndpoint =
            {
              '7days': 'last7days',
              month: 'current-month',
              year: 'current-year',
              '': 'all',
              daily: 'today'
            }[filters.period] || 'today';
          responseData = await venteServiceV1.getSalesByPeriod(
            periodEndpoint,
            page,
            pageSize
          );
        }

        const resultPage = responseData?.data;
        let items = resultPage?.content || [];
        setTotalAmount(resultPage?.totalAmount || 0);

        if (filters.specificDate && items.length === 0) {
          return { data: [{ empty: true }], pageCount: 1 };
        }

        if (!filters.specificDate && searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          items = items.filter(
            sale =>
              (sale.libelleProduit || '').toLowerCase().includes(term) ||
              (sale.categorieProduit || '').toLowerCase().includes(term)
          );
        }

        // Ajouter une clé unique pour éviter la duplication
        items = items.map(item => ({
          ...item,
          uniqueKey: `${item.detailVenteId}-${item.venteId}` // Clé unique combinant detailVenteId et venteId
        }));
        // Supprimer les doublons basés sur uniqueKey
        const uniqueItems = Array.from(
          new Map(items.map(item => [item.uniqueKey, item])).values()
        );
        return { data: uniqueItems, pageCount: resultPage?.totalPages || 1 };
      } catch (error) {
        console.error('[Sales] Error fetching sales:', error);
        addToast({
          title: 'Erreur',
          message:
            error.response?.data?.message ||
            'Erreur lors de la récupération des ventes.',
          type: 'error'
        });
        return { data: [], pageCount: 0 };
      }
    },
    [filters, searchTerm, addToast]
  );

  const handleFiltersChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setRefresh(prev => prev + 1);
  }, []);

  const handleSearch = useCallback(term => {
    setSearchTerm(term);
  }, []);

  const handleActionSuccess = useCallback(() => {
    setShowActionForm(false);
    setSelectedSale(null);
    setSelectedAction(null);
    setRefresh(prev => prev + 1);
  }, []);

  const handleActionCancel = useCallback(() => {
    setShowActionForm(false);
    setSelectedSale(null);
    setSelectedAction(null);
  }, []);

  // useMemo pour les colonnes - IMPORTANT: passer isDark en paramètre
  const columns = useMemo(
    () =>
      getSalesColumns(
        onEdit,
        setShowActionForm,
        setSelectedSale,
        setSelectedAction,
        isDark  // Passer isDark pour éviter d'appeler useAppContext dans getSalesColumns
      ),
    [onEdit, isDark]  // Les setters useState sont stables, seulement onEdit et isDark
  );

  const salesFilters = useMemo(() => getSalesFiltersConfig(), []);

  const table = useAdvanceTable({
    data: [],
    columns,
    selection: false,
    sortable: true,
    pagination: true,
    perPage: 5,
    serverPagination: true,
    fetchData: fetchSales,
    refreshKey: refresh,
    rowKey: 'uniqueKey' // Utilisation de la clé unique pour éviter la duplication
  });

  return (
    <Row className="g-3">
      <style>
        {`
          .sales-container {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .card {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
          }
          
          /* CRITICAL: Fix dropdown Actions dans tableau */
          .card-body {
            overflow: visible !important;
          }
          
          .table-responsive {
            overflow: visible !important;
          }
          
          .table {
            overflow: visible !important;
          }
          
          .table td,
          .table th {
            overflow: visible !important;
            position: relative;
          }
          
          .table tbody tr {
            position: relative;
          }
          
          /* Dropdown Actions spécifique au tableau */
          .table .dropdown {
            position: static !important;
          }
          
          .table .dropdown-menu {
            position: absolute !important;
            z-index: 10000 !important;
            margin-top: 0.25rem !important;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
          
          .table .dropdown.show {
            position: relative !important;
            z-index: 10000 !important;
          }
          
          /* Mobile: dropdown en position fixed */
          @media (max-width: 767.98px) {
            .table .dropdown-menu {
              position: fixed !important;
              right: 0.5rem !important;
              left: auto !important;
              top: auto !important;
              max-width: calc(100vw - 1rem) !important;
              width: auto !important;
              min-width: 250px !important;
            }
          }
          
          /* Modal d'action responsive */
          @media (max-width: 767.98px) {
            .sale-action-modal .modal-dialog {
              margin: 0 !important;
              max-width: 100% !important;
            }
            
            .sale-action-modal .modal-body {
              padding: 1rem !important;
              max-height: 80vh;
              overflow-y: auto;
            }
          }
        `}
      </style>
      <Col md={12}>
        <PageHeader
          title="Liste des ventes"
          titleTag="h5"
          className={`mb-4 ${isDark ? 'text-light' : ''}`}
        />
        <AdvanceTableProvider {...table}>
          <Row className="sales-container">
            {/* Colonne pour le tableau des ventes */}
            <Col md={showActionForm && selectedSale && !responsive.isMobile ? 9 : 12}>
              <Card
                className={`mb-3 ${
                  isDark ? 'bg-dark text-light border-secondary' : ''
                }`}
              >
                <Card.Header
                  className={`${
                    isDark ? 'bg-dark border-secondary' : 'bg-body-tertiary'
                  }`}
                >
                  <Col xs={8} sm="auto" className="ms-auto text-end ps-0">
                    <div id="orders-actions">
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="plus"
                        transform="shrink-3"
                      >
                        <span className="d-none d-sm-inline-block ms-1">
                          New
                        </span>
                      </IconButton>
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="filter"
                        transform="shrink-3"
                        className="mx-2"
                      >
                        <span className="d-none d-sm-inline-block ms-1">
                          Filter
                        </span>
                      </IconButton>
                      <IconButton
                        variant="falcon-default"
                        size="sm"
                        icon="external-link-alt"
                        transform="shrink-3"
                      >
                        <span className="d-none d-sm-inline-block ms-1">
                          Export
                        </span>
                      </IconButton>
                    </div>
                  </Col>
                </Card.Header>
                <Card.Body
                  className={`p-1 ${isDark ? 'bg-dark text-light' : ''}`}
                  style={{ overflow: 'visible' }}
                >
                  {salesFilters.length === 0 ? (
                    <div className="text-center text-danger">
                      Aucun filtre disponible.
                    </div>
                  ) : (
                    <BulkActionsAndSearchBar
                      searchPlaceholder="Rechercher un produit..."
                      filtersConfig={salesFilters}
                      filtersValues={filters}
                      onFiltersChange={handleFiltersChange}
                      onSearch={handleSearch}
                      minDate={dateRange.firstSaleDate}
                      maxDate={dateRange.lastSaleDate}
                    />
                  )}
                  <div style={{ overflow: 'visible', position: 'relative' }}>
                    <AdvanceTable
                      headerClassName="bg-200 text-nowrap align-middle"
                      rowClassName="align-middle white-space-nowrap"
                      tableProps={{
                        size: 'sm',
                        striped: true,
                        className: 'fs-10 mb-0'
                      }}
                    />
                  </div>
                </Card.Body>
                <Card.Footer
                  className={`${
                    isDark
                      ? 'bg-dark border-secondary text-light'
                      : 'bg-body-tertiary'
                  } py-2`}
                >
                  <AdvanceTablePagination totalAmount={totalAmount} />
                </Card.Footer>
              </Card>
            </Col>
            {/* Formulaire d'action en Modal sur mobile, en colonne sur desktop */}
            {showActionForm && selectedSale && (
              <>
                {/* Mobile: Modal plein écran */}
                {responsive.isMobile ? (
                  <Modal
                    show={showActionForm}
                    onHide={handleActionCancel}
                    size="lg"
                    fullscreen="sm-down"
                    centered
                    className="sale-action-modal"
                    style={{ zIndex: 10000 }}
                    backdrop="static"
                  >
                    <Modal.Header 
                      closeButton 
                      className={isDark ? 'bg-dark text-light border-secondary' : 'bg-primary text-white border-0'}
                    >
                      <Modal.Title className="fs-6">
                        {selectedAction === 'remboursementBonEtat' && 'Remboursement - Bon état'}
                        {selectedAction === 'remboursementDefectueux' && 'Remboursement - Défectueux'}
                        {selectedAction === 'echangeDefectueux' && 'Échange - Défectueux'}
                        {selectedAction === 'echangeChangementPreference' && 'Échange - Préférence'}
                        {selectedAction === 'echangeAjustementPrix' && 'Échange - Ajustement prix'}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={isDark ? 'bg-dark text-light' : 'p-3'}>
                      <SaleActionForm
                        detailVenteId={selectedSale.detailVenteId}
                        onSuccess={handleActionSuccess}
                        onCancel={handleActionCancel}
                        addToast={addToast}
                        initialAction={selectedAction}
                        quantiteVendu={selectedSale.quantiteVendu}
                        status={selectedSale.status}
                      />
                    </Modal.Body>
                  </Modal>
                ) : (
                  /* Desktop: Colonne à côté du tableau */
                  <Col md={3}>
                    <SaleActionForm
                      detailVenteId={selectedSale.detailVenteId}
                      onSuccess={handleActionSuccess}
                      onCancel={handleActionCancel}
                      addToast={addToast}
                      initialAction={selectedAction}
                      quantiteVendu={selectedSale.quantiteVendu}
                      status={selectedSale.status}
                    />
                  </Col>
                )}
              </>
            )}
          </Row>
        </AdvanceTableProvider>
      </Col>
    </Row>
  );
};

export default Sales;
