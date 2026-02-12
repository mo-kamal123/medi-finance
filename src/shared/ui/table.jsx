
const Table = ({
  columns = [],
  data = [],
  onChange,
  onDelete,
  footer,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        {/* Header */}
        <thead className="bg-primary/90 text-white">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="p-3 text-right">
                {col.header}
              </th>
            ))}
            {onDelete && <th></th>}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-300">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="p-2">
                  {renderCell(col, row, rowIndex, onChange)}
                </td>
              ))}

              {onDelete && (
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => onDelete(rowIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>

        {/* Footer */}
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
};

const renderCell = (col, row, rowIndex, onChange) => {
  switch (col.type) {
    case "select":
      return (
        <select
          value={row[col.key] || ""}
          onChange={(e) =>
            onChange(rowIndex, col.key, e.target.value)
          }
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
        >
          <option value="">اختر</option>
          {col.options?.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "number":
      return (
        <input
          type="number"
          value={row[col.key] || ""}
          onChange={(e) =>
            onChange(rowIndex, col.key, e.target.value)
          }
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
        />
      );

    case "text":
      return (
        <input
          type="text"
          value={row[col.key] || ""}
          onChange={(e) =>
            onChange(rowIndex, col.key, e.target.value)
          }
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
        />
      );

    case "custom":
      return col.render(row, rowIndex);

    default:
      return row[col.key];
  }
};

export default Table;
