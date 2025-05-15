import React from 'react';
import { Dropdown } from 'react-bootstrap';
import CardDropdown from 'components/common/CardDropdown';

/**
 * Coloration rouge pour chaque cellule si la catégorie est supprimée
 */
const cellWrapperClass = deleted => (deleted ? 'bg-danger bg-opacity-25' : '');

export const getCategoriesColumns = (onEdit, openDeleteModal, onRestore) => [
  {
    accessorKey: 'id',
    header: 'ID',
    meta: {
      headerProps: { className: 'pe-7 text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={cellWrapperClass(original.deleted)}>
        <strong>#{original.id}</strong>
      </div>
    )
  },
  {
    accessorKey: 'libelle',
    header: 'Nom de catégorie',
    meta: {
      headerProps: { className: 'pe-7 text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={cellWrapperClass(original.deleted)}>
        {original.libelle}
      </div>
    )
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => {
      const { original } = row;
      return (
        <div className={cellWrapperClass(original.deleted)}>
          <CardDropdown>
            <div className="py-2">
              {original.deleted ? ( // Si la catégorie est supprimée, on affiche seulement "Restaurer"
                <Dropdown.Item
                  className="text-success"
                  onClick={() => onRestore(original)}
                >
                  Restaurer
                </Dropdown.Item> // Sinon, on affiche "Modifier" et "Supprimer"
              ) : (
                <>
                  <Dropdown.Item onClick={() => onEdit(original)}>
                    Modifier
                  </Dropdown.Item>
                  <Dropdown.Divider as="div" />
                  <Dropdown.Item
                    className="text-danger"
                    onClick={() => openDeleteModal(original)}
                  >
                    Supprimer
                  </Dropdown.Item>
                </>
              )}
            </div>
          </CardDropdown>
        </div>
      );
    }
  }
];
