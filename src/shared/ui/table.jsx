import { useRef, useState } from 'react';
import { Trash2, Columns3, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
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
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [showColPicker, setShowColPicker] = useState(false);
  const pickerBtnRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);

  const hasActions = !!onDelete;
  const nonActionColumns = hasActions ? columns.slice(0, -1) : columns;
  const visibleColumns = columns.filter(
    (_, i) => !hiddenCols.has(i) || (hasActions && i === columns.length - 1)
  );
  const colSpan = visibleColumns.length + (hasActions ? 1 : 0);

  const toggleCol = (index) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const openPicker = () => {
    if (pickerBtnRef.current) {
      const rect = pickerBtnRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: Math.max(rect.right - 256, 16),
        zIndex: 9999,
      });
    }
    setShowColPicker(true);
  };

  const closePicker = () => {
    setShowColPicker(false);
    setDropdownStyle(null);
  };

  const getColIndex = (col) => columns.indexOf(col);

  return (
    <div className="relative space-y-2">
      <div className="flex justify-end">
        <button
          ref={pickerBtnRef}
          type="button"
          onClick={() => (showColPicker ? closePicker() : openPicker())}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-primary/40 hover:text-primary"
          title="إظهار/إخفاء الأعمدة"
        >
          <Columns3 size={16} />
          <span>الأعمدة</span>
        </button>
      </div>

      {showColPicker && dropdownStyle
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={closePicker}
              />
              <div
                style={dropdownStyle}
                className="w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
              >
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-800">
                    الأعمدة
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                  {nonActionColumns.map((col, index) => {
                    const isVisible = !hiddenCols.has(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleCol(index)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            isVisible
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isVisible ? <Check size={12} /> : null}
                        </span>
                        <span
                          className={
                            isVisible ? 'text-gray-800' : 'text-gray-400'
                          }
                        >
                          {col.header}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body
          )
        : null}

      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-max min-w-full table-auto border-collapse text-sm">
        <thead className="bg-primary text-white">
          <tr>
            {visibleColumns.map((col, index) => (
              <th key={index} className="p-3 text-center font-semibold">
                {col.header}
              </th>
            ))}
            {hasActions ? <th className="border border-gray-200" /> : null}
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
                {visibleColumns.map((col, colIndex) => {
                  const originalIndex = getColIndex(col);
                  return (
                    <td
                      key={colIndex}
                      className="border border-gray-200 p-3 align-middle text-center"
                    >
                      {renderCell(col, row, originalIndex, onChange, extraRenderArg)}
                    </td>
                  );
                })}

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
