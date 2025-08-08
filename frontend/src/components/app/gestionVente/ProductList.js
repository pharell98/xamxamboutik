import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import IconButton from 'components/common/IconButton';
import useProductHook from './useProductHook';
import ProductImage from './ProductImage';
import Flex from 'components/common/Flex';
import { useProductContext } from 'providers/ProductProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Constantes pour améliorer la maintenabilité
const STOCK_UPDATE_DURATION = 3000;
const ROW_ANIMATION_DURATION = 300;
const STOCK_INDICATOR_SIZE = 16;

// Hook personnalisé pour la gestion des indicateurs de stock
const useStockIndicator = (stockDisponible, libelle, id) => {
  const [isRecentlyUpdated, setIsRecentlyUpdated] = React.useState(false);
  const [previousStock, setPreviousStock] = React.useState(stockDisponible);

  // Réinitialiser l'état quand le produit change
  React.useEffect(() => {
    setPreviousStock(stockDisponible);
    setIsRecentlyUpdated(false);
  }, [id]);

  // Effet pour détecter les changements de stock
  React.useEffect(() => {
    const currentStock = stockDisponible || 0;
    const prevStock = previousStock || 0;
    
    // Ne déclencher que si le stock a réellement diminué (vente effectuée)
    if (prevStock > currentStock && currentStock >= 0 && prevStock > 0) {
      console.log(`[ProductList] Stock mis à jour: ${prevStock} -> ${currentStock} pour ${libelle} (ID: ${id})`);
      setIsRecentlyUpdated(true);
      const timer = setTimeout(() => {
        setIsRecentlyUpdated(false);
      }, STOCK_UPDATE_DURATION);
      return () => clearTimeout(timer);
    }
    
    // Mettre à jour le stock précédent seulement si c'est différent
    if (currentStock !== prevStock) {
      setPreviousStock(currentStock);
    }
  }, [stockDisponible, previousStock, libelle, id]);

  return { isRecentlyUpdated };
};

// Composant pour l'indicateur de stock
const StockIndicator = ({ isVisible, stockDisponible }) => {
  if (!isVisible) return null;

  const isOutOfStock = stockDisponible === 0;
  const backgroundColor = isOutOfStock ? 'rgba(220, 53, 69, 0.9)' : 'rgba(255, 193, 7, 0.9)';
  const icon = isOutOfStock ? 'times' : 'exclamation-triangle';
  const title = isOutOfStock ? 'Rupture de stock' : 'Stock mis à jour';

  return (
    <div 
      className="position-absolute top-0 end-0 m-2"
      style={{
        backgroundColor,
        borderRadius: '50%',
        width: `${STOCK_INDICATOR_SIZE}px`,
        height: `${STOCK_INDICATOR_SIZE}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 1s infinite',
        zIndex: 10
      }}
      title={title}
    >
      <FontAwesomeIcon 
        icon={icon}
        size="xs" 
        style={{ color: 'white' }}
      />
    </div>
  );
};

// Composant pour le bouton d'ajout au panier
const AddToCartButton = ({ onAddToCart, isInStock }) => (
  <IconButton
    size="sm"
    variant="primary"
    icon="plus"
    onClick={(e) => {
      e.stopPropagation();
      onAddToCart(1, true);
    }}
    disabled={!isInStock}
    className="w-100"
  >
    <span className="d-none d-sm-inline">+1</span>
    <span className="d-inline d-sm-none">+</span>
  </IconButton>
);

const ProductList = ({ product, index }) => {
  // Validation et transformation des données du produit
  const validatedProduct = {
    id: product?.id || product?.produitId || 'unknown',
    libelle: product?.libelle || product?.nom || 'Produit sans nom',
    image: product?.image || product?.imageUrl || null,
    prixVente: Number(product?.prixVente || product?.prix || 0),
    prixAchat: Number(product?.prixAchat || 0),
    stockDisponible: Number(product?.stockDisponible || product?.stock || 0),
    categorieLibelle: product?.categorieLibelle || product?.categorie || 'Sans catégorie'
  };

  const {
    id,
    libelle,
    image,
    prixVente,
    prixAchat,
    stockDisponible,
    categorieLibelle
  } = validatedProduct;

  const {
    productsState: { cartItems }
  } = useProductContext();
  const isInCart = cartItems.some(item => item.id === id);
  const isInStock = stockDisponible > 0;
  const { handleAddToCart } = useProductHook(product);
  // Désactivé pour éviter le double re-render
  // const { isRecentlyUpdated } = useStockIndicator(stockDisponible, libelle, id);

  const handleRowClick = () => {
    if (isInStock && !isInCart) {
      handleAddToCart(1, true);
      // Feedback visuel désactivé pour éviter le double re-render
      // const row = document.querySelector(`[data-product-id="${id}"]`);
      // if (row) {
      //   row.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
      //   setTimeout(() => {
      //     row.style.backgroundColor = '';
      //   }, ROW_ANIMATION_DURATION);
      // }
    }
  };

  const rowClassName = classNames('py-2 px-1 fade-in product-list-item', {
    'bg-100': index % 2 !== 0,
    'bg-light': isInCart,
    'cursor-pointer': isInStock && !isInCart,
    'cursor-not-allowed': !isInStock
  });

  const stockClassName = classNames({
    'text-success': isInStock,
    'text-danger': !isInStock
  });

  return (
    <Col
      xs={12}
      className={rowClassName}
      data-product-id={id}
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      <Row className="g-2 align-items-center">
        {/* Colonne image */}
        <Col sm={2} md={2}>
          <div className="product-image">
            <ProductImage
              libelle={libelle}
              id={id}
              image={image}
              layout="list"
              containerStyle={{ height: '100%' }}
            />
          </div>
        </Col>
        
        <Col sm={10} md={10}>
          <Row className="h-100">
            <Col
              as={Flex}
              direction="column"
              justifyContent="center"
              className="mb-2 mb-md-0"
            >
              <h4
                className="fs-7 text-warning mb-1 price-display"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                XOF {prixVente}
              </h4>
              
              <h6
                className="fs-8 mb-1 product-title"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {libelle}
              </h6>
              
              <div className="d-none d-md-block">
                <p
                  className="fs-8 mb-1"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Link to="#!" className="text-500">
                    {categorieLibelle}
                  </Link>
                </p>
                <p
                  className="fs-8 mb-1"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Achat : <strong>XOF {prixAchat}</strong>
                </p>
                <p
                  className="fs-8 mb-1"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Stock:{' '}
                  <strong className={stockClassName}>
                    {isInStock ? `${stockDisponible} dispo` : 'Rupture'}
                  </strong>
                </p>
              </div>
            </Col>
            
            <Col
              xs="auto"
              className="d-flex align-items-center mt-auto mt-md-0"
            >
              <div className="product-actions">
                <AddToCartButton onAddToCart={handleAddToCart} isInStock={isInStock} />
              </div>
            </Col>
          </Row>
          
          {/* StockIndicator désactivé pour éviter le double re-render */}
          {/* <StockIndicator isVisible={isRecentlyUpdated} stockDisponible={stockDisponible} /> */}
        </Col>
      </Row>
    </Col>
  );
};

ProductList.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    libelle: PropTypes.string,
    image: PropTypes.string,
    prixVente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    prixAchat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stockDisponible: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    categorieLibelle: PropTypes.string
  }),
  index: PropTypes.number
};

export default React.memo(ProductList);
