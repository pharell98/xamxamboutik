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

  return (
    <Col className="mb-2" {...rest}>
      <Flex
        direction="column"
        className={classNames('border rounded-1 p-2', {
          'bg-light': isInCart
        })}
        style={{ height: 'auto' }}
      >
        <ProductImage libelle={libelle} id={id} image={image} layout="grid" />
        <h5
          className="fs-md-7 text-warning mt-2 mb-2"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          XOF {prixVente}
        </h5>
        <h5
          className="fs-9 mb-2"
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
        <div className="mt-auto">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip style={{ position: 'fixed' }}>Vendre</Tooltip>}
          >
            <Button
              variant="falcon-default"
              size="sm"
              onClick={() => handleAddToCart(1, true)}
            >
              <FontAwesomeIcon icon="cart-plus" />
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
