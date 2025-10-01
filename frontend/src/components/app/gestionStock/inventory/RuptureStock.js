import React, { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import useAdvanceTable from 'hooks/useAdvanceTable';
import useResponsive from 'hooks/useResponsive';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import apiServiceV1 from 'services/api.service.v1';
import { useStompClient } from 'contexts/StompContext';
import BulkActionsAndSearchBar from 'components/common/advance-table/BulkActionsAndSearchBar';
import SubtleBadge from 'components/common/SubtleBadge';
import { useToast } from 'components/common/Toast';
import * as preApproService from 'services/preApproService';
import CriticalStockHeader from './CriticalStockHeader';

const ruptureFiltersConfig = [
  {
    name: 'state',
    label: 'Filtrer le stock',
    type: 'select',
    options: [
      { value: 'all', label: 'Tous' },
      { value: 'faible', label: 'Faible stock' },
      { value: 'rupture', label: 'Rupture de stock' }
    ],
    defaultValue: 'all',
    md: 4
  }
];

const getRuptureColumns = (getColumnStyles) => [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row: { original } }) =>
      original.image ? (
        <img
          src={original.image}
          alt={original.libelle}
          style={{ width: 40, height: 40, objectFit: 'cover' }}
          className="rounded"
        />
      ) : (
        <div 
          style={{ 
            width: 40, 
            height: 40, 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="fas fa-image text-muted" style={{ fontSize: '0.8rem' }}></i>
        </div>
      ),
    enableSorting: false,
    meta: {
      headerProps: {
        style: getColumnStyles(50, 40, 45),
        className: 'text-center'
      },
      cellProps: {
        style: getColumnStyles(50, 40, 45),
        className: 'text-center'
      }
    }
  },
  {
    accessorKey: 'codeProduit',
    header: 'Code',
    cell: ({ row: { original } }) => (
      <div className="text-start fw-medium text-truncate">
        {original.codeProduit || '—'}
      </div>
    ),
    meta: {
      headerProps: {
        style: getColumnStyles(100, 70, 85),
        className: 'text-start'
      },
      cellProps: {
        style: getColumnStyles(100, 70, 85)
      }
    }
  },
  {
    accessorKey: 'libelle',
    header: 'Nom du Produit',
    cell: ({ row: { original } }) => (
      <div className="text-start fw-medium text-truncate" title={original.libelle}>
        {original.libelle || '—'}
      </div>
    ),
    meta: {
      headerProps: {
        style: getColumnStyles(180, 120, 150),
        className: 'text-start'
      },
      cellProps: {
        style: getColumnStyles(180, 120, 150)
      }
    }
  },
  {
    accessorKey: 'stockDisponible',
    header: 'Stock',
    cell: ({ row: { original } }) => (
      <div className="text-center">
        <span
          className={`fw-bold ${
            original.stockDisponible <= 0 ? 'text-danger' : 'text-warning'
          }`}
        >
          {original.stockDisponible}
        </span>
      </div>
    ),
    meta: {
      headerProps: {
        style: getColumnStyles(70, 50, 60),
        className: 'text-center'
      },
      cellProps: {
        style: getColumnStyles(70, 50, 60)
      }
    }
  },
  {
    accessorKey: 'statut',
    header: 'Statut',
    cell: ({ row: { original } }) => (
      <div className="text-center">
        {original.stockDisponible <= 0 ? (
          <SubtleBadge bg="danger" className="fs-10">Rupture</SubtleBadge>
        ) : (
          <SubtleBadge bg="warning" className="fs-10">Faible</SubtleBadge>
        )}
      </div>
    ),
    meta: {
      headerProps: {
        style: getColumnStyles(90, 70, 80),
        className: 'text-center'
      },
      cellProps: {
        style: getColumnStyles(90, 70, 80)
      }
    }
  },
  {
    accessorKey: 'prixAchat',
    header: "Prix d'Achat",
    cell: ({ row: { original } }) => (
      <div className="text-end fw-medium">
        {original.prixAchat ? `${original.prixAchat} FCFA` : '—'}
      </div>
    ),
    meta: {
      headerProps: {
        style: getColumnStyles(130, 100, 115),
        className: 'text-end'
      },
      cellProps: {
        style: getColumnStyles(130, 100, 115)
      }
    }
  }
];

const RuptureStock = () => {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ state: 'all' });
  const [rowSelection, setRowSelection] = useState({});
  const { data } = useStompClient();
  const { addToast } = useToast();
  const { isMobile, isTablet } = useResponsive();

  const handleFiltersChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setRefresh(prev => prev + 1);
  }, []);

  // Ajuster les largeurs de colonnes selon la taille d'écran
  const getColumnStyles = (baseWidth, mobileWidth = null, tabletWidth = null) => {
    let width = baseWidth;
    if (isMobile && mobileWidth) {
      width = mobileWidth;
    } else if (isTablet && tabletWidth) {
      width = tabletWidth;
    }
    return {
      width: `${width}px`,
      minWidth: `${width}px`,
      maxWidth: `${width}px`
    };
  };

  // Écouter les messages WebSocket pour les ruptures de stock
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const latestMessage = data[data.length - 1];

      // Vérifier si c'est un message de rupture de stock
      if (
        latestMessage &&
        (latestMessage.type === 'STOCK_UPDATED' ||
          latestMessage.type === 'PRODUCT_UPDATED' ||
          latestMessage.message?.includes('stock') ||
          latestMessage.message?.includes('rupture'))
      ) {
        setRefresh(prev => prev + 1);
      }
    }
  }, [data]);

  const fetchRuptureStock = useCallback(async (pageIndex, pageSize) => {
    const response = await apiServiceV1.getRuptureStockProducts(
      pageIndex + 1,
      pageSize
    );
    const result = response.data;
    return { data: result?.content || [], pageCount: result?.totalPages || 0 };
  }, []);

  const table = useAdvanceTable({
    data: [],
    columns: getRuptureColumns(getColumnStyles),
    selection: !isMobile, // Désactiver la sélection sur mobile pour économiser l'espace
    sortable: true,
    pagination: true,
    perPage: isMobile ? 5 : isTablet ? 8 : 10, // Moins d'éléments par page sur mobile
    serverPagination: true,
    fetchData: fetchRuptureStock,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection
  });

  useEffect(() => {
    const syncSelectionToStorage = async () => {
      const currentSelection = (await preApproService.getPreAppro()) || {};
      table.getRowModel().rows.forEach(row => {
        if (rowSelection[row.id]) {
          const { id, libelle, prixAchat, stockDisponible } = row.original;
          currentSelection[id] = {
            id,
            libelle,
            prixAchat,
            stockDisponible
          };
        } else {
          delete currentSelection[row.original.id];
        }
      });
      await preApproService.setPreAppro(currentSelection);
      setRefresh(prev => prev + 1);
    };
    syncSelectionToStorage();
  }, [rowSelection, table]);

  useEffect(() => {
    const loadSelectionFromStorage = async () => {
      const savedSelection = (await preApproService.getPreAppro()) || {};
      const rows = table.getRowModel().rows;
      const newSelection = {};
      rows.forEach(row => {
        if (savedSelection[row.original.id]) {
          newSelection[row.id] = true;
        }
      });
      setRowSelection(newSelection);
    };
    loadSelectionFromStorage();
  }, [table.getRowModel().rows]);

  return (
    <Row className="mb-2 g-0">
      <Col xs={12} className="px-0">
        <AdvanceTableProvider {...table}>
          <Card className="shadow-sm inventory-table border-0">
            <Card.Header className="bg-body-tertiary p-1 p-md-2">
              <Row className="align-items-center g-1 g-md-2">
                <Col xs={12} md={4} className="d-flex bulk-actions px-1">
                  <BulkActionsAndSearchBar
                    onBulkDelete={() => {}}
                    filtersConfig={ruptureFiltersConfig}
                    filtersValues={filters}
                    onFiltersChange={handleFiltersChange}
                    searchPlaceholder=""
                    onSearch={() => {}}
                    hideSearchBar={true}
                  />
                </Col>
                <Col xs={12} md={8} className="px-1">
                  <div className="actions-container">
                    <CriticalStockHeader refresh={refresh} />
                  </div>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <AdvanceTable
                  tableProps={{
                    size: 'sm',
                    striped: true,
                    className: 'fs-10 mb-0 table-fixed-layout'
                  }}
                />
              </div>
            </Card.Body>
            <Card.Footer className="p-1 p-md-2">
              <AdvanceTablePagination />
            </Card.Footer>
          </Card>
        </AdvanceTableProvider>
      </Col>
    </Row>
  );
};

export default RuptureStock;
