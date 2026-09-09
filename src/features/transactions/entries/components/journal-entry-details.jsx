import { Plus } from 'lucide-react';
import JournalEntryDetailsTable from './journal-entry-details-table';

// Details section: add-row button plus the scrollable entries table
const JournalEntryDetails = ({
  fields,
  control,
  errors,
  register,
  remove,
  append,
  createDetailRow,
  watchedDetails,
  readOnly,
  handleAmountChange,
  handleCustomerChange,
  handleSupplierChange,
  handleLoadInvoiceDetails,
  totalDebit,
  totalCredit,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">تفاصيل القيد</h2>
      <button
        type="button"
        onClick={() => append(createDetailRow())}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        <Plus size={16} />
        إضافة سطر
      </button>
    </div>

    <JournalEntryDetailsTable
      fields={fields}
      control={control}
      errors={errors}
      register={register}
      remove={remove}
      watchedDetails={watchedDetails}
      readOnly={readOnly}
      handleAmountChange={handleAmountChange}
      handleCustomerChange={handleCustomerChange}
      handleSupplierChange={handleSupplierChange}
      handleLoadInvoiceDetails={handleLoadInvoiceDetails}
      totalDebit={totalDebit}
      totalCredit={totalCredit}
    />
  </div>
);

export default JournalEntryDetails;