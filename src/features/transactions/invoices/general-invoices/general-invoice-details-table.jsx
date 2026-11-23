import { Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import AccountSearchSelect from '../../entries/components/account-search-select';
import { formatCurrency } from '../shared/utils/format-currency';
import {
  calculateGeneralInvoiceTotals,
  emptyGeneralDetail,
} from './general-invoice-utils';

const GeneralInvoiceDetailsTable = ({
  control,
  fields,
  append,
  remove,
  errors,
  watchedDetails,
}) => {
  const renderInput = (name, index, label, props = {}) => (
    <Controller
      name={`details.${index}.${name}`}
      control={control}
      render={({ field }) => (
        <>
          <input
            {...field}
            value={field.value ?? ''}
            aria-label={label}
            aria-invalid={Boolean(errors.details?.[index]?.[name])}
            onChange={(event) => {
              const raw = event.target.value;
              field.onChange(
                props.type === 'number' && raw !== ''
                  ? raw.replace(/^0+(?=\d)/, '')
                  : raw
              );
            }}
            onFocus={
              props.type === 'number'
                ? (event) => event.target.select()
                : undefined
            }
            className={`min-w-0 w-full rounded-lg border px-3 py-2 ${errors.details?.[index]?.[name] ? 'border-red-400' : 'border-gray-200'}`}
            {...props}
          />
          {errors.details?.[index]?.[name]?.message && (
            <p className="mt-1 text-xs text-red-500">
              {errors.details[index][name].message}
            </p>
          )}
        </>
      )}
    />
  );

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">تفاصيل الفاتورة</h2>
        <button
          type="button"
          onClick={() => append(emptyGeneralDetail())}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
        >
          <Plus size={16} />
          إضافة بند
        </button>
      </div>
      {errors.details?.root?.message && (
        <p className="text-sm text-red-500">{errors.details.root.message}</p>
      )}
      <div className="min-w-0 rounded-lg border border-gray-200">
        <table className="block w-full text-sm md:table md:table-fixed">
          <colgroup className="hidden md:table-column-group">
            <col className="w-[28%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[26%]" />
            <col className="w-[15%]" />
            <col className="w-[5%]" />
          </colgroup>
          <thead className="hidden bg-primary/90 text-white md:table-header-group">
            <tr>
              <th scope="col" className="p-3 text-right">
                الحساب
              </th>
              <th scope="col" className="p-3 text-right">
                المبلغ
              </th>
              <th scope="col" className="p-3 text-right">
                ضريبة %
              </th>
              <th scope="col" className="p-3 text-right">
                الوصف
              </th>
              <th scope="col" className="p-3 text-right">
                الإجمالي
              </th>
              <th scope="col">
                <span className="sr-only">الإجراءات</span>
              </th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {fields.map((row, index) => (
              <tr
                key={row.id}
                className="grid grid-cols-2 items-start border-b border-gray-200 align-top last:border-b-0 md:table-row"
              >
                <td className="col-span-2 block min-w-0 p-2 md:table-cell">
                  <span className="mb-1 block font-medium text-gray-700 md:hidden">
                    الحساب
                  </span>
                  <Controller
                    name={`details.${index}.accountID`}
                    control={control}
                    render={({ field }) => (
                      <AccountSearchSelect
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.details?.[index]?.accountID?.message}
                      />
                    )}
                  />
                </td>
                <td className="block min-w-0 p-2 md:table-cell">
                  <span className="mb-1 block font-medium text-gray-700 md:hidden">
                    المبلغ
                  </span>
                  {renderInput('amount', index, 'المبلغ', {
                    type: 'number',
                    min: '0',
                    step: 'any',
                  })}
                </td>
                <td className="block min-w-0 p-2 md:table-cell">
                  <span className="mb-1 block font-medium text-gray-700 md:hidden">
                    ضريبة %
                  </span>
                  {renderInput('taxPercentage', index, 'نسبة الضريبة %', {
                    type: 'number',
                    min: '0',
                    max: '100',
                    step: 'any',
                  })}
                </td>
                <td className="col-span-2 block min-w-0 p-2 md:table-cell">
                  <span className="mb-1 block font-medium text-gray-700 md:hidden">
                    الوصف
                  </span>
                  {renderInput('descriptionAr', index, 'الوصف')}
                </td>
                <td className="block min-w-0 wrap-break-word p-3 font-semibold text-gray-700 md:table-cell">
                  <span className="mb-1 block font-medium md:hidden">
                    الإجمالي
                  </span>
                  {formatCurrency(
                    calculateGeneralInvoiceTotals([
                      watchedDetails?.[index] ?? {},
                    ]).netAmount
                  )}
                </td>
                <td className="block min-w-0 p-2 text-center md:table-cell">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label={`حذف البند ${index + 1}`}
                    className="text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneralInvoiceDetailsTable;
