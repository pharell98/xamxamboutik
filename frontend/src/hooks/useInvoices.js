import { useState, useEffect, useCallback } from 'react';
import factureService from 'services/api.facture';

/**
 * Hook personnalisé pour gérer les factures
 */
const useInvoices = (initialFilters = {}) => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 20
  });
  const [filters, setFilters] = useState({
    period: 'today',
    specificDate: '',
    ...initialFilters
  });

  /**
   * Charge les factures selon les filtres actuels
   */
  const fetchFactures = useCallback(async (page = 0, pageSize = 20) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      console.log('🔍 Récupération des factures:', { filters, page, pageSize });
      
      // Appel API réel
      if (filters.specificDate && filters.specificDate.trim()) {
        console.log('📅 Récupération par date spécifique:', filters.specificDate);
        response = await factureService.getFacturesByDate(
          filters.specificDate,
          page,
          pageSize
        );
      } else if (filters.period === 'all') {
        console.log('📋 Récupération de toutes les factures');
        response = await factureService.getAllFactures(page, pageSize);
      } else {
        console.log('📊 Récupération par période:', filters.period);
        response = await factureService.getFacturesByPeriod(
          filters.period,
          page,
          pageSize
        );
      }
      
      console.log('✅ Réponse API reçue:', response);

      if (response?.success && response?.data) {
        setFactures(response.data.factures || []);
        setPagination({
          currentPage: response.data.currentPage || page,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || 0,
          pageSize: response.data.pageSize || pageSize
        });
      } else {
        throw new Error(response?.message || 'Erreur lors de la récupération des factures');
      }
    } catch (err) {
      console.error('Erreur useInvoices:', err);
      setError(err.message || 'Erreur lors du chargement des factures');
      setFactures([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Met à jour les filtres et recharge les données
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Change de page
   */
  const changePage = useCallback((newPage) => {
    fetchFactures(newPage, pagination.pageSize);
  }, [fetchFactures, pagination.pageSize]);

  /**
   * Change la taille de page
   */
  const changePageSize = useCallback((newPageSize) => {
    fetchFactures(0, newPageSize);
  }, [fetchFactures]);

  /**
   * Recharge les données
   */
  const refresh = useCallback(() => {
    fetchFactures(pagination.currentPage, pagination.pageSize);
  }, [fetchFactures, pagination.currentPage, pagination.pageSize]);

  // Charger les données au montage et lors du changement de filtres
  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  // Recharger quand les filtres changent
  useEffect(() => {
    fetchFactures(0, pagination.pageSize);
  }, [filters]);

  return {
    // Données
    factures,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    updateFilters,
    changePage,
    changePageSize,
    refresh,
    fetchFactures
  };
};

export default useInvoices;
