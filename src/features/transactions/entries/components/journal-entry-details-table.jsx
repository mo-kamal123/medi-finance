import { Search, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import DateInput from '../../../../shared/ui/date-input';
import AccountSearchSelect from './account-search-select';
import PartySearchSelect from '../../../../shared/ui/party-search-select';
import CostCenterSearchSelect from '../../../../shared/ui/cost-center-search-select';
import {
  journalEntryInputClass,
  journalEntryFlexInputClass,
} from '../utils/journal-entry.utils';

// Scrollable table view listing all entry detail rows with totals footer
const JournalEntryDetailsTable = ({
  fields,
  control,
  errors,
  register,
  remove,
  readOnly,
  watchedDetails,
  handleAmountChange,
  handleCustomerChange,
  handleSupplierChange,
  handleLoadInvoiceDetails,
  totalDebit,
  totalCredit,
}) => (
  <div className="max-w-full overflow-x-auto">
    <table className="min-w-max overflow-hidden rounded-lg border border-gray-200 text-sm">
      <thead className="bg-primary/90 text-white">
        <tr>
          <th className="p-3 text-right">مدين</th>
          <th className="p-3 text-right">دائن</th>
          <th className="p-3 text-right">الحساب</th>
          <th className="p-3 text-right">مركز التكلفة</th>
          <th className="p-3 text-right">العميل</th>
          <th className="p-3 text-right">المورد</th>
          <th className="p-3 text-right">الوصف</th>
          <th className="p-3 text-right">تاريخ السجل</th>
          <th className="p-3 text-right">رقم المستند</th>
          <th className="p-3 text-right">رقم الفاتوره</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field, index) => {
          const rowErrors = errors?.details?.[index] || {};
          return (
            <tr key={field.id} className="align-top border border-gray-200">
              <td className="min-w-30 p-2">
                <Controller
                  name={`details.${index}.debitAmount`}
                  control={control}
                  render={({ field: f }) => (
                    <input
                      type="number"
                      value={f.value ?? ''}
                      onChange={(e) =>
                        handleAmountChange(index, 'debitAmount', e.target.value)
                      }
                      readOnly={readOnly}
                      className={journalEntryInputClass}
                    />
                  )}
                />
                {rowErrors.debitAmount?.message ? (
                  <p className="mt-1 text-xs text-red-500">
                    {rowErrors.debitAmount.message}
                  </p>
                ) : null}
              </td>

              <td className="min-w-30 p-2">
                <Controller
                  name={`details.${index}.creditAmount`}
                  control={control}
                  render={({ field: f }) => (
                    <input
                      type="number"
                      value={f.value ?? ''}
                      onChange={(e) =>
                        handleAmountChange(index, 'creditAmount', e.target.value)
                      }
                      readOnly={readOnly}
                      className={journalEntryInputClass}
                    />
                  )}
                />
              </td>

              <td className="min-w-70 p-2">
                <Controller
                  name={`details.${index}.accountID`}
                  control={control}
                  render={({ field: f }) => (
                    <AccountSearchSelect
                      value={f.value ?? ''}
                      onChange={f.onChange}
                      disabled={readOnly}
                      error={rowErrors.accountID?.message}
                    />
                  )}
                />
              </td>

              <td className="min-w-60 p-2">
                <Controller
                  name={`details.${index}.costCenterID`}
                  control={control}
                  render={({ field: f }) => (
                    <CostCenterSearchSelect
                      value={f.value ?? ''}
                      onChange={f.onChange}
                      disabled={readOnly}
                    />
                  )}
                />
              </td>

              <td className="min-w-60 p-2">
                <Controller
                  name={`details.${index}.customerID`}
                  control={control}
                  render={({ field: f }) => (
                    <PartySearchSelect
                      type="customer"
                      value={f.value ?? ''}
                      onChange={(e) =>
                        handleCustomerChange(index, e.target.value, e.target.entityName)
                      }
                      disabled={
                        readOnly || Boolean(watchedDetails[index]?.supplierID)
                      }
                    />
                  )}
                />
              </td>

              <td className="min-w-60 p-2">
                <Controller
                  name={`details.${index}.supplierID`}
                  control={control}
                  render={({ field: f }) => (
                    <PartySearchSelect
                      type="supplier"
                      value={f.value ?? ''}
                      onChange={(e) =>
                        handleSupplierChange(index, e.target.value, e.target.entityName)
                      }
                      disabled={
                        readOnly || Boolean(watchedDetails[index]?.customerID)
                      }
                    />
                  )}
                />
              </td>

              <td className="min-w-45 p-2">
                <input
                  type="text"
                  {...register(`details.${index}.description`)}
                  readOnly={readOnly}
                  className={journalEntryInputClass}
                />
              </td>

              <td className="min-w-40 p-2">
                <Controller
                  name={`details.${index}.recordDate`}
                  control={control}
                  render={({ field: f }) => (
                    <DateInput
                      value={f.value ?? ''}
                      onChange={(e) => f.onChange(e.target.value)}
                      readOnly={readOnly}
                    />
                  )}
                />
              </td>

              <td className="min-w-40 p-2">
                <input
                  type="text"
                  {...register(`details.${index}.documentNumber`)}
                  readOnly={readOnly}
                  className={journalEntryInputClass}
                />
              </td>

              <td className="min-w-55 p-2">
                <div className="relative">
                  <input
                    type="text"
                    {...register(`details.${index}.invoiceNumber`)}
                    readOnly={readOnly}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLoadInvoiceDetails(index);
                      }
                    }}
                    className={`${journalEntryFlexInputClass} pl-10!`}
                  />
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => handleLoadInvoiceDetails(index)}
                      className="absolute left-5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-main text-white"
                    >
                      <Search size={14} />
                    </button>
                  ) : null}
                </div>
              </td>

              <td className="p-2 text-center">
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-400 mt-1 rounded-xl"
                  >
                    <Trash2 />
                  </button>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="bg-gray-50 font-semibold">
        <tr>
          <td className="p-3 text-green-600">{totalDebit.toFixed(2)}</td>
          <td className="p-3 text-red-600">{totalCredit.toFixed(2)}</td>
          <td colSpan="9" className="p-3 text-right">
            الإجمالي
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default JournalEntryDetailsTable;