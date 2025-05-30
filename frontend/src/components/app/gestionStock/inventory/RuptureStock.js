import React, { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import useAdvanceTable from 'hooks/useAdvanceTable';
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
    cell: ({ row: { original } }) => original.codeProduit || '—'
  },
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row: { original } }) =>
      original.image ? (
        <img
          src={original.image}
          alt={original.libelle}
          style={{ width: 50, height: 50, objectFit: 'cover' }}
        />
      ) : (
        '—'
      )
  },
  {
    accessorKey: 'libelle',
    header: 'Produit',
    cell: ({ row: { original } }) => original.libelle || '—'
  },
  {
    accessorKey: 'prixAchat',
    header: "Prix d'achat",
    cell: ({ row: { original } }) => original.prixAchat || '—'
  },
  {
    accessorKey: 'statut',
    header: 'Statut',
    cell: ({ row: { original } }) =>
      original.stockDisponible <= 0 ? (
        <SubtleBadge bg="danger">Rupture</SubtleBadge>
      ) : (
        <SubtleBadge bg="warning">Stock faible</SubtleBadge>
      )
  },
  {
    accessorKey: 'stockDisponible',
    header: 'Stock',
    cell: ({ row: { original } }) => (
      <strong
        style={{ color: original.stockDisponible <= 0 ? 'red' : 'orange' }}
      >
        {original.stockDisponible}
      </strong>
    )
  }
];

const RuptureStock = () => {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ state: 'all' });
  const [rowSelection, setRowSelection] = useState({});
  const { stompClient, connected, subscribe, unsubscribe, isConnected } =
    useStompClient();
  const { addToast } = useToast();
  const [subscriptionId] = useState(`ruptureStock-${Date.now()}`); // ID unique pour la souscription

  const handleFiltersChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setRefresh(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!stompClient || !connected) {
      return;
    }

    let retryCount = 0;
    const maxRetries = 5;

    const attemptSubscription = () => {
      if (retryCount >= maxRetries) {
        console.error(
          `Échec de la souscription à /topic/ruptureStock après ${maxRetries} tentatives.`
        );
        addToast({
          title: 'Erreur WebSocket',
          message:
            "Impossible de s'abonner aux mises à jour des stocks après plusieurs tentatives.",
          type: 'error'
        });
        return;
      }

      if (isConnected()) {
        const subscribed = subscribe(
          '/topic/ruptureStock',
          () => {
            setRefresh(prev => prev + 1);
          },
          subscriptionId
        );
        if (!subscribed) {
          retryCount++;
          setTimeout(attemptSubscription, 1000);
        }
      } else {
        retryCount++;
        setTimeout(attemptSubscription, 1000);
      }
    };

    attemptSubscription();

    return () => {
      unsubscribe(subscriptionId);
    };
  }, [
    stompClient,
    connected,
    subscribe,
    unsubscribe,
    isConnected,
    addToast,
    subscriptionId
  ]);

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
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 10,
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
    <Row className="mb-3">
      <Col md={12}>
        <AdvanceTableProvider {...table}>
          <Card>
            <Card.Header className="bg-body-tertiary">
              <Row className="align-items-center">
                <Col md={4} className="d-flex">
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
                <Col md={8}>
                  <CriticalStockHeader refresh={refresh} />
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-1">
              <AdvanceTable
                tableProps={{
                  size: 'sm',
                  striped: true,
                  className: 'fs-10 mb-0 overflow-hidden'
                }}
              />
            </Card.Body>
            <Card.Footer>
              <AdvanceTablePagination />
            </Card.Footer>
          </Card>
        </AdvanceTableProvider>
      </Col>
    </Row>
  );
};

export default RuptureStock;
