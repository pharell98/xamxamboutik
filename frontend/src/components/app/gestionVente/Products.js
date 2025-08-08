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
const STOCK_UPDATE_DELAY = 300;
const PRODUCT_RELOAD_DELAY = 1000;
const SENTINEL_MARGIN = '100px';

// Hook personnalisé pour la gestion des produits
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastSoldItems, setLastSoldItems] = useState([]);

  const fetchProducts = useCallback(async (pageToLoad) => {
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
          stockDisponible: Number(product.stockDisponible || product.stock || 0),
          categorieLibelle: product.categorieLibelle || product.categorie || 'Sans catégorie',
          quantiteDisponible: Number(product.stockDisponible || product.stock || 0),
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
      console.log('[Products] Rechargement des produits après vente...');
      // Éviter les rechargements multiples
      if (loading) {
        console.log('[Products] Rechargement ignoré - requête en cours');
        return;
      }
      try {
        setLoading(true);
        const response = await venteServiceV1.getMostSoldProducts(1, PRODUCTS_PER_PAGE, 'web');
        if (response.success && response.data) {
          const { content } = response.data;
          if (content && Array.isArray(content)) {
            const validatedProducts = content
              .filter(product => product && (product.id || product.produitId))
              .map(product => ({
                id: product.id || product.produitId,
                libelle: product.libelle || product.nom || 'Produit sans nom',
                image: product.image || product.imageUrl || null,
                prixVente: Number(product.prixVente || product.prix || 0),
                prixAchat: Number(product.prixAchat || 0),
                stockDisponible: Number(product.stockDisponible || product.stock || 0),
                categorieLibelle: product.categorieLibelle || product.categorie || 'Sans catégorie',
                quantiteDisponible: Number(product.stockDisponible || product.stock || 0),
                totalPrice: Number(product.prixVente || product.prix || 0) * 1
              }));
            console.log('[Products] Nouveaux produits chargés:', validatedProducts.length);
            setProducts(validatedProducts);
            setPage(1);
            setHasMore(true);
          }
        }
      } catch (error) {
        console.error('[Products] Erreur lors du rechargement des produits:', error);
      } finally {
        setLoading(false);
      }
    }, PRODUCT_RELOAD_DELAY),
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

// Hook personnalisé pour la gestion des stocks
const useStockManagement = (products, setProducts) => {
  const updateProductStocks = useCallback(
    _.debounce(soldItems => {
      console.log('[Products] Mise à jour des stocks en cours...', soldItems);
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => {
          const soldItem = soldItems.find(
            item => item.productId === product.id
          );
          if (soldItem) {
            const newStock = Math.max(
              0,
              product.stockDisponible - soldItem.quantity
            );
            console.log(`[Products] Produit ${product.libelle}: ${product.stockDisponible} -> ${newStock}`);
            return {
              ...product,
              stockDisponible: newStock
            };
          }
          return product;
        });
        console.log('[Products] Stocks mis à jour:', updatedProducts.length, 'produits');
        return updatedProducts;
      });
    }, STOCK_UPDATE_DELAY),
    [] // Supprimé les dépendances instables
  );

  return { updateProductStocks };
};

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

  const { updateProductStocks } = useStockManagement(products, setProducts);

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

  // Gestion des messages WebSocket
  useEffect(() => {
    if (Array.isArray(venteData) && venteData.length > 0) {
      const latestMessage = venteData[venteData.length - 1];
      console.log('[Products] Message de vente reçu:', latestMessage);
      if (
        latestMessage &&
        latestMessage.type === 'SALE' &&
        Array.isArray(latestMessage.soldItems) &&
        latestMessage.soldItems.length > 0
      ) {
        console.log('[Products] Mise à jour des stocks pour:', latestMessage.soldItems);
        updateProductStocks(latestMessage.soldItems);
        // Délayer le rechargement pour éviter les boucles
        setTimeout(() => {
          reloadProductsAfterSale();
        }, 1000);
      }
    }
  }, [venteData]); // Supprimé updateProductStocks et reloadProductsAfterSale des dépendances

  // Gestion des événements de checkout
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
      updateProductStocks(soldItems);
    };
    window.addEventListener('checkout', handleCheckout);
    return () => {
      window.removeEventListener('checkout', handleCheckout);
    };
  }, [cartItems]); // Supprimé updateProductStocks et setLastSoldItems des dépendances

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
                  <FontAwesomeIcon
                    icon="search"
                    className="empty-icon"
                  />
                  <h4 className="empty-title">Aucun produit trouvé</h4>
                  <p className="empty-description">
                    {searchTerm ? `Aucune correspondance pour « ${searchTerm} »` : 'Aucun produit disponible'}
                  </p>
                </div>
              ) : (
                <Row className={classNames({ 
                  'g-0': isList,
                  'product-grid': isGrid,
                  'product-list': isList
                })}>
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
              <div className="loading-state">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <span className="ms-2">Chargement des produits...</span>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Products;
