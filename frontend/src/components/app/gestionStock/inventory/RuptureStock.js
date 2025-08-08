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

const getRuptureColumns = () => [
  {
    accessorKey: 'codeProduit',
    header: 'Code',
    cell: ({ row: { original } }) => original.codeProduit || '—',
    size: 60,
    minSize: 50
  },
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row: { original } }) =>
      original.image ? (
        <img
          src={original.image}
          alt={original.libelle}
          style={{ width: 35, height: 35, objectFit: 'cover' }}
          className="rounded"
        />
      ) : (
        <div 
          style={{ 
            width: 35, 
            height: 35, 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="fas fa-image text-muted" style={{ fontSize: '0.7rem' }}></i>
        </div>
      ),
    size: 50,
    minSize: 40
  },
  {
    accessorKey: 'libelle',
    header: 'Produit',
    cell: ({ row: { original } }) => (
      <div className="text-truncate" style={{ maxWidth: '100px' }}>
        {original.libelle || '—'}
      </div>
    ),
    size: 120,
    minSize: 80
  },
  {
    accessorKey: 'prixAchat',
    header: "Prix d'achat",
    cell: ({ row: { original } }) => (
      <div className="text-end">
        {original.prixAchat ? `${original.prixAchat} FCFA` : '—'}
      </div>
    ),
    size: 90,
    minSize: 70
  },
  {
    accessorKey: 'statut',
    header: 'Statut',
    cell: ({ row: { original } }) =>
      original.stockDisponible <= 0 ? (
        <SubtleBadge bg="danger" className="fs-10">Rupture</SubtleBadge>
      ) : (
        <SubtleBadge bg="warning" className="fs-10">Faible</SubtleBadge>
      ),
    size: 70,
    minSize: 50
  },
  {
    accessorKey: 'stockDisponible',
    header: 'Stock',
    cell: ({ row: { original } }) => (
      <div className="text-center">
        <strong
          style={{ color: original.stockDisponible <= 0 ? 'red' : 'orange' }}
        >
          {original.stockDisponible}
        </strong>
      </div>
    ),
    size: 60,
    minSize: 40
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
    columns: getRuptureColumns(),
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
                    className: 'fs-10 mb-0'
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
