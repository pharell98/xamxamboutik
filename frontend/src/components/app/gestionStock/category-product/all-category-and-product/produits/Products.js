import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import apiServiceV1 from 'services/api.service.v1';
import { useStompClient } from 'contexts/StompContext';
import BulkActionsAndSearchBar from 'components/common/advance-table/BulkActionsAndSearchBar';
import DeleteConfirmationModal from 'components/common/DeleteConfirmationModal';
import { getProductsFiltersConfig } from './productsFiltersConfig';
import { getProductsColumns } from './productsColumnsConfig';
import { useToast } from 'components/common/Toast';
import Loading from '../../../../../common/Loading';
import { debounce } from 'lodash';

const Products = ({ onEdit, isEditing }) => {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ category: '', state: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data } = useStompClient();
  const { addToast } = useToast();

  const [categoryOptions, setCategoryOptions] = useState([
    { value: '', label: 'Toutes les catégories' }
  ]);

  const debouncedSetRefresh = debounce(() => {
    setRefresh(prev => prev + 1);
  }, 500);

  useEffect(() => {
    const fetchCategoriesForFilter = async () => {
      try {
        const response = await apiServiceV1.getAllCategories(1, 100);
        const cats = response.data.content || [];
        const options = cats.map(cat => ({
          value: cat.id,
          label: cat.libelle
        }));
        setCategoryOptions([
          { value: '', label: 'Toutes les catégories' },
          ...options
        ]);
      } catch (error) {
        console.error(
          '[Products] Erreur lors de la récupération des catégories pour le filtre:',
          error
        );
        addToast({
          title: 'Erreur',
          message: 'Une erreur est survenue lors du chargement des catégories.',
          type: 'error'
        });
      }
    };
    fetchCategoriesForFilter();
  }, [addToast]);

  useEffect(() => {
    const lastUpdate = data[data.length - 1];
    if (lastUpdate?.action) {
      debouncedSetRefresh();
    }
  }, [data]);

  const handleFiltersChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setSearchTerm('');
    setRefresh(prev => prev + 1);
  }, []);

  const handleSearch = useCallback(term => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== '') {
      const timer = setTimeout(() => {
        setRefresh(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const openDeleteModal = useCallback(product => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;
    try {
      await apiServiceV1.deleteProduct(productToDelete.id);
      addToast({
        title: 'Succès',
        message: `Produit "${productToDelete.libelle}" supprimé avec succès.`,
        type: 'success'
      });
    } catch (error) {
      console.error('[Products] Erreur lors de la suppression :', error);
      const serverMessage =
        error.response?.data?.message ||
        'Une erreur est survenue lors de la suppression du produit.';
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error'
      });
    }
    setRefresh(prev => prev + 1);
    closeDeleteModal();
  }, [productToDelete, closeDeleteModal, addToast]);

  const handleRestoreProduct = useCallback(
    async product => {
      if (!product || !product.id) return;
      try {
        await apiServiceV1.restoreProduct(product.id);
        addToast({
          title: 'Succès',
          message: `Produit "${product.libelle}" restauré avec succès.`,
          type: 'success'
        });
        setRefresh(prev => prev + 1);
      } catch (error) {
        console.error('[Products] Erreur lors de la restauration :', error);
        const serverMessage =
          error.response?.data?.message ||
          'Une erreur est survenue lors de la restauration du produit.';
        addToast({
          title: 'Erreur',
          message: serverMessage,
          type: 'error'
        });
      }
    },
    [addToast]
  );

  const fetchProducts = useCallback(
    async (pageIndex, pageSize) => {
      try {
        let response;
        let endpoint = '';

        const validStates = ['all', 'active', 'deleted'];
        if (filters.state && !validStates.includes(filters.state)) {
          throw new Error('État du filtre invalide');
        }

        if (filters.category && filters.category !== '') {
          if (isNaN(filters.category)) {
            throw new Error('ID de catégorie invalide');
          }
          endpoint = `/produits/category/${filters.category}`;
          response = await apiServiceV1.getProductsByCategory(
            filters.category,
            pageIndex + 1,
            pageSize
          );
        } else if (filters.state === 'deleted') {
          endpoint = '/produits/deleted';
          response = await apiServiceV1.getDeletedProducts(
            pageIndex + 1,
            pageSize
          );
        } else if (searchTerm && searchTerm.trim() !== '') {
          if (searchTerm.length < 2) {
            throw new Error(
              'Le terme de recherche doit contenir au moins 2 caractères'
            );
          }
          endpoint = '/produits/suggestions';
          response = await apiServiceV1.getProductSuggestions(
            searchTerm,
            pageIndex + 1,
            pageSize
          );
        } else {
          endpoint = '/produits';
          response = await apiServiceV1.getAllProducts(
            pageIndex + 1,
            pageSize,
            { state: filters.state === 'active' ? 'active' : undefined }
          );
        }

        const result = response.data || {};
        const data = result.content || [];
        const pageCount = result.totalPages || 0;
        return { data, pageCount };
      } catch (error) {
        console.error(
          '[Products] Erreur lors de la récupération des produits:',
          {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            endpoint
          }
        );
        addToast({
          title: 'Erreur',
          message: 'Impossible de charger les produits. Veuillez réessayer.',
          type: 'error'
        });
        return { data: [], pageCount: 0 };
      }
    },
    [filters, searchTerm, addToast]
  );

  const productsFilters = getProductsFiltersConfig(categoryOptions);
  const columns = getProductsColumns(
    onEdit,
    openDeleteModal,
    handleRestoreProduct
  );

  const table = useAdvanceTable({
    data: [],
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 10,
    serverPagination: true,
    fetchData: fetchProducts,
    refreshKey: refresh
  });

  return (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <AdvanceTableProvider {...table}>
            <Card className="mb-3">
              <Card.Header className="bg-body-tertiary">
                <h5 className="mb-0">Liste des produits</h5>
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
                  searchPlaceholder="Rechercher un produit..."
                  filtersConfig={productsFilters}
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
          productToDelete
            ? `Voulez-vous vraiment supprimer le produit "${productToDelete.libelle}" ?`
            : 'Voulez-vous vraiment supprimer ce produit ?'
        }
      />
    </>
  );
};

Products.propTypes = {
  onEdit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired
};

export default Products;
