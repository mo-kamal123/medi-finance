import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import AccountSearchSelect from '../../entries/components/account-search-select';
import Toggle from '../../../../shared/ui/toggle';
import useCostTree from '../../../accounting/tree/cost-tree/hooks/use-cost-tree';
import { useFinancialPeriods } from '../../invoices/shared/hooks/invoices.queries';
import {
  useCreateCashTransaction,
  useUpdateCashTransaction,
} from '../hooks/cash-transactions.mutations';

const TRANSACTION_TYPES = [
  { value: 'Deposit', label: 'سند قبض' },
  { value: 'Withdrawal', label: 'سند دفع' },
];

const emptyEditDetail = {
  journalEntryDetailID: null,
  accountID: '',
  costCenterID: '',
  debitAmount: '',
  creditAmount: '',
  descriptionAr: '',
  currencyID: '',
  exchangeRate: '',
  paymentPermit: '',
};

const getFinalNodes = (nodes = []) => {
  let finalNodes = [];
  nodes.forEach((node) => {
    if (node.isFinal) finalNodes.push(node);
    if (node.children?.length)
      finalNodes = finalNodes.concat(getFinalNodes(node.children));
  });
  return finalNodes;
};

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getEditInitialDetails = (details = []) => {
  if (!details.length) {
    return [{ ...emptyEditDetail }, { ...emptyEditDetail }];
  }

  return details.map((detail) => ({
    journalEntryDetailID: detail.journalEntryDetailID ?? null,
    accountID: detail.accountID ? String(detail.accountID) : '',
    costCenterID: detail.costCenterID ? String(detail.costCenterID) : '',
    debitAmount: detail.debitAmount ?? '',
    creditAmount: detail.creditAmount ?? '',
    descriptionAr: detail.descriptionAr ?? '',
    currencyID: detail.currencyID ? String(detail.currencyID) : '',
    exchangeRate: detail.exchangeRate ?? '',
    paymentPermit: detail.paymentPermit ?? '',
  }));
};

const normalizeCreateDetailPayload = (detail) => ({
  accountID: Number(detail.accountID),
  debitAmount: Number(detail.debitAmount) || 0,
  creditAmount: Number(detail.creditAmount) || 0,
  descriptionAr: detail.descriptionAr || '',
  paymentPermit: detail.paymentPermit || '',
});

const normalizeEditDetailPayload = (detail) => ({
  journalEntryDetailID: detail.journalEntryDetailID ?? null,
  accountID: Number(detail.accountID),
  costCenterID: detail.costCenterID ? Number(detail.costCenterID) : null,
  debitAmount: Number(detail.debitAmount) || 0,
  creditAmount: Number(detail.creditAmount) || 0,
  descriptionAr: detail.descriptionAr || '',
  descriptionEn: '',
  paymentPermit: detail.paymentPermit || '',
  currencyID: detail.currencyID ? Number(detail.currencyID) : null,
  exchangeRate: detail.exchangeRate === '' ? null : Number(detail.exchangeRate),
});

const getInitialValues = (defaultValues = {}) => ({
  transactionType: defaultValues.transactionType ?? 'Deposit',
  transactionDate: toDateInputValue(
    defaultValues.transactionDate || defaultValues.entryDate
  ),
  financialPeriodID: defaultValues.financialPeriodID
    ? String(defaultValues.financialPeriodID)
    : '',
  referenceNumber: defaultValues.referenceNumber ?? '',
  descriptionAr: defaultValues.descriptionAr ?? '',
  journalEntryID: defaultValues.journalEntryID ?? null,
  journalEntryNumber: defaultValues.journalEntryNumber ?? '',
  postImmediately: defaultValues.postImmediately ?? true,
  details: getEditInitialDetails(defaultValues.details),
});

const SelectField = ({
  value,
  onChange,
  options,
  placeholder = 'اختر',
  disabled = false,
  dropdownPosition = 'bottom',
}) => (
  <SearchableSelect
    value={value}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
    disabled={disabled}
    dropdownPosition={dropdownPosition}
    className="disabled:bg-gray-100"
  />
);

const CashTransactionForm = ({ defaultValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const createMutation = useCreateCashTransaction();
  const updateMutation = useUpdateCashTransaction();
  const { data: costTree = [] } = useCostTree();
  const { data: financialPeriods = [] } = useFinancialPeriods();

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const costCenterOptions = useMemo(
    () =>
      getFinalNodes(costTree).map((center) => ({
        value: String(center.costCenterID),
        label: `${center.ccCode} - ${center.nameAr}`,
      })),
    [costTree]
  );

  const periodOptions = useMemo(
    () =>
      financialPeriods.map((item) => ({
        value: String(item.financialPeriodID),
        label: item.nameAr || item.financialPeriodNameAr || item.nameEn,
      })),
    [financialPeriods]
  );

  const [formData, setFormData] = useState(() =>
    getInitialValues(defaultValues, mode)
  );

  const [showErrors, setShowErrors] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditRowChange = (index, field, value) => {
    setFormData((prev) => {
      const details = [...prev.details];
      details[index] = { ...details[index], [field]: value };
      return { ...prev, details };
    });
  };

  const editTotals = useMemo(
    () =>
      formData.details.reduce(
        (acc, row) => ({
          debit: acc.debit + (Number(row.debitAmount) || 0),
          credit: acc.credit + (Number(row.creditAmount) || 0),
        }),
        { debit: 0, credit: 0 }
      ),
    [formData.details]
  );

  const isEditValid =
    formData.details.length > 0 &&
    formData.details.every(
      (row) =>
        Number(row.accountID) > 0 &&
        Number.isFinite(Number(row.debitAmount)) &&
        Number.isFinite(Number(row.creditAmount)) &&
        Number(row.debitAmount) >= 0 &&
        Number(row.creditAmount) >= 0 &&
        ((Number(row.debitAmount) > 0 && Number(row.creditAmount) === 0) ||
          (Number(row.creditAmount) > 0 && Number(row.debitAmount) === 0))
    ) &&
    editTotals.debit > 0 &&
    Math.abs(editTotals.debit - editTotals.credit) < 0.0001;

  const isCreateValid =
    isEditValid &&
    formData.details.length >= 2 &&
    formData.transactionDate &&
    Number(formData.financialPeriodID) > 0;
  const canSubmit = isCreateMode ? isCreateValid : isEditValid;

  const rowErrors = formData.details.map((row) => {
    const debit = Number(row.debitAmount);
    const credit = Number(row.creditAmount);
    return {
      account: Number(row.accountID) > 0 ? '' : 'الحساب مطلوب',
      amount:
        !Number.isFinite(debit) ||
        !Number.isFinite(credit) ||
        debit < 0 ||
        credit < 0
          ? 'أدخل مبلغاً صحيحاً غير سالب'
          : !((debit > 0 && credit === 0) || (credit > 0 && debit === 0))
            ? 'أدخل مبلغاً أكبر من صفر في المدين أو الدائن فقط'
            : '',
    };
  });
  const validationMessages = [
    ...(isCreateMode && !formData.transactionDate ? ['التاريخ مطلوب'] : []),
    ...(isCreateMode && !(Number(formData.financialPeriodID) > 0)
      ? ['الفترة المالية مطلوبة']
      : []),
    ...(isCreateMode && formData.details.length < 2
      ? ['يجب إدخال سطرين على الأقل']
      : []),
    ...rowErrors.flatMap((errors, index) =>
      Object.values(errors)
        .filter(Boolean)
        .map((message) => `السطر ${index + 1}: ${message}`)
    ),
    ...(Math.abs(editTotals.debit - editTotals.credit) >= 0.0001
      ? ['يجب أن يتساوى إجمالي المدين والدائن']
      : []),
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowErrors(true);

    if (isCreateMode) {
      if (!isCreateValid) {
        return;
      }

      const payload = {
        transactionType: formData.transactionType,
        transactionDate: `${formData.transactionDate}T00:00:00`,
        financialPeriodID: Number(formData.financialPeriodID),
        referenceNumber: formData.referenceNumber || '',
        descriptionAr: formData.descriptionAr || '',
        postImmediately: formData.postImmediately,
        details: formData.details.map(normalizeCreateDetailPayload),
      };

      createMutation.mutate(payload, {
        onSuccess: () => navigate('/cash-transactions'),
      });

      return;
    }

    if (!isEditValid) {
      return;
    }

    updateMutation.mutate(
      {
        id: formData.journalEntryID,
        journalEntryID: formData.journalEntryID,
        descriptionAr: formData.descriptionAr || '',
        descriptionEn: defaultValues?.descriptionEn || '',
        referenceNumber: formData.referenceNumber || '',
        details: formData.details.map(normalizeEditDetailPayload),
      },
      { onSuccess: () => navigate('/cash-transactions') }
    );
  };

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:p-6">
        <ArrowLeft
          className="cursor-pointer text-gray-500 hover:text-gray-800"
          onClick={() => navigate(-1)}
        />
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            {isEditMode ? 'تعديل حركة نقدية' : 'إنشاء حركة نقدية'}
          </h1>
          <p className="text-sm text-gray-600">
            {isCreateMode
              ? 'إدخال حركة نقدية متوازنة بحساب الصندوق والحساب المقابل'
              : 'عرض وتعديل تفاصيل الحركة كقيد محاسبي'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:space-y-6 md:p-6"
      >
        <p className="text-sm text-gray-600">
          الحقول المميزة بـ <span className="text-red-500">*</span> مطلوبة. أدخل
          الحساب ومبلغاً في المدين أو الدائن لكل سطر. إذن القبض / الصرف اختياري.
        </p>
        {showErrors && validationMessages.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <p className="font-semibold">يرجى تصحيح الأخطاء التالية:</p>
            <ul className="list-inside list-disc">
              {validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isEditMode ? (
            <FormInput
              label="رقم الحركة"
              value={formData.journalEntryNumber}
              readOnly
            />
          ) : (
            <FormInput
              as="select"
              label="نوع الحركة"
              value={formData.transactionType}
              onChange={(event) =>
                handleFieldChange('transactionType', event.target.value)
              }
            >
              {TRANSACTION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormInput>
          )}

          <DateInput
            required
            error={
              showErrors && !formData.transactionDate
                ? 'التاريخ مطلوب'
                : undefined
            }
            label="التاريخ"
            value={formData.transactionDate}
            onChange={(event) =>
              handleFieldChange('transactionDate', event.target.value)
            }
            readOnly={isEditMode}
          />

          <FormInput
            label="رقم المرجع"
            value={formData.referenceNumber}
            onChange={(event) =>
              handleFieldChange('referenceNumber', event.target.value)
            }
          />

          <FormInput
            label="الوصف عربي"
            value={formData.descriptionAr}
            onChange={(event) =>
              handleFieldChange('descriptionAr', event.target.value)
            }
          />

          <FormInput
            as="select"
            label="الفترة المالية"
            required
            error={
              showErrors && !(Number(formData.financialPeriodID) > 0)
                ? 'الفترة المالية مطلوبة'
                : undefined
            }
            value={formData.financialPeriodID}
            onChange={(event) =>
              handleFieldChange('financialPeriodID', event.target.value)
            }
            disabled={isEditMode}
          >
            <option value="">اختر</option>
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>
        </div>

        {isCreateMode && (
          <Toggle
            label="ترحيل فوراً"
            checked={formData.postImmediately}
            onChange={(e) =>
              handleFieldChange('postImmediately', e.target.checked)
            }
          />
        )}
        {
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3" dir="rtl">
              <h2 className="text-lg font-semibold text-gray-900">
                تفاصيل الحركة
              </h2>
              {isCreateMode && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      details: [...prev.details, { ...emptyEditDetail }],
                    }))
                  }
                >
                  <Plus size={16} aria-hidden="true" />
                  إضافة سطر
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
                <thead className="bg-primary/90 text-white">
                  <tr>
                    <th className="p-3 text-right">
                      الحساب <span className="text-red-200">*</span>
                    </th>
                    {isEditMode && (
                      <th className="p-3 text-right">مركز التكلفة</th>
                    )}
                    <th className="p-3 text-right">
                      {formData.transactionType === 'Deposit'
                        ? 'إذن القبض'
                        : 'إذن الصرف'}
                    </th>
                    <th className="p-3 text-right">الوصف عربي</th>
                    <th className="p-3 text-right">مدين</th>
                    <th className="p-3 text-right">دائن</th>
                    {isCreateMode && (
                      <th className="p-3 text-right">إجراءات</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {formData.details.map((row, index) => (
                    <tr
                      key={row.journalEntryDetailID ?? index}
                      className="border border-gray-200"
                    >
                      <td className="min-w-[220px] p-2">
                        <AccountSearchSelect
                          fitContent
                          error={
                            showErrors ? rowErrors[index].account : undefined
                          }
                          value={row.accountID}
                          onChange={(e) =>
                            handleEditRowChange(
                              index,
                              'accountID',
                              e.target.value
                            )
                          }
                        />
                      </td>

                      {isEditMode && (
                        <td className="min-w-[200px] p-2">
                          <SelectField
                            value={row.costCenterID}
                            onChange={(e) =>
                              handleEditRowChange(
                                index,
                                'costCenterID',
                                e.target.value
                              )
                            }
                            options={costCenterOptions}
                          />
                        </td>
                      )}
                      <td className="min-w-[200px] p-2">
                        <input
                          aria-label={
                            formData.transactionType === 'Deposit'
                              ? 'إذن القبض'
                              : 'إذن الصرف'
                          }
                          value={row.paymentPermit}
                          onChange={(e) =>
                            handleEditRowChange(
                              index,
                              'paymentPermit',
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                      </td>
                      <td className="min-w-[220px] p-2">
                        <input
                          type="text"
                          value={row.descriptionAr}
                          onChange={(e) =>
                            handleEditRowChange(
                              index,
                              'descriptionAr',
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                      </td>

                      <td className="min-w-[140px] p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          aria-label={`مدين - السطر ${index + 1}`}
                          aria-invalid={
                            showErrors && Boolean(rowErrors[index].amount)
                          }
                          value={row.debitAmount}
                          onChange={(e) =>
                            handleEditRowChange(
                              index,
                              'debitAmount',
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                      </td>

                      <td className="min-w-[140px] p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          aria-label={`دائن - السطر ${index + 1}`}
                          aria-invalid={
                            showErrors && Boolean(rowErrors[index].amount)
                          }
                          value={row.creditAmount}
                          onChange={(e) =>
                            handleEditRowChange(
                              index,
                              'creditAmount',
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                        {showErrors && rowErrors[index].amount && (
                          <p className="mt-1 text-sm text-red-500">
                            {rowErrors[index].amount}
                          </p>
                        )}
                      </td>

                      {isCreateMode && (
                        <td className="p-2">
                          <button
                            type="button"
                            disabled={formData.details.length <= 2}
                            aria-label={`حذف السطر ${index + 1}`}
                            title="حذف السطر"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                details: prev.details.filter(
                                  (_, rowIndex) => rowIndex !== index
                                ),
                              }))
                            }
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`rounded-lg p-3 text-sm ${
                canSubmit
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {canSubmit
                ? 'القيد متوازن'
                : 'القيد غير متوازن أو توجد بيانات ناقصة'}
              <span className="mr-3">
                إجمالي المدين: {editTotals.debit.toFixed(2)}
              </span>
              <span className="mr-3">
                إجمالي الدائن: {editTotals.credit.toFixed(2)}
              </span>
            </div>
          </div>
        }

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/cash-transactions')}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700"
          >
            رجوع
          </button>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-white disabled:opacity-50"
          >
            {isEditMode ? 'حفظ التعديلات' : 'حفظ الحركة'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CashTransactionForm;
