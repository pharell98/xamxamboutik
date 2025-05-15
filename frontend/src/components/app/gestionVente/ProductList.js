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

  return (
    <Col
      xs={12}
      className={classNames('py-2 px-1', {
        // Alterne l'arrière-plan pour les lignes impaires/paire
        'bg-100': index % 2 !== 0,
        // Ajoute un background supplémentaire si le produit est dans le panier
        'bg-light': isInCart
      })}
    >
      <Row className="g-2 align-items-center">
        {/* Colonne image */}
        <Col sm={2} md={2}>
          <ProductImage
            libelle={libelle}
            id={id}
            image={image}
            layout="list"
            containerStyle={{ height: '100%' }}
          />
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
                className="fs-7 text-warning mb-1"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                XOF {prixVente}
              </h4>
              <h6
                className="fs-8 mb-1"
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
              <IconButton
                size="sm"
                variant="primary"
                icon="cart-plus"
                onClick={() => handleAddToCart(1, true)}
              >
                Vendre
              </IconButton>
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
