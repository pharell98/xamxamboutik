import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

/**
 * Normalise les données d'un produit
 */
export const normalizeProduct = (product) => ({
  id: product?.id || product?.produitId || 'unknown',
  libelle: product?.libelle || product?.nom || 'Produit sans nom',
  image: product?.image || product?.imageUrl || null,
  prixVente: Number(product?.prixVente || product?.prix || 0),
  prixAchat: Number(product?.prixAchat || 0),
  stockDisponible: Number(product?.stockDisponible || product?.stock || 0),
  categorieLibelle: product?.categorieLibelle || product?.categorie || 'Sans catégorie'
});

/**
 * Affichage du prix de vente
 */
export const ProductPrice = ({ price, className = 'fs-md-7 text-warning' }) => (
  <h5 className={`${className} mb-2 price-display`} style={ELLIPSIS_STYLE}>
    XOF {price.toLocaleString()}
  </h5>
);

/**
 * Titre du produit
 */
export const ProductTitle = ({ title, className = 'fs-9' }) => (
  <h5 className={`${className} mb-2 product-title`} style={ELLIPSIS_STYLE}>
    {title}
  </h5>
);

/**
 * Catégorie du produit
 */
export const ProductCategory = ({ category, className = 'fs-9' }) => (
  <p className={`${className} mb-1`} style={ELLIPSIS_STYLE}>
    <Link to="#!" className="text-500">
      {category}
    </Link>
  </p>
);

/**
 * Prix d'achat du produit
 */
export const ProductPurchasePrice = ({ price, className = 'fs-9' }) => (
  <p className={`${className} mb-1`} style={ELLIPSIS_STYLE}>
    Achat : <strong>XOF {price.toLocaleString()}</strong>
  </p>
);

/**
 * Informations de stock
 */
export const ProductStock = ({ stock, className = 'fs-9' }) => {
  const isInStock = stock > 0;
  const stockClassName = classNames(className, {
    'text-success': isInStock,
    'text-danger': !isInStock
  });

  return (
    <p className={`${stockClassName} mb-2`} style={ELLIPSIS_STYLE}>
      Stock:{' '}
      <strong>
        {isInStock ? `${stock} dispo` : 'Rupture'}
      </strong>
    </p>
  );
};

/**
 * Bouton d'ajout au panier
 */
export const AddToCartButton = ({ 
  onAddToCart, 
  isInStock, 
  variant = 'falcon-default',
  size = 'sm',
  className = 'w-100' 
}) => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip style={{ position: 'fixed' }}>Ajouter +1</Tooltip>}
  >
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        onAddToCart(1);
      }}
      className={className}
      disabled={!isInStock}
    >
      <FontAwesomeIcon icon="plus" className="me-1" />
      <span className="d-none d-sm-inline">+1</span>
      <span className="d-inline d-sm-none">+</span>
    </Button>
  </OverlayTrigger>
);

/**
 * Conteneur de détails produit (pour masquer sur mobile)
 */
export const ProductDetails = ({ children, showOnMobile = false }) => (
  <div className={showOnMobile ? '' : 'd-none d-md-block'}>
    {children}
  </div>
);

// Styles partagés
export const ELLIPSIS_STYLE = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

// PropTypes partagés
const productPropTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  libelle: PropTypes.string,
  image: PropTypes.string,
  prixVente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prixAchat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stockDisponible: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categorieLibelle: PropTypes.string
};

// PropTypes pour les composants
ProductPrice.propTypes = {
  price: PropTypes.number.isRequired,
  className: PropTypes.string
};

ProductTitle.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string
};

ProductCategory.propTypes = {
  category: PropTypes.string.isRequired,
  className: PropTypes.string
};

ProductPurchasePrice.propTypes = {
  price: PropTypes.number.isRequired,
  className: PropTypes.string
};

ProductStock.propTypes = {
  stock: PropTypes.number.isRequired,
  className: PropTypes.string
};

AddToCartButton.propTypes = {
  onAddToCart: PropTypes.func.isRequired,
  isInStock: PropTypes.bool.isRequired,
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string
};

ProductDetails.propTypes = {
  children: PropTypes.node.isRequired,
  showOnMobile: PropTypes.bool
};

export { productPropTypes };
