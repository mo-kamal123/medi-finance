import { memo, useMemo } from 'react';
import DateInput from '../../../../shared/ui/date-input';
import FormInput from '../../../../shared/ui/input';
import { withCurrentOption, journalEntryInputClass, journalEntryFlexInputClass } from '../utils/journal-entry.utils';
import { X } from 'lucide-react';

const JournalEntryDetailRow = memo(function JournalEntryDetailRow({
  row,
  index,
  accountOptions,
  costCenterOptions,
  customerOptions,
  supplierOptions,
  onRowChange,
  onAmountChange,
  onLoadBatchSummary,
  onRemove,
  readOnly = false,
  rowErrors = {},
}) {
  const rowCustomerOptions = useMemo(
    () =>
      withCurrentOption(
        customerOptions,
        row.customerID,
        row.customerNameAr || row.customerName
      ),
    [customerOptions, row.customerID, row.customerNameAr, row.customerName]
  );

  const rowSupplierOptions = useMemo(
    () =>
      withCurrentOption(
        supplierOptions,
        row.supplierID,
        row.supplierNameAr || row.supplierName
      ),
    [supplierOptions, row.supplierID, row.supplierNameAr, row.supplierName]
  );

  const hasCustomer = Boolean(row.customerID);
  const hasSupplier = Boolean(row.supplierID);

  return (
    <tr className="align-top border border-gray-200">
      <td className="min-w-[120px] p-2">
        <input
          type="number"
          value={row.debitAmount}
          onChange={(event) =>
            onAmountChange(index, 'debitAmount', event.target.value)
          }
          readOnly={readOnly}
          className={journalEntryInputClass}
        />
        {rowErrors.amount ? (
          <p className="mt-1 text-xs text-red-500">{rowErrors.amount}</p>
        ) : null}
      </td>

      <td className="min-w-[120px] p-2">
        <input
          type="number"
          value={row.creditAmount}
          onChange={(event) =>
            onAmountChange(index, 'creditAmount', event.target.value)
          }
          readOnly={readOnly}
          className={journalEntryInputClass}
        />
        {rowErrors.amount ? (
          <p className="mt-1 text-xs text-red-500">{rowErrors.amount}</p>
        ) : null}
      </td>

      <td className="min-w-[220px] p-2">
        <FormInput
          as="select"
          value={row.accountID}
          onChange={(event) =>
            onRowChange(index, 'accountID', event.target.value)
          }
          disabled={readOnly}
          error={rowErrors.accountID}
        >
          <option value="">اختر الحساب</option>
          {accountOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormInput>
      </td>

      <td className="min-w-[200px] p-2">
        <FormInput
          as="select"
          value={row.costCenterID}
          onChange={(event) =>
            onRowChange(index, 'costCenterID', event.target.value)
          }
          disabled={readOnly}
        >
          <option value="">اختر مركز التكلفة</option>
          {costCenterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormInput>
      </td>

      <td className="min-w-[200px] p-2">
        <FormInput
          as="select"
          value={row.customerID}
          onChange={(event) =>
            onRowChange(index, 'customerID', event.target.value)
          }
          disabled={readOnly || hasSupplier}
        >
          <option value="">اختر العميل</option>
          {rowCustomerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormInput>
      </td>

      <td className="min-w-[200px] p-2">
        <FormInput
          as="select"
          value={row.supplierID}
          onChange={(event) =>
            onRowChange(index, 'supplierID', event.target.value)
          }
          disabled={readOnly || hasCustomer}
        >
          <option value="">اختر المورد</option>
          {rowSupplierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormInput>
      </td>

      <td className="min-w-[180px] p-2">
        <input
          type="text"
          value={row.description}
          onChange={(event) =>
            onRowChange(index, 'description', event.target.value)
          }
          readOnly={readOnly}
          className={journalEntryInputClass}
        />
      </td>

      <td className="min-w-[160px] p-2">
        <DateInput
          value={row.recordDate}
          onChange={(event) =>
            onRowChange(index, 'recordDate', event.target.value)
          }
          readOnly={readOnly}
        />
      </td>

      <td className="min-w-[160px] p-2">
        <input
          type="text"
          value={row.documentNumber}
          onChange={(event) =>
            onRowChange(index, 'documentNumber', event.target.value)
          }
          readOnly={readOnly}
          className={journalEntryInputClass}
        />
      </td>

      <td className="min-w-[220px] p-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={row.batchNumber}
            onChange={(event) =>
              onRowChange(index, 'batchNumber', event.target.value)
            }
            readOnly={readOnly}
            className={journalEntryFlexInputClass}
          />
          {!readOnly ? (
            <button
              type="button"
              onClick={() => onLoadBatchSummary(index)}
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90"
            >
              جلب
            </button>
          ) : null}
        </div>
      </td>

      <td className="p-2 text-center">
        {!readOnly ? (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-white bg-red-400 mt-1 rounded-xl"
          >
            <X />
          </button>
        ) : null}
      </td>
    </tr>
  );
});

export default JournalEntryDetailRow;
