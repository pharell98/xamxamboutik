export const getUsersFiltersConfig = roleOptions => [
  {
    name: 'role',
    label: 'Rôle',
    type: 'select',
    options: roleOptions,
    defaultValue: '',
    md: 4
  },
  {
    name: 'state',
    label: 'État de l’utilisateur',
    type: 'select',
    options: [
      { value: 'all', label: 'Tous' },
      { value: 'active', label: 'Actifs' },
      { value: 'deleted', label: 'Supprimés' }
    ],
    defaultValue: 'all',
    md: 4
  }
];
