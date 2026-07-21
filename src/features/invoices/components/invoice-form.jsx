import React, { useEffect, useRef } from 'react';
import { Controller, useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import DateInput from '../../../shared/ui/date-input';
import { invoiceSchema } from '../validation/invoice.validation';
import { useNextInvoiceNumber, useInvoiceStatuses } from '../hooks/invoices.queries';
import {
  buildInvoicePayload,
  createEmptyDetail,
  defaultValues,
  INVOICE_STATUS_OPTIONS,
  mapInvoiceToFormValues,
} from '../utils/mapInvoiceToFormValues';
import useDropdowns from '../hooks/dropdowns';
import NormalSelect from '../../../shared/ui/NormalSelect';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { formatCurrency } from '../utils/format-currency';

const DetailField = ({ label, children, error }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error ? <p className="text-sm text-red-500">{error}</p> : null}
  </div>
);

const EMPTY_INVOICE = {};
const EMPTY_STATUSES = [];

const InvoiceForm = ({
  initialData = EMPTY_INVOICE,
  onSubmit,
  isLoading,
  invoiceType,
}) => {
  const isEditMode = Boolean(initialData?.invoiceID);
  const {
    customers,
    financialPeriods,
    invoiceTypes,
    productsServices,
    suppliers,
  } = useDropdowns();
  const { data: nextInvoiceNumberData } = useNextInvoiceNumber(!isEditMode);
  const { data: invoiceStatuses = EMPTY_STATUSES } = useInvoiceStatuses();
  const statusOptions =
    invoiceStatuses.length > 0
      ? invoiceStatuses.map((status) => ({
          value: String(status.id ?? status.statusId),
          label: status.nameAr ?? status.name ?? status.nameEn,
        }))
      : INVOICE_STATUS_OPTIONS;
  const {
    register,
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
  const watchedDetails = useWatch({ control, name: 'details' });
  const watchedDiscountAmount = useWatch({ control, name: 'discountAmount' });
  const watchedTaxAmount = useWatch({ control, name: 'taxAmount' });

  const totalAmount = (watchedDetails || []).reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);

  const detailsDiscounts = (watchedDetails || []).reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    const discountPercentage = Number(item?.discountPercentage) || 0;
    return sum + (quantity * unitPrice * discountPercentage) / 100;
  }, 0);

  const formDiscountAmount = Number(watchedDiscountAmount) || 0;
  const totalDiscounts = detailsDiscounts + formDiscountAmount;
  const taxAmount = Number(watchedTaxAmount) || 0;
  const netAmount = Math.max(totalAmount - totalDiscounts + taxAmount, 0);

  const hasSetInvoiceNumber = useRef(false);

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

  useEffect(() => {
    if (isEditMode && initialData?.invoiceID) {
      reset(mapInvoiceToFormValues(initialData, invoiceStatuses));
    }
  }, [isEditMode, initialData, initialData?.invoiceID, invoiceStatuses, reset]);

  useEffect(() => {
    if (!invoiceType) return;

    if (invoiceType === 'customer') setValue('supplierID', '');
    if (invoiceType === 'supplier') setValue('customerID', '');
  }, [invoiceType, setValue]);

  const productOptions =
    productsServices?.map((product) => ({
      value: String(product.id ?? product.productServiceID ?? ''),
      label:
        product.name ??
        product.productServiceNameAr ??
        product.productServiceNameEn ??
        '',
    })) || [];

  const renderDetailNumberInput = (name, index) => (
    <Controller
      name={`details.${index}.${name}`}
      control={control}
      render={({ field }) => (
        <input
          type="number"
          min="0"
          step="any"
          value={field.value ?? ''}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        />
      )}
    />
  );

  const renderProductSelect = (index) => (
    <Controller
      name={`details.${index}.productServiceID`}
      control={control}
      render={({ field }) => (
        <SearchableSelect
          value={field.value ?? ''}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
          options={productOptions}
        />
      )}
    />
  );

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(buildInvoicePayload(data, { isEditMode }));
      })}
      className="bg-white shadow-lg rounded-2xl p-8 space-y-8"
    >
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

      {isEditMode && initialData?.invoiceID ? (
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">الإجمالي</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(initialData.totalAmount ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">الصافي</p>
            <p className="font-semibold text-primary">
              {formatCurrency(initialData.netAmount ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">المدفوع</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(initialData.paidAmount ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">المتبقي</p>
            <p className="font-semibold text-red-600">
              {formatCurrency(initialData.remainingAmount ?? 0)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            تفاصيل الخدمات
          </h2>

          <button
            type="button"
            onClick={() => append(createEmptyDetail())}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
          >
            <Plus size={16} />
            إضافة خدمة
          </button>
        </div>

        <div className="space-y-4 lg:hidden">
          {fields.map((field, index) => {
            const detailErrors = errors?.details?.[index] || {};

            return (
              <div
                key={field.id}
                className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {`الخدمة ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailField
                    label="الخدمة"
                    error={detailErrors?.productServiceID?.message}
                  >
                    {renderProductSelect(index)}
                  </DetailField>

                  <DetailField
                    label="الكمية"
                    error={detailErrors?.quantity?.message}
                  >
                    {renderDetailNumberInput('quantity', index)}
                  </DetailField>

                  <DetailField
                    label="سعر الوحدة"
                    error={detailErrors?.unitPrice?.message}
                  >
                    {renderDetailNumberInput('unitPrice', index)}
                  </DetailField>

                  <DetailField
                    label="خصم %"
                    error={detailErrors?.discountPercentage?.message}
                  >
                    {renderDetailNumberInput('discountPercentage', index)}
                  </DetailField>

                  <DetailField
                    label="ضريبة %"
                    error={detailErrors?.taxPercentage?.message}
                  >
                    {renderDetailNumberInput('taxPercentage', index)}
                  </DetailField>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden max-w-full overflow-x-auto lg:block">
          <table className="w-full overflow-hidden rounded-lg border border-gray-200 text-sm">
            <thead className="bg-primary/90 text-white">
              <tr>
                <th className="p-3 text-right">الخدمة</th>
                <th className="p-3 text-right">الكمية</th>
                <th className="p-3 text-right">سعر الوحدة</th>
                <th className="p-3 text-right">خصم %</th>
                <th className="p-3 text-right">ضريبة %</th>
                <th className="p-3 text-right">الإجمالي</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const detailErrors = errors?.details?.[index] || {};
                const row = watchedDetails?.[index] || {};
                const quantity = Number(row.quantity) || 0;
                const unitPrice = Number(row.unitPrice) || 0;
                const discountPercentage = Number(row.discountPercentage) || 0;
                const taxPercentage = Number(row.taxPercentage) || 0;
                const gross = quantity * unitPrice;
                const discount = (gross * discountPercentage) / 100;
                const tax = ((gross - discount) * taxPercentage) / 100;
                const rowTotal = gross - discount + tax;

                return (
                  <tr key={field.id} className="align-top border border-gray-200">
                    <td className="min-w-[260px] p-2">
                      {renderProductSelect(index)}
                      {detailErrors?.productServiceID?.message ? (
                        <p className="mt-1 text-sm text-red-500">
                          {detailErrors.productServiceID.message}
                        </p>
                      ) : null}
                    </td>

                    <td className="min-w-30 p-2">
                      {renderDetailNumberInput('quantity', index)}
                      {detailErrors?.quantity?.message ? (
                        <p className="mt-1 text-xs text-red-500">
                          {detailErrors.quantity.message}
                        </p>
                      ) : null}
                    </td>

                    <td className="min-w-30 p-2">
                      {renderDetailNumberInput('unitPrice', index)}
                      {detailErrors?.unitPrice?.message ? (
                        <p className="mt-1 text-xs text-red-500">
                          {detailErrors.unitPrice.message}
                        </p>
                      ) : null}
                    </td>

                    <td className="min-w-30 p-2">
                      {renderDetailNumberInput('discountPercentage', index)}
                      {detailErrors?.discountPercentage?.message ? (
                        <p className="mt-1 text-xs text-red-500">
                          {detailErrors.discountPercentage.message}
                        </p>
                      ) : null}
                    </td>

                    <td className="min-w-30 p-2">
                      {renderDetailNumberInput('taxPercentage', index)}
                      {detailErrors?.taxPercentage?.message ? (
                        <p className="mt-1 text-xs text-red-500">
                          {detailErrors.taxPercentage.message}
                        </p>
                      ) : null}
                    </td>

                    <td className="min-w-30 p-3 font-semibold text-gray-700">
                      {formatCurrency(rowTotal)}
                    </td>

                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">إجمالي الفاتورة</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">إجمالي الخصومات</p>
            <p className="mt-2 text-lg font-semibold text-red-500">
              {formatCurrency(totalDiscounts)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">صافي الفاتورة</p>
            <p className="mt-2 text-lg font-semibold text-primary">
              {formatCurrency(netAmount)}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
          >
            حفظ الفاتورة
          </button>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
