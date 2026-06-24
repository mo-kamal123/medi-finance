import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { customerSchema } from '../validation/customer.validation';
import { useCustomerTypes } from '../hooks/customers.queries';

const cleanNulls = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v ?? ''])
  );

const CustomerForm = ({
  mode = 'create',
  defaultValues = {},
  onSubmit,
  isPending = false,
}) => {
  const { data: customerTypes = [] } = useCustomerTypes();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerID: 0,
      customerType: 1,
      isTaxable: false,
      isActive: true,
      creditLimit: 0,
      paymentTermDays: 0,
      user: 'ms',
      ...cleanNulls(defaultValues),
    },
  });

  const submitHandler = (data) => {
    onSubmit({
      customerID: data.customerID ?? 0,
      customerCode: data.customerCode,
      customerNameAr: data.customerNameAr,
      customerNameEn: data.customerNameEn || '',
      customerType: Number(data.customerType),
      contactPerson: data.contactPerson || '',
      email: data.email || '',
      phone: data.phone || '',
      addressAr: data.addressAr || '',
      addressEn: data.addressEn || '',
      taxNumber: data.taxNumber || '',
      isTaxable: Boolean(data.isTaxable),
      creditLimit: Number(data.creditLimit) || 0,
      paymentTermDays: Number(data.paymentTermDays) || 0,
      isActive: Boolean(data.isActive),
      user: 'ms',
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="كود العميل"
          {...register('customerCode')}
          error={errors.customerCode?.message}
          disabled={mode === 'update'}
          required
        />

        <FormInput
          label="الاسم بالعربية"
          {...register('customerNameAr')}
          error={errors.customerNameAr?.message}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="الاسم بالإنجليزية"
          {...register('customerNameEn')}
          error={errors.customerNameEn?.message}
        />

        <Controller
          name="customerType"
          control={control}
          render={({ field }) => (
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                نوع العميل
              </label>
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={customerTypes.map((t) => ({
                  value: t.customerTypeID,
                  label: t.nameAr,
                }))}
              />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="الشخص المسؤول"
          {...register('contactPerson')}
          error={errors.contactPerson?.message}
        />

        <FormInput
          label="الهاتف"
          {...register('phone')}
          error={errors.phone?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="البريد الإلكتروني"
          {...register('email')}
          error={errors.email?.message}
        />

        <FormInput
          label="الرقم الضريبي"
          {...register('taxNumber')}
          error={errors.taxNumber?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="العنوان بالعربية"
          {...register('addressAr')}
          error={errors.addressAr?.message}
        />

        <FormInput
          label="العنوان بالإنجليزية"
          {...register('addressEn')}
          error={errors.addressEn?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="الحد الائتماني"
          type="number"
          {...register('creditLimit')}
          error={errors.creditLimit?.message}
        />

        <FormInput
          label="مدة السداد (أيام)"
          type="number"
          {...register('paymentTermDays')}
          error={errors.paymentTermDays?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
          <input type="checkbox" {...register('isTaxable')} />
          <span>خاضع للضريبة</span>
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
          <input type="checkbox" {...register('isActive')} />
          <span>العميل نشط</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <Save size={18} />
        {isSubmitting || isPending
          ? 'جاري الحفظ...'
          : mode === 'create'
            ? 'إنشاء العميل'
            : 'حفظ التعديلات'}
      </button>
    </form>
  );
};

export default CustomerForm;
