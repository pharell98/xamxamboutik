// src/components/productsFiltersConfig.js
export const getProductsFiltersConfig = categoryOptions => [
  {
    name: 'category',
    label: 'Catégorie',
    type: 'select', // Explicitly set type to select
    options: categoryOptions, // Options dynamiques chargées depuis l'API
    defaultValue: '',
    md: 4
  },
  {
    name: 'state',
    label: 'État du produit',
    type: 'select', // Explicitly set type to select
    options: [
      { value: 'all', label: 'Tous' },
      { value: 'active', label: 'Non supprimés' },
      { value: 'deleted', label: 'Supprimés' }
    ],
    defaultValue: 'all',
    md: 4
  }
];
