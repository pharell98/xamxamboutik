// src/views/approvisionnementColumnsConfig.js
import React from 'react';

export const getApprovisionnementColumns = (
  onDetail,
  selectedApproId = null
) => [
  {
    accessorKey: 'codeAppro',
    header: 'Code Appro',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => {
      const isSelected = selectedApproId === original.id;
      return (
        <div
          className={`text-center ${isSelected ? 'fw-bold text-primary' : ''}`}
        >
          {original.codeAppro || '—'}
        </div>
      );
    }
  },
  {
    accessorKey: 'montantAppro',
    header: 'Montant Appro',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => {
      const isSelected = selectedApproId === original.id;
      return (
        <div
          className={`text-center ${isSelected ? 'fw-bold text-primary' : ''}`}
        >
          {original.montantAppro !== undefined
            ? `${original.montantAppro} cfa`
            : '—'}
        </div>
      );
    }
  },
  {
    accessorKey: 'fraisTransport',
    header: 'Frais Transport',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => {
      const isSelected = selectedApproId === original.id;
      return (
        <div
          className={`text-center ${isSelected ? 'fw-bold text-primary' : ''}`}
        >
          {original.fraisTransport !== undefined
            ? `${original.fraisTransport} cfa`
            : '—'}
        </div>
      );
    }
  },
  {
    accessorKey: 'date',
    header: 'Date Approvisionnement',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => {
      const isSelected = selectedApproId === original.id;
      return (
        <div
          className={`text-center ${isSelected ? 'fw-bold text-primary' : ''}`}
        >
          {original.date || '—'}
        </div>
      );
    }
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { cellProps: { className: 'text-center' } },
    cell: ({ row: { original } }) => {
      const isSelected = selectedApproId === original.id;
      return (
        <div className="text-center">
          <button
            type="button"
            className={`btn btn-sm ${
              isSelected ? 'btn-outline-primary fw-bold' : 'btn-primary'
            }`}
            onClick={() => onDetail(original)}
          >
            {isSelected ? 'Sélectionné' : 'Détail'}
          </button>
        </div>
      );
    }
  }
];

export default getApprovisionnementColumns;
