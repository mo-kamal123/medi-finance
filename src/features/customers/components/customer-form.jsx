import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import { customerSchema } from '../validation/customer.validation';

const CustomerForm = ({
  mode = 'create',
  defaultValues = {},
  currencies = [],
  accounts = [],
  costCenters = [],
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
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
      ...defaultValues,
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
      currencyID: Number(data.currencyID) || 0,
      accountID: Number(data.accountID) || 0,
      defaultCostCenterID: Number(data.defaultCostCenterID) || 0,
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
        />

        <FormInput
          label="الاسم بالعربية"
          {...register('customerNameAr')}
          error={errors.customerNameAr?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="الاسم بالإنجليزية"
          {...register('customerNameEn')}
          error={errors.customerNameEn?.message}
        />

        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            نوع العميل
          </label>
          <select
            {...register('customerType')}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>عميل</option>
            <option value={2}>عميل نقدي</option>
          </select>
        </div>
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            العملة
          </label>
          <select
            {...register('currencyID')}
            className="w-full rounded-lg border border-gray-200 px-4 py-2"
          >
            <option value="">اختر العملة</option>
            {currencies.map((currency) => (
              <option key={currency.currencyID} value={currency.currencyID}>
                {currency.currencyName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            الحساب
          </label>
          <select
            {...register('accountID')}
            className="w-full rounded-lg border border-gray-200 px-4 py-2"
          >
            <option value="">اختر الحساب</option>
            {accounts.map((acc) => (
              <option key={acc.accountID} value={acc.accountID}>
                {acc.accountCode} - {acc.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            مركز التكلفة الافتراضي
          </label>
          <select
            {...register('defaultCostCenterID')}
            className="w-full rounded-lg border border-gray-200 px-4 py-2"
          >
            <option value="">بدون</option>
            {costCenters.map((center) => (
              <option key={center.costCenterID} value={center.costCenterID}>
                {center.ccCode} - {center.nameAr}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
            <input type="checkbox" {...register('isTaxable')} />
            <span>خاضع للضريبة</span>
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
            <input type="checkbox" {...register('isActive')} />
            <span>العميل نشط</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <Save size={18} />
        {isSubmitting
          ? 'جاري الحفظ...'
          : mode === 'create'
            ? 'إنشاء العميل'
            : 'حفظ التعديلات'}
      </button>
    </form>
  );
};

export default CustomerForm;
