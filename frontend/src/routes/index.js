import React, { useEffect, useState } from 'react';
import App from 'App';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import localForage from 'localforage';
import { jwtDecode } from 'jwt-decode';

import MainLayout from '../layouts/MainLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import paths, { rootPaths } from './paths';

import UserPage from 'components/app/user/UserPage';
import CustomersDetails from 'components/app/gestionVente/customers-details/CustomersDetails';
import Products from 'components/app/gestionVente/Products';
import PageCategoryAndProduct from 'components/app/gestionStock/category-product/Page-category-and-product';
import SaleList from 'components/app/gestionVente/allSales/saleList';
import PageAppro from '../components/app/gestionStock/supply/page/pageAppro';
import Ecommerce from 'components/dashboards/e-commerce';
import CardLogin from 'components/authentication/card/Login';
import PageAlerteStock from 'components/app/gestionStock/inventory/PageAlerteStock';
import ShopSettingsPage from 'components/app/paramettre/ShopSettingsPage';

const RequireAuth = ({ children, requireGestionnaire = false }) => {
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localForage
      .getItem('accessToken')
      .then(storedToken => {
        if (storedToken) {
          setToken(storedToken);
          const decodedToken = jwtDecode(storedToken);
          const rolesArray =
            typeof decodedToken.roles === 'string'
              ? decodedToken.roles.split(',')
              : [decodedToken.roles];
          setRoles(rolesArray);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur lors de la récupération du token:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to={paths.cardLogin} replace />;
  }

  if (requireGestionnaire && !roles.includes('ROLE_GESTIONNAIRE')) {
    return <Navigate to={paths.products('product-grid')} replace />;
  }

  return children;
};

const routes = [
  {
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to={paths.cardLogin} replace />
      },
      {
        path: '/',
        element: (
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        ),
        children: [
          {
            path: paths.ecommerce,
            element: (
              <RequireAuth requireGestionnaire={true}>
                <Ecommerce />
              </RequireAuth>
            )
          },
          {
            path: rootPaths.gestionStockRoot,
            children: [
              {
                path: paths.approDetails,
                element: (
                  <RequireAuth requireGestionnaire={true}>
                    <PageAppro />
                  </RequireAuth>
                )
              },
              {
                path: paths.AlertesStock,
                element: (
                  <RequireAuth requireGestionnaire={true}>
                    <PageAlerteStock />
                  </RequireAuth>
                )
              },
              {
                path: paths.allSales,
                element: <SaleList />
              },
              {
                path: paths.customerDetails,
                element: <CustomersDetails />
              },
              {
                path: paths.addProduct,
                element: (
                  <RequireAuth requireGestionnaire={true}>
                    <PageCategoryAndProduct />
                  </RequireAuth>
                )
              },
              {
                path: paths.products(':productLayout'),
                element: <Products />
              }
            ]
          },
          {
            path: rootPaths.gestionUserRoot,
            children: [
              {
                path: 'users',
                element: (
                  <RequireAuth>
                    <UserPage />
                  </RequireAuth>
                )
              }
            ]
          },
          {
            path: rootPaths.settingsRoot,
            children: [
              {
                path: 'shop-settings',
                element: (
                  <RequireAuth requireGestionnaire={true}>
                    <ShopSettingsPage />
                  </RequireAuth>
                )
              }
            ]
          }
        ]
      },
      {
        path: rootPaths.authRoot,
        children: [
          {
            path: rootPaths.authCardRoot,
            children: [
              {
                path: paths.cardLogin,
                element: <CardLogin />
              }
            ]
          }
        ]
      },
      {
        path: '/error/*',
        element: <ErrorLayout />
      },
      {
        path: '*',
        element: <Navigate to="/error/404" replace />
      }
    ]
  }
];

export const router = createBrowserRouter(routes, {
  basename: process.env.PUBLIC_URL
});

export default routes;
