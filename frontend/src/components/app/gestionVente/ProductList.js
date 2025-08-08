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

const ProductList = ({ product, index }) => {
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

  const handleRowClick = () => {
    if (isInStock && !isInCart) {
      handleAddToCart(1, true);
      // Feedback visuel
      const row = document.querySelector(`[data-product-id="${id}"]`);
      if (row) {
        row.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
        setTimeout(() => {
          row.style.backgroundColor = '';
        }, 300);
      }
    }
  };

  return (
    <Col
      xs={12}
      className={classNames('py-2 px-1 fade-in product-list-item', {
        // Alterne l'arrière-plan pour les lignes impaires/paire
        'bg-100': index % 2 !== 0,
        // Ajoute un background supplémentaire si le produit est dans le panier
        'bg-light': isInCart,
        'cursor-pointer': isInStock && !isInCart,
        'cursor-not-allowed': !isInStock
      })}
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
            </Col>
            <Col
              xs="auto"
              className="d-flex align-items-center mt-auto mt-md-0"
            >
              <div className="product-actions">
                <IconButton
                  size="sm"
                  variant="primary"
                  icon="plus"
                  onClick={(e) => {
                    e.stopPropagation(); // Empêcher le déclenchement du click de la ligne
                    handleAddToCart(1, true);
                  }}
                  disabled={!isInStock}
                  className="w-100"
                >
                  <span className="d-none d-sm-inline">+1</span>
                  <span className="d-inline d-sm-none">+</span>
                </IconButton>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  );
};

ProductList.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    libelle: PropTypes.string.isRequired,
    image: PropTypes.string,
    prixVente: PropTypes.number.isRequired,
    prixAchat: PropTypes.number.isRequired,
    stockDisponible: PropTypes.number.isRequired,
    categorieLibelle: PropTypes.string.isRequired
  }),
  index: PropTypes.number
};

export default React.memo(ProductList);
