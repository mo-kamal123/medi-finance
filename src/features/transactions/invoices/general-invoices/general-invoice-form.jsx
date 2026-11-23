import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import { useAllBankAccounts } from '../../../banking/banks/hooks/banks.queries';
import { useFinancialPeriods } from '../shared/hooks/invoices.queries';
import {
  buildAllBankAccountOptions,
  normalizeCollection,
} from '../shared/utils/pay-invoice-utils';
import InvoiceSummaryCards from '../shared/components/invoice-summary-cards';
import InvoiceTotals from '../shared/components/invoice-totals';
import GeneralInvoiceDetailsTable from './general-invoice-details-table';
import { toast } from '../../../../shared/lib/toast';
import {
  buildGeneralInvoicePayload,
  calculateGeneralInvoiceTotals,
  generalInvoiceDefaults,
  generalInvoiceSchema,
} from './general-invoice-utils';

const GeneralInvoiceForm = ({
  initialData,
  onSubmit,
  isLoading,
  onTotalsChange,
}) => {
  const { data: periods = [], isError: periodsError } = useFinancialPeriods();
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAllBankAccounts();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: generalInvoiceDefaults(initialData),
    resolver: zodResolver(generalInvoiceSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });
  const details = useWatch({ control, name: 'details' });
  const paymentSource = useWatch({ control, name: 'paymentSource' });
  const totals = calculateGeneralInvoiceTotals(details);

  useEffect(() => {
    if (initialData) reset(generalInvoiceDefaults(initialData));
  }, [initialData, reset]);

  useEffect(() => {
    onTotalsChange?.({
      totalAmount: totals.totalAmount,
      taxAmount: totals.taxAmount,
      totalDiscounts: 0,
      netAmount: totals.netAmount,
    });
  }, [onTotalsChange, totals.totalAmount, totals.taxAmount, totals.netAmount]);

  const input = (name, label, props = {}) => (
    <Controller
      key={name}
      name={name}
      control={control}
      render={({ field }) => (
        <FormInput
          {...field}
          label={label}
          error={errors[name]?.message}
          {...props}
        />
      )}
    />
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(
        (data) => onSubmit(buildGeneralInvoicePayload(data)),
        () => toast.error('راجع الحقول المطلوبة والأخطاء الموضحة في النموذج.')
      )}
      className="min-w-0 space-y-6"
    >
      {!initialData && (
        <InvoiceSummaryCards showPayments={false} totals={totals} />
      )}
      <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-6 text-lg font-bold">بيانات الفاتورة العامة</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {input('invoiceNumber', 'رقم الفاتورة', {
            required: true,
            placeholder: 'EXP-2026-0001',
          })}
          <Controller
            name="invoiceDate"
            control={control}
            render={({ field }) => (
              <DateInput
                {...field}
                label="تاريخ الفاتورة"
                required
                error={errors.invoiceDate?.message}
              />
            )}
          />
          <Controller
            name="financialPeriodID"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                label="الفترة المالية"
                required
                error={
                  errors.financialPeriodID?.message ||
                  (periodsError ? 'تعذر تحميل الفترات المالية' : undefined)
                }
                options={periods.map((period) => ({
                  value: String(period.financialPeriodID),
                  label:
                    period.nameAr ||
                    period.financialPeriodNameAr ||
                    period.nameEn,
                }))}
              />
            )}
          />
          <Controller
            name="paymentSource"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                label="مصدر الدفع"
                required
                error={errors.paymentSource?.message}
                onChange={(event) => {
                  field.onChange(event);
                  if (event.target.value === 'Cash')
                    setValue('bankAccountID', '', { shouldValidate: true });
                }}
                options={[
                  { value: 'Cash', label: 'نقدي' },
                  { value: 'Bank', label: 'بنك' },
                ]}
              />
            )}
          />
          {paymentSource === 'Bank' && (
            <Controller
              name="bankAccountID"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  {...field}
                  label="حساب البنك"
                  required
                  disabled={accountsLoading}
                  error={
                    errors.bankAccountID?.message ||
                    (accountsError ? 'تعذر تحميل حسابات البنوك' : undefined)
                  }
                  options={buildAllBankAccountOptions(
                    normalizeCollection(accounts)
                  )}
                />
              )}
            />
          )}
          {input('referenceNumber', 'الرقم المرجعي')}
          {input('descriptionAr', 'الوصف', {
            as: 'textarea',
            containerClass: 'md:col-span-2',
          })}
        </div>
      </section>
      <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <GeneralInvoiceDetailsTable
          control={control}
          fields={fields}
          append={append}
          remove={remove}
          errors={errors}
          watchedDetails={details}
        />
      </section>
      <InvoiceTotals {...totals} isLoading={isLoading} showSummary={false} />
    </form>
  );
};

export default GeneralInvoiceForm;
