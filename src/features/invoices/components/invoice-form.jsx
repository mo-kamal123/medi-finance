import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import { invoiceSchema } from '../validation/invoice.validation';
import {
  useInvoiceTypes,
  useCustomers,
  useSuppliers,
  useFinancialPeriods,
  useNextInvoiceNumber,
} from '../hooks/invoices.queries';

const PRODUCT_SERVICE_OPTIONS = [
  { id: 12, code: '0022', name: 'werw' },
  { id: 11, code: '3434', name: 'wewr' },
  { id: 6, code: '0013', name: 'ادوية و حقن' },
  { id: 3, code: '0012', name: 'اقامة مستشفيات' },
  { id: 1, code: '0011', name: 'تحاليل و اشعة' },
  { id: 7, code: '777', name: 'قفغقفغق' },
];

const EMPTY_INITIAL_DATA = Object.freeze({});

const createEmptyDetail = () => ({
  productServiceID: '',
  quantity: 1,
  unitPrice: 0,
  discountPercentage: 0,
  taxPercentage: 0,
});

const defaultValues = {
  invoiceNumber: '',
  invoiceDate: '',
  dueDate: '',
  invoiceTypeID: '',
  customerID: '',
  supplierID: '',
  taxAmount: 0,
  discountAmount: 0,
  financialPeriodID: '',
  status: 'Posted',
  details: [createEmptyDetail()],
};

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const mapInvoiceToFormValues = (invoice) => {
  if (!invoice || Object.keys(invoice).length === 0) {
    return defaultValues;
  }

  return {
    invoiceNumber: invoice.invoiceNumber || '',
    invoiceDate: toDateInputValue(invoice.invoiceDate),
    dueDate: toDateInputValue(invoice.dueDate),
    invoiceTypeID: invoice.invoiceTypeID ? String(invoice.invoiceTypeID) : '',
    customerID: invoice.customerID ? String(invoice.customerID) : '',
    supplierID: invoice.supplierID ? String(invoice.supplierID) : '',
    taxAmount: invoice.taxAmount ?? 0,
    discountAmount: invoice.discountAmount ?? 0,
    financialPeriodID: invoice.financialPeriodID
      ? String(invoice.financialPeriodID)
      : '',
    status: invoice.status || 'Posted',
    details:
      invoice.invoiceDetails?.length > 0
        ? invoice.invoiceDetails.map((item) => ({
            productServiceID: item.productServiceID
              ? String(item.productServiceID)
              : '',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            discountPercentage: item.discountPercentage ?? 0,
            taxPercentage: item.taxPercentage ?? 0,
          }))
        : invoice.details?.length > 0
          ? invoice.details.map((item) => ({
              productServiceID: item.productServiceID
                ? String(item.productServiceID)
                : '',
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice ?? 0,
              discountPercentage: item.discountPercentage ?? 0,
              taxPercentage: item.taxPercentage ?? 0,
            }))
          : [createEmptyDetail()],
  };
};

const InvoiceForm = ({
  initialData = EMPTY_INITIAL_DATA,
  onSubmit,
  isLoading,
  invoiceType,
}) => {
  const isEditMode = Boolean(initialData?.invoiceID);
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();
  const { data: financialPeriods } = useFinancialPeriods();
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

  useEffect(() => {
    reset(mapInvoiceToFormValues(initialData));
  }, [initialData, reset]);

  useEffect(() => {
    if (!isEditMode && nextInvoiceNumberData?.nextInvoiceNumber) {
      setValue('invoiceNumber', nextInvoiceNumberData.nextInvoiceNumber, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [isEditMode, nextInvoiceNumberData, setValue]);

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

      <div className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 font-semibold text-gray-700 px-4 py-2 bg-gray-200 rounded-xl">
          <span>معرف المنتج</span>
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
              className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border border-gray-300 rounded-xl p-4 bg-gray-50"
            >
              <div className="flex flex-col">
                <select
                  {...register(`details.${index}.productServiceID`, {
                    valueAsNumber: true,
                  })}
                  className="input-modern"
                >
                  <option value="">اختر</option>
                  {PRODUCT_SERVICE_OPTIONS.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {detailErrors?.productServiceID?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {detailErrors.productServiceID.message}
                  </p>
                )}
              </div>

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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
        >
          حفظ الفاتورة
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;

const NormalSelect = React.forwardRef(
  ({ label, options, error, ...rest }, ref) => (
    <div className="w-full flex flex-col mb-4">
      <label className="mb-1 text-gray-700 font-medium">{label}</label>
      <select
        ref={ref}
        {...rest}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  )
);
