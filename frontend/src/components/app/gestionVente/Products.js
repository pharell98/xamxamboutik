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

const Products = () => {
  const navigate = useNavigate();
  const { productLayout } = useParams();
  const layout = productLayout?.split(/-/)[1];
  const isList = layout === 'list';
  const isGrid = layout === 'grid';
  const { addToast } = useToast();

  useEffect(() => {
    if (!isList && !isGrid) {
      navigate('/errors/404');
    }
  }, [isList, isGrid, navigate]);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastSoldItems, setLastSoldItems] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    productsState: { cartItems },
    productsDispatch
  } = useProductContext();
  const { venteData } = useStompClient();

  const fetchProducts = async pageToLoad => {
    if (!hasMore || loading) return;
    try {
      setLoading(true);
      const response = await venteServiceV1.getMostSoldProducts(
        pageToLoad,
        24,
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

      setProducts(prev => {
        const merged = [...prev, ...content];
        const unique = merged.filter(
          (item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx
        );
        return unique;
      });
      setPage(currentPage);
      setTotalPages(totalPages);
      setHasMore(currentPage < totalPages);
      console.log(
        `[Products] Page ${currentPage}/${totalPages}, hasMore: ${
          currentPage < totalPages
        }`
      );
    } catch (err) {
      console.error('[Products] Erreur de fetch page:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const sentinelRef = useRef(null);
  const debouncedFetchProducts = useMemo(
    () =>
      _.debounce(pageToLoad => {
        fetchProducts(pageToLoad);
      }, 300),
    [hasMore, loading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('[Products] Sentinel intersected:', entry.isIntersecting, {
          loading,
          hasMore
        });
        if (entry.isIntersecting && !loading && hasMore) {
          debouncedFetchProducts(page + 1);
        }
      },
      {
        root: null,
        rootMargin: '100px',
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
  }, [page, loading, hasMore, debouncedFetchProducts]);

  const updateProductStocks = useCallback(
    _.debounce(soldItems => {
      startTransition(() => {
        setProducts(prevProducts =>
          prevProducts.map(product => {
            const soldItem = soldItems.find(
              item => item.productId === product.id
            );
            if (soldItem) {
              const newStock = Math.max(
                0,
                product.stockDisponible - soldItem.quantity
              );
              return {
                ...product,
                stockDisponible: newStock
              };
            }
            return product;
          })
        );
      });
    }, 500),
    []
  );

  useEffect(() => {
    if (Array.isArray(venteData) && venteData.length > 0) {
      const latestMessage = venteData[venteData.length - 1];
      if (
        latestMessage &&
        latestMessage.type === 'SALE' &&
        Array.isArray(latestMessage.soldItems) &&
        latestMessage.soldItems.length > 0
      ) {
        updateProductStocks(latestMessage.soldItems);
        addToast({
          title: 'Vente effectuée',
          message: `Mise à jour des stocks pour ${latestMessage.soldItems.length} produit(s).`,
          type: 'success'
        });
      }
    }
  }, [venteData, updateProductStocks, addToast]);

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
  }, [cartItems, updateProductStocks]);

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
    <>
      <Row className="mb-3">
        <Col xs={12}>
          <Card>
            <Card.Body className="d-flex align-items-center justify-content-between flex-wrap">
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
          className="order-1 order-md-2 mb-3 mb-md-0"
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
          <Card>
            <Card.Body
              className={classNames({
                'p-0 overflow-hidden': isList,
                'pb-0': isGrid
              })}
            >
              {finalProducts.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon
                    icon="search"
                    size="2x"
                    className="text-300 mb-3"
                  />
                  <h4>Aucun produit trouvé</h4>
                  <p className="text-700">
                    Aucune correspondance pour « {searchTerm} »
                  </p>
                </div>
              ) : (
                <Row className={classNames({ 'g-0': isList })}>
                  {finalProducts.map((product, index) =>
                    isList ? (
                      <ProductList
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ) : (
                      <Col
                        xs={6}
                        sm={4}
                        md={3}
                        key={product.id}
                        className="mb-3"
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
            {loading && <Loading />}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Products;
