import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useWatch, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import Toggle from '../../../../shared/ui/toggle';
import NormalSelect from '../../../../shared/ui/NormalSelect';
import PartySearchSelect from '../../../../shared/ui/party-search-select';
import ChequeInvoiceSelector from './cheque-invoice-selector';
import PaymentChequeRows from './payment-cheque-rows';
import CostCenterSearchSelect from '../../../transactions/entries/components/cost-center-search-select';
import { emptyPaymentCheque, buildChequePayload, buildPaymentChequesPayload, totalInvoicePayments, getChequeErrorMessage, getChequeInvoiceParty } from '../utils/cheque-payload';
import { useCreateCheque } from '../hooks/cheques.mutations';
import { useChequeBanks, useChequeCurrencies, useEgyptChequeBanks } from '../hooks/cheques.queries';
import { useBankAccounts } from '../../banks/hooks/banks.queries';
import { chequeSchema, paymentChequesSchema } from '../validation/cheque.validation';

const toDateValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const getInitialValues = (defaultValues) => {
  const rawType = String(defaultValues?.transactionType ?? defaultValues?.type ?? '');
  const derivedChequeType =
    rawType === 'PAYMENT' || rawType === '1'
      ? '1'
      : rawType === 'RECEIPT' || rawType === '0'
        ? '0'
        : defaultValues?.chequeType != null
          ? String(defaultValues.chequeType)
          : '0';

  const initialParty = getChequeInvoiceParty(defaultValues, derivedChequeType);
  const initialPartyFields = initialParty ? {
    [derivedChequeType === '0' ? 'customerID' : 'supplierID']: initialParty.id,
    partyName: initialParty.name,
  } : {};
  return {
    chequeType: derivedChequeType,
    cheques: [emptyPaymentCheque()],
    chequeNumber: defaultValues?.chequeNumber ?? '',
    receiptDate: toDateValue(defaultValues?.receiptDate || defaultValues?.chequeDate),
    dueDate: toDateValue(defaultValues?.dueDate),
    voucherDate: toDateValue(defaultValues?.voucherDate),
    amount: defaultValues?.amount ?? '',
    currencyID: defaultValues?.currencyID ? String(defaultValues.currencyID) : '1',
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
    invoiceAllocationMode: 'partial',
    invoicePayments: Array.isArray(defaultValues?.invoicePayments)
      ? defaultValues.invoicePayments.map((payment) => ({ ...initialPartyFields, ...payment, invoiceID: Number(payment.invoiceID), amount: payment.amount }))
      : defaultValues?.invoiceID ? [{ ...initialPartyFields, invoiceID: Number(defaultValues.invoiceID), invoiceNumber: defaultValues.invoiceNumber, amount: defaultValues.amount }] : [],
    isNonCashable: defaultValues?.isNonCashable ?? false,
    isBearerOnly: defaultValues?.isBearerOnly ?? false,
    hasAttachmentPage: defaultValues?.hasAttachmentPage ?? false,
    beneficiaryName: defaultValues?.beneficiaryName ?? '',
    statusID: defaultValues?.statusID ? String(defaultValues.statusID) : '',
    branchName: defaultValues?.branchName ?? '',
    notes: defaultValues?.notes ?? '',
  };
};

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

const ChequeForm = ({ defaultValues, mode = 'create', onSubmit, isPending, activeTab, invoiceSelectionContainer, onBatchModeChange }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bankIdFromUrl = searchParams.get('bankId');
  const createMutation = useCreateCheque();
  const { data: banks = [] } = useChequeBanks();
  const { data: currencies = [] } = useChequeCurrencies();
  const isViewMode = mode === 'view';
  const [isResolvingInvoice, setIsResolvingInvoice] = useState(false);

  const formDefaults = useMemo(
    () => getInitialValues(defaultValues),
    [defaultValues]
  );

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: formDefaults,
    resolver: (values, context, options) => zodResolver(
      mode === 'create' && values.chequeType === '1' ? paymentChequesSchema : chequeSchema
    )(values, context, options),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const { fields: chequeFields, append: appendCheque, remove: removeCheque } = useFieldArray({ control, name: 'cheques' });
  const [selectedChequeId, setSelectedChequeId] = useState(null);
  const selectedChequeIndex = Math.max(0, chequeFields.findIndex((row) => row.id === selectedChequeId));
  const activeChequeId = chequeFields[selectedChequeIndex]?.id;
  const cheques = useWatch({ control, name: 'cheques' }) ?? [];
  const chequeType = useWatch({ control, name: 'chequeType' });
  const isBatchPayment = mode === 'create' && chequeType === '1';
  useEffect(() => {
    onBatchModeChange?.(isBatchPayment);
  }, [isBatchPayment, onBatchModeChange]);
  const customerID = useWatch({ control, name: 'customerID' });
  const supplierID = useWatch({ control, name: 'supplierID' });
  const singleInvoicePayments = useWatch({ control, name: 'invoicePayments' }) ?? [];
  const invoicePayments = isBatchPayment ? cheques[selectedChequeIndex]?.invoicePayments ?? [] : singleInvoicePayments;
  const allInvoicePayments = isBatchPayment ? cheques.flatMap((row) => row.invoicePayments ?? []) : invoicePayments;
  const partyID = chequeType === '0' ? customerID : supplierID;
  const watchedBankID = useWatch({ control, name: 'bankID' });

  const { data: bankAccountsRes = [], isLoading: loadingBankAccounts } =
    useBankAccounts(chequeType === '0' || isBatchPayment ? watchedBankID : undefined);
  const { data: egyptBanks = [], isLoading: loadingPaymentBanks, isError: paymentBanksError } =
    useEgyptChequeBanks(chequeType === '1');

  const paymentBankOptions = useMemo(() => {
    const options = egyptBanks.map((bank) => ({
      value: String(bank.bankID ?? bank.id),
      label: bank.bankNameAr || bank.bankNameEn || bank.nameAr || bank.name || String(bank.bankID ?? bank.id),
    }));
    if (defaultValues?.bankID && !options.some((option) => option.value === String(defaultValues.bankID))) {
      options.push({ value: String(defaultValues.bankID), label: defaultValues.bankNameAr || defaultValues.bankNameEn || String(defaultValues.bankID) });
    }
    return options;
  }, [egyptBanks, defaultValues]);

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
      chequeType !== '0' ||
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
  }, [bankIdFromUrl, banks, setValue, isViewMode, mode, chequeType]);

  const bankOptions = toOptions(banks, 'bankID', 'bankNameAr');
  const currencyOptions = toOptions(currencies, 'currencyID', 'currencyNameAr');

  const clearInvoicePayments = () => {
    setValue('invoicePayments', [], { shouldDirty: true, shouldValidate: true });
    createMutation.reset();
  };

  const handleInvoicePaymentsChange = (payments) => {
    setValue('invoiceAllocationMode', 'partial');
    if (payments.length) {
      const party = getChequeInvoiceParty(payments[0], chequeType);
      if (party) {
        setValue(chequeType === '0' ? 'customerID' : 'supplierID', String(party.id), { shouldDirty: true, shouldValidate: true });
        setValue(chequeType === '0' ? 'supplierID' : 'customerID', '');
        const beneficiaryField = isBatchPayment ? `cheques.${selectedChequeIndex}.beneficiaryName` : 'beneficiaryName';
        if (chequeType === '1' && !getValues(beneficiaryField)?.trim()) {
          setValue(beneficiaryField, party.name, { shouldDirty: true, shouldValidate: true });
        }
      }
      setValue('currencyID', '1', { shouldValidate: true });
      setValue('exchangeRate', 1, { shouldValidate: true });
    }
    setValue(isBatchPayment ? `cheques.${selectedChequeIndex}.invoicePayments` : 'invoicePayments', payments, { shouldDirty: true, shouldValidate: true });
    setValue(isBatchPayment ? `cheques.${selectedChequeIndex}.amount` : 'amount', payments.length ? totalInvoicePayments(payments) : '', { shouldDirty: true, shouldValidate: true });
    createMutation.reset();
  };

  const handleFormSubmit = (data) => {
    const payload = isBatchPayment ? buildPaymentChequesPayload(data) : buildChequePayload(data);
    if (onSubmit) {
      onSubmit(payload);
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/cheques') });
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
          error={opts.error ?? errors[name]?.message}
          disabled={isViewMode || opts.disabled}
          options={options}
          placeholder={opts.placeholder ?? 'اختر'}
        />
      )}
    />
  );

  const isTabMode = !!activeTab;
  const invoiceSelector = (mode === 'create' || invoicePayments.length > 0) ? (
    <div className="space-y-3">
      {isBatchPayment && <NormalSelect label="تطبيق الفواتير على الشيك" value={activeChequeId ?? ''} onChange={(event) => setSelectedChequeId(event.target.value)} options={chequeFields.map((row, index) => ({ value: row.id, label: `شيك ${index + 1}${cheques[index]?.chequeNumber ? ` - ${cheques[index].chequeNumber}` : ''}` }))} />}
    <ChequeInvoiceSelector
      key={`${chequeType}-${partyID || ''}-${isBatchPayment ? activeChequeId : ''}`}
      chequeType={chequeType}
      payments={invoicePayments}
      onChange={handleInvoicePaymentsChange}
      onLoadingChange={setIsResolvingInvoice}
      errors={isBatchPayment ? errors.cheques?.[selectedChequeIndex]?.invoicePayments : errors.invoicePayments}
      selectedPartyID={isBatchPayment ? supplierID : undefined}
      disabled={mode !== 'create'}
    />
    </div>
  ) : null;

  const renderInfoTab = () => {
    const isReceipt = chequeType === '0';
    const partyField = isReceipt ? 'customerID' : 'supplierID';
    const partyLabel = isReceipt ? 'العميل' : 'المورد';
    const defaultParty = getChequeInvoiceParty(defaultValues, chequeType);
    const selectedPartyOption = allInvoicePayments.length
      ? { value: partyID, label: allInvoicePayments[0].partyName }
      : defaultParty
        ? { value: String(defaultParty.id), label: defaultParty.name }
        : undefined;

    return (
      <div className="space-y-10">
        <div>
          <SectionHeader title="بيانات الشيك الأساسية" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!isBatchPayment && <>
            <FormInput
              label="رقم الشيك"
              required
              {...register('chequeNumber')}
              error={errors.chequeNumber?.message}
              readOnly={isViewMode}
              placeholder="أدخل رقم الشيك"
            />
            <FormInput
              type="number"
              label="القيمة"
              required
              {...register('amount')}
              error={errors.amount?.message}
              readOnly={isViewMode}
              step="0.01"
              placeholder="أدخل قيمة الشيك"
            />
            </>}
            {renderSelect('chequeType', 'نوع الشيك', [
              { value: '0', label: 'شيك قبض' },
              { value: '1', label: 'شيك صرف' },
            ], {
              required: true,
              disabled: mode !== 'create' && invoicePayments.length > 0,
              onChange: () => {
                setValue('customerID', '');
                setValue('supplierID', '');
                setValue('bankAccountID', '');
                setValue('bankID', '');
                cheques.forEach((_, index) => setValue(`cheques.${index}.invoicePayments`, []));
                clearInvoicePayments();
              },
            })}
            {isBatchPayment ? renderDate('voucherDate', 'تاريخ السند', true) : <>
              {renderDate('receiptDate', 'تاريخ الشيك', true)}
              {renderDate('dueDate', 'تاريخ الاستحقاق', true)}
            </>}
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
                  <PartySearchSelect
                    selectedOption={selectedPartyOption}
                    type={isReceipt ? 'customer' : 'supplier'}
                    value={field.value ?? ''}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      clearInvoicePayments();
                      if (isReceipt) {
                        setValue('supplierID', '');
                      } else {
                        setValue('customerID', '');
                      }
                    }}
                    error={errors[partyField]?.message}
                    disabled={isViewMode || allInvoicePayments.length > 0}
                  />
                </div>
              )}
            />
            {isReceipt || isBatchPayment ? <>
            {renderSelect('bankID', 'البنك', isBatchPayment ? paymentBankOptions : bankOptions, {
              required: true,
              placeholder: isBatchPayment && loadingPaymentBanks ? 'جاري تحميل البنوك...' : 'اختر البنك',
              disabled: isBatchPayment && (loadingPaymentBanks || paymentBanksError),
              error: isBatchPayment && paymentBanksError ? 'تعذر تحميل البنوك' : errors.bankID?.message,
              onChange: () => setValue('bankAccountID', ''),
            })}
            {renderSelect('bankAccountID', 'الحساب البنكي', bankAccountOptions, {
              required: true,
              placeholder: 'اختر الحساب البنكي',
              disabled: !watchedBankID || loadingBankAccounts,
            })}
            </> : renderSelect('bankID', 'البنك', paymentBankOptions, {
              required: true,
              placeholder: loadingPaymentBanks ? 'جاري تحميل البنوك...' : 'اختر البنك',
              disabled: loadingPaymentBanks || paymentBanksError,
              error: paymentBanksError ? 'تعذر تحميل البنوك' : errors.bankID?.message,
              onChange: () => setValue('bankAccountID', ''),
            })}
            {renderSelect('currencyID', 'العملة', currencyOptions, {
              required: isBatchPayment,
              disabled: allInvoicePayments.length > 0,
              placeholder: 'اختر العملة',
            })}
            {!isBatchPayment && <FormInput
              type="number"
              step="0.01"
              label="سعر الصرف"
              {...register('exchangeRate')}
              error={errors.exchangeRate?.message}
              readOnly={isViewMode || invoicePayments.length > 0}
              placeholder="1"
            />}
            {isBatchPayment && <Controller name="costCenterID" control={control} render={({ field }) => (
              <div>
                <label className="mb-1 block text-[15px] font-medium text-gray-700">مركز التكلفة</label>
                <CostCenterSearchSelect value={field.value} onChange={(event) => field.onChange(event.target.value)} error={errors.costCenterID?.message} />
              </div>
            )} />}
          </div>
        </div>

        {isBatchPayment || !invoiceSelectionContainer ? invoiceSelector : null}

        {isBatchPayment ? <PaymentChequeRows control={control} register={register} errors={errors} fields={chequeFields} append={appendCheque} remove={removeCheque} selectedId={activeChequeId} onSelect={setSelectedChequeId} /> : <div>
          <SectionHeader title="بيانات إضافية" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="اسم المستفيد"
              required
              {...register('beneficiaryName')}
              error={errors.beneficiaryName?.message}
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
        </div>}
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <div>
        <SectionHeader title="خصائص الشيك" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Toggle
            label="غير قابل للصرف"
            {...register('isNonCashable')}
            disabled={isViewMode}
            className="w-full rounded-lg border border-gray-200 bg-white p-3"
          />
          <Toggle
            label="لحامله فقط"
            {...register('isBearerOnly')}
            disabled={isViewMode}
            className="w-full rounded-lg border border-gray-200 bg-white p-3"
          />
          <Toggle
            label="صفحة مرفقة"
            {...register('hasAttachmentPage')}
            disabled={isViewMode}
            className="w-full rounded-lg border border-gray-200 bg-white p-3"
          />
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
    if (isBatchPayment) return renderInfoTab();
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
    <div className={isTabMode ? '' : 'p-6 bg-white rounded-xl border border-gray-200 space-y-6'}>
      {invoiceSelectionContainer && !isBatchPayment ? createPortal(invoiceSelector, invoiceSelectionContainer) : null}
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
        {createMutation.isError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{getChequeErrorMessage(createMutation.error)}</div> : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/cheques')}
            className="px-6 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            رجوع
          </button>

          {!isViewMode && (
            <button
              type="submit"
              disabled={isPending || createMutation.isPending || isResolvingInvoice}
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
