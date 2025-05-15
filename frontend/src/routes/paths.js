export const rootPaths = {
  root: '/',
  dashboardRoot: 'dashboard',
  gestionStockRoot: 'gestion-stock',
  gestionUserRoot: 'gestion-user',
  productRoot: 'product',
  authRoot: 'authentication',
  authCardRoot: 'card',
  settingsRoot: 'paramettre' // Nouvelle racine pour les paramètres
};

export default {
  changelog: '/changelog',
  widgets: '/widgets',
  landing: '/landing',
  ecommerce: `/${rootPaths.dashboardRoot}/e-commerce`,
  authWizard: `/${rootPaths.authRoot}/wizard`,
  addProduct: `/${rootPaths.gestionStockRoot}/${rootPaths.productRoot}/add-product`,
  products: productLayout =>
    `/${rootPaths.gestionStockRoot}/${rootPaths.productRoot}${
      productLayout ? `/${productLayout}` : ''
    }`,
  productDetails: productId =>
    `/${rootPaths.gestionStockRoot}/${rootPaths.productRoot}/product-details${
      productId ? `/${productId}` : ''
    }`,
  AlertesStock: `/${rootPaths.gestionStockRoot}/inventory/AlertesStock`,
  approDetails: `/${rootPaths.gestionStockRoot}/approvisionnement/appro-details`,
  allSales: `/${rootPaths.gestionStockRoot}/allSales`,
  customerDetails: `/${rootPaths.gestionStockRoot}/customer-details`,
  user: `/${rootPaths.gestionUserRoot}/users`,
  cardLogin: `/${rootPaths.authRoot}/${rootPaths.authCardRoot}/login`,
  shopSettings: `/${rootPaths.settingsRoot}/shop-settings` // Nouvelle route pour les paramètres
};
