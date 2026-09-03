import { useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import { toast } from '../../../../shared/lib/toast';
import { useCurrencies } from '../../commercial-papers/hooks/commercial-papers.queries';
import {
  useFinancialPeriods,
} from '../../invoices/hooks/invoices.queries';
import AccountSearchSelect from './account-search-select';
import PartySearchSelect from '../../../../shared/ui/party-search-select';
import CostCenterSearchSelect from '../../../../shared/ui/cost-center-search-select';
import CurrencyExchangeInput from './currency-exchange-input';
import { journalEntrySchema } from '../validation/journal-entry.validation';
import {
  useCreateJournalEntry,
  usePostJournalEntry,
  useReverseJournalEntry,
  useUpdateJournalEntry,
} from '../hooks/entries.mutations';
import { getInvoiceForCashVoucher } from '../../cash-vouchers/api/cash-vouchers.api';
import { useJournalEntryStatuses } from '../hooks/entries.queries';
import {
  buildJournalEntryPayload,
  isJournalEntryPosted,
  isJournalEntryReversed,
  JOURNAL_TYPES,
  journalEntryInputClass,
  journalEntryFlexInputClass,
} from '../utils/journal-entry.utils';

const getToday = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

const createDetailRow = () => ({
  rowKey: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  invoiceNumber: '',
  accountID: '',
  costCenterID: '',
  customerID: '',
  supplierID: '',
  customerNameAr: '',
  supplierNameAr: '',
  recordDate: getToday(),
  documentNumber: '',
  debitAmount: '',
  creditAmount: '',
  description: '',
});

const toDateValue = (v) => (v ? String(v).split('T')[0] : '');

const mapEntryToForm = (entry) => {
  const mapDetail = (d) => ({
    rowKey: `detail-${d.journalEntryDetailID || Math.random()}`,
    journalEntryDetailID: d.journalEntryDetailID ?? null,
    invoiceNumber: d.invoiceNumber ?? d.batchNumber ?? '',
    accountID: d.accountID ? String(d.accountID) : d.id ? String(d.id) : '',
    costCenterID: d.costCenterID != null ? String(d.costCenterID) : '',
    customerID: d.customerID > 0 ? String(d.customerID) : '',
    supplierID: d.supplierID > 0 ? String(d.supplierID) : '',
    customerNameAr: d.customerNameAr ?? d.customerName ?? '',
    supplierNameAr: d.supplierNameAr ?? d.supplierName ?? '',
    recordDate: toDateValue(d.recordDate),
    documentNumber: d.documentNumber ?? '',
    debitAmount: d.debitAmount != null ? String(d.debitAmount) : '',
    creditAmount: d.creditAmount != null ? String(d.creditAmount) : '',
    description: d.description ?? d.descriptionAr ?? '',
  });

  return {
    entryDate: toDateValue(entry.entryDate) || getToday(),
    journalType: entry.journalType ?? 'DailyEntry',
    description: entry.description ?? entry.descriptionAr ?? '',
    referenceNumber: entry.referenceNumber ?? '',
    financialPeriodID: entry.financialPeriodID
      ? String(entry.financialPeriodID)
      : '',
    statusID: entry.statusID != null ? String(entry.statusID) : '0',
    currencyID: entry.currencyID ? String(entry.currencyID) : '',
    exchangeRate: entry.exchangeRate != null ? String(entry.exchangeRate) : '1',
    details: entry.details?.length
      ? entry.details.map(mapDetail)
      : [createDetailRow(), createDetailRow()],
  };
};

const DetailField = ({ label, children, error }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error ? <p className="text-sm text-red-500">{error}</p> : null}
  </div>
);

const JournalEntryForm = ({
  defaultValues = {},
  mode = 'create',
  showEntryDetailsButton = false,
  viewOnly = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreateJournalEntry();
  const updateMutation = useUpdateJournalEntry();
  const postMutation = usePostJournalEntry();
  const reverseMutation = useReverseJournalEntry();
  const { data: currencies = [] } = useCurrencies();
  const { data: financialPeriods = [] } = useFinancialPeriods();
  const { data: statuses = [] } = useJournalEntryStatuses();
  const isEditMode = mode === 'edit';
  const entryId = defaultValues?.journalEntryID || defaultValues?.id;
  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        value: String(c.currencyID),
        label: c.currencyNameAr || c.currencyNameEn || c.currencyCode,
      })),
    [currencies]
  );
  const periodOptions = useMemo(
    () =>
      financialPeriods.map((p) => ({
        value: String(p.financialPeriodID),
        label: p.nameAr || p.financialPeriodNameAr || p.nameEn,
      })),
    [financialPeriods]
  );
  const statusOptions = useMemo(
    () => statuses.map((s) => ({ value: String(s.id), label: s.name })),
    [statuses]
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: mapEntryToForm(defaultValues),
    resolver: zodResolver(journalEntrySchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });
  const watchedDetails = useWatch({ control, name: 'details' }) || [];
  const watchedStatusID = useWatch({ control, name: 'statusID' });
  const watchedExchangeRate = useWatch({ control, name: 'exchangeRate' });

  // Reset form when switching to an existing entry
  useEffect(() => {
    if (isEditMode && defaultValues?.journalEntryID) {
      reset(mapEntryToForm(defaultValues));
    }
  }, [isEditMode, defaultValues?.journalEntryID, defaultValues?.modifiedAt]);

  // Default currency to EGP when currencies load
  useEffect(() => {
    if (!isEditMode && currencies.length > 0 && !getValues('currencyID')) {
      const egp = currencies.find(
        (c) =>
          c.currencyCode?.toUpperCase() === 'EGP' ||
          c.currencyNameAr?.includes('جنيه')
      );
      if (egp) {
        setValue('currencyID', String(egp.currencyID));
        setValue('exchangeRate', '1');
      }
    }
  }, [currencies, isEditMode]);

  const totalDebit = useMemo(
    () => watchedDetails.reduce((s, r) => s + (Number(r?.debitAmount) || 0), 0),
    [watchedDetails]
  );
  const totalCredit = useMemo(
    () =>
      watchedDetails.reduce((s, r) => s + (Number(r?.creditAmount) || 0), 0),
    [watchedDetails]
  );
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const selectedStatus = statusOptions.find(
    (s) => s.value === String(watchedStatusID)
  );
  const entryStatus =
    selectedStatus?.label || defaultValues.statusName || defaultValues.status;
  const isPosted = isJournalEntryPosted({
    ...defaultValues,
    statusID: Number(watchedStatusID) || 0,
    statusName: entryStatus,
  });
  const isReversed = isJournalEntryReversed({
    ...defaultValues,
    statusName: entryStatus,
  });

  // Mutual exclusion: setting debit clears credit and vice versa
  const handleAmountChange = (index, field, value) => {
    const opposite = field === 'debitAmount' ? 'creditAmount' : 'debitAmount';
    setValue(`details.${index}.${field}`, value);
    if (value !== '') setValue(`details.${index}.${opposite}`, '');
  };

  // Mutual exclusion: selecting a customer clears supplier
  const handleCustomerChange = (index, value, entityName) => {
    setValue(`details.${index}.customerID`, value);
    setValue(
      `details.${index}.customerNameAr`,
      value ? entityName || '' : ''
    );
    if (value) {
      setValue(`details.${index}.supplierID`, '');
      setValue(`details.${index}.supplierNameAr`, '');
    }
  };

  // Mutual exclusion: selecting a supplier clears customer
  const handleSupplierChange = (index, value, entityName) => {
    setValue(`details.${index}.supplierID`, value);
    setValue(
      `details.${index}.supplierNameAr`,
      value ? entityName || '' : ''
    );
    if (value) {
      setValue(`details.${index}.customerID`, '');
      setValue(`details.${index}.customerNameAr`, '');
    }
  };

  const handleLoadInvoiceDetails = async (index) => {
    const invoiceNumber = String(watchedDetails[index]?.invoiceNumber || '').trim();
    if (!invoiceNumber) {
      toast.error('أدخل رقم الفاتورة أولاً');
      return;
    }

    try {
      const response = await getInvoiceForCashVoucher(invoiceNumber);
      const invoice = response?.data ?? response;
      if (!invoice) {
        toast.error('تعذر جلب بيانات الفاتورة');
        return;
      }

      setValue(
        `details.${index}.accountID`,
        invoice.accountID ? String(invoice.accountID) : ''
      );
      setValue(`details.${index}.debitAmount`, String(invoice.amount ?? ''));
      setValue(`details.${index}.creditAmount`, '');
      setValue(`details.${index}.documentNumber`, invoice.invoiceNumber || invoiceNumber);

      const customerID = invoice.customerID ?? invoice.customerId;
      const supplierID = invoice.supplierID ?? invoice.supplierId;
      const partyName = invoice.name || '';

      if (customerID) {
        setValue(`details.${index}.customerID`, String(customerID));
        setValue(`details.${index}.customerNameAr`, partyName);
        setValue(`details.${index}.supplierID`, '');
        setValue(`details.${index}.supplierNameAr`, '');
      } else if (supplierID) {
        setValue(`details.${index}.supplierID`, String(supplierID));
        setValue(`details.${index}.supplierNameAr`, partyName);
        setValue(`details.${index}.customerID`, '');
        setValue(`details.${index}.customerNameAr`, '');
      }

      toast.success('تم تحميل بيانات الفاتورة');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل في جلب بيانات الفاتورة');
    }
  };

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

  // Build API payload & submit
  const onSubmit = (data) => {
    const getCachedAccount = (id) => queryClient.getQueryData(['account', id]);

    let hasLockedAccount = false;
    data.details.forEach((d, index) => {
      if (!d.accountID) return;
      const account = getCachedAccount(d.accountID);
      if (account?.lockedInJournal) {
        hasLockedAccount = true;
        setError(`details.${index}.accountID`, {
          type: 'locked',
          message: 'لا يمكن استخدام هذا الحساب لأنه مقفل',
        });
      }
    });
    if (hasLockedAccount) {
      toast.error('لا يمكن إنشاء القيد باستخدام حساب مقفل');
      return;
    }

    const payload = buildJournalEntryPayload(data, { isCreate: !isEditMode });
    if (isEditMode) {
      updateMutation.mutate(
        { id: entryId, ...payload },
        { onSuccess: () => navigate('/entries') }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/entries') });
    }
  };

  const readOnly = viewOnly || (isEditMode && isPosted);

  return (
    <div className="min-w-0 w-full max-w-full space-y-4 md:space-y-6">
      {/* Header */}
      {!viewOnly ? (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
                  postMutation.isPending ||
                  reverseMutation.isPending ||
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
                  postMutation.isPending ||
                  reverseMutation.isPending ||
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
      ) : showEntryDetailsButton && entryId ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/entries/${entryId}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700 hover:bg-sky-100"
          >
            <ExternalLink size={16} />
            فتح صفحة القيد
          </button>
        </div>
      ) : null}


      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 md:space-y-6 md:p-6"
      >
        {/* Header fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Controller
            name="entryDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="التاريخ"
                value={field.value ?? ''}
                onChange={field.onChange}
                required
                error={errors.entryDate?.message}
              />
            )}
          />

          <Controller
            name="journalType"
            control={control}
            render={({ field }) => (
              <FormInput
                as="select"
                label="نوع القيد"
                value={field.value ?? ''}
                onChange={field.onChange}
                required
                error={errors.journalType?.message}
              >
                {JOURNAL_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FormInput>
            )}
          />

          <FormInput label="رقم المرجع" {...register('referenceNumber')} />

          <FormInput label="الوصف عربي" {...register('description')} />

          <Controller
            name="financialPeriodID"
            control={control}
            render={({ field }) => (
              <FormInput
                as="select"
                label="الفترة المالية"
                value={field.value ?? ''}
                onChange={field.onChange}
                required
                error={errors.financialPeriodID?.message}
              >
                <option value="">اختر</option>
                {periodOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FormInput>
            )}
          />

          <Controller
            name="statusID"
            control={control}
            render={({ field }) => (
              <FormInput
                as="select"
                label="الحالة"
                value={field.value ?? ''}
                onChange={field.onChange}
                required
                error={errors.statusID?.message}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FormInput>
            )}
          />

          <Controller
            name="currencyID"
            control={control}
            render={({ field }) => (
              <CurrencyExchangeInput
                currencyValue={field.value ?? ''}
                exchangeRateValue={watchedExchangeRate ?? ''}
                onCurrencyChange={field.onChange}
                onExchangeRateChange={(e) => setValue('exchangeRate', e.target.value)}
                currencyOptions={currencyOptions}
                disabled={readOnly}
              />
            )}
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              تفاصيل القيد
            </h2>
            <button
              type="button"
              onClick={() => append(createDetailRow())}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              <Plus size={16} />
              إضافة سطر
            </button>
          </div>

          {/* Mobile view */}
          <div className="space-y-4 lg:hidden">
            {fields.map((field, index) => {
              const rowErrors = errors?.details?.[index] || {};
              return (
                <div
                  key={field.id}
                  className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{`السطر ${index + 1}`}</span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailField label="رقم الفاتوره">
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
                          className={`${journalEntryFlexInputClass} !pl-10`}
                        />
                        <button
                          type="button"
                          onClick={() => handleLoadInvoiceDetails(index)}
                          disabled={readOnly}
                          className="absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-main text-white disabled:opacity-50"
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    </DetailField>

                    <DetailField
                      label="الحساب"
                      error={rowErrors.accountID?.message}
                    >
                      <Controller
                        name={`details.${index}.accountID`}
                        control={control}
                        render={({ field: f }) => (
                          <AccountSearchSelect
                            value={f.value ?? ''}
                            onChange={f.onChange}
                          />
                        )}
                      />
                    </DetailField>

                    <DetailField label="مركز التكلفة">
                      <Controller
                        name={`details.${index}.costCenterID`}
                        control={control}
                        render={({ field: f }) => (
                          <CostCenterSearchSelect
                            value={f.value ?? ''}
                            onChange={f.onChange}
                          />
                        )}
                      />
                    </DetailField>

                    <DetailField label="العميل">
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
                          />
                        )}
                      />
                    </DetailField>

                    <DetailField label="المورد">
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
                          />
                        )}
                      />
                    </DetailField>

                    <DetailField
                      label="مدين"
                      error={rowErrors.debitAmount?.message}
                    >
                      <Controller
                        name={`details.${index}.debitAmount`}
                        control={control}
                        render={({ field: f }) => (
                          <input
                            type="number"
                            value={f.value ?? ''}
                            onChange={(e) =>
                              handleAmountChange(
                                index,
                                'debitAmount',
                                e.target.value
                              )
                            }
                            className={journalEntryInputClass}
                          />
                        )}
                      />
                    </DetailField>

                    <DetailField label="دائن">
                      <Controller
                        name={`details.${index}.creditAmount`}
                        control={control}
                        render={({ field: f }) => (
                          <input
                            type="number"
                            value={f.value ?? ''}
                            onChange={(e) =>
                              handleAmountChange(
                                index,
                                'creditAmount',
                                e.target.value
                              )
                            }
                            className={journalEntryInputClass}
                          />
                        )}
                      />
                    </DetailField>

                    <DetailField label="تاريخ السجل">
                      <Controller
                        name={`details.${index}.recordDate`}
                        control={control}
                        render={({ field: f }) => (
                          <DateInput
                            value={f.value ?? ''}
                            onChange={(e) => f.onChange(e.target.value)}
                          />
                        )}
                      />
                    </DetailField>

                    <DetailField label="رقم المستند">
                      <input
                        type="text"
                        {...register(`details.${index}.documentNumber`)}
                        className={journalEntryInputClass}
                      />
                    </DetailField>

                    <DetailField label="الوصف عربي">
                      <input
                        type="text"
                        {...register(`details.${index}.description`)}
                        className={journalEntryInputClass}
                      />
                    </DetailField>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden max-w-full overflow-x-auto lg:block">
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
                    <tr
                      key={field.id}
                      className="align-top border border-gray-200"
                    >
                      <td className="min-w-30 p-2">
                        <Controller
                          name={`details.${index}.debitAmount`}
                          control={control}
                          render={({ field: f }) => (
                            <input
                              type="number"
                              value={f.value ?? ''}
                              onChange={(e) =>
                                handleAmountChange(
                                  index,
                                  'debitAmount',
                                  e.target.value
                                )
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
                                handleAmountChange(
                                  index,
                                  'creditAmount',
                                  e.target.value
                                )
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
                                readOnly ||
                                Boolean(watchedDetails[index]?.supplierID)
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
                                readOnly ||
                                Boolean(watchedDetails[index]?.customerID)
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
                  <td className="p-3 text-green-600">
                    {totalDebit.toFixed(2)}
                  </td>
                  <td className="p-3 text-red-600">{totalCredit.toFixed(2)}</td>
                  <td colSpan="9" className="p-3 text-right">
                    الإجمالي
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/entries')}
            className="rounded-lg border border-gray-400 px-6 py-2 text-gray-700"
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
