const Table = ({
  columns = [],
  data = [],
  onChange,
  onDelete,
  footer,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm border-collapse">
        
        {/* Header */}
        <thead className="bg-primary/90 text-white">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="p-3 text-right  font-semibold"
              >
                {col.header}
              </th>
            ))}
            {onDelete && (
              <th className="border border-gray-200"></th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors even:bg-gray-50/40"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-3 border border-gray-200 align-middle"
                  >
                    {renderCell(
                      col,
                      row,
                      rowIndex,
                      onChange
                    )}
                  </td>
                ))}

                {onDelete && (
                  <td className="p-3 border border-gray-200 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onDelete(rowIndex)
                      }
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      حذف
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (onDelete ? 1 : 0)
                }
                className="text-center p-6 text-gray-400 border border-gray-200"
              >
                لا توجد بيانات
              </td>
            </tr>
          )}
        </tbody>

        {/* Footer */}
        {footer && (
          <tfoot className="bg-gray-50 font-semibold">
            {footer}
          </tfoot>
        )}
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
