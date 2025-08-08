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

const ProductGrid = ({ product, ...rest }) => {
  const {
    id,
    libelle,
    image,
    prixVente,
    prixAchat,
    stockDisponible,
    categorieLibelle
  } = product;

  const {
    productsState: { cartItems }
  } = useProductContext();
  const isInCart = cartItems.some(item => item.id === id);

  const isInStock = stockDisponible > 0;
  const { handleAddToCart } = useProductHook(product);

  const handleCardClick = () => {
    if (isInStock && !isInCart) {
      handleAddToCart(1, true);
      // Feedback visuel
      const card = document.querySelector(`[data-product-id="${id}"]`);
      if (card) {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      }
    }
  };

  return (
    <Col className="mb-2" {...rest}>
              <Flex
          direction="column"
          className={classNames('border rounded-1 p-2 product-card fade-in', {
            'bg-light': isInCart,
            'cursor-pointer': isInStock && !isInCart,
            'cursor-not-allowed': !isInStock
          })}
          data-product-id={id}
        style={{ 
          height: 'auto',
          transition: 'all 0.2s ease',
          ...(isInStock && !isInCart && {
            cursor: 'pointer',
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          })
        }}
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
            <strong
              className={classNames({
                'text-success': isInStock,
                'text-danger': !isInStock
              })}
            >
              {isInStock ? `${stockDisponible} dispo` : 'Rupture'}
            </strong>
          </p>
        </div>
        <div className="mt-auto product-actions">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip style={{ position: 'fixed' }}>Ajouter +1</Tooltip>}
          >
            <Button
              variant="falcon-default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Empêcher le déclenchement du click de la carte
                handleAddToCart(1, true);
              }}
              className="w-100"
              disabled={!isInStock}
            >
              <FontAwesomeIcon icon="plus" className="me-1" />
              <span className="d-none d-sm-inline">+1</span>
              <span className="d-inline d-sm-none">+</span>
            </Button>
          </OverlayTrigger>
        </div>
      </Flex>
    </Col>
  );
};

ProductGrid.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    libelle: PropTypes.string.isRequired,
    image: PropTypes.string,
    prixVente: PropTypes.number.isRequired,
    prixAchat: PropTypes.number.isRequired,
    stockDisponible: PropTypes.number.isRequired,
    categorieLibelle: PropTypes.string.isRequired
  })
};

export default React.memo(ProductGrid);
