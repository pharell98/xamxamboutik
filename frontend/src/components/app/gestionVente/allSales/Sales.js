import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
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

const Sales = ({ onEdit }) => {
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
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDateRange = async () => {
      console.log('[Sales] Fetching sales date range...');
      try {
        const response = await dashboardService.getSalesDateRange();
        console.log('[Sales] Sales date range fetched:', response.data);
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
      console.log(
        `[Sales] Fetching sales - Period: ${filters.period}, Specific Date: ${filters.specificDate}, Page: ${page}, Size: ${pageSize}, Search Term: ${searchTerm}`
      );
      try {
        let responseData;
        if (filters.specificDate && filters.specificDate.trim()) {
          console.log(
            '[Sales] Fetching sales by specific date:',
            filters.specificDate
          );
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
          console.log('[Sales] Fetching sales by period:', periodEndpoint);
          responseData = await venteServiceV1.getSalesByPeriod(
            periodEndpoint,
            page,
            pageSize
          );
        }

        const resultPage = responseData?.data;
        let items = resultPage?.content || [];
        console.log('[Sales] Raw sales data fetched:', items);
        setTotalAmount(resultPage?.totalAmount || 0);

        if (filters.specificDate && items.length === 0) {
          console.log(
            '[Sales] No sales found for specific date, returning empty state'
          );
          return { data: [{ empty: true }], pageCount: 1 };
        }

        if (!filters.specificDate && searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          console.log('[Sales] Filtering sales by search term:', term);
          items = items.filter(
            sale =>
              (sale.libelleProduit || '').toLowerCase().includes(term) ||
              (sale.categorieProduit || '').toLowerCase().includes(term)
          );
          console.log('[Sales] Filtered sales:', items);
        }

        // Ajouter une clé unique pour éviter la duplication
        items = items.map(item => ({
          ...item,
          uniqueKey: `${item.detailVenteId}-${item.venteId}` // Clé unique combinant detailVenteId et venteId
        }));
        console.log('[Sales] Sales data with unique keys:', items);

        // Supprimer les doublons basés sur uniqueKey
        const uniqueItems = Array.from(
          new Map(items.map(item => [item.uniqueKey, item])).values()
        );
        console.log(
          '[Sales] Unique sales data after deduplication:',
          uniqueItems
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
    console.log(`[Sales] Filter changed - Name: ${name}, Value: ${value}`);
    setFilters(prev => ({ ...prev, [name]: value }));
    table.setPageIndex(0);
    setRefresh(prev => prev + 1);
  }, []);

  const handleSearch = useCallback(term => {
    console.log('[Sales] Search term updated:', term);
    setSearchTerm(term);
  }, []);

  const handleActionSuccess = () => {
    console.log('[Sales] Action successful, refreshing sales list');
    setShowActionForm(false);
    setSelectedSale(null);
    setSelectedAction(null);
    setRefresh(prev => prev + 1);
  };

  const handleActionCancel = () => {
    console.log('[Sales] Action cancelled');
    setShowActionForm(false);
    setSelectedSale(null);
    setSelectedAction(null);
  };

  const columns = useMemo(
    () =>
      getSalesColumns(
        onEdit,
        setShowActionForm,
        setSelectedSale,
        setSelectedAction
      ),
    [onEdit, setShowActionForm, setSelectedSale, setSelectedAction]
  );

  const salesFilters = getSalesFiltersConfig();

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

  console.log('[Sales] Current table data:', table.data);

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
        `}
      </style>
      <Col md={12}>
        <PageHeader title="Liste des ventes" titleTag="h5" className="mb-4" />
        <AdvanceTableProvider {...table}>
          <Row className="sales-container">
            {/* Colonne pour le tableau des ventes */}
            <Col md={showActionForm && selectedSale ? 9 : 12}>
              <Card className="mb-3">
                <Card.Header className="bg-body-tertiary">
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
                <Card.Body className="p-1">
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
                <Card.Footer className="bg-body-tertiary py-2">
                  <AdvanceTablePagination totalAmount={totalAmount} />
                </Card.Footer>
              </Card>
            </Col>
            {/* Colonne pour le formulaire d'action */}
            {showActionForm && selectedSale && (
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
          </Row>
        </AdvanceTableProvider>
      </Col>
    </Row>
  );
};

export default Sales;
