import React from 'react';
import PropTypes from 'prop-types';
import Flex from 'components/common/Flex';
import { Link } from 'react-router-dom';
import { Button, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import useProductHook from './useProductHook';
import ProductImage from './ProductImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useProductContext } from 'providers/ProductProvider';

// Constantes pour améliorer la maintenabilité
const STOCK_UPDATE_DURATION = 3000;
const CARD_ANIMATION_DURATION = 150;
const STOCK_INDICATOR_SIZE = 20;

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
      console.log(`[ProductGrid] Stock mis à jour: ${prevStock} -> ${currentStock} pour ${libelle} (ID: ${id})`);
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
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip style={{ position: 'fixed' }}>Ajouter +1</Tooltip>}
  >
    <Button
      variant="falcon-default"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onAddToCart(1, true);
      }}
      className="w-100"
      disabled={!isInStock}
    >
      <FontAwesomeIcon icon="plus" className="me-1" />
      <span className="d-none d-sm-inline">+1</span>
      <span className="d-inline d-sm-none">+</span>
    </Button>
  </OverlayTrigger>
);

const ProductGrid = ({ product, ...rest }) => {
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

  const handleCardClick = () => {
    if (isInStock && !isInCart) {
      handleAddToCart(1, true);
      // Feedback visuel désactivé pour éviter le double re-render
      // const card = document.querySelector(`[data-product-id="${id}"]`);
      // if (card) {
      //   card.style.transform = 'scale(0.95)';
      //   setTimeout(() => {
      //     card.style.transform = '';
      //   }, CARD_ANIMATION_DURATION);
      // }
    }
  };

  const cardClassName = classNames('border rounded-1 p-2 product-card fade-in', {
    'bg-light': isInCart,
    'cursor-pointer': isInStock && !isInCart,
    'cursor-not-allowed': !isInStock
  });

  const cardStyle = {
    height: 'auto',
    transition: 'all 0.2s ease',
    ...(isInStock && !isInCart && {
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    })
  };

  const stockClassName = classNames({
    'text-success': isInStock,
    'text-danger': !isInStock
  });

  return (
    <Col className="mb-2" {...rest}>
      <Flex
        direction="column"
        className={cardClassName}
        data-product-id={id}
        style={cardStyle}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="product-image mb-2">
          <ProductImage libelle={libelle} id={id} image={image} layout="grid" />
        </div>
        
        <h5
          className="fs-md-7 text-warning mt-2 mb-2 price-display"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          XOF {prixVente}
        </h5>
        
        <h5
          className="fs-9 mb-2 product-title"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {libelle}
        </h5>
        
        <div className="d-none d-md-block">
          <p
            className="fs-9 mb-1"
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
            className="fs-9 mb-1"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Achat : <strong>XOF {prixAchat}</strong>
          </p>
          <p
            className="fs-9 mb-2"
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
        
        <div className="mt-auto product-actions">
          <AddToCartButton onAddToCart={handleAddToCart} isInStock={isInStock} />
        </div>
        
        {/* StockIndicator désactivé pour éviter le double re-render */}
        {/* <StockIndicator isVisible={isRecentlyUpdated} stockDisponible={stockDisponible} /> */}
      </Flex>
    </Col>
  );
};

ProductGrid.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    libelle: PropTypes.string,
    image: PropTypes.string,
    prixVente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    prixAchat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stockDisponible: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    categorieLibelle: PropTypes.string
  })
};

export default React.memo(ProductGrid);
