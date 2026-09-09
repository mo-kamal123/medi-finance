import React, { useEffect, useRef } from 'react';
import { Controller, useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// -- UI primitives 
import FormInput from '../../../../../shared/ui/input';
import DateInput from '../../../../../shared/ui/date-input';
import NormalSelect from '../../../../../shared/ui/NormalSelect';

// -- Domain logic 
import { invoiceSchema } from '../validation/invoice.validation';
import { useNextInvoiceNumber, useInvoiceStatuses } from '../hooks/invoices.queries';
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
} from '../utils/invoice-form-utils';

// -- Composed sub-components 
import InvoiceSummaryCards from './invoice-summary-cards';
import InvoiceDetailsTable from './invoice-details-table';
import InvoiceTotals from './invoice-totals';

// Constants

const EMPTY_INVOICE = {};
const EMPTY_STATUSES = [];

// InvoiceForm

const InvoiceForm = ({
  initialData = EMPTY_INVOICE,
  onSubmit,
  isLoading,
  invoiceType,
}) => {
  // Derived state
  const isEditMode = Boolean(initialData?.invoiceID);

  // Data fetching
  const {
    customers,
    financialPeriods,
    invoiceTypes,
    productsServices,
    suppliers,
  } = useDropdowns();
  const { data: nextInvoiceNumberData } = useNextInvoiceNumber(!isEditMode);
  const { data: invoiceStatuses = EMPTY_STATUSES } = useInvoiceStatuses();

  // Status option mapping
  const statusOptions = buildStatusOptions(invoiceStatuses, INVOICE_STATUS_OPTIONS);

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues,
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

  const { totalAmount, totalDiscounts, netAmount } = calculateTotals(
    watchedDetails,
    watchedDiscountAmount,
    watchedTaxAmount,
  );

  // Side-effects
  const hasSetInvoiceNumber = useRef(false);

  /** Auto-populate the next invoice number in create mode. */
  useEffect(() => {
    if (
      !isEditMode &&
      nextInvoiceNumberData?.nextInvoiceNumber &&
      !hasSetInvoiceNumber.current
    ) {
      setValue('invoiceNumber', nextInvoiceNumberData.nextInvoiceNumber);
      hasSetInvoiceNumber.current = true;
    }
  }, [isEditMode, nextInvoiceNumberData?.nextInvoiceNumber, setValue]);

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
  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(buildInvoicePayload(data, { isEditMode }));
  });

  // JSX
  return (
    <form
      onSubmit={handleFormSubmit}
      className="bg-white shadow-lg rounded-2xl p-8 space-y-8"
    >
      {/* Header fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="invoiceNumber"
          control={control}
          render={({ field }) => (
            <FormInput
              label="رقم الفاتورة"
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.invoiceNumber?.message}
              readOnly={!isEditMode}
              required
              className={
                !isEditMode ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
              }
            />
          )}
        />

        <Controller
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
        />

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
              error={errors.dueDate?.message}
              required
              {...field}
            />
          )}
        />

        {invoiceType !== 'supplier' && (
          <Controller
            name="customerID"
            control={control}
            render={({ field }) => (
              <NormalSelect
                label="العميل"
                value={field.value ?? ''}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  if (event.target.value) {
                    setValue('supplierID', '');
                  }
                }}
                onBlur={field.onBlur}
                error={errors.customerID?.message}
                required
                options={[
                  { value: '', label: 'اختر' },
                  ...(customers?.map((c) => ({
                    value: String(c.customerID),
                    label: c.customerNameAr || c.customerNameEn,
                  })) || []),
                ]}
              />
            )}
          />
        )}

        {invoiceType !== 'customer' && (
          <Controller
            name="supplierID"
            control={control}
            render={({ field }) => (
              <NormalSelect
                label="المورد"
                value={field.value ?? ''}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  if (event.target.value) {
                    setValue('customerID', '');
                  }
                }}
                onBlur={field.onBlur}
                error={errors.supplierID?.message}
                required
                options={[
                  { value: '', label: 'اختر' },
                  ...(suppliers?.map((s) => ({
                    value: String(s.supplierID),
                    label: s.supplierNameAr || s.supplierNameEn,
                  })) || []),
                ]}
              />
            )}
          />
        )}

        <Controller
          name="taxAmount"
          control={control}
          render={({ field }) => (
            <FormInput
              type="number"
              label="المبلغ الضريبي"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
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
              label="المبلغ الخصم"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
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
      </div>

      {/* Summary cards (edit mode only)*/}
      {isEditMode && <InvoiceSummaryCards invoice={initialData} />}

      {/* Detail rows */}
      <InvoiceDetailsTable
        control={control}
        fields={fields}
        append={append}
        remove={remove}
        errors={errors}
        watchedDetails={watchedDetails}
        productOptions={productOptions}
      />

      {/* Totals & submit  */}
      <InvoiceTotals
        totalAmount={totalAmount}
        totalDiscounts={totalDiscounts}
        netAmount={netAmount}
        isLoading={isLoading}
      />
    </form>
  );
};

export default InvoiceForm;
