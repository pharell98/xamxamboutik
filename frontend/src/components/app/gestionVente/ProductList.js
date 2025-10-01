import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import classNames from 'classnames';

import Flex from 'components/common/Flex';
import IconButton from 'components/common/IconButton';
import { useProductContext } from 'providers/ProductProvider';
import useProductHook from './useProductHook';
import ProductImage from './ProductImage';
import {
  normalizeProduct,
  ProductPrice,
  ProductTitle,
  ProductCategory,
  ProductPurchasePrice,
  ProductStock,
  ProductDetails,
  productPropTypes
} from './shared/ProductComponents';

/**
 * Bouton d'ajout spécialisé pour la vue liste
 */
const ListAddToCartButton = ({ onAddToCart, isInStock }) => (
  <IconButton
    size="sm"
    variant="primary"
    icon="plus"
    onClick={e => {
      e.stopPropagation();
      onAddToCart(1);
    }}
    disabled={!isInStock}
    className="w-100"
  >
    <span className="d-none d-sm-inline">+1</span>
    <span className="d-inline d-sm-none">+</span>
  </IconButton>
);

/**
 * Composant produit en mode liste
 */
const ProductList = ({ product, index }) => {
  const validatedProduct = normalizeProduct(product);
  const {
    id,
    libelle,
    image,
    prixVente,
    prixAchat,
    stockDisponible,
    categorieLibelle
  } = validatedProduct;

  const { isInShoppingCart } = useProductContext();
  const { handleAddToCart } = useProductHook(product);

  const isInCart = isInShoppingCart(id);
  const isInStock = stockDisponible > 0;

  const handleRowClick = useCallback(() => {
    if (isInStock && !isInCart) {
      handleAddToCart(1);
    }
  }, [isInStock, isInCart, handleAddToCart]);

  const handleKeyDown = useCallback(
    e => {
      if ((e.key === 'Enter' || e.key === ' ') && isInStock && !isInCart) {
        e.preventDefault();
        handleRowClick();
      }
    },
    [handleRowClick, isInStock, isInCart]
  );

  const rowClassName = classNames('py-2 px-1 fade-in product-list-item', {
    'bg-100': index % 2 !== 0,
    'bg-light': isInCart,
    'cursor-pointer': isInStock && !isInCart,
    'cursor-not-allowed': !isInStock
  });

  return (
    <Col
      xs={12}
      className={rowClassName}
      data-product-id={id}
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Row className="g-2 align-items-center">
        {/* Image */}
        <Col sm={2} md={2}>
          <div className="product-image">
            <ProductImage
              libelle={libelle}
              id={id}
              image={image}
              layout="list"
              containerStyle={{ height: '100%' }}
              enableZoom={true}
            />
          </div>
        </Col>

        {/* Contenu principal */}
        <Col sm={10} md={10}>
          <Row className="h-100">
            <Col
              as={Flex}
              direction="column"
              justifyContent="center"
              className="mb-2 mb-md-0"
            >
              {/* Prix */}
              <ProductPrice
                price={prixVente}
                className="fs-7 text-warning mb-1"
              />

              {/* Titre */}
              <ProductTitle title={libelle} className="fs-8 mb-1" />

              {/* Détails (cachés sur mobile) */}
              <ProductDetails>
                <ProductCategory category={categorieLibelle} className="fs-8" />
                <ProductPurchasePrice price={prixAchat} className="fs-8" />
                <ProductStock stock={stockDisponible} className="fs-8" />
              </ProductDetails>
            </Col>

            {/* Actions */}
            <Col
              xs="auto"
              className="d-flex align-items-center mt-auto mt-md-0"
            >
              <div className="product-actions">
                <ListAddToCartButton
                  onAddToCart={handleAddToCart}
                  isInStock={isInStock}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  );
};

ListAddToCartButton.propTypes = {
  onAddToCart: PropTypes.func.isRequired,
  isInStock: PropTypes.bool.isRequired
};

ProductList.propTypes = {
  product: PropTypes.shape(productPropTypes),
  index: PropTypes.number
};

export default React.memo(ProductList);
