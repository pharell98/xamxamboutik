import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  OverlayTrigger,
  Row,
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

const SENTINEL_MARGIN = '100px';

// Hook personnalisé pour la gestion des produits
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastSoldItems, setLastSoldItems] = useState([]);

  const fetchProducts = useCallback(async pageToLoad => {
    // Éviter les requêtes multiples
    if (loading) {
      console.log('[Products] Requête en cours, ignorée');
      return;
    }

    try {
      setLoading(true);
      const response = await venteServiceV1.getMostSoldProducts(
        pageToLoad,
        PRODUCTS_PER_PAGE,
        'web'
      );

      if (!response.success) {
        return;
      }

      const { number, totalPages, content } = response.data || {};
      const currentPage = number !== undefined ? number + 1 : pageToLoad;

      if (!content || !totalPages) {
        console.error('[Products] Données API incomplètes:', {
          number,
          totalPages,
          content
        });
        setHasMore(false);
        return;
      }

      // Valider et transformer les données des produits
      const validatedContent = content
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

      setProducts(prev => {
        const merged = [...prev, ...validatedContent];
        const unique = merged.filter(
          (item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx
        );
        return unique;
      });

      setPage(currentPage);
      setTotalPages(totalPages);
      setHasMore(currentPage < totalPages);
    } catch (err) {
      console.error('[Products] Erreur de fetch page:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []); // Supprimé les dépendances instables

  const reloadProductsAfterSale = useCallback(
    _.debounce(async () => {
      console.log('[Products] Rechargement fluide des produits après vente...');
      // Éviter les rechargements multiples
      if (loading) {
        console.log('[Products] Rechargement ignoré - requête en cours');
        return;
      }
      try {
        // Démarrer le loading avec un délai minimal pour la fluidité
        setLoading(true);

        const response = await venteServiceV1.getMostSoldProducts(
          1,
          PRODUCTS_PER_PAGE,
          'web'
        );
        if (response.success && response.data) {
          const { content, totalPages } = response.data;
          if (content && Array.isArray(content)) {
            const validatedProducts = content
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
                  product.categorieLibelle ||
                  product.categorie ||
                  'Sans catégorie',
                quantiteDisponible: Number(
                  product.stockDisponible || product.stock || 0
                ),
                totalPrice: Number(product.prixVente || product.prix || 0) * 1
              }));

            console.log(
              '[Products] Nouveaux produits chargés:',
              validatedProducts.length
            );

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
          setLoading(false);
        }, 200);
      }
    }, 500), // Réduit le délai de debounce pour plus de réactivité
    [] // Supprimé les dépendances instables
  );

  return {
    products,
    setProducts,
    loading,
    hasMore,
    page,
    fetchProducts,
    reloadProductsAfterSale,
    lastSoldItems,
    setLastSoldItems
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
    fetchProducts,
    reloadProductsAfterSale,
    lastSoldItems,
    setLastSoldItems
  } = useProducts();

  // Plus besoin du hook de gestion des stocks

  // Ajouter une vérification pour éviter les requêtes multiples
  const isInitializedRef = useRef(false);

  // Fonction de test pour vérifier la connexion WebSocket
  const testWebSocketConnection = () => {
    console.log('[Products] Test de connexion WebSocket:');
    console.log('- Connected:', connected);
    console.log('- VenteData length:', venteData?.length || 0);
    console.log('- Dernier message:', venteData?.[venteData.length - 1]);
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
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchProducts(1);
    }
  }, []); // Supprimé fetchProducts de la dépendance

  // Gestion de l'intersection observer pour le scroll infini
  const sentinelRef = useRef(null);
  const debouncedFetchProducts = useMemo(
    () =>
      _.debounce(pageToLoad => {
        fetchProducts(pageToLoad);
      }, DEBOUNCE_DELAY),
    [] // Supprimé fetchProducts de la dépendance
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
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
    };
  }, [page, loading, hasMore]); // Supprimé debouncedFetchProducts de la dépendance

  // Gestion des messages WebSocket - Effet unique après vente
  const lastProcessedMessageRef = useRef(null);
  useEffect(() => {
    if (Array.isArray(venteData) && venteData.length > 0) {
      const latestMessage = venteData[venteData.length - 1];
      
      // Éviter le traitement du même message plusieurs fois
      if (lastProcessedMessageRef.current === latestMessage) {
        return;
      }
      
      console.log('[Products] Message de vente reçu:', latestMessage);
      
      // Filtrer les messages pour éviter les rechargements inutiles
      if (
        latestMessage &&
        latestMessage.type === 'SALE' &&
        Array.isArray(latestMessage.soldItems) &&
        latestMessage.soldItems.length > 0
      ) {
        lastProcessedMessageRef.current = latestMessage;
        console.log('[Products] Rechargement des produits après vente...');
        // Un seul effet : rechargement complet avec transition
        setTimeout(() => {
          reloadProductsAfterSale();
        }, 500); // Réduit le délai pour plus de fluidité
      } else if (
        latestMessage &&
        latestMessage.action === 'UPDATE' &&
        latestMessage.productId
      ) {
        // Ignorer les mises à jour de produits (stock, prix, etc.) pour éviter les boucles
        console.log('[Products] Mise à jour produit ignorée pour éviter les boucles:', latestMessage);
        lastProcessedMessageRef.current = latestMessage;
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
      console.log('[Products] Checkout détecté, rechargement des produits...');
      setTimeout(() => {
        reloadProductsAfterSale();
      }, 300);
    };
    window.addEventListener('checkout', handleCheckout);
    return () => {
      window.removeEventListener('checkout', handleCheckout);
    };
  }, [cartItems]);

  // Filtrage des produits
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const lower = searchTerm.toLowerCase();
      return (
        p.libelle?.toLowerCase().includes(lower) ||
        p.categorieLibelle?.toLowerCase().includes(lower)
      );
    });
  }, [products, searchTerm]);

  const finalProducts = filteredProducts;

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
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      <FontAwesomeIcon icon="times" />
                    </Button>
                  )}
                </InputGroup>
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
