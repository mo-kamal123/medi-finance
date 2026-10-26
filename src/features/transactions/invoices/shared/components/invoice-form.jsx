import React, { useEffect, useRef } from 'react';
import { Controller, useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// -- UI primitives
import FormInput from '../../../../../shared/ui/input';
import DateInput from '../../../../../shared/ui/date-input';
import NormalSelect from '../../../../../shared/ui/NormalSelect';
import PartySearchSelect from '../../../../../shared/ui/party-search-select';
import { toast } from '../../../../../shared/lib/toast';

// -- Domain logic
import { invoiceSchema } from '../validation/invoice.validation';
import {
  useNextInvoiceNumber,
  useInvoiceStatuses,
} from '../hooks/invoices.queries';
import useDropdowns from '../hooks/dropdowns';
import {
  buildInvoicePayload,
  defaultValues,
  INVOICE_STATUS_OPTIONS,
  mapInvoiceToFormValues,
} from '../utils/mapInvoiceToFormValues';
import {
  calculateTotals,
  buildStatusOptions,
  getDefaultInvoiceTypeId,
} from '../utils/invoice-form-utils';

// -- Composed sub-components
import InvoiceDetailsTable from './invoice-details-table';
import InvoiceTotals from './invoice-totals';
import InvoiceSummaryCards from './invoice-summary-cards';

// Constants

const EMPTY_INVOICE = {};
const EMPTY_STATUSES = [];

// InvoiceForm

const InvoiceForm = ({
  initialData = EMPTY_INVOICE,
  onSubmit,
  isLoading,
  invoiceType,
  onTotalsChange,
}) => {
  // Derived state
  const isEditMode = Boolean(initialData?.invoiceID);

  // Data fetching
  const { financialPeriods, invoiceTypes, productsServices } = useDropdowns();
  const { data: nextInvoiceNumberData } = useNextInvoiceNumber(!isEditMode);
  const { data: invoiceStatuses = EMPTY_STATUSES } = useInvoiceStatuses();

  // Status option mapping
  const statusOptions = buildStatusOptions(
    invoiceStatuses,
    INVOICE_STATUS_OPTIONS
  );

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: isEditMode
      ? mapInvoiceToFormValues(initialData, invoiceStatuses)
      : defaultValues,
    resolver: zodResolver(invoiceSchema),
    shouldUnregister: false,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  // Watched values & derived totals
  const watchedDetails = useWatch({ control, name: 'details' });
  const watchedDiscountAmount = useWatch({ control, name: 'discountAmount' });
  const watchedTaxAmount = useWatch({ control, name: 'taxAmount' });
  const watchedInvoiceDate = useWatch({ control, name: 'invoiceDate' });
  const watchedDueDate = useWatch({ control, name: 'dueDate' });

  const isDueBeforeIssue = Boolean(
    watchedInvoiceDate && watchedDueDate && watchedDueDate < watchedInvoiceDate
  );
  const dueDateError =
    errors.dueDate?.message ||
    (isDueBeforeIssue
      ? 'تاريخ الاستحقاق لا يمكن أن يكون قبل تاريخ الإصدار'
      : undefined);

  const { totalAmount, totalDiscounts, netAmount } = calculateTotals(
    watchedDetails,
    watchedDiscountAmount,
    watchedTaxAmount
  );

  useEffect(() => {
    if (
      !isDirty &&
      !initialData.details?.length &&
      !initialData.invoiceDetails?.length
    )
      return;
    onTotalsChange?.({
      totalAmount,
      totalDiscounts,
      netAmount,
      taxAmount: Number(watchedTaxAmount) || 0,
    });
  }, [
    onTotalsChange,
    totalAmount,
    totalDiscounts,
    netAmount,
    watchedTaxAmount,
    initialData,
    isDirty,
  ]);

  // Side-effects
  const hasSetInvoiceNumber = useRef(false);
  const nextInvoiceNumber =
    nextInvoiceNumberData?.data?.nextInvoiceNumber ??
    nextInvoiceNumberData?.nextInvoiceNumber;

  useEffect(() => {
    if (isEditMode) return;
    const defaultTypeId = getDefaultInvoiceTypeId(invoiceTypes, invoiceType);
    const period2026 = financialPeriods?.find((period) =>
      ['الفترة المالية 2026', '2026'].includes(
        String(
          period.nameAr || period.financialPeriodNameAr || period.nameEn || ''
        ).trim()
      )
    );
    setValue('invoiceTypeID', defaultTypeId);
    if (period2026 && !getValues('financialPeriodID')) {
      setValue('financialPeriodID', String(period2026.financialPeriodID));
    }
    const draftStatus = buildStatusOptions(
      invoiceStatuses,
      INVOICE_STATUS_OPTIONS
    ).find((status) => status.label === 'مسودة');
    if (draftStatus) setValue('statusId', draftStatus.value);
  }, [
    isEditMode,
    invoiceTypes,
    invoiceType,
    financialPeriods,
    invoiceStatuses,
    getValues,
    setValue,
  ]);

  /** Auto-populate the next invoice number in create mode. */
  useEffect(() => {
    if (
      !isEditMode &&
      nextInvoiceNumber != null &&
      nextInvoiceNumber !== '' &&
      !hasSetInvoiceNumber.current
    ) {
      if (!getValues('invoiceNumber')) {
        setValue('invoiceNumber', String(nextInvoiceNumber));
      }
      hasSetInvoiceNumber.current = true;
    }
  }, [isEditMode, nextInvoiceNumber, getValues, setValue]);

  /** Populate form with server data when editing. */
  useEffect(() => {
    if (isEditMode && initialData?.invoiceID) {
      reset(mapInvoiceToFormValues(initialData, invoiceStatuses));
    }
  }, [isEditMode, initialData, initialData?.invoiceID, invoiceStatuses, reset]);

  /** Clear the "other" party field when the invoice type changes. */
  useEffect(() => {
    if (!invoiceType) return;
    if (invoiceType === 'customer') setValue('supplierID', '');
    if (invoiceType === 'supplier') setValue('customerID', '');
  }, [invoiceType, setValue]);

  // Option lists
  const productOptions =
    productsServices?.map((product) => ({
      value: String(product.id ?? product.productServiceID ?? ''),
      label:
        product.name ??
        product.productServiceNameAr ??
        product.productServiceNameEn ??
        '',
    })) || [];

  // Submit handler
  const handleFormSubmit = handleSubmit(
    (data) => onSubmit(buildInvoicePayload(data, { isEditMode })),
    (validationErrors) => {
      if (!isEditMode && validationErrors.invoiceNumber) {
        toast.error('تعذر تحميل رقم الفاتورة التلقائي. أعد تحميل الصفحة وحاول مرة أخرى.');
      } else if (!isEditMode && validationErrors.invoiceTypeID) {
        toast.error('تعذر تحديد نوع الفاتورة تلقائياً. تحقق من إعدادات أنواع الفواتير.');
      } else {
        toast.error('تعذر حفظ الفاتورة. راجع الحقول المطلوبة والأخطاء الموضحة في النموذج.');
      }
    }
  );

  // JSX
  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {!isEditMode && (
        <InvoiceSummaryCards
          showPayments={false}
          totals={{
            totalAmount,
            totalDiscounts,
            netAmount,
            taxAmount: Number(watchedTaxAmount) || 0,
          }}
        />
      )}
      {/* Header fields */}
      <section
        className={
          isEditMode ? '' : 'rounded-xl border border-gray-200 bg-white p-6'
        }
      >
        {!isEditMode && (
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            بيانات الفاتورة
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isEditMode && <Controller
              name="invoiceNumber"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="رقم الفاتورة"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.invoiceNumber?.message}
                  required
                />
              )}
          />}

          {isEditMode && <Controller
              name="invoiceTypeID"
              control={control}
              render={({ field }) => (
                <NormalSelect
                  label="نوع الفاتورة"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.invoiceTypeID?.message}
                  required
                  options={[
                    { value: '', label: 'اختر' },
                    ...(invoiceTypes?.map((t) => ({
                      value: String(t.invoiceTypeID),
                      label: t.nameAr || t.invoiceTypeNameAr || t.nameEn,
                    })) || []),
                  ]}
                />
              )}
          />}

          <Controller
            name="invoiceDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="تاريخ الإصدار"
                error={errors.invoiceDate?.message}
                required
                {...field}
              />
            )}
          />
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="تاريخ الاستحقاق"
                error={dueDateError}
                required
                minDate={watchedInvoiceDate || undefined}
                {...field}
              />
            )}
          />

          {invoiceType !== 'supplier' && (
            <Controller
              name="customerID"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-[15px]">
                    العميل
                    <span className="text-red-500 mr-1"> *</span>
                  </label>
                  <PartySearchSelect
                    type="customer"
                    value={field.value ?? ''}
                    selectedOption={{
                      value: initialData.customerID,
                      label:
                        initialData.customerNameAr ||
                        initialData.customerName ||
                        initialData.customerNameEn ||
                        '',
                    }}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      if (event.target.value) {
                        setValue('supplierID', '');
                      }
                    }}
                    onBlur={field.onBlur}
                    error={errors.customerID?.message}
                    placeholder="ابحث عن عميل بالاسم"
                  />
                </div>
              )}
            />
          )}

          {invoiceType !== 'customer' && (
            <Controller
              name="supplierID"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block font-medium text-gray-700 text-[15px]">
                    المورد
                    <span className="text-red-500 mr-1"> *</span>
                  </label>
                  <PartySearchSelect
                    type="supplier"
                    value={field.value ?? ''}
                    selectedOption={{
                      value: initialData.supplierID,
                      label:
                        initialData.supplierNameAr ||
                        initialData.supplierName ||
                        initialData.supplierNameEn ||
                        '',
                    }}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      if (event.target.value) {
                        setValue('customerID', '');
                      }
                    }}
                    onBlur={field.onBlur}
                    error={errors.supplierID?.message}
                    placeholder="ابحث عن مورد بالاسم"
                  />
                </div>
              )}
            />
          )}

          <Controller
            name="taxAmount"
            control={control}
            render={({ field }) => (
              <FormInput
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                label="المبلغ الضريبي"
                value={field.value ?? ''}
                onChange={(event) => {
                  const raw = event.target.value;
                  field.onChange(
                    raw === '' ? '' : raw.replace(/^0+(?=\d)/, '')
                  );
                }}
                onFocus={(event) => event.target.select()}
                onBlur={field.onBlur}
                error={errors.taxAmount?.message}
              />
            )}
          />
          <Controller
            name="discountAmount"
            control={control}
            render={({ field }) => (
              <FormInput
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                label="الخصم"
                value={field.value ?? ''}
                onChange={(event) => {
                  const raw = event.target.value;
                  field.onChange(
                    raw === '' ? '' : raw.replace(/^0+(?=\d)/, '')
                  );
                }}
                onFocus={(event) => event.target.select()}
                onBlur={field.onBlur}
                error={errors.discountAmount?.message}
              />
            )}
          />

          <Controller
            name="financialPeriodID"
            control={control}
            render={({ field }) => (
              <NormalSelect
                label="الفترة المالية"
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.financialPeriodID?.message}
                required
                options={[
                  { value: '', label: 'اختر' },
                  ...(financialPeriods?.map((p) => ({
                    value: String(p.financialPeriodID),
                    label: p.nameAr || p.financialPeriodNameAr || p.nameEn,
                  })) || []),
                ]}
              />
            )}
          />

          {isEditMode && (
            <Controller
              name="statusId"
              control={control}
              render={({ field }) => (
                <NormalSelect
                  label="الحالة"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.statusId?.message}
                  required
                  options={[
                    { value: '', label: 'اختر' },
                    ...statusOptions.map((status) => ({
                      value: status.value,
                      label: status.label,
                    })),
                  ]}
                />
              )}
            />
          )}
        </div>
      </section>

      {/* Detail rows */}
      <section
        className={
          isEditMode ? '' : 'rounded-xl border border-gray-200 bg-white p-6'
        }
      >
        <InvoiceDetailsTable
          control={control}
          fields={fields}
          append={append}
          remove={remove}
          errors={errors}
          watchedDetails={watchedDetails}
          productOptions={productOptions}
          showTaxAndDiscount={isEditMode}
        />
      </section>

      {/* Totals & submit  */}
      <InvoiceTotals
        totalAmount={totalAmount}
        totalDiscounts={totalDiscounts}
        netAmount={netAmount}
        isLoading={isLoading}
        disabled={isDueBeforeIssue}
        showSummary={false}
      />
    </form>
  );
};

export default InvoiceForm;
