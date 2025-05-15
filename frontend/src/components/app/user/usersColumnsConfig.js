import React from 'react';
import { Dropdown } from 'react-bootstrap';
import CardDropdown from 'components/common/CardDropdown';

const cellWrapperClass = deleted => (deleted ? 'bg-danger bg-opacity-25' : '');

export const getUsersColumns = (onEdit, openDeleteModal, onRestore) => [
  {
    accessorKey: 'id',
    header: 'ID',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.id || '—'}
      </div>
    )
  },
  {
    accessorKey: 'nom',
    header: 'Nom',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.nom || '—'}
      </div>
    )
  },
  {
    accessorKey: 'login',
    header: 'Login',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.login || '—'}
      </div>
    )
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    meta: {
      headerProps: { className: 'text-center text-900' }
    },
    cell: ({ row: { original } }) => (
      <div className={`text-center ${cellWrapperClass(original.deleted)}`}>
        {original.role || '—'}
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
                <Dropdown.Divider as="div" />
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
