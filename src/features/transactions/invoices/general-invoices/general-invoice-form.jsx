import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import DateInput from '../../../../shared/ui/date-input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import AccountSearchSelect from '../../entries/components/account-search-select';
import { useAllBankAccounts } from '../../../banking/banks/hooks/banks.queries';
import { useFinancialPeriods } from '../shared/hooks/invoices.queries';
import {
  buildAllBankAccountOptions,
  normalizeCollection,
} from '../shared/utils/pay-invoice-utils';
import InvoiceSummaryCards from '../shared/components/invoice-summary-cards';
import InvoiceTotals from '../shared/components/invoice-totals';
import { toast } from '../../../../shared/lib/toast';
import {
  buildGeneralInvoicePayload,
  calculateGeneralInvoiceTotals,
  emptyGeneralDetail,
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
      className="space-y-6"
    >
      {!initialData && (
        <InvoiceSummaryCards showPayments={false} totals={totals} />
      )}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
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
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">بنود الفاتورة</h2>
          <button
            type="button"
            onClick={() => append(emptyGeneralDetail())}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-primary"
          >
            <Plus size={16} />
            إضافة بند
          </button>
        </div>
        {errors.details?.root?.message && (
          <p className="text-sm text-red-500">{errors.details.root.message}</p>
        )}
        {fields.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-1 items-start gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2 xl:grid-cols-5"
          >
            <Controller
              name={`details.${index}.accountID`}
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block font-medium text-gray-700">
                    الحساب <span className="text-red-500">*</span>
                  </label>
                  <AccountSearchSelect
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.details?.[index]?.accountID?.message}
                  />
                </div>
              )}
            />
            {[
              [
                'amount',
                'المبلغ',
                { type: 'number', min: '0', step: 'any', required: true },
              ],
              [
                'taxPercentage',
                'نسبة الضريبة %',
                {
                  type: 'number',
                  min: '0',
                  max: '100',
                  step: 'any',
                  required: true,
                },
              ],
              ['descriptionAr', 'الوصف', {}],
            ].map(([name, label, props]) => (
              <Controller
                key={name}
                name={`details.${index}.${name}`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    label={label}
                    error={errors.details?.[index]?.[name]?.message}
                    {...props}
                  />
                )}
              />
            ))}
            <button
              type="button"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
              aria-label={`حذف البند ${index + 1}`}
              className="mt-6 justify-self-end rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </section>
      <InvoiceTotals {...totals} isLoading={isLoading} showSummary={false} />
    </form>
  );
};

export default GeneralInvoiceForm;
