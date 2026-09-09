import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '../../../../shared/lib/toast';
import { useCurrencies } from '../../commercial-papers/hooks/commercial-papers.queries';
import { useFinancialPeriods } from '../../invoices/shared/hooks/invoices.queries';
import { journalEntrySchema } from '../validation/journal-entry.validation';
import {
  useCreateJournalEntry,
  usePostJournalEntry,
  useReverseJournalEntry,
  useUpdateJournalEntry,
} from './entries.mutations';
import { getInvoiceForCashVoucher } from '../../cash-vouchers/api/cash-vouchers.api';
import { useJournalEntryStatuses } from './entries.queries';
import {
  buildJournalEntryPayload,
  isJournalEntryPosted,
  isJournalEntryReversed,
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

const EMPTY_DETAILS = [];

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

const useJournalEntryForm = ({ defaultValues = {}, mode = 'create', viewOnly = false }) => {
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
  const watchedDetails = useWatch({ control, name: 'details' }) ?? EMPTY_DETAILS;
  const watchedStatusID = useWatch({ control, name: 'statusID' });
  const watchedExchangeRate = useWatch({ control, name: 'exchangeRate' });

  // Reset form when switching to an existing entry (reset/defaultValues intentionally excluded)
  useEffect(() => {
    if (isEditMode && defaultValues?.journalEntryID) {
      reset(mapEntryToForm(defaultValues));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, defaultValues?.journalEntryID, defaultValues?.modifiedAt]);

  // Default currency to EGP when currencies load (getValues/setValue intentionally excluded)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Fetch invoice details and auto-fill the current detail row
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

  // Post the saved entry (edit mode only)
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

  // Reverse the posted entry (edit mode only)
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

  // Build API payload, guard locked accounts, then submit
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

  // Update the exchange rate field
  const handleExchangeRateChange = (e) =>
    setValue('exchangeRate', e.target.value);

  return {
    navigate,
    register,
    control,
    errors,
    submitHandler: handleSubmit(onSubmit),
    fields,
    append,
    remove,
    watchedDetails,
    watchedExchangeRate,
    currencyOptions,
    periodOptions,
    statusOptions,
    isEditMode,
    entryId,
    createMutation,
    updateMutation,
    postMutation,
    reverseMutation,
    totalDebit,
    totalCredit,
    isBalanced,
    isPosted,
    isReversed,
    readOnly,
    createDetailRow,
    handleAmountChange,
    handleCustomerChange,
    handleSupplierChange,
    handleLoadInvoiceDetails,
    handlePostEntry,
    handleReverseEntry,
    handleExchangeRateChange,
  };
};

export default useJournalEntryForm;