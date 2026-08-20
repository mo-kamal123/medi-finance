import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import DateInput from '../../../shared/ui/date-input';
import NormalSelect from '../../../shared/ui/NormalSelect';
import AccountSearchSelect from '../../entries/components/account-search-select';
import InvoiceSearch from './invoice-search';
import { useCreateCheque } from '../hooks/cheques.mutations';
import {
  useChequeBanks,
  useChequeCustomers,
  useChequeSuppliers,
  useChequeCurrencies,
  useChequeStatuses,
} from '../hooks/cheques.queries';
import { chequeSchema } from '../validation/cheque.validation';

const toDateValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getInitialValues = (defaultValues) => ({
  chequeNumber: defaultValues?.chequeNumber ?? '',
  chequeDate: toDateValue(defaultValues?.chequeDate),
  receiptDate: toDateValue(defaultValues?.receiptDate),
  dueDate: toDateValue(defaultValues?.dueDate),
  voucherDate: toDateValue(defaultValues?.voucherDate),
  amount: defaultValues?.amount ?? '',
  currencyID: defaultValues?.currencyID ? String(defaultValues.currencyID) : '',
  exchangeRate: defaultValues?.exchangeRate ?? 1,
  customerID: defaultValues?.customerID ? String(defaultValues.customerID) : '',
  supplierID: defaultValues?.supplierID ? String(defaultValues.supplierID) : '',
  bankID: defaultValues?.bankID ? String(defaultValues.bankID) : '',
  underDeliveryAccountID: defaultValues?.underDeliveryAccountID
    ? String(defaultValues.underDeliveryAccountID)
    : '',
  collectionAccountID: defaultValues?.collectionAccountID
    ? String(defaultValues.collectionAccountID)
    : '',
  counterAccountID: defaultValues?.counterAccountID
    ? String(defaultValues.counterAccountID)
    : '',
  invoiceID: defaultValues?.invoiceID ? String(defaultValues.invoiceID) : '',
  invoiceNumber: defaultValues?.invoiceNumber ?? '',
  isNonCashable: defaultValues?.isNonCashable ?? false,
  isBearerOnly: defaultValues?.isBearerOnly ?? false,
  hasAttachmentPage: defaultValues?.hasAttachmentPage ?? false,
  beneficiaryName: defaultValues?.beneficiaryName ?? '',
  statusID: defaultValues?.statusID ? String(defaultValues.statusID) : '',
  branchName: defaultValues?.branchName ?? '',
  bankBranchName: defaultValues?.bankBranchName ?? '',
  cardNumber: defaultValues?.cardNumber ?? '',
  notes: defaultValues?.notes ?? '',
});

const buildPayload = (data) => ({
  customerID: data.customerID ? Number(data.customerID) : null,
  supplierID: data.supplierID ? Number(data.supplierID) : null,
  chequeNumber: data.chequeNumber,
  chequeDate: new Date(data.chequeDate).toISOString(),
  receiptDate: data.receiptDate
    ? new Date(data.receiptDate).toISOString()
    : null,
  dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
  voucherDate: data.voucherDate
    ? new Date(data.voucherDate).toISOString()
    : null,
  amount: Number(data.amount),
  currencyID: data.currencyID ? Number(data.currencyID) : null,
  exchangeRate: Number(data.exchangeRate) || 1,
  bankID: Number(data.bankID),
  underDeliveryAccountID: data.underDeliveryAccountID
    ? Number(data.underDeliveryAccountID)
    : null,
  collectionAccountID: data.collectionAccountID
    ? Number(data.collectionAccountID)
    : null,
  counterAccountID: data.counterAccountID
    ? Number(data.counterAccountID)
    : null,
  invoiceID: data.invoiceID ? Number(data.invoiceID) : null,
  invoiceNumber: data.invoiceNumber || '',
  isNonCashable: Boolean(data.isNonCashable),
  isBearerOnly: Boolean(data.isBearerOnly),
  hasAttachmentPage: Boolean(data.hasAttachmentPage),
  beneficiaryName: data.beneficiaryName || '',
  branchName: data.branchName || '',
  bankBranchName: data.bankBranchName || '',
  cardNumber: data.cardNumber || '',
  notes: data.notes || '',
  user: 'ms',
});

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3">
    <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
    <h3 className="text-sm font-bold text-gray-700 whitespace-nowrap">{title}</h3>
    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
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

const withFallbackOption = (options, fallback) => {
  if (!fallback?.value || options.some((option) => option.value === fallback.value)) {
    return options;
  }

  return [options[0], fallback, ...options.slice(1)];
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

const ChequeForm = ({ defaultValues, mode = 'create', onSubmit, isPending, onStatusChange, isStatusUpdating, activeTab }) => {
  const navigate = useNavigate();
  const createMutation = useCreateCheque();
  const [invoiceParty, setInvoiceParty] = useState(null);
  const { data: customers = [] } = useChequeCustomers();
  const { data: suppliers = [] } = useChequeSuppliers();
  const { data: banks = [] } = useChequeBanks();
  const { data: currencies = [] } = useChequeCurrencies();
  const { data: statuses = [] } = useChequeStatuses();
  const isViewMode = mode === 'view';

  const formDefaults = useMemo(
    () => getInitialValues(defaultValues),
    [defaultValues]
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: formDefaults,
    resolver: zodResolver(chequeSchema),
  });

  const customerID = watch('customerID');
  const supplierID = watch('supplierID');

  const customerOptions = withFallbackOption(
    toOptions(customers, 'customerID', 'customerNameAr'),
    invoiceParty?.type === 'customer' ? invoiceParty : null
  );
  const supplierOptions = withFallbackOption(
    toOptions(suppliers, 'supplierID', 'supplierNameAr'),
    invoiceParty?.type === 'supplier' ? invoiceParty : null
  );
  const bankOptions = toOptions(banks, 'bankID', 'bankNameAr');
  const currencyOptions = toOptions(currencies, 'currencyID', 'currencyNameAr');
  const statusOptions = useMemo(
    () =>
      (Array.isArray(statuses) ? statuses : []).map((s) => ({
        value: String(s.id ?? s.Id ?? s.statusID ?? s.statusId),
        label: s.NameAr || s.nameAr || s.Name || s.name || '',
      })),
    [statuses]
  );

  const handleFormSubmit = (data) => {
    const payload = buildPayload(data);
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
        />
      )}
    />
  );

  const isTabMode = !!activeTab;

  const renderInfoTab = () => (
    <>
      <SectionHeader title="بيانات الشيك الأساسية" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="رقم الشيك"
          required
          {...register('chequeNumber')}
          error={errors.chequeNumber?.message}
          readOnly={isViewMode}
        />
        <FormInput
          type="number"
          label="القيمة"
          required
          {...register('amount')}
          error={errors.amount?.message}
          readOnly={isViewMode}
        />
        {renderDate('chequeDate', 'تاريخ الشيك', true)}
        {renderDate('receiptDate', 'تاريخ الاستلام')}
        {renderDate('dueDate', 'تاريخ الاستحقاق')}
        {renderDate('voucherDate', 'تاريخ القيد')}
        {renderSelect('statusID', 'الحالة', [
          { value: '', label: 'اختر الحالة' },
          ...statusOptions,
        ], {
          onChange: (val) => onStatusChange?.(val),
          disabled: isStatusUpdating,
        })}
      </div>

      <SectionHeader title="بيانات إضافية" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="اسم المستفيد"
          {...register('beneficiaryName')}
          readOnly={isViewMode}
        />
        <FormInput
          label="فرع الشركة"
          {...register('branchName')}
          readOnly={isViewMode}
        />
        <FormInput
          label="فرع البنك"
          {...register('bankBranchName')}
          readOnly={isViewMode}
        />
        <FormInput
          label="رقم الكارت"
          {...register('cardNumber')}
          readOnly={isViewMode}
        />
      </div>
    </>
  );

  const renderPartyTab = () => (
    <>
      <SectionHeader title="بيانات العميل والبنك والعملة" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSelect('customerID', 'العميل', customerOptions, {
          onChange: (val) => val && setValue('supplierID', ''),
          disabled: !!supplierID,
        })}
        {renderSelect('supplierID', 'المورد', supplierOptions, {
          onChange: (val) => val && setValue('customerID', ''),
          disabled: !!customerID,
        })}
        {renderSelect('bankID', 'البنك', bankOptions, { required: true })}
        {renderSelect('currencyID', 'العملة', currencyOptions)}
        <FormInput
          type="number"
          step="0.01"
          label="سعر الصرف"
          {...register('exchangeRate')}
          error={errors.exchangeRate?.message}
          readOnly={isViewMode}
        />
        <div>
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
                displayValue={formDefaults.invoiceNumber}
                onInvoiceSelect={(invoice) => {
                  const party = getInvoiceParty(invoice);
                  setValue('invoiceNumber', invoice.invoiceNumber || '');
                  setInvoiceParty(party);
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
        </div>
      </div>
    </>
  );

  const renderAccountsTab = () => (
    <>
      <SectionHeader title="بيانات الحسابات" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-medium text-gray-700">
            حساب تحت التحصيل
          </label>
          <Controller
            name="underDeliveryAccountID"
            control={control}
            render={({ field }) => (
              <AccountSearchSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={isViewMode}
                error={errors.underDeliveryAccountID?.message}
              />
            )}
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-gray-700">
            حساب التحصيل
          </label>
          <Controller
            name="collectionAccountID"
            control={control}
            render={({ field }) => (
              <AccountSearchSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={isViewMode}
                error={errors.collectionAccountID?.message}
              />
            )}
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-gray-700">
            الحساب المقابل
          </label>
          <Controller
            name="counterAccountID"
            control={control}
            render={({ field }) => (
              <AccountSearchSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={isViewMode}
                error={errors.counterAccountID?.message}
              />
            )}
          />
        </div>
      </div>
    </>
  );

  const renderSettingsTab = () => (
    <>
      <SectionHeader title="خصائص الشيك" />
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
          <input
            type="checkbox"
            {...register('isNonCashable')}
            disabled={isViewMode}
          />
          <span className="text-sm">غير قابل للصرف</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
          <input
            type="checkbox"
            {...register('isBearerOnly')}
            disabled={isViewMode}
          />
          <span className="text-sm">لحامله فقط</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
          <input
            type="checkbox"
            {...register('hasAttachmentPage')}
            disabled={isViewMode}
          />
          <span className="text-sm">صفحة مرفقة</span>
        </label>
      </div>

      <SectionHeader title="ملاحظات" />
      <div>
        <FormInput
          as="textarea"
          label="ملاحظات"
          {...register('notes')}
          readOnly={isViewMode}
        />
      </div>
    </>
  );

  const renderTabContent = () => {
    if (!isTabMode) {
      return (
        <>
          {renderInfoTab()}
          {renderPartyTab()}
          {renderAccountsTab()}
          {renderSettingsTab()}
        </>
      );
    }
    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'party':
        return renderPartyTab();
      case 'accounts':
        return renderAccountsTab();
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
              disabled={isPending}
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
