import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import classNames from 'classnames';

import Flex from 'components/common/Flex';
import { useAppContext } from 'providers/AppProvider';
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
  AddToCartButton,
  ProductDetails,
  productPropTypes
} from './shared/ProductComponents';

/**
 * Composant carte produit en mode grille
 */
const ProductGrid = ({ product, ...rest }) => {
  const {
    config: { isDark }
  } = useAppContext();
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

  const handleCardClick = useCallback(() => {
    if (isInStock && !isInCart) {
      handleAddToCart(1);
    }
  }, [isInStock, isInCart, handleAddToCart]);

  const handleKeyDown = useCallback(
    e => {
      if ((e.key === 'Enter' || e.key === ' ') && isInStock && !isInCart) {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick, isInStock, isInCart]
  );

  const cardClassName = classNames(
    'border rounded-1 p-2 product-card fade-in',
    {
      'bg-light': isInCart && !isDark,
      'bg-dark text-light border-secondary': isDark,
      'cursor-pointer': isInStock && !isInCart,
      'cursor-not-allowed': !isInStock
    }
  );

  const cardStyle = {
    height: 'auto',
    transition: 'all 0.2s ease',
    ...(isInStock &&
      !isInCart && {
        cursor: 'pointer'
      })
  };

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
        onKeyDown={handleKeyDown}
      >
        {/* Image */}
        <div className="product-image mb-2">
          <ProductImage
            libelle={libelle}
            id={id}
            image={image}
            layout="grid"
            enableZoom={true}
          />
        </div>

        {/* Prix */}
        <ProductPrice price={prixVente} />

        {/* Titre */}
        <ProductTitle title={libelle} />

        {/* Détails (cachés sur mobile) */}
        <ProductDetails>
          <ProductCategory category={categorieLibelle} />
          <ProductPurchasePrice price={prixAchat} />
          <ProductStock stock={stockDisponible} />
        </ProductDetails>

        {/* Actions */}
        <div className="mt-auto product-actions">
          <AddToCartButton
            onAddToCart={handleAddToCart}
            isInStock={isInStock}
          />
        </div>
      </Flex>
    </Col>
  );
};

ProductGrid.propTypes = {
  product: PropTypes.shape(productPropTypes)
};

export default React.memo(ProductGrid);
