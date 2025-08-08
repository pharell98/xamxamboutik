import paths from './paths';

export const dashboardRoutes = {
  label: 'Dashboard',
  labelIcon: 'chart-pie',
  labelDisable: true,
  children: [
    {
      name: 'Dashboard',
      to: paths.ecommerce,
      icon: 'chart-pie',
      active: true
    }
  ]
};

export const appRoutes = {
  label: 'gestion stock',
  labelIcon: 'box',
  children: [
    {
      name: 'gestion stock',
      icon: 'box',
      active: true,
      children: [
        {
          name: 'ajouter produit',
          to: paths.addProduct,
          icon: 'plus-circle',
          active: true
        },
        {
          name: 'Enregistrer appr.',
          to: paths.approDetails,
          icon: 'truck',
          active: true
        },
        {
          name: 'Alertes Stock',
          to: paths.AlertesStock,
          icon: 'exclamation-triangle',
          active: true,
          style: { color: 'red', fontWeight: 'bold' }
        }
      ]
    }
  ]
};

export const otherRoutes = {
  label: 'Ventes et Clients',
  labelIcon: 'shopping-cart',
  children: [
    {
      name: 'Ventes',
      to: paths.products('product-grid'),
      icon: 'shopping-cart',
      active: true
    },
    {
      name: 'Mes ventes',
      to: paths.allSales,
      icon: 'receipt',
      active: true
    },
    //{
    //   name: 'Customer details',
    //   to: paths.customerDetails,
    //   active: true
    // },
    {
      name: 'Utilisateur',
      to: paths.user,
      icon: 'users',
      active: true
    }
  ]
};

export const settingsRoutes = {
  label: 'Paramètres',
  labelIcon: 'cog',
  children: [
    {
      name: 'Paramètres de la boutique',
      to: paths.shopSettings,
      icon: 'cog',
      active: true
    }
  ]
};

export default [dashboardRoutes, appRoutes, otherRoutes, settingsRoutes];
