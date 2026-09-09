import { Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import { formatCurrency } from '../utils/format-currency';
import { createEmptyDetail } from '../utils/mapInvoiceToFormValues';
import { calculateRowTotal } from '../utils/invoice-form-utils';

// Small building-block components

/** Label + slot + optional error message for a table cell field. */
const DetailField = ({ label, children, error }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error ? <p className="text-sm text-red-500">{error}</p> : null}
  </div>
);

// InvoiceDetailsTable

const InvoiceDetailsTable = ({
  control,
  fields,
  append,
  remove,
  errors,
  watchedDetails,
  productOptions,
}) => {
  /** Number input bound to a detail-row field via react-hook-form. */
  const renderDetailNumberInput = (name, index) => (
    <Controller
      name={`details.${index}.${name}`}
      control={control}
      render={({ field }) => (
        <input
          type="number"
          min="0"
          step="any"
          value={field.value ?? ''}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        />
      )}
    />
  );

  /** Product/service select bound to a detail-row field. */
  const renderProductSelect = (index) => (
    <Controller
      name={`details.${index}.productServiceID`}
      control={control}
      render={({ field }) => (
        <SearchableSelect
          value={field.value ?? ''}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
          options={productOptions}
        />
      )}
    />
  );

  // There is no separate mobile layout — the single table below scrolls
  // horizontally (`overflow-x-auto`) so it is usable on every screen size.
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">تفاصيل الخدمات</h2>

        <button
          type="button"
          onClick={() => append(createEmptyDetail())}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
        >
          <Plus size={16} />
          إضافة خدمة
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
          <thead className="bg-primary/90 text-white">
            <tr>
              <th className="p-3 text-right">الخدمة</th>
              <th className="p-3 text-right">الكمية</th>
              <th className="p-3 text-right">سعر الوحدة</th>
              <th className="p-3 text-right">خصم %</th>
              <th className="p-3 text-right">ضريبة %</th>
              <th className="p-3 text-right">الإجمالي</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const detailErrors = errors?.details?.[index] || {};
              const row = watchedDetails?.[index] || {};
              const quantity = Number(row.quantity) || 0;
              const unitPrice = Number(row.unitPrice) || 0;
              const discountPercentage = Number(row.discountPercentage) || 0;
              const taxPercentage = Number(row.taxPercentage) || 0;
              const gross = calculateRowTotal(quantity, unitPrice);
              const discount = (gross * discountPercentage) / 100;
              const tax = ((gross - discount) * taxPercentage) / 100;
              const rowTotal = gross - discount + tax;

              return (
                <tr key={field.id} className="align-top border border-gray-200">
                  <td className="min-w-65 p-2">
                    {renderProductSelect(index)}
                    {detailErrors?.productServiceID?.message ? (
                      <p className="mt-1 text-sm text-red-500">
                        {detailErrors.productServiceID.message}
                      </p>
                    ) : null}
                  </td>

                  <td className="min-w-30 p-2">
                    {renderDetailNumberInput('quantity', index)}
                    {detailErrors?.quantity?.message ? (
                      <p className="mt-1 text-xs text-red-500">
                        {detailErrors.quantity.message}
                      </p>
                    ) : null}
                  </td>

                  <td className="min-w-30 p-2">
                    {renderDetailNumberInput('unitPrice', index)}
                    {detailErrors?.unitPrice?.message ? (
                      <p className="mt-1 text-xs text-red-500">
                        {detailErrors.unitPrice.message}
                      </p>
                    ) : null}
                  </td>

                  <td className="min-w-30 p-2">
                    {renderDetailNumberInput('discountPercentage', index)}
                    {detailErrors?.discountPercentage?.message ? (
                      <p className="mt-1 text-xs text-red-500">
                        {detailErrors.discountPercentage.message}
                      </p>
                    ) : null}
                  </td>

                  <td className="min-w-30 p-2">
                    {renderDetailNumberInput('taxPercentage', index)}
                    {detailErrors?.taxPercentage?.message ? (
                      <p className="mt-1 text-xs text-red-500">
                        {detailErrors.taxPercentage.message}
                      </p>
                    ) : null}
                  </td>

                  <td className="min-w-30 p-3 font-semibold text-gray-700">
                    {formatCurrency(rowTotal)}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceDetailsTable;
