import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'react-bootstrap';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTablePagination from 'components/common/advance-table/AdvanceTablePagination';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import userServiceV1 from 'services/user.service.v1';
import { useStompClient } from 'contexts/StompContext';
import BulkActionsAndSearchBar from 'components/common/advance-table/BulkActionsAndSearchBar';
import DeleteConfirmationModal from 'components/common/DeleteConfirmationModal';
import { getUsersFiltersConfig } from './usersFiltersConfig';
import { getUsersColumns } from './usersColumnsConfig';
import { useToast } from 'components/common/Toast';
import Loading from '../../common/Loading';

const Users = ({ onEdit, isEditing }) => {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ role: '', state: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleOptions, setRoleOptions] = useState([
    { value: '', label: 'Tous les rôles' }
  ]);

  const { stompClient, connected } = useStompClient();
  const { addToast } = useToast();

  // Charger les rôles dynamiquement
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await userServiceV1.getRoles();
        const roles = response.data || [];
        const options = roles.map(role => ({
          value: role,
          label: role.charAt(0) + role.slice(1).toLowerCase()
        }));
        setRoleOptions([{ value: '', label: 'Tous les rôles' }, ...options]);
      } catch (error) {
        console.error(
          '[Users] Erreur lors de la récupération des rôles:',
          error
        );
        addToast({
          title: 'Erreur',
          message: 'Erreur lors du chargement des rôles.',
          type: 'error'
        });
      }
    };
    fetchRoles();
  }, [addToast]);

  // Handle filter changes
  const handleFiltersChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setSearchTerm('');
    setRefresh(prev => prev + 1);
  }, []);

  // Handle search term updates
  const handleSearch = useCallback(term => {
    setSearchTerm(term);
  }, []);

  // Debounce search with 500ms delay
  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== '') {
      const timer = setTimeout(() => {
        setRefresh(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // STOMP subscription for real-time updates
  useEffect(() => {
    if (stompClient && connected) {
      const subscriptionUsers = stompClient.subscribe(
        '/topic/users',
        message => {
          console.log('Message received on /topic/users:', message.body);
          setRefresh(prev => prev + 1);
          addToast({
            title: 'Mise à jour utilisateur',
            message: `Action détectée sur un utilisateur.`,
            type: 'info'
          });
        }
      );
      const subscriptionUpdates = stompClient.subscribe(
        '/topic/updates',
        message => {
          console.log('Message received on /topic/updates:', message.body);
          setRefresh(prev => prev + 1);
        }
      );
      return () => {
        subscriptionUsers.unsubscribe();
        subscriptionUpdates.unsubscribe();
      };
    }
  }, [stompClient, connected, addToast]);

  // Open delete confirmation modal
  const openDeleteModal = useCallback(user => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }, []);

  // Close delete confirmation modal
  const closeDeleteModal = useCallback(() => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  }, []);

  // Confirm user deletion
  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    try {
      await userServiceV1.deleteUser(userToDelete.id);
      addToast({
        title: 'Succès',
        message: 'Utilisateur supprimé avec succès.',
        type: 'success'
      });
    } catch (error) {
      console.error('[Users] Error during deletion:', error);
      const serverMessage =
        error.response?.data?.message || 'Erreur lors de la suppression.';
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error'
      });
    }
    setRefresh(prev => prev + 1);
    closeDeleteModal();
  }, [userToDelete, closeDeleteModal, addToast]);

  // Restore a deleted user
  const handleRestoreUser = useCallback(
    async user => {
      if (!user || !user.id) return;
      try {
        await userServiceV1.restoreUser(user.id);
        addToast({
          title: 'Succès',
          message: `Utilisateur "${user.nom}" restauré avec succès.`,
          type: 'success'
        });
        setRefresh(prev => prev + 1);
      } catch (error) {
        console.error('[Users] Error during restoration:', error);
        const serverMessage =
          error.response?.data?.message || 'Erreur lors de la restauration.';
        addToast({
          title: 'Erreur',
          message: serverMessage,
          type: 'error'
        });
      }
    },
    [addToast]
  );

  // Fetch users with pagination, filters, and search
  const fetchUsers = useCallback(
    async (pageIndex, pageSize) => {
      try {
        let response;
        let endpoint = '';

        // Validate filters.state
        const validStates = ['all', 'active', 'deleted'];
        if (filters.state && !validStates.includes(filters.state)) {
          console.error('[fetchUsers] Invalid state:', filters.state);
          throw new Error('État du filtre invalide');
        }

        // Filter by role
        if (filters.role && filters.role !== '') {
          endpoint = `/users/role/${filters.role}`;
          console.log(`[fetchUsers] API Call: ${endpoint}`);
          response = await userServiceV1.getAllUsers(
            pageIndex,
            pageSize,
            'web'
          );
          // Simulate role filtering on client-side (adjust if backend supports role filtering)
          const filteredData = response.data.content.filter(
            user => user.role === filters.role
          );
          console.log('[fetchUsers] Filtered Data (role):', filteredData);
          return {
            data: filteredData,
            pageCount: Math.ceil(filteredData.length / pageSize) || 1
          };
        }
        // Deleted users
        else if (filters.state === 'deleted') {
          endpoint = '/users/deleted';
          console.log(`[fetchUsers] API Call: ${endpoint}`);
          response = await userServiceV1.getDeletedUsers(pageIndex, pageSize);
        }
        // Search by term (assuming backend supports search by nom or login)
        else if (searchTerm && searchTerm.trim() !== '') {
          if (searchTerm.length < 2) {
            console.warn('[fetchUsers] Search term too short:', searchTerm);
            throw new Error(
              'Le terme de recherche doit contenir au moins 2 caractères'
            );
          }
          endpoint = '/users/search';
          console.log(
            `[fetchUsers] API Call: ${endpoint} with query=${searchTerm}`
          );
          response = await userServiceV1.getAllUsers(
            pageIndex,
            pageSize,
            'web'
          );
          // Simulate search filtering on client-side (adjust if backend supports search)
          const filteredData = response.data.content.filter(
            user =>
              user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.login.toLowerCase().includes(searchTerm.toLowerCase())
          );
          console.log('[fetchUsers] Filtered Data (search):', filteredData);
          return {
            data: filteredData,
            pageCount: Math.ceil(filteredData.length / pageSize) || 1
          };
        }
        // Default: all active users
        else {
          endpoint = '/users';
          console.log(`[fetchUsers] API Call: ${endpoint}`);
          response = await userServiceV1.getAllUsers(
            pageIndex,
            pageSize,
            'web'
          );
        }

        const result = response.data || {};
        const data = result.content || [];
        const pageCount = result.totalPages || 0;
        console.log('[fetchUsers] Data:', data, 'PageCount:', pageCount);
        return { data, pageCount };
      } catch (error) {
        console.error('[Users] Error fetching users:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          endpoint
        });
        const serverMessage =
          error.response?.data?.message ||
          `Erreur lors de la récupération des utilisateurs: ${
            error.message || 'Erreur inconnue'
          }`;
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

  // Filter configuration
  const usersFilters = getUsersFiltersConfig(roleOptions);

  // Column configuration
  const columns = getUsersColumns(onEdit, openDeleteModal, handleRestoreUser);

  // Table hook
  const table = useAdvanceTable({
    data: [],
    columns,
    selection: true,
    sortable: true,
    pagination: true,
    perPage: 10,
    serverPagination: true,
    fetchData: fetchUsers,
    refreshKey: refresh
  });

  console.log('[Users] Table Data:', table.data); // Log pour déboguer les données passées à AdvanceTable

  return (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <AdvanceTableProvider {...table}>
            <Card className="mb-3">
              <Card.Header className="bg-body-tertiary">
                <h5 className="mb-0">Liste des utilisateurs</h5>
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
                  searchPlaceholder="Rechercher un utilisateur..."
                  filtersConfig={usersFilters}
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
          userToDelete
            ? `Voulez-vous vraiment supprimer l'utilisateur "${userToDelete.nom}" ?`
            : 'Voulez-vous vraiment supprimer cet utilisateur ?'
        }
      />
    </>
  );
};

Users.propTypes = {
  onEdit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired
};

export default Users;
