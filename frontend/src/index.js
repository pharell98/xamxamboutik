import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import AppProvider from 'providers/AppProvider';
import { router } from 'routes';
import 'helpers/initFA';

const container = document.getElementById('main');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>
);
