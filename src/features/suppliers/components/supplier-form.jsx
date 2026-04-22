import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import { supplierSchema } from '../validation/supplier.validation';

const SupplierForm = ({
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
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplierID: 0,
      supplierType: 1,
      isTaxable: false,
      isActive: true,
      paymentTermDays: 0,
      user: 'ms',
      ...defaultValues,
    },
  });

  const submitHandler = (data) => {
    onSubmit({
      supplierID: data.supplierID ?? 0,
      supplierCode: data.supplierCode,
      supplierNameAr: data.supplierNameAr,
      supplierNameEn: data.supplierNameEn || '',
      supplierType: Number(data.supplierType),
      contactPerson: data.contactPerson || '',
      email: data.email || '',
      phone: data.phone || '',
      addressAr: data.addressAr || '',
      addressEn: data.addressEn || '',
      taxNumber: data.taxNumber || '',
      isTaxable: Boolean(data.isTaxable),
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
          label="كود المورد"
          {...register('supplierCode')}
          error={errors.supplierCode?.message}
          disabled={mode === 'update'}
        />

        <FormInput
          label="الاسم بالعربية"
          {...register('supplierNameAr')}
          error={errors.supplierNameAr?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="الاسم بالإنجليزية"
          {...register('supplierNameEn')}
          error={errors.supplierNameEn?.message}
        />

        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            نوع المورد
          </label>
          <SearchableSelect
            {...register('supplierType')}
            options={[
              { value: 1, label: 'مورد' },
              { value: 2, label: 'مورد نقدي' },
            ]}
          />
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
          label="مدة السداد (أيام)"
          type="number"
          {...register('paymentTermDays')}
          error={errors.paymentTermDays?.message}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            العملة
          </label>
          <SearchableSelect
            {...register('currencyID')}
            placeholder="اختر العملة"
            options={currencies.map((currency) => ({
              value: currency.currencyID,
              label: currency.currencyName,
            }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            الحساب
          </label>
          <SearchableSelect
            {...register('accountID')}
            placeholder="اختر الحساب"
            options={accounts.map((acc) => ({
              value: acc.accountID,
              label: `${acc.accountCode} - ${acc.nameAr}`,
            }))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            مركز التكلفة
          </label>
          <SearchableSelect
            {...register('defaultCostCenterID')}
            placeholder="بدون"
            options={costCenters.map((center) => ({
              value: center.costCenterID,
              label: `${center.ccCode} - ${center.nameAr}`,
            }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
          <input type="checkbox" {...register('isTaxable')} />
          <span>خاضع للضريبة</span>
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
          <input type="checkbox" {...register('isActive')} />
          <span>المورد نشط</span>
        </label>
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
            ? 'إنشاء المورد'
            : 'حفظ التعديلات'}
      </button>
    </form>
  );
};

export default SupplierForm;
