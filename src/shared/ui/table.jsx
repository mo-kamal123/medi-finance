import { Trash2 } from 'lucide-react';
import Spinner from './spinner';
import SearchableSelect from './searchable-select';
import { formatDisplayValue } from '../utils/formatters';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  onChange,
  onDelete,
  footer,
  onRowClick,
  emptyMessage = 'لا توجد بيانات',
  extraRenderArg,
}) => {
  const colSpan = columns.length + (onDelete ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-max min-w-full table-auto border-collapse text-sm">
        {' '}
        <thead className="bg-primary text-white">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="p-3 text-center font-semibold">
                {col.header}
              </th>
            ))}
            {onDelete ? <th className="border border-gray-200" /> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="border border-gray-200 p-6">
                <div className="flex items-center justify-center gap-3 text-gray-500">
                  <Spinner size="md" />
                  <span className="font-medium">جاري تحميل البيانات...</span>
                </div>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`even:bg-gray-50/40 transition-colors hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-200 p-3 align-middle text-center"
                  >
                    {renderCell(col, row, rowIndex, onChange, extraRenderArg)}
                  </td>
                ))}

                {onDelete ? (
                  <td className="border border-gray-200 p-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(rowIndex)}
                      className="text-red-500 transition-colors hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                ) : null}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={colSpan}
                className="border border-gray-200 p-6 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
        {footer ? (
          <tfoot className="bg-gray-50 font-semibold">{footer}</tfoot>
        ) : null}
      </table>
    </div>
  );
};

const renderCell = (col, row, rowIndex, onChange, extraRenderArg) => {
  switch (col.type) {
    case 'select':
      return (
        <SearchableSelect
          value={row[col.key] || ''}
          onChange={(e) => onChange(rowIndex, col.key, e.target.value)}
          options={col.options || []}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={row[col.key] || ''}
          onChange={(e) => onChange(rowIndex, col.key, e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        />
      );

    case 'text':
      return (
        <input
          type="text"
          value={row[col.key] || ''}
          onChange={(e) => onChange(rowIndex, col.key, e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        />
      );

    case 'custom':
      return col.render(row, rowIndex, extraRenderArg);

    default:
      return formatDisplayValue(row[col.key]);
  }
};

export default Table;
