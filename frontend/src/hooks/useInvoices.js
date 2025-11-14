import { useState, useEffect, useCallback, useRef } from 'react';
import factureService from 'services/api.facture';

/**
 * Hook personnalisé pour gérer les factures avec chargement infini
 */
const useInvoices = (initialFilters = {}) => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
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

  // Ref pour éviter les requêtes multiples
  const isLoadingRef = useRef(false);
  const filtersChangedRef = useRef(false);

  /**
   * Charge les factures selon les filtres actuels
   * @param {number} page - Page à charger (0-indexed)
   * @param {number} pageSize - Taille de la page
   * @param {boolean} append - Si true, ajoute les résultats aux factures existantes
   */
  const fetchFactures = useCallback(
    async (page = 0, pageSize = 20, append = false) => {
      // Éviter les requêtes multiples
      if (isLoadingRef.current) {
        return;
      }

      // Si les filtres ont changé, réinitialiser et ne pas append
      if (filtersChangedRef.current) {
        append = false;
        filtersChangedRef.current = false;
      }

      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        let response;

        // Appel API réel
        if (filters.specificDate && filters.specificDate.trim()) {
          response = await factureService.getFacturesByDate(
            filters.specificDate,
            page,
            pageSize
          );
        } else if (filters.period === 'all') {
          response = await factureService.getAllFactures(page, pageSize);
        } else {
          response = await factureService.getFacturesByPeriod(
            filters.period,
            page,
            pageSize
          );
        }

        if (response?.success && response?.data) {
          const newFactures = response.data.factures || [];
          const currentPage = response.data.currentPage || page;
          const totalPages = response.data.totalPages || 1;
          const totalElements = response.data.totalElements || 0;

          if (append) {
            // Ajouter les nouvelles factures aux existantes (éviter les doublons)
            setFactures(prev => {
              const existingIds = new Set(prev.map(f => f.numeroFacture));
              const uniqueNewFactures = newFactures.filter(
                f => !existingIds.has(f.numeroFacture)
              );
              return [...prev, ...uniqueNewFactures];
            });
          } else {
            // Remplacer les factures (nouveau chargement)
            setFactures(newFactures);
          }

          setPagination({
            currentPage,
            totalPages,
            totalElements,
            pageSize: response.data.pageSize || pageSize
          });

          // Vérifier s'il y a plus de pages à charger
          setHasMore(currentPage + 1 < totalPages);
        } else {
          throw new Error(
            response?.message || 'Erreur lors de la récupération des factures'
          );
        }
      } catch (err) {
        console.error('Erreur useInvoices:', err);
        setError(err.message || 'Erreur lors du chargement des factures');
        if (!append) {
          setFactures([]);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [filters]
  );

  /**
   * Charge la page suivante
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore && pagination.currentPage + 1 < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      fetchFactures(nextPage, pagination.pageSize, true);
    }
  }, [loading, hasMore, pagination, fetchFactures]);

  /**
   * Met à jour les filtres et recharge les données
   */
  const updateFilters = useCallback(newFilters => {
    setFilters(prev => {
      const newFiltersState = { ...prev, ...newFilters };
      // Marquer que les filtres ont changé pour réinitialiser lors du prochain fetch
      filtersChangedRef.current = true;
      return newFiltersState;
    });
  }, []);

  /**
   * Change de page
   */
  const changePage = useCallback(
    newPage => {
      fetchFactures(newPage, pagination.pageSize, false);
    },
    [fetchFactures, pagination.pageSize]
  );

  /**
   * Change la taille de page
   */
  const changePageSize = useCallback(
    newPageSize => {
      fetchFactures(0, newPageSize, false);
    },
    [fetchFactures]
  );

  /**
   * Recharge les données depuis le début
   */
  const refresh = useCallback(() => {
    setFactures([]);
    setHasMore(true);
    fetchFactures(0, pagination.pageSize || 20, false);
  }, [fetchFactures, pagination.pageSize]);

  // Charger les données au montage et lors du changement de filtres
  useEffect(() => {
    // Réinitialiser lors du changement de filtres
    setFactures([]);
    setHasMore(true);
    fetchFactures(0, 20, false);
  }, [filters, fetchFactures]);

  return {
    // Données
    factures,
    loading,
    error,
    hasMore,
    pagination,
    filters,

    // Actions
    updateFilters,
    changePage,
    changePageSize,
    refresh,
    fetchFactures,
    loadMore
  };
};

export default useInvoices;
