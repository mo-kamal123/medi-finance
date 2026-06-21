import React, { useEffect } from 'react';
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
  const { data: invoiceStatuses = [] } = useInvoiceStatuses();
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

  useEffect(() => {
    if (isEditMode && initialData?.invoiceID) {
      reset(mapInvoiceToFormValues(initialData, invoiceStatuses));
    } else if (!isEditMode && nextInvoiceNumberData?.nextInvoiceNumber) {
      reset({
        ...defaultValues,
        invoiceNumber: nextInvoiceNumberData.nextInvoiceNumber,
      });
    }
  }, [
    isEditMode,
    initialData,
    initialData?.invoiceID,
    nextInvoiceNumberData?.nextInvoiceNumber,
    invoiceStatuses,
    reset,
  ]);

  useEffect(() => {
    if (!invoiceType) return;

    if (invoiceType === 'customer') setValue('supplierID', '');
    if (invoiceType === 'supplier') setValue('customerID', '');
  }, [invoiceType, setValue]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(buildInvoicePayload(data, { isEditMode }));
      })}
      className="bg-white shadow-lg rounded-2xl p-8 space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="رقم الفاتورة"
          {...register('invoiceNumber')}
          error={errors.invoiceNumber?.message}
          readOnly={!isEditMode}
          className={
            !isEditMode ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
          }
        />

        <NormalSelect
          label="نوع الفاتورة"
          {...register('invoiceTypeID')}
          error={errors.invoiceTypeID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(invoiceTypes?.map((t) => ({
              value: String(t.invoiceTypeID),
              label: t.nameAr || t.invoiceTypeNameAr || t.nameEn,
            })) || []),
          ]}
        />

        <Controller
          name="invoiceDate"
          control={control}
          render={({ field }) => (
            <DateInput
              label="تاريخ الإصدار"
              error={errors.invoiceDate?.message}
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
              {...field}
            />
          )}
        />

        {invoiceType !== 'supplier' && (
          <NormalSelect
            label="العميل"
            {...register('customerID', {
              onChange: (event) => {
                if (event.target.value) {
                  setValue('supplierID', '');
                }
              },
            })}
            options={[
              { value: '', label: 'اختر' },
              ...(customers?.map((c) => ({
                value: String(c.customerID),
                label: c.customerNameAr || c.customerNameEn,
              })) || []),
            ]}
          />
        )}

        {invoiceType !== 'customer' && (
          <NormalSelect
            label="المورد"
            {...register('supplierID', {
              onChange: (event) => {
                if (event.target.value) {
                  setValue('customerID', '');
                }
              },
            })}
            options={[
              { value: '', label: 'اختر' },
              ...(suppliers?.map((s) => ({
                value: String(s.supplierID),
                label: s.supplierNameAr || s.supplierNameEn,
              })) || []),
            ]}
          />
        )}

        <FormInput
          type="number"
          label="المبلغ الضريبي"
          {...register('taxAmount', { valueAsNumber: true })}
        />
        <FormInput
          type="number"
          label="المبلغ الخصم"
          {...register('discountAmount', { valueAsNumber: true })}
        />

        <NormalSelect
          label="الفترة المالية"
          {...register('financialPeriodID')}
          options={[
            { value: '', label: 'اختر' },
            ...(financialPeriods?.map((p) => ({
              value: String(p.financialPeriodID),
              label: p.nameAr || p.financialPeriodNameAr || p.nameEn,
            })) || []),
          ]}
        />

        <NormalSelect
          label="الحالة"
          {...register('statusId')}
          options={[
            { value: '', label: 'اختر' },
            ...statusOptions.map((status) => ({
              value: status.value,
              label: status.label,
            })),
          ]}
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
                    <SearchableSelect
                      {...register(`details.${index}.productServiceID`, {
                        valueAsNumber: true,
                      })}
                      options={
                        productsServices?.map((product) => ({
                          value: product.id ?? product.productServiceID,
                          label:
                            product.name ??
                            product.productServiceNameAr ??
                            product.productServiceNameEn,
                        })) || []
                      }
                    />
                  </DetailField>

                  <DetailField
                    label="الكمية"
                    error={detailErrors?.quantity?.message}
                  >
                    <input
                      type="number"
                      {...register(`details.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField
                    label="سعر الوحدة"
                    error={detailErrors?.unitPrice?.message}
                  >
                    <input
                      type="number"
                      {...register(`details.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField
                    label="خصم %"
                    error={detailErrors?.discountPercentage?.message}
                  >
                    <input
                      type="number"
                      {...register(`details.${index}.discountPercentage`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>

                  <DetailField
                    label="ضريبة %"
                    error={detailErrors?.taxPercentage?.message}
                  >
                    <input
                      type="number"
                      {...register(`details.${index}.taxPercentage`, {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </DetailField>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden max-w-full overflow-x-auto lg:block">
          <table className="min-w-max overflow-hidden rounded-lg border border-gray-200 text-sm">
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
                      <SearchableSelect
                        {...register(`details.${index}.productServiceID`, {
                          valueAsNumber: true,
                        })}
                        options={
                          productsServices?.map((product) => ({
                            value: product.id ?? product.productServiceID,
                            label:
                              product.name ??
                              product.productServiceNameAr ??
                              product.productServiceNameEn,
                          })) || []
                        }
                      />
                      {detailErrors?.productServiceID?.message ? (
                        <p className="mt-1 text-sm text-red-500">
                          {detailErrors.productServiceID.message}
                        </p>
                      ) : null}
                    </td>

                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        {...register(`details.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>

                    <td className="min-w-[140px] p-2">
                      <input
                        type="number"
                        {...register(`details.${index}.unitPrice`, {
                          valueAsNumber: true,
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>

                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        {...register(`details.${index}.discountPercentage`, {
                          valueAsNumber: true,
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>

                    <td className="min-w-[120px] p-2">
                      <input
                        type="number"
                        {...register(`details.${index}.taxPercentage`, {
                          valueAsNumber: true,
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </td>

                    <td className="min-w-[140px] p-3 font-semibold text-gray-700">
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
