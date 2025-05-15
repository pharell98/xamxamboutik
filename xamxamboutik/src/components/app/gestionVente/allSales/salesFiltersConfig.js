// src/salesFiltersConfig.js
export const getSalesFiltersConfig = () => [
  {
    name: 'period',
    type: 'select',
    label: 'Période',
    options: [
      { value: 'daily', label: 'Journalières' },
      { value: '7days', label: '7 Derniers Jours' },
      { value: 'month', label: 'Mois passé' },
      { value: 'year', label: 'Année en cours' },
      { value: '', label: 'Toutes périodes' }
    ],
    defaultValue: 'daily'
  },
  {
    name: 'specificDate',
    type: 'date',
    label: 'Date spécifique'
  }
];
