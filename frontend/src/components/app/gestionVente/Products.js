import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import _ from 'lodash';

import { useProductContext } from 'providers/ProductProvider';
import venteServiceV1 from 'services/vente.service.v1';
import ProductList from './ProductList';
import ProductGrid from './ProductGrid';
import CartSection from './cart/CartSection';
import paths from 'routes/paths';
import { useStompClient } from '../../../contexts/StompContext';
import Loading from '../../common/Loading';
import BarcodeScanner from './barcode/BarcodeScanner';
import { useToast } from '../../common/Toast';

// Constantes pour améliorer la maintenabilité
const PRODUCTS_PER_PAGE = 24;
const DEBOUNCE_DELAY = 300;
const SEARCH_DEBOUNCE_DELAY = 150; // Debounce très court pour recherche temps réel
const MIN_SEARCH_LENGTH = 2;

const SENTINEL_MARGIN = '100px';

// Fonction utilitaire pour transformer les produits
const transformProducts = content => {
  return content
    .filter(product => product && (product.id || product.produitId))
    .map(product => ({
      id: product.id || product.produitId,
      libelle: product.libelle || product.nom || 'Produit sans nom',
      image: product.image || product.imageUrl || null,
      prixVente: Number(product.prixVente || product.prix || 0),
      prixAchat: Number(product.prixAchat || 0),
      stockDisponible: Number(
        product.stockDisponible || product.stock || 0
      ),
      categorieLibelle:
        product.categorieLibelle || product.categorie || 'Sans catégorie',
      quantiteDisponible: Number(
        product.stockDisponible || product.stock || 0
      ),
      totalPrice: Number(product.prixVente || product.prix || 0) * 1
    }));
};

// Hook personnalisé pour la gestion des produits
const useProducts = (searchTerm = '') => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastSoldItems, setLastSoldItems] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Ref pour éviter les requêtes multiples
  const isLoadingRef = useRef(false);

  const fetchProducts = useCallback(
    async (pageToLoad, append = false, searchLibelle = '') => {
      // Éviter les requêtes multiples
      if (isLoadingRef.current) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        
        let response;
        const normalizedSearch = searchLibelle
          ? searchLibelle.trim().toLowerCase()
          : '';
        const isSearching = normalizedSearch.length > 0;

        if (isSearching) {
          response = await venteServiceV1.searchProductsByLibelle(
            searchLibelle,
            pageToLoad,
            PRODUCTS_PER_PAGE
          );
        } else {
          response = await venteServiceV1.getMostSoldProducts(
            pageToLoad,
            PRODUCTS_PER_PAGE,
            'web'
          );
        }

        if (!response.success) {
          console.warn('[Products] Réponse non réussie:', response);
          return;
        }

        // Extraire les données paginées
        // Le backend retourne ApiResponse<Page<?>> donc response.data contient l'objet Page
        const pageData = response.data || {};
        const { number, totalPages, content } = pageData;
        const currentPage = number !== undefined ? number + 1 : pageToLoad;

        const activeSearch = searchTermRef.current
          ? searchTermRef.current.trim().toLowerCase()
          : '';
        if (normalizedSearch !== activeSearch) {
          console.log(
            '[Products] Réponse ignorée (recherche dépassée):',
            searchLibelle
          );
          return;
        }

        setIsSearchMode(isSearching);

        // Vérifier que les données sont valides
        // totalPages peut être 0 (aucun résultat), c'est valide
        if (content === undefined || totalPages === undefined) {
          console.error('[Products] Données API incomplètes:', {
            number,
            totalPages,
            content,
            response: response
          });
          setHasMore(false);
          if (!append) {
            setProducts([]);
          }
          return;
        }

        // Si aucun résultat trouvé, traiter comme une liste vide valide
        if (totalPages === 0 || !Array.isArray(content)) {
          if (append) {
            // Si on ajoute des pages, ne rien faire
            setHasMore(false);
          } else {
            // Si nouvelle recherche, vider la liste
            setProducts([]);
            setPage(1);
            setTotalPages(0);
            setHasMore(false);
          }
          return;
        }

        // Valider et transformer les données des produits
        const validatedContent = transformProducts(content);

        if (append) {
          // Ajouter les nouvelles pages
          setProducts(prev => {
            const merged = [...prev, ...validatedContent];
            const unique = merged.filter(
              (item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx
            );
            return unique;
          });
        } else {
          // Remplacer les produits (nouvelle recherche ou première page)
          setProducts(validatedContent);
        }

        setPage(currentPage);
        setTotalPages(totalPages);
        setHasMore(currentPage < totalPages);
      } catch (err) {
        console.error('[Products] Erreur de fetch page:', err);
        setHasMore(false);
        if (!append) {
          setProducts([]);
        }
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    [] // Pas de dépendances instables
  );

  const reloadProductsAfterSale = useCallback(
    _.debounce(async () => {
      // Éviter les rechargements multiples
      if (isLoadingRef.current) {
        return;
      }
      try {
        // Démarrer le loading avec un délai minimal pour la fluidité
        isLoadingRef.current = true;
        setLoading(true);
        setIsSearchMode(false); // Revenir à la liste normale après vente

        const response = await venteServiceV1.getMostSoldProducts(
          1,
          PRODUCTS_PER_PAGE,
          'web'
        );
        if (response.success && response.data) {
          const { content, totalPages } = response.data;
          if (content && Array.isArray(content)) {
            const validatedProducts = transformProducts(content);

            // Transition fluide : remplacer les produits d'un coup
            setProducts(validatedProducts);
            setPage(1);
            setTotalPages(totalPages || 1);
            setHasMore(1 < (totalPages || 1));
          }
        }
      } catch (error) {
        console.error(
          '[Products] Erreur lors du rechargement des produits:',
          error
        );
      } finally {
        // Délai minimal pour éviter le flash
        setTimeout(() => {
          isLoadingRef.current = false;
          setLoading(false);
        }, 200);
      }
    }, 500), // Réduit le délai de debounce pour plus de réactivité
    [] // Pas de dépendances instables
  );

  // Ref pour stocker les fonctions stables
  const fetchProductsRef = useRef(fetchProducts);
  const setPageRef = useRef(setPage);
  const setProductsRef = useRef(setProducts);
  
  // Mettre à jour les refs quand les fonctions changent
  useEffect(() => {
    fetchProductsRef.current = fetchProducts;
    setPageRef.current = setPage;
    setProductsRef.current = setProducts;
  }, [fetchProducts, setPage, setProducts]);

  // Recherche en temps réel avec debounce minimal
  const searchProducts = useMemo(
    () =>
      _.debounce((searchLibelle, pageNum = 1) => {
        if (!searchLibelle || !searchLibelle.trim()) {
          // Si recherche vide, revenir à la liste normale
          setProductsRef.current([]);
          setPageRef.current(1);
          if (fetchProductsRef.current) {
            fetchProductsRef.current(1, false, '');
          }
        } else {
          if (fetchProductsRef.current) {
            fetchProductsRef.current(pageNum, false, searchLibelle);
          }
        }
      }, SEARCH_DEBOUNCE_DELAY), // Debounce minimal pour recherche temps réel
    [] // Pas de dépendances instables
  );

  return {
    products,
    setProducts,
    loading,
    hasMore,
    page,
    setPage,
    fetchProducts,
    reloadProductsAfterSale,
    lastSoldItems,
    setLastSoldItems,
    searchProducts,
    isSearchMode
  };
};

// Hook supprimé - plus besoin de gestion manuelle des stocks
// Le rechargement complet gère tout automatiquement

const Products = () => {
  const navigate = useNavigate();
  const { productLayout } = useParams();
  const layout = productLayout?.split(/-/)[1];
  const isList = layout === 'list';
  const isGrid = layout === 'grid';
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchTooShort, setIsSearchTooShort] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    productsState: { cartItems },
    productsDispatch
  } = useProductContext();
  const { venteData, connected } = useStompClient();

  const {
    products,
    setProducts,
    loading,
    hasMore,
    page,
    setPage,
    fetchProducts,
    reloadProductsAfterSale,
    lastSoldItems,
    setLastSoldItems,
    searchProducts,
    isSearchMode
  } = useProducts(searchTerm);

  const trimmedSearchValue = searchTerm.trim();
  const showSearchHelper =
    isSearchTooShort && trimmedSearchValue.length > 0;
  const showSearchSummary =
    isSearchMode && !showSearchHelper && trimmedSearchValue.length > 0;
  const searchResultCount = showSearchSummary ? products.length : 0;

  // Plus besoin du hook de gestion des stocks

  // Ajouter une vérification pour éviter les requêtes multiples
  const isInitializedRef = useRef(false);

  // Fonction de test pour vérifier la connexion WebSocket
  const testWebSocketConnection = () => {
    };

  useEffect(() => {
    // Limiter les tests de connexion WebSocket
    const timeoutId = setTimeout(() => {
      testWebSocketConnection();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [connected, venteData]);

  useEffect(() => {
    if (!isList && !isGrid) {
      navigate('/errors/404');
    }
  }, [isList, isGrid, navigate]);

  useEffect(() => {
    if (!isInitializedRef.current && fetchProducts) {
      isInitializedRef.current = true;
      fetchProducts(1, false, '');
    }
  }, []); // Charger uniquement au montage

  // Ref pour suivre le dernier terme de recherche
  const lastSearchTermRef = useRef('');
  const isSearchModeRef = useRef(false);
  const fetchProductsRef = useRef(fetchProducts);
  const setPageRef = useRef(setPage);
  const setProductsRef = useRef(setProducts);

  useEffect(() => {
    fetchProductsRef.current = fetchProducts;
    setPageRef.current = setPage;
    setProductsRef.current = setProducts;
  }, [fetchProducts, setPage, setProducts]);

  useEffect(() => {
    isSearchModeRef.current = isSearchMode;
  }, [isSearchMode]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    // Ignorer le premier rendu si pas encore initialisé
    if (!isInitializedRef.current) {
      return undefined;
    }

    const trimmedSearch = searchTerm ? searchTerm.trim() : '';

    // Éviter de relancer la recherche si le terme n'a pas changé
    if (trimmedSearch === lastSearchTermRef.current) {
      return undefined;
    }

    lastSearchTermRef.current = trimmedSearch;

    if (!trimmedSearch) {
      setIsSearchTooShort(false);
      if (isSearchModeRef.current && fetchProductsRef.current) {
        searchProducts.cancel();
        setProductsRef.current([]);
        setPageRef.current(1);
        fetchProductsRef.current(1, false, '');
      }
      return () => {
        searchProducts.cancel();
      };
    }

    if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
      setIsSearchTooShort(true);
      searchProducts.cancel();
      return undefined;
    }

    setIsSearchTooShort(false);
    // Recherche avec debounce
    searchProducts(trimmedSearch, 1);

    return () => {
      searchProducts.cancel();
    };
  }, [searchTerm, searchProducts]);

  // Gestion de l'intersection observer pour le scroll infini
  const sentinelRef = useRef(null);
  const searchTermRef = useRef(searchTerm);
  
  // Mettre à jour la ref quand searchTerm change
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const debouncedFetchProducts = useMemo(
    () =>
      _.debounce(pageToLoad => {
        const currentSearch = searchTermRef.current
          ? searchTermRef.current.trim()
          : '';
        fetchProducts(pageToLoad, true, currentSearch);
      }, DEBOUNCE_DELAY),
    [fetchProducts]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          // Charger plus (fonctionne aussi en mode recherche)
          debouncedFetchProducts(page + 1);
        }
      },
      {
        root: null,
        rootMargin: SENTINEL_MARGIN,
        threshold: 0.1
      }
    );

    const el = sentinelRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
      }
      debouncedFetchProducts.cancel();
    };
  }, [page, loading, hasMore, debouncedFetchProducts]);

  // Gestion des messages WebSocket - Effet unique après vente
  const lastProcessedMessageRef = useRef(null);
  useEffect(() => {
    if (Array.isArray(venteData) && venteData.length > 0) {
      const latestMessage = venteData[venteData.length - 1];

      // Éviter le traitement du même message plusieurs fois
      if (lastProcessedMessageRef.current === latestMessage) {
        return;
      }

      if (
        latestMessage &&
        latestMessage.type === 'SALE' &&
        Array.isArray(latestMessage.soldItems) &&
        latestMessage.soldItems.length > 0
      ) {
        lastProcessedMessageRef.current = latestMessage;
        // Un seul effet : rechargement complet avec transition
        setTimeout(() => {
          reloadProductsAfterSale();
        }, 500); // Réduit le délai pour plus de fluidité
      }
    }
  }, [venteData, reloadProductsAfterSale]);

  // Gestion des événements de checkout - Effet unique
  useEffect(() => {
    const handleCheckout = event => {
      const soldItems =
        event.detail ||
        cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          libelle: item.libelle
        }));
      setLastSoldItems(soldItems);

      // Un seul effet : rechargement complet au lieu de mise à jour immédiate
      setTimeout(() => {
        reloadProductsAfterSale();
      }, 300);
    };
    window.addEventListener('checkout', handleCheckout);
    return () => {
      window.removeEventListener('checkout', handleCheckout);
    };
  }, [cartItems]);

  // Pas besoin de filtrage côté client si on utilise la recherche serveur
  const finalProducts = products;

  return (
    <div className="vente-mobile">
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          /* Transitions fluides pour le rechargement */
          .product-grid-item, .product-list-item {
            transition: opacity 0.3s ease, transform 0.3s ease;
          }
          
          .vente-components {
            transition: opacity 0.2s ease;
          }
          
          .loading-overlay {
            transition: opacity 0.3s ease;
          }
          
          /* Animation d'apparition pour les nouveaux produits */
          .fade-in {
            animation: fadeInProduct 0.4s ease-out;
          }
          
          @keyframes fadeInProduct {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <Row className="mb-3">
        <Col xs={12}>
          <Card className="search-section">
            <Card.Body className="d-flex align-items-center justify-content-between flex-wrap p-2 p-md-3">
              <div
                className="d-flex flex-column w-100"
                style={{ maxWidth: '500px' }}
              >
                <InputGroup
                  className="mb-2 shadow-sm"
                  style={{
                    flex: '1',
                    borderRadius: '20px',
                    overflow: 'hidden'
                  }}
                >
                  <InputGroup.Text>
                    <FontAwesomeIcon icon="search" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    aria-label="Recherche produit"
                  />
                  {loading && trimmedSearchValue && (
                    <InputGroup.Text className="bg-transparent border-start-0">
                      <Spinner animation="border" size="sm" role="status">
                        <span className="visually-hidden">Recherche en cours</span>
                      </Spinner>
                    </InputGroup.Text>
                  )}
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      <FontAwesomeIcon icon="times" />
                    </Button>
                  )}
                </InputGroup>
                <div className="d-flex flex-column flex-sm-row gap-2 ms-1">
                  {showSearchHelper && (
                    <small className="text-warning">
                      Tapez au moins {MIN_SEARCH_LENGTH} caractères pour lancer la recherche.
                    </small>
                  )}
                  {showSearchSummary && (
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="info" pill>
                        {searchResultCount} résultat{searchResultCount > 1 ? 's' : ''}
                      </Badge>
                      <small className="text-muted">
                        {loading
                          ? 'Recherche en cours...'
                          : `Recherche pour « ${trimmedSearchValue} »`}
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center">
                <BarcodeScanner />
              </div>

              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip style={{ position: 'fixed' }}>
                    {isList ? 'Afficher Grid' : 'Afficher Liste'}
                  </Tooltip>
                }
              >
                <Link
                  to={paths.products(isList ? 'product-grid' : 'product-list')}
                  className="text-600 ms-3 mt-2 mt-sm-0"
                >
                  <FontAwesomeIcon
                    icon={classNames({ th: isList, 'list-ul': isGrid })}
                    size="lg"
                  />
                </Link>
              </OverlayTrigger>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row style={{ height: '80vh' }}>
        <Col
          xs={12}
          md={4}
          className="order-1 order-md-2 mb-3 mb-md-0 cart-section"
          style={{
            maxHeight: '100%',
            overflowY: 'auto'
          }}
        >
          <CartSection show />
        </Col>

        <Col
          xs={12}
          md={8}
          className="order-2 order-md-1"
          style={{
            maxHeight: '100%',
            overflowY: 'auto'
          }}
        >
          <Card className="vente-components">
            <Card.Body
              className={classNames({
                'p-0 overflow-hidden': isList,
                'pb-0': isGrid
              })}
            >
              {finalProducts.length === 0 ? (
                <div className="empty-state">
                  <FontAwesomeIcon icon="search" className="empty-icon" />
                  <h4 className="empty-title">Aucun produit trouvé</h4>
                  <p className="empty-description">
                    {searchTerm
                      ? `Aucune correspondance pour « ${searchTerm} »`
                      : 'Aucun produit disponible'}
                  </p>
                </div>
              ) : (
                <Row
                  className={classNames({
                    'g-0': isList,
                    'product-grid': isGrid,
                    'product-list': isList
                  })}
                >
                  {finalProducts.map((product, index) =>
                    isList ? (
                      <ProductList
                        key={`${product.id}-${product.stockDisponible}`}
                        product={product}
                        index={index}
                      />
                    ) : (
                      <Col
                        xs={6}
                        sm={4}
                        md={3}
                        key={`${product.id}-${product.stockDisponible}`}
                        className="mb-3 product-grid-item"
                      >
                        <ProductGrid product={product} />
                      </Col>
                    )
                  )}
                </Row>
              )}
            </Card.Body>

            <div
              ref={sentinelRef}
              style={{ height: '50px', background: 'transparent' }}
            />

            {loading && (
              <div className="loading-state position-relative">
                <div
                  className="loading-overlay position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 10,
                    borderRadius: '8px'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    >
                      <span className="visually-hidden">Mise à jour...</span>
                    </div>
                    <span className="text-muted">
                      Mise à jour des produits...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Products;
