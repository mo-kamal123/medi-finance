import React, { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import { invoiceSchema } from '../validation/invoice.validation';
import { useNextInvoiceNumber } from '../hooks/invoices.queries';
import { createEmptyDetail, mapInvoiceToFormValues, defaultValues } from '../utils/mapInvoiceToFormValues';
import useDropdowns from '../hooks/dropdowns';
import NormalSelect from '../../../shared/ui/NormalSelect';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { formatCurrency } from '../utils/format-currency';

const InvoiceForm = ({ initialData = {}, onSubmit, isLoading, invoiceType }) => {
  const isEditMode = Boolean(initialData?.invoiceID);
  const {
    customers,
    financialPeriods,
    invoiceTypes,
    productsServices,
    suppliers,
  } = useDropdowns();
  const { data: nextInvoiceNumberData } = useNextInvoiceNumber(!isEditMode);
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
      reset(mapInvoiceToFormValues(initialData));
    } else if (!isEditMode && nextInvoiceNumberData?.nextInvoiceNumber) {
      reset({
        ...defaultValues,
        invoiceNumber: nextInvoiceNumberData.nextInvoiceNumber,
      });
    }
  }, [
    isEditMode,
    initialData?.invoiceID,
    nextInvoiceNumberData?.nextInvoiceNumber,
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
        const payload = {
          invoiceNumber: data.invoiceNumber,
          invoiceDate: new Date(data.invoiceDate).toISOString(),
          dueDate: new Date(data.dueDate).toISOString(),
          invoiceTypeID: Number(data.invoiceTypeID),
          customerID: Number(data.customerID) || null,
          supplierID: Number(data.supplierID) || null,
          taxAmount: Number(data.taxAmount),
          discountAmount: Number(data.discountAmount),
          financialPeriodID: Number(data.financialPeriodID),
          status: data.status,
          details: data.details.map((item) => ({
            productServiceID: Number(item.productServiceID),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            discountPercentage: Number(item.discountPercentage),
            taxPercentage: Number(item.taxPercentage),
          })),
        };

        if (!isEditMode) payload.createdBy = 'ms';

        onSubmit(payload);
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

        <FormInput
          type="date"
          label="تاريخ الإصدار"
          {...register('invoiceDate')}
          error={errors.invoiceDate?.message}
        />
        <FormInput
          type="date"
          label="تاريخ الاستحقاق"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />

        {invoiceType !== 'supplier' && (
          <NormalSelect
            label="العميل"
            {...register('customerID')}
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
            {...register('supplierID')}
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
          {...register('status')}
          options={[
            { value: 'Posted', label: 'قيد الانتظار' },
            { value: 'paid', label: 'مدفوعة' },
            { value: 'overdue', label: 'متأخرة' },
          ]}
        />
      </div>

      <div className="space-y-4 w-full overflow-x-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            تفاصيل الخدمات
          </h2>

          <button
            type="button"
            onClick={() => append(createEmptyDetail())}
            className="flex items-center gap-2 text-white bg-primary hover:bg-primary/90 px-3 py-1 rounded-lg transition"
          >
            <Plus size={16} />
            إضافة خدمة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-8 gap-3 font-semibold text-gray-700 px-4 py-2 bg-gray-200 rounded-xl">
          <span>الخدمه</span>
          <span>نوع الخدمه</span>
          <span>التاريخ</span>
          <span>الكمية</span>
          <span>سعر الوحدة</span>
          <span>خصم %</span>
          <span>ضريبة %</span>
          <span>حذف</span>
        </div>

        {fields.map((field, index) => {
          const detailErrors = errors?.details?.[index] || {};

          return (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-9 gap-3 items-end border border-gray-300 rounded-xl p-4 bg-gray-50"
            >
              <div className="flex flex-col">
                <SearchableSelect
                  {...register(`details.${index}.productServiceID`, {
                    valueAsNumber: true,
                  })}
                  className="input-modern"
                  options={
                    productsServices?.map((product) => ({
                      value: product.id,
                      label: product.name,
                    })) || []
                  }
                />
                {detailErrors?.productServiceID?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {detailErrors.productServiceID.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <SearchableSelect
                  {...register(`details.${index}.ServiceTypeID`, {
                    valueAsNumber: true,
                  })}
                  className="input-modern"
                  options={
                    productsServices?.map((product) => ({
                      value: product.id,
                      label: product.name,
                    })) || []
                  }
                />
                {detailErrors?.serviceTypeID?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {detailErrors.serviceTypeID.message}
                  </p>
                )}
              </div>

              <input
                type="date"
                {...register(`details.${index}.quantity`, {
                  valueAsNumber: true,
                })}
                className="input-modern"
              />

              <input
                type="number"
                {...register(`details.${index}.quantity`, {
                  valueAsNumber: true,
                })}
                className="input-modern"
              />
              <input
                type="number"
                {...register(`details.${index}.quantity`, {
                  valueAsNumber: true,
                })}
                className="input-modern"
              />
              <input
                type="number"
                {...register(`details.${index}.unitPrice`, {
                  valueAsNumber: true,
                })}
                className="input-modern"
              />
              <input
                type="number"
                {...register(`details.${index}.discountPercentage`, {
                  valueAsNumber: true,
                })}
                className="input-modern"
              />
              <input
                type="number"
                {...register(`details.${index}.taxPercentage`, {
                  valueAsNumber: true,
                })}
                className="input-modern"
              />

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
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
