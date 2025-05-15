import React from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import IndeterminateCheckbox from 'components/common/advance-table/IndeterminateCheckbox';

const selectionColumn = (selectionColumnWidth, selectionHeaderClassname) => ({
  id: 'selection',
  header: ({ table }) => (
    <IndeterminateCheckbox
      className="form-check mb-0"
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => (
    <IndeterminateCheckbox
      className="form-check mb-0"
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      indeterminate={row.getIsSomeSelected()}
      onChange={() => row.toggleSelected()}
    />
  ),
  meta: {
    headerProps: {
      className: selectionHeaderClassname,
      style: { width: selectionColumnWidth }
    },
    cellProps: {
      style: { width: selectionColumnWidth }
    }
  }
});

const useAdvanceTable = ({
  columns,
  data, // données côté client ou initiales si mode serveur
  selection,
  selectionColumnWidth,
  selectionHeaderClassname,
  pagination,
  perPage = 10,
  onRowSelectionChange,
  initialSelection = {},
  serverPagination = false,
  fetchData, // (pageIndex, pageSize) => Promise<{ data, pageCount }>
  refreshKey = 0,
  state // Optionnel: si fourni, on utilisera state.rowSelection (contrôlé)
}) => {
  // État interne pour la sélection (uniquement si le composant n'est pas contrôlé)
  const [internalRowSelection, setInternalRowSelection] =
    React.useState(initialSelection);
  // Utiliser la sélection contrôlée si fournie, sinon l'état interne
  const effectiveRowSelection =
    state && state.rowSelection !== undefined
      ? state.rowSelection
      : internalRowSelection;

  // Handler qui envoie la nouvelle sélection au parent et met à jour l'état interne (si non contrôlé)
  const handleRowSelectionChange = newSelection => {
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelection);
    }
    if (!(state && state.rowSelection !== undefined)) {
      setInternalRowSelection(newSelection);
    }
  };

  // Ajouter la colonne de sélection si nécessaire
  const tableColumns = React.useMemo(
    () =>
      selection
        ? [
            selectionColumn(selectionColumnWidth, selectionHeaderClassname),
            ...columns
          ]
        : columns,
    [selection, selectionColumnWidth, selectionHeaderClassname, columns]
  );

  // Gestion de la pagination et du data en mode serveur
  const [tableData, setTableData] = React.useState(data || []);
  const [serverPageCount, setServerPageCount] = React.useState(0);
  const initialPaginationState = { pageIndex: 0, pageSize: perPage };
  const [paginationState, setPaginationState] = React.useState(
    initialPaginationState
  );

  React.useEffect(() => {
    if (serverPagination && typeof fetchData === 'function') {
      const fetchAsyncData = async () => {
        try {
          const { data: newData, pageCount } = await fetchData(
            paginationState.pageIndex,
            paginationState.pageSize
          );
          setTableData(newData || []);
          setServerPageCount(pageCount || 0);
        } catch (error) {
          console.error('Erreur lors du fetch de données : ', error);
        }
      };
      fetchAsyncData();
    }
  }, [
    serverPagination,
    fetchData,
    paginationState.pageIndex,
    paginationState.pageSize,
    refreshKey
  ]);

  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(effectiveRowSelection);
    }
  }, [effectiveRowSelection, onRowSelectionChange]);

  return useReactTable({
    data: serverPagination ? tableData : data,
    columns: tableColumns,
    state: {
      rowSelection: effectiveRowSelection,
      pagination: serverPagination
        ? paginationState
        : { pageSize: pagination ? perPage : data.length }
    },
    manualPagination: serverPagination,
    pageCount: serverPagination ? serverPageCount : undefined,
    onPaginationChange: serverPagination ? setPaginationState : undefined,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pagination &&
      !serverPagination && { getPaginationRowModel: getPaginationRowModel() }),
    initialState: {
      pagination: {
        pageSize: serverPagination ? paginationState.pageSize : perPage
      }
    }
  });
};

export default useAdvanceTable;
