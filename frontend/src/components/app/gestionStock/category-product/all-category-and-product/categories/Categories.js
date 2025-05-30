import React, { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import apiServiceV1 from 'services/api.service.v1';
import { useStompClient } from 'contexts/StompContext';
import BulkActionsAndSearchBar from 'components/common/advance-table/BulkActionsAndSearchBar';
import DeleteConfirmationModal from 'components/common/DeleteConfirmationModal';
import { categoriesFiltersConfig } from './categoriesFiltersConfig';
import { getCategoriesColumns } from './categoriesColumnsConfig';
import { useToast } from 'components/common/Toast';
import Loading from '../../../../../common/Loading';

const Categories = ({ onEdit }) => {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ state: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionId] = useState(`categories-${Date.now()}`); // ID unique pour la souscription

  const { stompClient, connected, subscribe, unsubscribe, isConnected } =
    useStompClient();
  const { addToast } = useToast();

  const handleFiltersChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setSearchTerm('');
    setRefresh(prev => prev + 1);
  }, []);

  const handleSearch = useCallback(term => {
    setSearchTerm(term.toLowerCase());
    setRefresh(prev => prev + 1);
  }, []);

  const openDeleteModal = useCallback(category => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setCategoryToDelete(null);
    setShowDeleteModal(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;
    try {
      await apiServiceV1.deleteCategory(categoryToDelete.id);
      addToast({
        title: 'Succès',
        message: `Catégorie "${categoryToDelete.libelle}" supprimée avec succès.`,
        type: 'success'
      });
      setRefresh(prev => prev + 1);
      closeDeleteModal();
    } catch (error) {
      console.error('[Categories] Erreur lors de la suppression:', error);
      const serverMessage =
        error.response?.data?.message ||
        'Impossible de supprimer la catégorie.';
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error'
      });
    }
  }, [categoryToDelete, closeDeleteModal, addToast]);

  const handleRestoreCategory = useCallback(
    async category => {
      if (!category || !category.id) return;
      try {
        await apiServiceV1.restoreCategory(category.id);
        addToast({
          title: 'Succès',
          message: `Catégorie "${category.libelle}" restaurée avec succès.`,
          type: 'success'
        });
        setRefresh(prev => prev + 1);
      } catch (error) {
        console.error('[Categories] Erreur lors de la restauration:', error);
        const serverMessage =
          error.response?.data?.message ||
          'Impossible de restaurer la catégorie.';
        addToast({
          title: 'Erreur',
          message: serverMessage,
          type: 'error'
        });
      }
    },
    [addToast]
  );

  const fetchCategories = useCallback(
    async (pageIndex, pageSize) => {
      try {
        let response;
        if (searchTerm && searchTerm.trim() !== '') {
          response = await apiServiceV1.suggestionsCategories(
            searchTerm,
            pageIndex + 1,
            pageSize
          );
        } else if (filters.state === 'deleted') {
          response = await apiServiceV1.getDeletedCategories(
            pageIndex + 1,
            pageSize
          );
        } else {
          response = await apiServiceV1.getAllCategories(
            pageIndex + 1,
            pageSize
          );
        }

        const result = response.data;
        const data = result?.content || [];
        const pageCount = result?.totalPages || 0;
        return { data, pageCount };
      } catch (error) {
        console.error('[Categories] Erreur lors de la récupération:', error);
        const serverMessage =
          error.response?.data?.message ||
          'Impossible de récupérer les catégories.';
        addToast({
          title: 'Erreur',
          message: serverMessage,
          type: 'error'
        });
        return { data: [], pageCount: 0 };
      }
    },
    [filters, searchTerm, addToast]
  );

  useEffect(() => {
    if (!stompClient || !connected) {
      return;
    }

    let retryCount = 0;
    const maxRetries = 5;

    const attemptSubscription = () => {
      if (retryCount >= maxRetries) {
        console.error(
          `Échec de la souscription à /topic/categories après ${maxRetries} tentatives.`
        );
        addToast({
          title: 'Erreur WebSocket',
          message:
            "Impossible de s'abonner aux mises à jour des catégories après plusieurs tentatives.",
          type: 'error'
        });
        return;
      }

      if (isConnected()) {
        const subscribed = subscribe(
          '/topic/categories',
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

  const columns = getCategoriesColumns(
    onEdit,
    openDeleteModal,
    handleRestoreCategory
  );

  const table = useAdvanceTable({
    data: [],
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 10,
    serverPagination: true,
    fetchData: fetchCategories,
    refreshKey: refresh
  });

  return (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <AdvanceTableProvider {...table}>
            <Card className="mb-3">
              <Card.Header className="bg-body-tertiary">
                <h5 className="mb-0">Liste des catégories</h5>
              </Card.Header>
              <Card.Body className="p-1">
                <BulkActionsAndSearchBar
                  onBulkDelete={() => {
                    addToast({
                      title: 'Information',
                      message: 'Suppression multiple simulée (à implémenter).',
                      type: 'info'
                    });
                    setRefresh(prev => prev + 1);
                  }}
                  searchPlaceholder="Rechercher une catégorie..."
                  filtersConfig={categoriesFiltersConfig}
                  filtersValues={filters}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                />
                {table.loading ? (
                  <Loading />
                ) : (
                  <AdvanceTable
                    headerClassName="bg-200 text-nowrap align-middle"
                    rowClassName="align-middle white-space-nowrap"
                    tableProps={{
                      size: 'sm',
                      striped: true,
                      className: 'fs-10 mb-0 overflow-hidden'
                    }}
                  />
                )}
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

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Confirmation de suppression"
        message={
          categoryToDelete
            ? `Voulez-vous vraiment supprimer la catégorie "${categoryToDelete.libelle}" ?`
            : 'Voulez-vous vraiment supprimer cette catégorie ?'
        }
      />
    </>
  );
};

export default Categories;
