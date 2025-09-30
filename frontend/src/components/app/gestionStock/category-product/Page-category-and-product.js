import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Categories from './all-category-and-product/categories/Categories';
import Products from './all-category-and-product/produits/Products';
import CategoryManagement from './add-category-and-product/add-product/CategoryManagement';
import ProductManagement from './add-category-and-product/add-product/ProductManagement';
import useProducts from './add-category-and-product/add-product/useProducts';
import useCategories from '../../../../hooks/useCategories';
import PageHeader from '../../../common/PageHeader';
import { useAppContext } from 'providers/AppProvider';

const PageCategoryAndProduct = () => {
  const {
    categories,
    selectedCategory,
    editModeCategory,
    setSelectedCategory,
    setEditModeCategory,
    handleSaveCategory
  } = useCategories();

  const {
    selectedProduct,
    editModeProduct,
    setSelectedProduct,
    setEditModeProduct,
    handleSaveProduct
  } = useProducts();

  const {
    config: { isDark, isFluid, isRTL }
  } = useAppContext();

  // Lorsqu'on clique pour éditer un produit, on normalise l'objet pour l'édition.
  // On conserve le libellé de la catégorie dans "categorieLibelle" pour permettre la recherche.
  const handleEditProduct = async product => {
    try {
      let catId = '';
      if (typeof product.categorie === 'object' && product.categorie !== null) {
        catId = product.categorie.id;
      } else if (typeof product.categorie === 'string') {
        catId = product.categorieProduit || '';
      }
      const normalizedProduct = {
        ...product,
        // Conserver le libellé de la catégorie pour la recherche
        categorieLibelle: product.categorie,
        // Affecter l'ID (peut être vide)
        categorieProduit: catId,
        currentImage: product.image
      };
      setSelectedProduct(normalizedProduct);
      setEditModeProduct(true);
    } catch (error) {
      console.error(
        "[PageCategoryAndProduct] Erreur lors de l'édition du produit:",
        error
      );
    }
  };

  // Wrapper pour handleSaveCategory afin de garantir la gestion des erreurs
  const handleSaveCategoryWithErrorHandling = async categoryData => {
    try {
      await handleSaveCategory(categoryData);
    } catch (error) {
      console.error(
        '[PageCategoryAndProduct] Erreur lors de la sauvegarde de la catégorie:',
        error
      );
    }
  };

  return (
    <Container
      fluid={isFluid}
      className={isDark ? 'bg-dark text-light py-3' : 'bg-white text-dark py-3'}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Row className="g-3">
        <PageHeader
          title="Ajout/Liste Produit & Catégorie"
          titleTag="h5"
          className="mb-3"
        />
        <Col xs={12} md={6} lg={4}>
          <CategoryManagement
            selectedCategory={selectedCategory}
            editModeCategory={editModeCategory}
            handleSaveCategory={handleSaveCategoryWithErrorHandling}
            setSelectedCategory={setSelectedCategory}
            setEditModeCategory={setEditModeCategory}
          />
          <ProductManagement
            categories={categories}
            selectedProduct={selectedProduct}
            editModeProduct={editModeProduct}
            handleSaveProduct={handleSaveProduct}
            setSelectedProduct={setSelectedProduct}
            setEditModeProduct={setEditModeProduct}
          />
        </Col>
        <Col xs={12} md={6} lg={8}>
          <Container fluid>
            <Categories
              onEdit={category => {
                setSelectedCategory(category);
                setEditModeCategory(true);
              }}
            />
            <Products onEdit={handleEditProduct} isEditing={editModeProduct} />
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default PageCategoryAndProduct;
