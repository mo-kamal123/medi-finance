import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import NormalSelect from '../../../../shared/ui/NormalSelect';
import PartySearchSelect from '../../../../shared/ui/party-search-select';
import InvoiceSearch from './invoice-search';
import BatchInvoiceSelector from './batch-invoice-selector';
import { totalBatchInvoiceAmount } from '../utils/batch-invoice-summaries';
import { useCreateCheque } from '../hooks/cheques.mutations';
import { useChequeBanks, useChequeCurrencies } from '../hooks/cheques.queries';
import { useBankAccounts } from '../../banks/hooks/banks.queries';
import { chequeSchema } from '../validation/cheque.validation';

const toDateValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getInitialValues = (defaultValues) => {
  const rawType = String(defaultValues?.transactionType ?? '');
  const derivedChequeType =
    rawType === 'PAYMENT' || rawType === '1'
      ? '1'
      : rawType === 'RECEIPT' || rawType === '0'
        ? '0'
        : defaultValues?.chequeType != null
          ? String(defaultValues.chequeType)
          : '0';

  return {
    chequeType: derivedChequeType,
    chequeNumber: defaultValues?.chequeNumber ?? '',
    chequeDate: toDateValue(defaultValues?.chequeDate),
    receiptDate: toDateValue(defaultValues?.receiptDate),
    dueDate: toDateValue(defaultValues?.dueDate),
    voucherDate: toDateValue(defaultValues?.voucherDate),
    amount: defaultValues?.amount ?? '',
    currencyID: defaultValues?.currencyID ? String(defaultValues.currencyID) : '',
    exchangeRate: defaultValues?.exchangeRate ?? 1,
    customerID: defaultValues?.customerID
      ? String(defaultValues.customerID)
      : defaultValues?.clientID
        ? String(defaultValues.clientID)
        : '',
    supplierID: defaultValues?.supplierID
      ? String(defaultValues.supplierID)
      : defaultValues?.providerID
        ? String(defaultValues.providerID)
        : '',
    bankID: defaultValues?.bankID ? String(defaultValues.bankID) : '',
    bankAccountID: defaultValues?.bankAccountID
      ? String(defaultValues.bankAccountID)
      : '',
    bankBranchName: defaultValues?.bankBranchName ?? '',
    cardNumber: defaultValues?.cardNumber ?? '',
    underDeliveryAccountID: defaultValues?.underDeliveryAccountID
      ? String(defaultValues.underDeliveryAccountID)
      : '',
    collectionAccountID: defaultValues?.collectionAccountID
      ? String(defaultValues.collectionAccountID)
      : '',
    counterAccountID: defaultValues?.counterAccountID
      ? String(defaultValues.counterAccountID)
      : '',
    costCenterID: defaultValues?.costCenterID
      ? String(defaultValues.costCenterID)
      : '',
    invoiceID: defaultValues?.invoiceID ? String(defaultValues.invoiceID) : '',
    invoiceNumber: defaultValues?.invoiceNumber ?? '',
    isNonCashable: defaultValues?.isNonCashable ?? false,
    isBearerOnly: defaultValues?.isBearerOnly ?? false,
    hasAttachmentPage: defaultValues?.hasAttachmentPage ?? false,
    beneficiaryName: defaultValues?.beneficiaryName ?? '',
    statusID: defaultValues?.statusID ? String(defaultValues.statusID) : '',
    branchName: defaultValues?.branchName ?? '',
    notes: defaultValues?.notes ?? '',
  };
};

const buildPayload = (data) => ({
  customerID: data.customerID ? Number(data.customerID) : null,
  supplierID: data.supplierID ? Number(data.supplierID) : null,
  chequeNumber: data.chequeNumber,
  dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
  receiptDate: data.receiptDate
    ? new Date(data.receiptDate).toISOString()
    : null,
  amount: Number(data.amount),
  currencyID: data.currencyID ? Number(data.currencyID) : 0,
  exchangeRate: Number(data.exchangeRate) || 1,
  bankID: Number(data.bankID),
  collectionAccountID: data.collectionAccountID
    ? Number(data.collectionAccountID)
    : 0,
  counterAccountID: data.counterAccountID
    ? Number(data.counterAccountID)
    : 0,
  costCenterID: data.costCenterID ? Number(data.costCenterID) : 0,
  invoiceID: data.invoiceID ? Number(data.invoiceID) : 0,
  underDeliveryAccountID: data.underDeliveryAccountID
    ? Number(data.underDeliveryAccountID)
    : 0,
  isBearerOnly: Boolean(data.isBearerOnly),
  bankAccountID: data.bankAccountID ? Number(data.bankAccountID) : 0,
  beneficiaryName: data.beneficiaryName || '',
  branchName: data.branchName || '',
  notes: data.notes || '',
  type: Number(data.chequeType),
  cashVoucherID: 0,
});

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-2 mb-8">
    <p className='text-lg font-bold'>-</p>
    <h3 className="text-base font-bold text-gray-700 whitespace-nowrap">{title}</h3>
  </div>
);

const toOptions = (list, valueKey, labelKey) => {
  if (!Array.isArray(list)) return [{ value: '', label: 'اختر' }];
  return [
    { value: '', label: 'اختر' },
    ...list.map((item) => ({
      value: String(item[valueKey] ?? ''),
      label: item[labelKey] ?? '',
    })),
  ];
};

const getInvoiceParty = (invoice) => {
  const customerID = invoice?.customerID ?? invoice?.customerId;
  const supplierID = invoice?.supplierID ?? invoice?.supplierId;

  if (customerID) {
    return {
      type: 'customer',
      value: String(customerID),
      label:
        invoice.customerNameAr ||
        invoice.customerNameEn ||
        invoice.customerName ||
        String(customerID),
    };
  }

  if (supplierID) {
    return {
      type: 'supplier',
      value: String(supplierID),
      label:
        invoice.supplierNameAr ||
        invoice.supplierNameEn ||
        invoice.supplierName ||
        String(supplierID),
    };
  }

  return null;
};

const ChequeForm = ({ defaultValues, mode = 'create', onSubmit, isPending, activeTab }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bankIdFromUrl = searchParams.get('bankId');
  const createMutation = useCreateCheque();
  const { data: banks = [] } = useChequeBanks();
  const { data: currencies = [] } = useChequeCurrencies();
  const isViewMode = mode === 'view';
  const [batchInvoices, setBatchInvoices] = useState([]);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  const formDefaults = useMemo(
    () => getInitialValues(defaultValues),
    [defaultValues]
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: formDefaults,
    resolver: zodResolver(chequeSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const chequeType = useWatch({ control, name: 'chequeType' });
  const usesBatchInvoices = mode === 'create' && chequeType === '1';
  const batchSupplierName = [...new Set(batchInvoices.map((batch) => batch.supplierName))].join('، ');
  const watchedBankID = useWatch({ control, name: 'bankID' });

  const { data: bankAccountsRes = [], isLoading: loadingBankAccounts } =
    useBankAccounts(watchedBankID);

  const bankAccountOptions = useMemo(() => {
    const list = Array.isArray(bankAccountsRes) ? bankAccountsRes : [];
    return list.map((a) => ({
      value: String(a.bankAccountID ?? a.id ?? ''),
      label:
        a.accountNumberWithBranch ||
        a.accountNumber ||
        a.accountNameAr ||
        String(a.bankAccountID ?? a.id ?? ''),
    }));
  }, [bankAccountsRes]);

  useEffect(() => {
    if (
      !bankIdFromUrl ||
      isViewMode ||
      mode === 'edit' ||
      !Array.isArray(banks) ||
      banks.length === 0
    ) {
      return;
    }
    const exists = banks.some(
      (b) => String(b.bankID) === String(bankIdFromUrl)
    );
    if (exists) {
      setValue('bankID', String(bankIdFromUrl));
    }
  }, [bankIdFromUrl, banks, setValue, isViewMode, mode]);

  const bankOptions = toOptions(banks, 'bankID', 'bankNameAr');
  const currencyOptions = toOptions(currencies, 'currencyID', 'currencyNameAr');

  const handleBatchInvoicesChange = (batches) => {
    setBatchInvoices(batches);
    const suppliedSupplierID = batches.find((batch) => batch.supplierID)?.supplierID;
    const supplierID = suppliedSupplierID
      ? String(suppliedSupplierID)
      : batches.length > 0 && batchInvoices.length > 0 ? getValues('supplierID') : '';
    setValue('supplierID', supplierID, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('customerID', '');
    setValue('amount', batches.length > 0 ? totalBatchInvoiceAmount(batches) : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('invoiceID', '');
    setValue('invoiceNumber', '');
  };

  const handleFormSubmit = (data) => {
    if (isLoadingBatch) return;
    const payload = buildPayload(data);
    if (usesBatchInvoices) {
      delete payload.invoiceID;
      payload.invoices = batchInvoices.map((batch) => batch.batchNumber);
    }
    if (onSubmit) {
      onSubmit(payload);
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/cheques'),
      });
    }
  };

  const renderDate = (name, label, required) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DateInput
          label={label}
          required={required}
          error={errors[name]?.message}
          readOnly={isViewMode}
          {...field}
        />
      )}
    />
  );

  const renderSelect = (name, label, options, opts = {}) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <NormalSelect
          label={label}
          required={opts.required}
          value={field.value ?? ''}
          onChange={(e) => {
            field.onChange(e.target.value);
            opts.onChange?.(e.target.value);
          }}
          onBlur={field.onBlur}
          error={errors[name]?.message}
          disabled={isViewMode || opts.disabled}
          options={options}
          placeholder={opts.placeholder ?? 'اختر'}
        />
      )}
    />
  );

  const isTabMode = !!activeTab;

  const renderInfoTab = () => {
    const isReceipt = chequeType === '0';
    const partyField = isReceipt ? 'customerID' : 'supplierID';
    const partyLabel = isReceipt ? 'العميل' : 'المورد';

    return (
      <div className="space-y-10">
        <div>
          <SectionHeader title="بيانات الشيك الأساسية" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="رقم الشيك"
              required
              {...register('chequeNumber')}
              error={errors.chequeNumber?.message}
              readOnly={isViewMode}
              placeholder="أدخل رقم الشيك (أرقام فقط)"
            />
            <FormInput
              type="number"
              label="القيمة"
              required
              {...register('amount')}
              error={errors.amount?.message}
              readOnly={isViewMode || (usesBatchInvoices && batchInvoices.length > 0)}
              step="0.01"
              placeholder="أدخل قيمة الشيك"
            />
            {renderSelect('chequeType', 'نوع الشيك', [
              { value: '0', label: 'شيك قبض' },
              { value: '1', label: 'شيك صرف' },
            ], {
              required: true,
              disabled: isLoadingBatch,
              onChange: () => {
                setValue('customerID', '');
                setValue('supplierID', '');
                if (batchInvoices.length > 0) handleBatchInvoicesChange([]);
              },
            })}
            {renderDate('chequeDate', 'تاريخ الشيك', true)}
            {renderDate('receiptDate', 'تاريخ الاستلام', true)}
            {renderDate('dueDate', 'تاريخ الاستحقاق', true)}
          </div>
        </div>

        <div>
          <SectionHeader title="العميل والبنك والعملة" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Controller
              name={partyField}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-[15px]">
                    {partyLabel} <span className="text-red-500">*</span>
                  </label>
                  {usesBatchInvoices && batchInvoices.length > 0 ? (
                    <div className="space-y-2">
                    <FormInput
                      aria-label="المورد"
                      value={batchSupplierName}
                      title={batchSupplierName}
                      readOnly
                      className="bg-gray-50 text-gray-700"
                    />
                    {!batchInvoices.some((batch) => batch.supplierID) ? (
                      <>
                        <p className="text-xs text-gray-500">اختر المورد لربط الشيك؛ ملخص الفاتورة يحتوي على الاسم فقط.</p>
                        <PartySearchSelect
                          type="supplier"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          onBlur={field.onBlur}
                          placeholder="اختر المورد للحفظ"
                          error={errors.supplierID?.message}
                        />
                      </>
                    ) : null}
                    </div>
                  ) : <PartySearchSelect
                    type={isReceipt ? 'customer' : 'supplier'}
                    value={field.value ?? ''}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      if (isReceipt) {
                        setValue('supplierID', '');
                      } else {
                        setValue('customerID', '');
                      }
                    }}
                    error={errors[partyField]?.message}
                    disabled={isViewMode}
                  />}
                </div>
              )}
            />
            {renderSelect('bankID', 'البنك', bankOptions, {
              required: true,
              placeholder: 'اختر البنك',
              onChange: () => setValue('bankAccountID', ''),
            })}
            {renderSelect('bankAccountID', 'الحساب البنكي', bankAccountOptions, {
              required: true,
              placeholder: 'اختر الحساب البنكي',
              disabled: !watchedBankID || loadingBankAccounts,
            })}
            {renderSelect('currencyID', 'العملة', currencyOptions, {
              placeholder: 'اختر العملة',
            })}
            <FormInput
              type="number"
              step="0.01"
              label="سعر الصرف"
              {...register('exchangeRate')}
              error={errors.exchangeRate?.message}
              readOnly={isViewMode}
              placeholder="1"
            />
            {!usesBatchInvoices ? <div>
              <label className="mb-1 block font-medium text-gray-700">
                الفاتورة
              </label>
              <Controller
                name="invoiceID"
                control={control}
                render={({ field }) => (
                  <InvoiceSearch
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    displayValue={formDefaults.invoiceNumber}
                    onInvoiceSelect={(invoice) => {
                      const party = getInvoiceParty(invoice);
                      setValue('invoiceNumber', invoice.invoiceNumber || '');
                      if (invoice.netAmount)
                        setValue('amount', invoice.netAmount);
                      if (party?.type === 'customer') {
                        setValue('customerID', party.value);
                        setValue('supplierID', '');
                      }
                      if (party?.type === 'supplier') {
                        setValue('supplierID', party.value);
                        setValue('customerID', '');
                      }
                    }}
                    disabled={isViewMode}
                    error={errors.invoiceID?.message}
                  />
                )}
              />
            </div> : null}
          </div>
        </div>

        {usesBatchInvoices ? (
          <BatchInvoiceSelector
            batches={batchInvoices}
            onChange={handleBatchInvoicesChange}
            onLoadingChange={setIsLoadingBatch}
          />
        ) : null}

        <div>
          <SectionHeader title="بيانات إضافية" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="اسم المستفيد"
              {...register('beneficiaryName')}
              readOnly={isViewMode}
              placeholder="أدخل اسم المستفيد"
            />
            <FormInput
              label="فرع الشركة"
              {...register('branchName')}
              readOnly={isViewMode}
              placeholder="أدخل اسم الفرع"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <div>
        <SectionHeader title="خصائص الشيك" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
            <input
              type="checkbox"
              {...register('isNonCashable')}
              disabled={isViewMode}
            />
            <span className="text-sm">غير قابل للصرف</span>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
            <input
              type="checkbox"
              {...register('isBearerOnly')}
              disabled={isViewMode}
            />
            <span className="text-sm">لحامله فقط</span>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
            <input
              type="checkbox"
              {...register('hasAttachmentPage')}
              disabled={isViewMode}
            />
            <span className="text-sm">صفحة مرفقة</span>
          </label>
        </div>
      </div>

      <div>
        <SectionHeader title="ملاحظات" />
        <div className="mt-4">
          <FormInput
            as="textarea"
            label="ملاحظات"
            {...register('notes')}
            readOnly={isViewMode}
            placeholder="أدخل ملاحظات الشيك"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (!isTabMode) {
      return (
        <>
          {renderInfoTab()}
          {renderSettingsTab()}
        </>
      );
    }
    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  return (
    <div className={isTabMode ? '' : 'p-6 bg-white rounded-xl shadow-sm border border-gray-300 space-y-6'}>
      {!isTabMode && (
        <div>
          <h2 className="text-xl font-bold">
            {isViewMode
              ? 'تفاصيل الشيك'
              : mode === 'edit'
                ? 'تعديل الشيك'
                : 'إضافة شيك'}
          </h2>
          <p className="text-sm text-gray-500">
            {isViewMode ? 'استعراض بيانات الشيك' : 'أدخل بيانات الشيك'}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {renderTabContent()}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/cheques')}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            رجوع
          </button>

          {!isViewMode && (
            <button
              type="submit"
              disabled={isPending || createMutation.isPending || isLoadingBatch}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isPending
                ? 'جاري الحفظ...'
                : mode === 'edit'
                  ? 'حفظ التعديلات'
                  : 'حفظ'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChequeForm;
