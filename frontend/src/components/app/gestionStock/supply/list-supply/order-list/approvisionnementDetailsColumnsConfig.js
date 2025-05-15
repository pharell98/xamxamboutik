// src/views/approvisionnementDetailsColumnsConfig.js
import React from 'react';

export const getApprovisionnementDetailsColumns = () => [
  {
    accessorKey: 'codeProduit',
    header: 'Code Produit',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">{original.codeProduit || '—'}</div>
    )
  },
  {
    accessorKey: 'libelle',
    header: 'Libellé',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">{original.libelle || '—'}</div>
    )
  },
  {
    accessorKey: 'prixAchat',
    header: 'Prix Achat',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">
        {original.prixAchat !== undefined ? `${original.prixAchat} cfa` : '—'}
      </div>
    )
  },
  {
    accessorKey: 'quantiteAchat',
    header: 'Quantité Achat',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">{original.quantiteAchat || '—'}</div>
    )
  },
  {
    accessorKey: 'montantTotal',
    header: 'Montant Total',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">
        {original.montantTotal !== undefined
          ? `${original.montantTotal} cfa`
          : '—'}
      </div>
    )
  }
];

export default getApprovisionnementDetailsColumns;
