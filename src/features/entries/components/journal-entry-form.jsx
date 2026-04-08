import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import useAccountsTree from '../../tree/accouts-tree/hooks/use-accounts-tree';
import useCostTree from '../../tree/cost-tree/hooks/use-cost-tree';
import {
  useCustomers,
  useFinancialPeriods,
  useSuppliers,
} from '../../invoices/hooks/invoices.queries';
import { useCurrencies } from '../../commercial-papers/hooks/commercial-papers.queries';
import {
  useCreateJournalEntry,
  useUpdateJournalEntry,
} from '../hooks/entries.mutations';

const JOURNAL_TYPES = [
  { value: '1', label: 'قيد يومية' },
  { value: '2', label: 'قيد تسوية' },
  { value: '3', label: 'قيد إقفال' },
];

const STATUS_OPTIONS = [
  { value: 'Posted', label: 'Posted' },
  { value: 'Draft', label: 'Draft' },
];

const emptyDetail = {
  accountID: '',
  costCenterID: '',
  debitAmount: '',
  creditAmount: '',
  descriptionAr: '',
  descriptionEn: '',
  customerID: '',
  supplierID: '',
  currencyID: '',
  exchangeRate: '',
};

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getFinalNodes = (nodes = []) => {
  let finalNodes = [];
  nodes.forEach((node) => {
    if (node.isFinal) finalNodes.push(node);
    if (node.children?.length) {
      finalNodes = finalNodes.concat(getFinalNodes(node.children));
    }
  });
  return finalNodes;
};

const getInitialValues = (defaultValues = {}) => ({
  entryDate: toDateInputValue(defaultValues.entryDate),
  journalType: defaultValues.journalType ?? '1',
  descriptionAr: defaultValues.descriptionAr ?? '',
  descriptionEn: defaultValues.descriptionEn ?? '',
  referenceNumber: defaultValues.referenceNumber ?? '',
  financialPeriodID: defaultValues.financialPeriodID
    ? String(defaultValues.financialPeriodID)
    : '',
  status: defaultValues.status ?? 'Posted',
  details:
    defaultValues.details?.length > 0
      ? defaultValues.details.map((detail) => ({
          accountID: detail.accountID ? String(detail.accountID) : '',
          costCenterID: detail.costCenterID ? String(detail.costCenterID) : '',
          debitAmount: detail.debitAmount ?? '',
          creditAmount: detail.creditAmount ?? '',
          descriptionAr: detail.descriptionAr ?? '',
          descriptionEn: detail.descriptionEn ?? '',
          customerID: detail.customerID ? String(detail.customerID) : '',
          supplierID: detail.supplierID ? String(detail.supplierID) : '',
          currencyID: detail.currencyID ? String(detail.currencyID) : '',
          exchangeRate: detail.exchangeRate ?? '',
        }))
      : [{ ...emptyDetail }, { ...emptyDetail }],
});

const SelectField = ({ value, onChange, options, placeholder = 'اختر' }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const DetailField = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const JournalEntryForm = ({ defaultValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const createMutation = useCreateJournalEntry();
  const updateMutation = useUpdateJournalEntry();
  const { data: accountsTree = [] } = useAccountsTree();
  const { data: costTree = [] } = useCostTree();
  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();
  const { data: currencies = [] } = useCurrencies();
  const { data: financialPeriods = [] } = useFinancialPeriods();
  const isEditMode = mode === 'edit';

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
  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: String(customer.customerID),
        label: customer.customerNameAr || customer.customerNameEn,
      })),
    [customers]
  );
  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: String(supplier.supplierID),
        label: supplier.supplierNameAr || supplier.supplierNameEn,
      })),
    [suppliers]
  );
  const currencyOptions = useMemo(
    () =>
      currencies.map((currency) => ({
        value: String(currency.currencyID),
        label: currency.currencyNameEn || currency.currencyCode,
      })),
    [currencies]
  );
  const periodOptions = useMemo(
    () =>
      financialPeriods.map((period) => ({
        value: String(period.financialPeriodID),
        label: period.nameAr || period.financialPeriodNameAr || period.nameEn,
      })),
    [financialPeriods]
  );

  const [formData, setFormData] = useState(() =>
    getInitialValues(defaultValues)
  );

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, value) => {
    setFormData((prev) => {
      const details = [...prev.details];
      details[index] = { ...details[index], [field]: value };
      return { ...prev, details };
    });
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { ...emptyDetail }],
    }));
  };

  const removeRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const totalDebit = useMemo(
    () =>
      formData.details.reduce(
        (sum, row) => sum + (Number(row.debitAmount) || 0),
        0
      ),
    [formData.details]
  );

  const totalCredit = useMemo(
    () =>
      formData.details.reduce(
        (sum, row) => sum + (Number(row.creditAmount) || 0),
        0
      ),
    [formData.details]
  );

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isBalanced) {
      alert('يجب أن يكون مجموع المدين مساوياً للدائن');
      return;
    }

    const payload = {
      entryDate: new Date(formData.entryDate).toISOString(),
      journalType: formData.journalType,
      descriptionAr: formData.descriptionAr,
      descriptionEn: formData.descriptionEn || '',
      referenceNumber: formData.referenceNumber || '',
      financialPeriodID: Number(formData.financialPeriodID),
      status: formData.status,
      user: 'ms',
      details: formData.details.map((detail) => ({
        accountID: Number(detail.accountID),
        costCenterID: detail.costCenterID ? Number(detail.costCenterID) : null,
        debitAmount: Number(detail.debitAmount) || 0,
        creditAmount: Number(detail.creditAmount) || 0,
        descriptionAr: detail.descriptionAr || '',
        descriptionEn: detail.descriptionEn || '',
        customerID: detail.customerID ? Number(detail.customerID) : null,
        supplierID: detail.supplierID ? Number(detail.supplierID) : null,
        currencyID: detail.currencyID ? Number(detail.currencyID) : null,
        exchangeRate:
          detail.exchangeRate === '' ? null : Number(detail.exchangeRate),
      })),
    };

    if (isEditMode) {
      updateMutation.mutate(
        { id: defaultValues.journalEntryID || defaultValues.id, ...payload },
        { onSuccess: () => navigate('/entries') }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/entries'),
    });
  };

  return (
    <div className="min-w-0 w-full max-w-full space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:p-6">
        <ArrowLeft
          className="cursor-pointer text-gray-500 hover:text-gray-800"
          onClick={() => navigate(-1)}
        />
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            {isEditMode ? 'تعديل قيد يومي' : 'إنشاء قيد يومي'}
          </h1>
          <p className="text-sm text-gray-600">
            يجب أن يكون مجموع المدين مساوياً للدائن
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:space-y-6 md:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormInput
            type="date"
            label="التاريخ"
            value={formData.entryDate}
            onChange={(event) =>
              handleFieldChange('entryDate', event.target.value)
            }
            required
          />

          <FormInput
            as="select"
            label="نوع القيد"
            value={formData.journalType}
            onChange={(event) =>
              handleFieldChange('journalType', event.target.value)
            }
          >
            {JOURNAL_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

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
            label="الوصف إنجليزي"
            value={formData.descriptionEn}
            onChange={(event) =>
              handleFieldChange('descriptionEn', event.target.value)
            }
          />

          <FormInput
            as="select"
            label="الفترة المالية"
            value={formData.financialPeriodID}
            onChange={(event) =>
              handleFieldChange('financialPeriodID', event.target.value)
            }
          >
            <option value="">اختر</option>
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          <FormInput
            as="select"
            label="الحالة"
            value={formData.status}
            onChange={(event) =>
              handleFieldChange('status', event.target.value)
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              تفاصيل القيد
            </h2>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              <Plus size={16} />
              إضافة سطر
            </button>
          </div>

          <div className="space-y-4 lg:hidden">
            {formData.details.map((row, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    السطر {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* ✅ IMPROVED: better responsive grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="الحساب">
                    <SelectField
                      value={row.accountID}
                      onChange={(e) =>
                        handleRowChange(index, 'accountID', e.target.value)
                      }
                      options={accountOptions}
                    />
                  </DetailField>

                  <DetailField label="مركز التكلفة">
                    <SelectField
                      value={row.costCenterID}
                      onChange={(e) =>
                        handleRowChange(index, 'costCenterID', e.target.value)
                      }
                      options={costCenterOptions}
                    />
                  </DetailField>

                  <DetailField label="الوصف عربي">
                    <input
                      type="text"
                      value={row.descriptionAr}
                      onChange={(e) =>
                        handleRowChange(index, 'descriptionAr', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField label="الوصف إنجليزي">
                    <input
                      type="text"
                      value={row.descriptionEn}
                      onChange={(e) =>
                        handleRowChange(index, 'descriptionEn', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField label="مدين">
                    <input
                      type="number"
                      value={row.debitAmount}
                      onChange={(e) =>
                        handleRowChange(index, 'debitAmount', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField label="دائن">
                    <input
                      type="number"
                      value={row.creditAmount}
                      onChange={(e) =>
                        handleRowChange(index, 'creditAmount', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField label="العميل">
                    <SelectField
                      value={row.customerID}
                      onChange={(e) =>
                        handleRowChange(index, 'customerID', e.target.value)
                      }
                      options={customerOptions}
                    />
                  </DetailField>

                  <DetailField label="المورد">
                    <SelectField
                      value={row.supplierID}
                      onChange={(e) =>
                        handleRowChange(index, 'supplierID', e.target.value)
                      }
                      options={supplierOptions}
                    />
                  </DetailField>

                  <DetailField label="العملة">
                    <SelectField
                      value={row.currencyID}
                      onChange={(e) =>
                        handleRowChange(index, 'currencyID', e.target.value)
                      }
                      options={currencyOptions}
                    />
                  </DetailField>

                  <DetailField label="سعر الصرف">
                    <input
                      type="number"
                      value={row.exchangeRate}
                      onChange={(e) =>
                        handleRowChange(index, 'exchangeRate', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ TABLE (Desktop) */}
          <div className="hidden max-w-full overflow-x-auto lg:block">
            <table className="min-w-max overflow-hidden rounded-lg border border-gray-200 text-sm">
              <thead className="bg-primary/90 text-white">
                <tr>
                  <th className="p-3 text-right">الحساب</th>
                  <th className="p-3 text-right">مركز التكلفة</th>
                  <th className="p-3 text-right">الوصف عربي</th>
                  <th className="p-3 text-right">الوصف إنجليزي</th>
                  <th className="p-3 text-right">مدين</th>
                  <th className="p-3 text-right">دائن</th>
                  <th className="p-3 text-right">العميل</th>
                  <th className="p-3 text-right">المورد</th>
                  <th className="p-3 text-right">العملة</th>
                  <th className="p-3 text-right">سعر الصرف</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.details.map((row, index) => (
                  <tr key={index} className="align-top border border-gray-200">
                    <td className="min-w-[220px] p-2">
                      <SelectField
                        value={row.accountID}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'accountID',
                            event.target.value
                          )
                        }
                        options={accountOptions}
                      />
                    </td>
                    <td className="min-w-[200px] p-2">
                      <SelectField
                        value={row.costCenterID}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'costCenterID',
                            event.target.value
                          )
                        }
                        options={costCenterOptions}
                      />
                    </td>
                    <td className="min-w-[180px] p-2">
                      <input
                        type="text"
                        value={row.descriptionAr}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'descriptionAr',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    <td className="min-w-[180px] p-2">
                      <input
                        type="text"
                        value={row.descriptionEn}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'descriptionEn',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        value={row.debitAmount}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'debitAmount',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        value={row.creditAmount}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'creditAmount',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    <td className="min-w-[180px] p-2">
                      <SelectField
                        value={row.customerID}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'customerID',
                            event.target.value
                          )
                        }
                        options={customerOptions}
                      />
                    </td>
                    <td className="min-w-[180px] p-2">
                      <SelectField
                        value={row.supplierID}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'supplierID',
                            event.target.value
                          )
                        }
                        options={supplierOptions}
                      />
                    </td>
                    <td className="min-w-[180px] p-2">
                      <SelectField
                        value={row.currencyID}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'currencyID',
                            event.target.value
                          )
                        }
                        options={currencyOptions}
                      />
                    </td>
                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        value={row.exchangeRate}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'exchangeRate',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan="4" className="p-3 text-right">
                    الإجمالي
                  </td>
                  <td className="p-3 text-green-600">
                    {totalDebit.toFixed(2)}
                  </td>
                  <td className="p-3 text-red-600">{totalCredit.toFixed(2)}</td>
                  <td colSpan="5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div
          className={`rounded-lg p-3 text-sm ${
            isBalanced
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {isBalanced ? 'القيد متوازن' : 'القيد غير متوازن'}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/entries')}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700"
          >
            رجوع{' '}
          </button>
          <button
            type="submit"
            disabled={
              !isBalanced ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="rounded-lg bg-primary px-6 py-2 text-white disabled:opacity-50"
          >
            {isEditMode ? 'حفظ التعديلات' : 'حفظ القيد'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;
