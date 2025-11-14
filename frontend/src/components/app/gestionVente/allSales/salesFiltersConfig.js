// src/salesFiltersConfig.js
// (rien à changer ici côté logique; le styling est géré dans les composants consommateurs)
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
  },
  {
    name: 'modePaiement',
    type: 'select',
    label: 'Mode de paiement',
    options: [
      { value: '', label: 'Tous les modes' },
      { value: 'espece', label: 'Espèce' },
      { value: 'orange_money', label: 'Orange Money' },
      { value: 'wave', label: 'Wave' },
      { value: 'cart_bancaire', label: 'Carte bancaire' }
    ],
    defaultValue: ''
  }
];
