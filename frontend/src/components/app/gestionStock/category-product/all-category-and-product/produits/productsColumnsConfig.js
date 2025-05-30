import React from 'react';
import { Dropdown } from 'react-bootstrap';
import CardDropdown from 'components/common/CardDropdown';

const cellWrapperClass = deleted => (deleted ? 'bg-danger bg-opacity-25' : '');

export const getProductsColumns = (onEdit, openDeleteModal, onRestore) => [
  {
    accessorKey: 'codeProduit',
    header: 'Code Produit',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.codeProduit || '—'}
      </div>
    )
  },
  {
    accessorKey: 'image',
    header: 'Image',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.image ? (
          <img
            src={original.image}
            alt={original.libelle}
            style={{
              width: 50,
              height: 50,
              objectFit: 'cover',
              margin: '0 auto'
            }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            _
          </div>
        )}
      </div>
    )
  },
  {
    accessorKey: 'libelle',
    header: 'Nom du produit',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.libelle || '—'}
      </div>
    )
  },
  {
    accessorKey: 'prixAchat',
    header: 'Prix d’achat',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div
        className={`text-center fs-9 fw-medium ${cellWrapperClass(
          original.deleted
        )}`}
      >
        {original.prixAchat !== undefined ? `${original.prixAchat} cfa` : '—'}
      </div>
    )
  },
  {
    accessorKey: 'coupMoyenAcquisition',
    header: 'Coût moyen acquisition',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div
        className={`text-center fs-9 fw-medium ${cellWrapperClass(
          original.deleted
        )}`}
      >
        {original.coupMoyenAcquisition !== undefined
          ? `${original.coupMoyenAcquisition} cfa`
          : '—'}
      </div>
    )
  },
  {
    accessorKey: 'prixVente',
    header: 'Prix de vente',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div
        className={`text-center fs-9 fw-medium ${cellWrapperClass(
          original.deleted
        )}`}
      >
        {original.prixVente !== undefined ? `${original.prixVente} cfa` : '—'}
      </div>
    )
  },
  {
    accessorKey: 'stockDisponible',
    header: 'Stock',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div
        className={`text-center fs-9 fw-medium ${cellWrapperClass(
          original.deleted
        )}`}
      >
        {original.stockDisponible ?? '—'}
      </div>
    )
  },
  {
    accessorKey: 'seuilRuptureStock',
    header: 'Seuil de rupture',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div
        className={`text-center fs-9 fw-medium ${cellWrapperClass(
          original.deleted
        )}`}
      >
        {original.seuilRuptureStock ?? '—'}
      </div>
    )
  },
  {
    accessorKey: 'categorie',
    header: 'Catégorie',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.categorie || '—'}
      </div>
    )
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { cellProps: { className: 'text-center' } },
    cell: ({ row }) => {
      const { original } = row;
      return (
        <div className={`py-2 ${cellWrapperClass(original.deleted)}`}>
          <CardDropdown>
            {original.deleted ? (
              <Dropdown.Item
                className="text-success"
                onClick={() => onRestore(original)}
              >
                Restaurer
              </Dropdown.Item>
            ) : (
              <>
                <Dropdown.Item onClick={() => onEdit(original)}>
                  Modifier
                </Dropdown.Item>
                <Dropdown.Item
                  className="text-danger"
                  onClick={() => openDeleteModal(original)}
                >
                  Supprimer
                </Dropdown.Item>
              </>
            )}
          </CardDropdown>
        </div>
      );
    }
  }
];
