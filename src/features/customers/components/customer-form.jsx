import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { customerSchema } from '../validation/customer.validation';
import FormInput from '../../../shared/ui/input';

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
      customerType: 1,
      isTaxable: false,
      isActive: true,
      creditLimit: 0,
      paymentTermDays: 0,
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6"
    >
      <div className="flex gap-5">
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

      <div className="flex gap-5">
        <FormInput
          label="الاسم بالإنجليزية"
          {...register('customerNameEn')}
          error={errors.customerNameEn?.message}
        />

        <div className="w-full">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            نوع العميل
          </label>

          <select
            {...register('customerType')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>عميل</option>
            <option value={2}>عميل نقدي</option>
          </select>
        </div>
      </div>

      <div className="flex gap-5">
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

      <div className="flex gap-5">
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

      <div className="flex gap-5">
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

      <div className="flex gap-5">
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

      <div className="flex gap-5">
        <div className="w-full">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            العملة
          </label>

          <select
            {...register('currencyID')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
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
          <label className="block mb-1 text-sm font-medium text-gray-700">
            الحساب
          </label>

          <select
            {...register('accountID')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
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

      <div className="flex gap-5">
        <div className="w-full">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            مركز التكلفة الافتراضي
          </label>

          <select
            {...register('defaultCostCenterID')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">بدون</option>

            {costCenters.map((center) => (
              <option key={center.costCenterID} value={center.costCenterID}>
                {center.ccCode} - {center.nameAr}
              </option>
            ))}
          </select>
        </div>

        <FormInput
          label="المستخدم"
          {...register('user')}
          error={errors.user?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-300">
          <input type="checkbox" {...register('isTaxable')} />
          <span>خاضع للضريبة</span>
        </label>

        <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-300">
          <input type="checkbox" {...register('isActive')} />
          <span>العميل نشط</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60"
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
