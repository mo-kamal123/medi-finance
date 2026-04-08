import { Trash2 } from 'lucide-react';
import Spinner from './spinner';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  onChange,
  onDelete,
  footer,
  emptyMessage = 'لا توجد بيانات',
}) => {
  const colSpan = columns.length + (onDelete ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-primary/90 text-white">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="p-3 text-right font-semibold">
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
                className="even:bg-gray-50/40 transition-colors hover:bg-gray-50"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-200 p-3 align-middle"
                  >
                    {renderCell(col, row, rowIndex, onChange)}
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

const renderCell = (col, row, rowIndex, onChange) => {
  switch (col.type) {
    case 'select':
      return (
        <select
          value={row[col.key] || ''}
          onChange={(e) => onChange(rowIndex, col.key, e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        >
          <option value="">اختر</option>
          {col.options?.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
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
      return col.render(row, rowIndex);

    default:
      return row[col.key];
  }
};

export default Table;
