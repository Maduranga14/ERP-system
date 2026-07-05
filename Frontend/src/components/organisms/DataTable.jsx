import React from 'react';

/**
 * DataTable organism — reusable table
 * @param {Array<{key, label, render?}>} columns
 * @param {Array<object>} rows
 * @param {string} emptyMessage
 */
const DataTable = ({
  columns = [],
  rows = [],
  emptyMessage = 'No data found.',
  className = '',
}) => {
  return (
    <div className={['w-full overflow-x-auto', className].join(' ')}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-sm text-gray-400 py-8"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors duration-100 group"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700 align-middle">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
