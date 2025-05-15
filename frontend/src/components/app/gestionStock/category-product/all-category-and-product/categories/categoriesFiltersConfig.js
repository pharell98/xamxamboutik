// src/components/categoriesFiltersConfig.js
export const categoriesFiltersConfig = [
  {
    name: 'state',
    label: 'Filtrer les catégories',
    type: 'select', // Explicitly set type to select
    options: [
      { value: 'all', label: 'Toutes' },
      { value: 'active', label: 'Non supprimées' },
      { value: 'deleted', label: 'Supprimées' }
    ],
    defaultValue: 'all',
    md: 4
  }
];
