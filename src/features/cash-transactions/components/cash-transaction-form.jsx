import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import useAccountsTree from '../../tree/accouts-tree/hooks/use-accounts-tree';
import useCostTree from '../../tree/cost-tree/hooks/use-cost-tree';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import { useCurrencies } from '../../commercial-papers/hooks/commercial-papers.queries';
import {
  useCreateCashTransaction,
  useUpdateCashTransaction,
} from '../hooks/cash-transactions.mutations';

const TRANSACTION_TYPES = [
  { value: 'Deposit', label: 'سند قبض' },
  { value: 'Withdrawal', label: 'سند دفع' },
];

const emptyCreateDetail = {
  accountID: '',
  costCenterID: '',
  amount: '',
  descriptionAr: '',
  currencyID: '',
  exchangeRate: '',
  isCash: false,
};

const emptyEditDetail = {
  journalEntryDetailID: null,
  accountID: '',
  costCenterID: '',
  debitAmount: '',
  creditAmount: '',
  descriptionAr: '',
  currencyID: '',
  exchangeRate: '',
  isCash: false,
};

const getFinalNodes = (nodes = []) => {
  let finalNodes = [];
  nodes.forEach((node) => {
    if (node.isFinal) finalNodes.push(node);
    if (node.children?.length) finalNodes = finalNodes.concat(getFinalNodes(node.children));
  });
  return finalNodes;
};

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getAmountFromDetail = (detail) => {
  if (detail?.amount !== undefined && detail?.amount !== null) return detail.amount;

  const debit = Number(detail?.debitAmount) || 0;
  const credit = Number(detail?.creditAmount) || 0;
  return debit || credit || '';
};

const getCreateInitialDetail = (defaultValues = {}) => {
  const firstDetail = defaultValues.details?.[0];
  if (!firstDetail) return { ...emptyCreateDetail };

  return {
    accountID: firstDetail.accountID ? String(firstDetail.accountID) : '',
    costCenterID: firstDetail.costCenterID ? String(firstDetail.costCenterID) : '',
    amount: getAmountFromDetail(firstDetail),
    descriptionAr: firstDetail.descriptionAr ?? '',
    currencyID: firstDetail.currencyID ? String(firstDetail.currencyID) : '',
    exchangeRate: firstDetail.exchangeRate ?? '',
    isCash: Boolean(firstDetail.isCash),
  };
};

const getEditInitialDetails = (details = []) => {
  if (!details.length) {
    return [{ ...emptyEditDetail }, { ...emptyEditDetail, isCash: true }];
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
    isCash: Boolean(detail.isCash),
  }));
};

const normalizeCreateDetailPayload = (detail) => ({
  accountID: Number(detail.accountID),
  costCenterID: detail.costCenterID ? Number(detail.costCenterID) : null,
  amount: Number(detail.amount) || 0,
  descriptionAr: detail.descriptionAr || '',
  currencyID: detail.currencyID ? Number(detail.currencyID) : null,
  exchangeRate: detail.exchangeRate === '' ? null : Number(detail.exchangeRate),
  isCash: Boolean(detail.isCash),
});

const normalizeEditDetailPayload = (detail) => ({
  journalEntryDetailID: detail.journalEntryDetailID ?? null,
  accountID: Number(detail.accountID),
  costCenterID: detail.costCenterID ? Number(detail.costCenterID) : null,
  debitAmount: Number(detail.debitAmount) || 0,
  creditAmount: Number(detail.creditAmount) || 0,
  descriptionAr: detail.descriptionAr || '',
  descriptionEn: '',
  customerID: null,
  supplierID: null,
  currencyID: detail.currencyID ? Number(detail.currencyID) : null,
  exchangeRate: detail.exchangeRate === '' ? null : Number(detail.exchangeRate),
  isCash: Boolean(detail.isCash),
});

const getInitialValues = (defaultValues = {}, mode = 'create') => ({
  transactionType: defaultValues.transactionType ?? 'Deposit',
  transactionDate: toDateInputValue(defaultValues.transactionDate || defaultValues.entryDate),
  financialPeriodID: defaultValues.financialPeriodID ? String(defaultValues.financialPeriodID) : '',
  referenceNumber: defaultValues.referenceNumber ?? '',
  descriptionAr: defaultValues.descriptionAr ?? '',
  journalEntryID: defaultValues.journalEntryID ?? null,
  journalEntryNumber: defaultValues.journalEntryNumber ?? '',
  details:
    mode === 'create'
      ? [getCreateInitialDetail(defaultValues)]
      : getEditInitialDetails(defaultValues.details),
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

const DetailField = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const CashTransactionForm = ({ defaultValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const createMutation = useCreateCashTransaction();
  const updateMutation = useUpdateCashTransaction();
  const { data: accountsTree = [] } = useAccountsTree();
  const { data: costTree = [] } = useCostTree();
  const { data: currencies = [] } = useCurrencies();
  const { data: financialPeriods = [] } = useFinancialPeriods();

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const accountOptions = useMemo(
    () =>
      getFinalNodes(accountsTree).map((account) => ({
        value: String(account.accountID),
        label: `${account.accountCode} - ${account.nameAr}`,
      })),
    [accountsTree]
  );

  const costCenterOptions = useMemo(
    () =>
      getFinalNodes(costTree).map((center) => ({
        value: String(center.costCenterID),
        label: `${center.ccCode} - ${center.nameAr}`,
      })),
    [costTree]
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((item) => ({
        value: String(item.currencyID),
        label: item.currencyNameEn || item.currencyCode,
      })),
    [currencies]
  );

  const periodOptions = useMemo(
    () =>
      financialPeriods.map((item) => ({
        value: String(item.financialPeriodID),
        label: item.nameAr || item.financialPeriodNameAr || item.nameEn,
      })),
    [financialPeriods]
  );

  const [formData, setFormData] = useState(() => getInitialValues(defaultValues, mode));

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateDetailChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      details: [{ ...prev.details[0], [field]: value }],
    }));
  };

  const handleEditRowChange = (index, field, value) => {
    setFormData((prev) => {
      const details = [...prev.details];
      details[index] = { ...details[index], [field]: value };
      return { ...prev, details };
    });
  };

  const createDetail = formData.details[0] || emptyCreateDetail;
  const createAmount = Number(createDetail.amount) || 0;

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

  const isCreateValid =
    Number(createDetail.accountID) > 0 &&
    createAmount > 0 &&
    formData.transactionDate &&
    Number(formData.financialPeriodID) > 0;

  const isEditValid =
    formData.details.length > 0 &&
    formData.details.every(
      (row) =>
        Number(row.accountID) > 0 &&
        ((Number(row.debitAmount) || 0) > 0 || (Number(row.creditAmount) || 0) > 0)
    ) &&
    editTotals.debit > 0 &&
    Math.abs(editTotals.debit - editTotals.credit) < 0.0001;

  const canSubmit = isCreateMode ? isCreateValid : isEditValid;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isCreateMode) {
      if (!isCreateValid) {
        alert('يجب إدخال التاريخ والفترة المالية والحساب والمبلغ بشكل صحيح');
        return;
      }

      const payload = {
        transactionType: formData.transactionType,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        financialPeriodID: Number(formData.financialPeriodID),
        referenceNumber: formData.referenceNumber || '',
        descriptionAr: formData.descriptionAr || '',
        details: [normalizeCreateDetailPayload(createDetail)],
      };

      createMutation.mutate(payload, {
        onSuccess: () => navigate('/cash-transactions'),
      });

      return;
    }

    if (!isEditValid) {
      alert('يجب أن تكون القيود متوازنة وأن يحتوي كل سطر على حساب ومبلغ صحيح');
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
              ? 'إدخال حركة نقدية بسطر واحد فقط'
              : 'عرض وتعديل تفاصيل الحركة كقيد محاسبي'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:space-y-6 md:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isEditMode ? (
            <FormInput label="رقم الحركة" value={formData.journalEntryNumber} readOnly />
          ) : (
            <FormInput
              as="select"
              label="نوع الحركة"
              value={formData.transactionType}
              onChange={(event) => handleFieldChange('transactionType', event.target.value)}
            >
              {TRANSACTION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormInput>
          )}

          <FormInput
            type="date"
            label="التاريخ"
            value={formData.transactionDate}
            onChange={(event) => handleFieldChange('transactionDate', event.target.value)}
            readOnly={isEditMode}
          />

          <FormInput
            label="رقم المرجع"
            value={formData.referenceNumber}
            onChange={(event) => handleFieldChange('referenceNumber', event.target.value)}
          />

          <FormInput
            label="الوصف عربي"
            value={formData.descriptionAr}
            onChange={(event) => handleFieldChange('descriptionAr', event.target.value)}
          />

          <FormInput
            as="select"
            label="الفترة المالية"
            value={formData.financialPeriodID}
            onChange={(event) => handleFieldChange('financialPeriodID', event.target.value)}
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

        {isCreateMode ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">تفاصيل الحركة</h2>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <DetailField label="الحساب">
                  <SelectField
                    value={createDetail.accountID}
                    onChange={(e) => handleCreateDetailChange('accountID', e.target.value)}
                    options={accountOptions}
                  />
                </DetailField>

                <DetailField label="مركز التكلفة">
                  <SelectField
                    value={createDetail.costCenterID}
                    onChange={(e) => handleCreateDetailChange('costCenterID', e.target.value)}
                    options={costCenterOptions}
                  />
                </DetailField>

                <DetailField label="المبلغ">
                  <input
                    type="number"
                    value={createDetail.amount}
                    onChange={(e) => handleCreateDetailChange('amount', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </DetailField>

                <DetailField label="الوصف عربي">
                  <input
                    type="text"
                    value={createDetail.descriptionAr}
                    onChange={(e) => handleCreateDetailChange('descriptionAr', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </DetailField>

                <DetailField label="العملة">
                  <SelectField
                    value={createDetail.currencyID}
                    onChange={(e) => handleCreateDetailChange('currencyID', e.target.value)}
                    options={currencyOptions}
                  />
                </DetailField>

                <DetailField label="سعر الصرف">
                  <input
                    type="number"
                    value={createDetail.exchangeRate}
                    onChange={(e) => handleCreateDetailChange('exchangeRate', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </DetailField>

                <div className="flex items-end">
                  <label className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={createDetail.isCash}
                      onChange={(e) => handleCreateDetailChange('isCash', e.target.checked)}
                    />
                    حساب نقدي
                  </label>
                </div>
              </div>
            </div>

            <div
              className={`rounded-lg p-3 text-sm ${
                isCreateValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {isCreateValid ? 'بيانات الحركة صالحة' : 'أدخل بيانات الحركة بشكل صحيح'}
              <span className="mr-3">المبلغ: {createAmount.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">تفاصيل الحركة</h2>

            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
                <thead className="bg-primary/90 text-white">
                  <tr>
                    <th className="p-3 text-right">الحساب</th>
                    <th className="p-3 text-right">مركز التكلفة</th>
                    <th className="p-3 text-right">الوصف عربي</th>
                    <th className="p-3 text-right">مدين</th>
                    <th className="p-3 text-right">دائن</th>
                    <th className="p-3 text-right">نقدي</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.details.map((row, index) => (
                    <tr key={row.journalEntryDetailID ?? index} className="border border-gray-200">
                      <td className="min-w-[220px] p-2">
                        <SelectField
                          value={row.accountID}
                          onChange={(e) => handleEditRowChange(index, 'accountID', e.target.value)}
                          options={accountOptions}
                        />
                      </td>

                      <td className="min-w-[200px] p-2">
                        <SelectField
                          value={row.costCenterID}
                          onChange={(e) =>
                            handleEditRowChange(index, 'costCenterID', e.target.value)
                          }
                          options={costCenterOptions}
                        />
                      </td>

                      <td className="min-w-[220px] p-2">
                        <input
                          type="text"
                          value={row.descriptionAr}
                          onChange={(e) =>
                            handleEditRowChange(index, 'descriptionAr', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                      </td>

                      <td className="min-w-[140px] p-2">
                        <input
                          type="number"
                          value={row.debitAmount}
                          onChange={(e) =>
                            handleEditRowChange(index, 'debitAmount', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                      </td>

                      <td className="min-w-[140px] p-2">
                        <input
                          type="number"
                          value={row.creditAmount}
                          onChange={(e) =>
                            handleEditRowChange(index, 'creditAmount', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={row.isCash}
                          onChange={(e) => handleEditRowChange(index, 'isCash', e.target.checked)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`rounded-lg p-3 text-sm ${
                isEditValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {isEditValid ? 'القيد متوازن' : 'القيد غير متوازن أو توجد بيانات ناقصة'}
              <span className="mr-3">إجمالي المدين: {editTotals.debit.toFixed(2)}</span>
              <span className="mr-3">إجمالي الدائن: {editTotals.credit.toFixed(2)}</span>
            </div>
          </div>
        )}

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
            disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}
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
