import paths from './paths';

export const dashboardRoutes = {
  label: 'Dashboard',
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
  children: [
    {
      name: 'gestion stock',
      icon: 'shopping-cart',
      active: true,
      children: [
        {
          name: 'Approvisionnement',
          active: true,
          children: [
            {
              name: 'ajouter produit',
              to: paths.addProduct,
              active: true
            },
            {
              name: 'Enregistrer appr.',
              to: paths.approDetails,
              active: true
            }
          ]
        },
        {
          name: 'Alertes Stock',
          to: paths.AlertesStock,
          active: true,
          style: { color: 'red', fontWeight: 'bold' }
        }
      ]
    }
  ]
};

export const otherRoutes = {
  label: 'Ventes et Clients',
  children: [
    {
      name: 'Ventes',
      to: paths.products('product-grid'),
      active: true
    },
    {
      name: 'Mes ventes',
      to: paths.allSales,
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
      active: true
    }
  ]
};

export const settingsRoutes = {
  label: 'Paramètres',
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
