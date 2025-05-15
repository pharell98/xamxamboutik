// src/views/approvisionnementColumnsConfig.js
import React from 'react';

export const getApprovisionnementColumns = onDetail => [
  {
    accessorKey: 'codeAppro',
    header: 'Code Appro',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">{original.codeAppro || '—'}</div>
    )
  },
  {
    accessorKey: 'montantAppro',
    header: 'Montant Appro',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">
        {original.montantAppro !== undefined
          ? `${original.montantAppro} cfa`
          : '—'}
      </div>
    )
  },
  {
    accessorKey: 'fraisTransport',
    header: 'Frais Transport',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">
        {original.fraisTransport !== undefined
          ? `${original.fraisTransport} cfa`
          : '—'}
      </div>
    )
  },
  {
    accessorKey: 'date',
    header: 'Date Approvisionnement',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className="text-center">{original.date || '—'}</div>
    )
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { cellProps: { className: 'text-center' } },
    cell: ({ row: { original } }) => (
      <div className="text-center">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => onDetail(original)}
        >
          Détail
        </button>
      </div>
    )
  }
];

export default getApprovisionnementColumns;
