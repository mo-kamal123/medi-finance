import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import { useCreateBank } from '../hooks/banks.mutations';
import { bankSchema } from '../validation/bank.validation';

const getInitialValues = (defaultValues = {}) => ({
  bankCode: defaultValues.bankCode ?? '',
  bankNameAr: defaultValues.bankNameAr ?? '',
  bankNameEn: defaultValues.bankNameEn ?? '',
  swiftCode: defaultValues.swiftCode ?? '',
  countryCode: defaultValues.countryCode ?? '',
  phone: defaultValues.phone ?? '',
  email: defaultValues.email ?? '',
  website: defaultValues.website ?? '',
  addressAr: defaultValues.addressAr ?? '',
  addressEn: defaultValues.addressEn ?? '',
  isActive: defaultValues.isActive ?? true,
});

const BankForm = ({ defaultValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const createMutation = useCreateBank();
  const isViewMode = mode === 'view';

  const formDefaults = useMemo(
    () => getInitialValues(defaultValues),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: formDefaults,
    values: formDefaults,
    resolver: zodResolver(bankSchema),
  });

  const onSubmit = (data) => {
    const payload = {
      bankCode: data.bankCode,
      bankNameAr: data.bankNameAr,
      bankNameEn: data.bankNameEn,
      swiftCode: data.swiftCode || '',
      countryCode: data.countryCode,
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      addressAr: data.addressAr || '',
      addressEn: data.addressEn || '',
      isActive: data.isActive,
      createdBy: 'ms',
    };

    createMutation.mutate(payload, {
      onSuccess: () => navigate('/banks'),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isViewMode ? 'تفاصيل البنك' : 'إضافة بنك'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isViewMode ? 'استعراض بيانات البنك' : 'إدخال بيانات بنك جديد'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          label="كود البنك"
          {...register('bankCode')}
          error={errors.bankCode?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="كود السويفت"
          {...register('swiftCode')}
          error={errors.swiftCode?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="اسم البنك بالعربية"
          {...register('bankNameAr')}
          error={errors.bankNameAr?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="اسم البنك بالإنجليزية"
          {...register('bankNameEn')}
          error={errors.bankNameEn?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="كود الدولة"
          {...register('countryCode')}
          error={errors.countryCode?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="الهاتف"
          {...register('phone')}
          error={errors.phone?.message}
          readOnly={isViewMode}
        />

        <FormInput
          type="email"
          label="البريد الإلكتروني"
          {...register('email')}
          error={errors.email?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="الموقع الإلكتروني"
          {...register('website')}
          error={errors.website?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="العنوان بالعربية"
          {...register('addressAr')}
          error={errors.addressAr?.message}
          readOnly={isViewMode}
        />

        <FormInput
          label="العنوان بالإنجليزية"
          {...register('addressEn')}
          error={errors.addressEn?.message}
          readOnly={isViewMode}
        />
      </div>

      <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-300 w-fit">
        <input
          type="checkbox"
          {...register('isActive')}
          disabled={isViewMode}
        />
        <span>البنك نشط</span>
      </label>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/banks')}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          رجوع
        </button>

        {!isViewMode && (
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60"
          >
            <Save size={18} />
            {isSubmitting || createMutation.isPending
              ? 'جاري الحفظ...'
              : 'حفظ البنك'}
          </button>
        )}
      </div>
    </form>
  );
};

export default BankForm;
