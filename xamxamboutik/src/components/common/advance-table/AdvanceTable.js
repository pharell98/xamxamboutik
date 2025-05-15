import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';
import { flexRender } from '@tanstack/react-table';
import classNames from 'classnames';

const AdvanceTable = ({
  headerClassName,
  bodyClassName,
  rowClassName,
  tableProps
}) => {
  const table = useAdvanceTableContext();
  const { getRowModel, getFlatHeaders } = table;

  return (
    <div className="table-responsive scrollbar">
      <Table {...tableProps}>
        <thead className={headerClassName}>
          <tr>
            {getFlatHeaders().map(header => {
              return (
                <th
                  key={header.id}
                  {...header.column.columnDef.meta?.headerProps}
                  className={classNames(
                    'fs-10',
                    header.column.columnDef.meta?.headerProps?.className,
                    {
                      sort: header.column.getCanSort(),
                      desc: header.column.getIsSorted() === 'desc',
                      asc: header.column.getIsSorted() === 'asc'
                    }
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={bodyClassName}>
          {getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={getFlatHeaders().length} className="text-center">
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            getRowModel().rows.map(row => (
              <tr key={row.id} className={rowClassName}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} {...cell.column.columnDef.meta?.cellProps}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

AdvanceTable.propTypes = {
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  tableProps: PropTypes.object
};

export default AdvanceTable;
