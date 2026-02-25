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
  // useAccounts,
  // useFinancialPeriods,
} from '../hooks/invoices.queries';
import useAccountsTree from '../../tree/accouts-tree/hooks/use-accounts-tree';
import useCostTree from '../../tree/cost-tree/hooks/use-cost-tree';

const InvoiceForm = ({ initialData = {}, onSubmit, isLoading }) => {
  // Fetch data for selects
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();
  const { data: accounts = [] } = useAccountsTree();
  const { data: cost = [] } = useCostTree();
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
      status: 'pending',
      createdBy: 1, // static createdBy for testing
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
  useEffect(() => {
    if (initialData) {
      // ضبط القيم البسيطة (input)
      Object.keys(initialData).forEach((key) => {
        if (
          [
            'invoiceNumber',
            'invoiceDate',
            'dueDate',
            'taxAmount',
            'discountAmount',
            'status',
          ].includes(key)
        ) {
          setValue(key, initialData[key] ?? '');
        }
      });

      // ضبط قيم الـ select بعد ما يتم تحميل الخيارات
      if (
        invoiceTypes &&
        customers &&
        suppliers &&
        accounts &&
        financialPeriods
      ) {
        setValue('invoiceTypeID', initialData.invoiceTypeID ?? '');
        setValue('customerID', initialData.customerID ?? '');
        setValue('supplierID', initialData.supplierID ?? '');
        setValue('financialPeriodID', initialData.financialPeriodID ?? '');
        setValue('debtorAccountID', initialData.debtorAccountID ?? '');
        setValue('creditorAccountID', initialData.creditorAccountID ?? '');
        setValue('taxAccountID', initialData.taxAccountID ?? '');
        setValue('discountAccountID', initialData.discountAccountID ?? '');
      }

      // ضبط تفاصيل الخدمات (details)
      if (initialData.details?.length) {
        initialData.details.forEach((detail, index) => {
          if (fields[index]) {
            setValue(
              `details.${index}.productServiceID`,
              detail.productServiceID ?? ''
            );
            setValue(`details.${index}.quantity`, detail.quantity ?? 1);
            setValue(`details.${index}.unitPrice`, detail.unitPrice ?? 0);
            setValue(
              `details.${index}.discountPercentage`,
              detail.discountPercentage ?? 0
            );
            setValue(
              `details.${index}.taxPercentage`,
              detail.taxPercentage ?? 0
            );
          } else {
            append({
              productServiceID: detail.productServiceID ?? '',
              quantity: detail.quantity ?? 1,
              unitPrice: detail.unitPrice ?? 0,
              discountPercentage: detail.discountPercentage ?? 0,
              taxPercentage: detail.taxPercentage ?? 0,
            });
          }
        });
      }
    }
  }, [
    initialData,
    invoiceTypes,
    customers,
    suppliers,
    accounts,
    financialPeriods,
  ]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        setValue(key, initialData[key]);
      });
    }
  }, [initialData, setValue]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const payload = {
          ...data,
          CreatedBy: 12,
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

        <NormalSelect
          label="العميل"
          {...register('customerID')}
          options={[
            { value: '', label: 'اختر' },
            ...(customers?.map((c) => ({
              value: c.customerID,
              label: c.customerNameAr,
            })) || []),
          ]}
        />

        <NormalSelect
          label="المورد"
          {...register('supplierID')}
          options={[
            { value: '', label: 'اختر' },
            ...(suppliers?.map((s) => ({
              value: s.supplierID,
              label: s.supplierNameAr,
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
          options={[
            { value: 'pending', label: 'معلقة' },
            { value: 'paid', label: 'مدفوعة' },
            { value: 'overdue', label: 'متأخرة' },
          ]}
        />
      </div>

      {/* Service Details */}
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
          <span>معرف المنتج/الخدمة</span>
          <span>الكمية</span>
          <span>سعر الوحدة</span>
          <span>خصم %</span>
          <span>ضريبة %</span>
          <span>حذف</span>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border border-gray-300 rounded-xl p-4 bg-gray-50"
          >
            <input
              type="number"
              placeholder="معرف المنتج"
              {...register(`details.${index}.productServiceID`, {
                valueAsNumber: true,
              })}
              className="input-modern"
            />
            <input
              type="number"
              placeholder="الكمية"
              {...register(`details.${index}.quantity`, {
                valueAsNumber: true,
              })}
              className="input-modern"
            />
            <input
              type="number"
              placeholder="سعر الوحدة"
              {...register(`details.${index}.unitPrice`, {
                valueAsNumber: true,
              })}
              className="input-modern"
            />
            <input
              type="number"
              placeholder="خصم %"
              {...register(`details.${index}.discountPercentage`, {
                valueAsNumber: true,
              })}
              className="input-modern"
            />
            <input
              type="number"
              placeholder="ضريبة %"
              {...register(`details.${index}.taxPercentage`, {
                valueAsNumber: true,
              })}
              className="input-modern"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
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

// Normal select component
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

NormalSelect.displayName = 'NormalSelect';
