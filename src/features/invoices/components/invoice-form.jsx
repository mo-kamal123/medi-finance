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
} from '../hooks/invoices.queries';
import useAccountsTree from '../../tree/accouts-tree/hooks/use-accounts-tree';

const InvoiceForm = ({ initialData = {}, onSubmit, isLoading, invoiceType }) => {
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();
  const { data: accounts = [] } = useAccountsTree();
  const { data: financialPeriods } = useFinancialPeriods();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoiceNumber: '',
      invoiceDate: '',
      dueDate: '',
      invoiceTypeID: '',
      customerID: '',
      supplierID: '',
      taxAmount: 0,
      discountAmount: 0,
      financialPeriodID: '',
      debtorAccountID: '',
      creditorAccountID: '',
      taxAccountID: '',
      discountAccountID: '',
      cashAccountID: '',
      // Must match `invoice.validation.js` enum: pending | paid | overdue
      status: 'pending',
      details: [
        {
          productServiceID: '',
          quantity: 1,
          unitPrice: 0,
          discountPercentage: 0,
          taxPercentage: 0,
        },
      ],
      ...initialData,
    },
    resolver: zodResolver(invoiceSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  // ✅ populate edit data
  useEffect(() => {
    if (
      initialData &&
      invoiceTypes &&
      customers &&
      suppliers &&
      accounts &&
      financialPeriods
    ) {
      Object.keys(initialData).forEach((key) => {
        setValue(key, initialData[key] ?? '');
      });
    }
  }, [
    initialData,
    invoiceTypes,
    customers,
    suppliers,
    accounts,
    financialPeriods,
  ]);

  // When creating a "customer" vs "supplier" invoice, clear the irrelevant party id.
  // (For edit flow, `invoiceType` is usually not provided, so we keep existing values.)
  useEffect(() => {
    if (!invoiceType) return;

    if (invoiceType === 'customer') {
      setValue('supplierID', '');
    }

    if (invoiceType === 'supplier') {
      setValue('customerID', '');
    }
  }, [invoiceType, setValue]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const payload = {
          ...data,
          createdBy: 'ms',

          invoiceDate: new Date(data.invoiceDate).toISOString(),
          dueDate: new Date(data.dueDate).toISOString(),

          customerID: Number(data.customerID) || null,
          supplierID: Number(data.supplierID) || null,
          cashAccountID: data.cashAccountID || null,
          debtorAccountID: data.debtorAccountID || null,
          creditorAccountID: data.creditorAccountID || null,
          taxAccountID: data.taxAccountID || null,
          discountAccountID: data.discountAccountID || null,

          invoiceTypeID: Number(data.invoiceTypeID),
          financialPeriodID: Number(data.financialPeriodID),

          details: data.details.map((item) => ({
            productServiceID: Number(item.productServiceID),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            discountPercentage: Number(item.discountPercentage),
            taxPercentage: Number(item.taxPercentage),
          })),
        };
        onSubmit(payload);
      })}
      className="bg-white shadow-lg rounded-2xl p-8 space-y-8"
    >
      {/* Main Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FormInput
          label="رقم الفاتورة"
          {...register('invoiceNumber')}
          error={errors.invoiceNumber?.message}
        />

        <NormalSelect
          label="نوع الفاتورة"
          {...register('invoiceTypeID')}
          error={errors.invoiceTypeID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(invoiceTypes?.map((t) => ({
              value: t.invoiceTypeID,
              label: t.nameAr,
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
            error={errors.customerID?.message}
            options={[
              { value: '', label: 'اختر' },
              ...(customers?.map((c) => ({
                value: Number(c.customerID),
                label: c.customerNameAr,
              })) || []),
            ]}
          />
        )}

        {invoiceType !== 'customer' && (
          <NormalSelect
            label="المورد"
            {...register('supplierID')}
            error={errors.supplierID?.message}
            options={[
              { value: '', label: 'اختر' },
              ...(suppliers?.map((s) => ({
                value: Number(s.supplierID),
                label: s.supplierNameAr,
              })) || []),
            ]}
          />
        )}

        <NormalSelect
          label="حساب النقدية"
          {...register('cashAccountID')}
          error={errors.cashAccountID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(accounts?.map((a) => ({
              value: a.accountID,
              label: a.nameAr,
            })) || []),
          ]}
        />

        <FormInput
          type="number"
          label="المبلغ الضريبي"
          {...register('taxAmount', { valueAsNumber: true })}
          error={errors.taxAmount?.message}
        />

        <FormInput
          type="number"
          label="المبلغ الخصم"
          {...register('discountAmount', { valueAsNumber: true })}
          error={errors.discountAmount?.message}
        />

        <NormalSelect
          label="الفترة المالية"
          {...register('financialPeriodID')}
          error={errors.financialPeriodID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(financialPeriods?.map((p) => ({
              value: p.financialPeriodID,
              label: p.nameAr,
            })) || []),
          ]}
        />

        <NormalSelect
          label="حساب المدين"
          {...register('debtorAccountID')}
          error={errors.debtorAccountID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(accounts?.map((a) => ({
              value: a.accountID,
              label: a.nameAr,
            })) || []),
          ]}
        />

        <NormalSelect
          label="حساب الدائن"
          {...register('creditorAccountID')}
          error={errors.creditorAccountID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(accounts?.map((a) => ({
              value: a.accountID,
              label: a.nameAr,
            })) || []),
          ]}
        />

        <NormalSelect
          label="حساب الضريبة"
          {...register('taxAccountID')}
          error={errors.taxAccountID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(accounts?.map((a) => ({
              value: a.accountID,
              label: a.nameAr,
            })) || []),
          ]}
        />

        <NormalSelect
          label="حساب الخصم"
          {...register('discountAccountID')}
          error={errors.discountAccountID?.message}
          options={[
            { value: '', label: 'اختر' },
            ...(accounts?.map((a) => ({
              value: a.accountID,
              label: a.nameAr,
            })) || []),
          ]}
        />

        <NormalSelect
          label="الحالة"
          {...register('status')}
          error={errors.status?.message}
          options={[
            { value: 'Posted', label: 'قيد الانتظار' },
            { value: 'paid', label: 'مدفوعة' },
            { value: 'overdue', label: 'متأخرة' },
          ]}
        />
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            تفاصيل الخدمات
          </h2>

          <button
            type="button"
            onClick={() =>
              append({
                productServiceID: '',
                quantity: 1,
                unitPrice: 0,
                discountPercentage: 0,
                taxPercentage: 0,
              })
            }
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
                <input
                  {...register(`details.${index}.productServiceID`, { valueAsNumber: true })}
                  className="input-modern"
                />
                {detailErrors?.productServiceID?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {detailErrors.productServiceID.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  {...register(`details.${index}.quantity`, { valueAsNumber: true })}
                  className="input-modern"
                />
                {detailErrors?.quantity?.message && (
                  <p className="text-red-500 text-sm mt-1">{detailErrors.quantity.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  {...register(`details.${index}.unitPrice`, { valueAsNumber: true })}
                  className="input-modern"
                />
                {detailErrors?.unitPrice?.message && (
                  <p className="text-red-500 text-sm mt-1">{detailErrors.unitPrice.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  {...register(`details.${index}.discountPercentage`, { valueAsNumber: true })}
                  className="input-modern"
                />
                {detailErrors?.discountPercentage?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {detailErrors.discountPercentage.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  {...register(`details.${index}.taxPercentage`, { valueAsNumber: true })}
                  className="input-modern"
                />
                {detailErrors?.taxPercentage?.message && (
                  <p className="text-red-500 text-sm mt-1">{detailErrors.taxPercentage.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700"
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

// select
const NormalSelect = React.forwardRef(({ label, options, error, ...rest }, ref) => (
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
));