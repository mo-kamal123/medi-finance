import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import DateInput from '../../../shared/ui/date-input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { toast } from '../../../shared/lib/toast';
import { useCurrencies } from '../../commercial-papers/hooks/commercial-papers.queries';
import { useFinancialPeriods } from '../../invoices/hooks/invoices.queries';
import useAccountsTree from '../../tree/accouts-tree/hooks/use-accounts-tree';
import useCostTree from '../../tree/cost-tree/hooks/use-cost-tree';
import {
  useCreateJournalEntry,
  usePostJournalEntry,
  useReverseJournalEntry,
  useUpdateJournalEntry,
} from '../hooks/entries.mutations';
import { getBatchSummary } from '../api/entries.api';
import { useJournalEntryStatuses } from '../hooks/entries.queries';
import {
  buildJournalEntryPayload,
  isJournalEntryPosted,
  isJournalEntryReversed,
  JOURNAL_TYPES,
  toDateInputValue,
} from '../utils/journal-entry.utils';

const getTodayDateInputValue = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

const emptyDetail = {
  batchNumber: '',
  accountID: '',
  costCenterID: '',
  recordDate: getTodayDateInputValue(),
  documentNumber: '',
  debitAmount: '',
  creditAmount: '',
  description: '',
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
  entryDate: toDateInputValue(defaultValues.entryDate) || getTodayDateInputValue(),
  journalType: defaultValues.journalType ?? 'DailyEntry',
  description: defaultValues.description ?? defaultValues.descriptionAr ?? '',
  referenceNumber: defaultValues.referenceNumber ?? '',
  financialPeriodID: defaultValues.financialPeriodID
    ? String(defaultValues.financialPeriodID)
    : '',
  statusID:
    defaultValues.statusID !== undefined && defaultValues.statusID !== null
      ? String(defaultValues.statusID)
      : '0',
  currencyID: defaultValues.currencyID ? String(defaultValues.currencyID) : '',
  exchangeRate: defaultValues.exchangeRate ?? '',
  details:
    defaultValues.details?.length > 0
      ? defaultValues.details.map((detail) => ({
          journalEntryDetailID: detail.journalEntryDetailID ?? null,
          batchNumber: detail.batchNumber ?? '',
          accountID: detail.accountID ? String(detail.accountID) : '',
          costCenterID:
            detail.costCenterID !== undefined && detail.costCenterID !== null
              ? String(detail.costCenterID)
              : '',
          recordDate: toDateInputValue(detail.recordDate),
          documentNumber: detail.documentNumber ?? '',
          debitAmount: detail.debitAmount ?? '',
          creditAmount: detail.creditAmount ?? '',
          description: detail.description ?? detail.descriptionAr ?? '',
          customerID:
            detail.customerID !== undefined && detail.customerID !== null
              ? String(detail.customerID)
              : '',
          supplierID:
            detail.supplierID !== undefined && detail.supplierID !== null
              ? String(detail.supplierID)
              : '',
        }))
      : [{ ...emptyDetail }, { ...emptyDetail }],
});

const SelectField = ({
  value,
  onChange,
  options,
  placeholder = 'اختر',
  dropdownPosition = 'bottom',
}) => (
  <SearchableSelect
    value={value}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
    dropdownPosition={dropdownPosition}
  />
);

const DetailField = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const JournalEntryForm = ({
  defaultValues = {},
  mode = 'create',
  showEntryDetailsButton = false,
}) => {
  const navigate = useNavigate();
  const createMutation = useCreateJournalEntry();
  const updateMutation = useUpdateJournalEntry();
  const postMutation = usePostJournalEntry();
  const reverseMutation = useReverseJournalEntry();
  const { data: accountsTree = [] } = useAccountsTree();
  const { data: costTree = [] } = useCostTree();
  const { data: currencies = [] } = useCurrencies();
  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: statuses = [] } = useJournalEntryStatuses();
  const isEditMode = mode === 'edit';
  const entryId = defaultValues?.journalEntryID || defaultValues?.id;

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
      currencies.map((currency) => ({
        value: String(currency.currencyID),
        label:
          currency.currencyNameAr ||
          currency.currencyNameEn ||
          currency.currencyCode,
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
  const statusOptions = useMemo(
    () =>
      statuses.map((status) => ({
        value: String(status.id),
        label: status.name,
      })),
    [statuses]
  );

  const [formData, setFormData] = useState(() =>
    getInitialValues(defaultValues)
  );

  useEffect(() => {
    if (!defaultValues?.journalEntryID) return;
    setFormData(getInitialValues(defaultValues));
  }, [defaultValues?.journalEntryID, defaultValues?.modifiedAt]);

  const selectedStatus = statusOptions.find(
    (status) => status.value === String(formData.statusID)
  );
  const entryStatus =
    selectedStatus?.label || defaultValues.statusName || defaultValues.status;
  const isPosted = isJournalEntryPosted({
    ...defaultValues,
    statusID: formData.statusID,
    statusName: entryStatus,
  });
  const isReversed = isJournalEntryReversed({
    ...defaultValues,
    statusName: entryStatus,
  });

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

  const handleAmountChange = (index, field, value) => {
    setFormData((prev) => {
      const details = [...prev.details];
      const oppositeField =
        field === 'debitAmount' ? 'creditAmount' : 'debitAmount';

      details[index] = {
        ...details[index],
        [field]: value,
        [oppositeField]: value !== '' ? '' : details[index][oppositeField],
      };

      return { ...prev, details };
    });
  };

  const handleLoadBatchSummary = async (index) => {
    const batchNumber = String(
      formData.details[index]?.batchNumber || ''
    ).trim();

    if (!batchNumber) {
      toast.error('أدخل رقم الدفعة أولاً');
      return;
    }

    try {
      const response = await getBatchSummary(batchNumber);
      const summary = response?.data ?? response;

      if (!summary) {
        toast.error('تعذر جلب بيانات الدفعة');
        return;
      }

      setFormData((prev) => {
        const details = [...prev.details];
        details[index] = {
          ...details[index],
          accountID: summary.accountID ? String(summary.accountID) : '',
          debitAmount:
            summary.totalAmount === null || summary.totalAmount === undefined
              ? ''
              : String(summary.totalAmount),
          creditAmount: '',
        };
        return { ...prev, details };
      });

      toast.success('تم تحميل بيانات الدفعة');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل في جلب بيانات الدفعة');
    }
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
  const isPosting = postMutation.isPending;
  const isReversing = reverseMutation.isPending;

  const handlePostEntry = () => {
    if (!entryId) return;

    if (isPosted) {
      toast.info('تم ترحيل هذا القيد بالفعل');
      return;
    }

    if (isReversed) {
      toast.info('لا يمكن ترحيل قيد تم عكسه');
      return;
    }

    postMutation.mutate({ id: entryId, postedBy: 'ms' });
  };

  const handleReverseEntry = () => {
    if (!entryId) return;

    if (isReversed) {
      toast.info('تم عكس هذا القيد بالفعل');
      return;
    }

    if (!isPosted) {
      toast.info('يجب ترحيل القيد أولاً قبل إجراء العكس');
      return;
    }

    reverseMutation.mutate({ id: entryId, reversedBy: 'ms' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isBalanced) {
      toast.error('يجب أن يكون مجموع المدين مساوياً للدائن');
      return;
    }

    const payload = buildJournalEntryPayload(formData, {
      isCreate: !isEditMode,
    });

    if (isEditMode) {
      updateMutation.mutate(
        { id: entryId, ...payload },
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
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
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

        {isEditMode ? (
          <div className="flex flex-wrap items-center gap-3">
            {showEntryDetailsButton && entryId ? (
              <button
                type="button"
                onClick={() => navigate(`/entries/${entryId}`)}
                className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700"
              >
                <ExternalLink size={16} />
                فتح صفحة القيد
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePostEntry}
              disabled={
                isPosting ||
                isReversing ||
                isPosted ||
                isReversed
              }
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              ترحيل القيد
            </button>
            <button
              type="button"
              onClick={handleReverseEntry}
              disabled={
                isPosting ||
                isReversing ||
                !isPosted ||
                isReversed
              }
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} />
              عكس القيد
            </button>
          </div>
        ) : null}
      </div>

      {isEditMode && defaultValues.journalEntryNumber ? (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4 md:p-6">
          <div>
            <p className="text-sm text-gray-500">رقم القيد</p>
            <p className="font-semibold text-gray-900">
              {defaultValues.journalEntryNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">إجمالي المدين / الدائن</p>
            <p className="font-semibold text-gray-900">
              {Number(defaultValues.totalDebit || 0).toFixed(2)} /{' '}
              {Number(defaultValues.totalCredit || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">العملة</p>
            <p className="font-semibold text-gray-900">
              {defaultValues.currencyNameAr ||
                defaultValues.currencyCode ||
                '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">الفترة المالية</p>
            <p className="font-semibold text-gray-900">
              {defaultValues.financialPeriodNameAr ||
                defaultValues.financialPeriodNameEn ||
                '-'}
            </p>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:space-y-6 md:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DateInput
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
            value={formData.description}
            onChange={(event) =>
              handleFieldChange('description', event.target.value)
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
            value={formData.statusID}
            onChange={(event) =>
              handleFieldChange('statusID', event.target.value)
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          <FormInput
            as="select"
            label="العملة"
            value={formData.currencyID}
            onChange={(event) =>
              handleFieldChange('currencyID', event.target.value)
            }
          >
            <option value="">اختر</option>
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormInput>

          <FormInput
            type="number"
            label="سعر الصرف"
            value={formData.exchangeRate}
            onChange={(event) =>
              handleFieldChange('exchangeRate', event.target.value)
            }
          />
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
                className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {`السطر ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="رقم الدفعة">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={row.batchNumber}
                        onChange={(e) =>
                          handleRowChange(index, 'batchNumber', e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleLoadBatchSummary(index)}
                        className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90"
                      >
                        جلب
                      </button>
                    </div>
                  </DetailField>

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

                  <DetailField label="مدين">
                    <input
                      type="number"
                      value={row.debitAmount}
                      onChange={(e) =>
                        handleAmountChange(index, 'debitAmount', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField label="دائن">
                    <input
                      type="number"
                      value={row.creditAmount}
                      onChange={(e) =>
                        handleAmountChange(
                          index,
                          'creditAmount',
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField label="تاريخ السجل">
                    <DateInput
                      value={row.recordDate}
                      onChange={(e) =>
                        handleRowChange(index, 'recordDate', e.target.value)
                      }
                    />
                  </DetailField>

                  <DetailField label="رقم المستند">
                    <input
                      type="text"
                      value={row.documentNumber}
                      onChange={(e) =>
                        handleRowChange(index, 'documentNumber', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField label="الوصف عربي">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        handleRowChange(index, 'description', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden max-w-full overflow-x-auto lg:block">
            <table className="min-w-max overflow-hidden rounded-lg border border-gray-200 text-sm">
              <thead className="bg-primary/90 text-white">
                <tr>
                  <th className="p-3 text-right">مدين</th>
                  <th className="p-3 text-right">دائن</th>
                  <th className="p-3 text-right">الحساب</th>
                  <th className="p-3 text-right">مركز التكلفة</th>
                  <th className="p-3 text-right">الوصف</th>
                  <th className="p-3 text-right">تاريخ السجل</th>
                  <th className="p-3 text-right">رقم المستند</th>
                  <th className="p-3 text-right">رقم الدفعة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.details.map((row, index) => (
                  <tr key={index} className="align-top border border-gray-200">
                    {/* مدين */}
                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        value={row.debitAmount}
                        onChange={(event) =>
                          handleAmountChange(
                            index,
                            'debitAmount',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>

                    {/* دائن */}
                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        value={row.creditAmount}
                        onChange={(event) =>
                          handleAmountChange(
                            index,
                            'creditAmount',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>

                    {/* الحساب */}
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

                    {/* مركز التكلفة */}
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
                    {/* الوصف */}
                    <td className="min-w-[180px] p-2">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'description',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>
                    {/* تاريخ السجل */}
                    <td className="min-w-[160px] p-2">
                      <DateInput
                        value={row.recordDate}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'recordDate',
                            event.target.value
                          )
                        }
                      />
                    </td>

                    {/* رقم المستند */}
                    <td className="min-w-[160px] p-2">
                      <input
                        type="text"
                        value={row.documentNumber}
                        onChange={(event) =>
                          handleRowChange(
                            index,
                            'documentNumber',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>

                    {/* رقم الدفعة (آخر حاجة) */}
                    <td className="min-w-[190px] p-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={row.batchNumber}
                          onChange={(event) =>
                            handleRowChange(
                              index,
                              'batchNumber',
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleLoadBatchSummary(index)}
                          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-white"
                        >
                          جلب
                        </button>
                      </div>
                    </td>

                    {/* حذف */}
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
                  <td className="p-3 text-green-600">
                    {totalDebit.toFixed(2)}
                  </td>
                  <td className="p-3 text-red-600">{totalCredit.toFixed(2)}</td>
                  <td colSpan="7" className="p-3 text-right">
                    الإجمالي
                  </td>
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
            رجوع
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
