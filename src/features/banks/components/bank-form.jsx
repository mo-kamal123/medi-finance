import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Save } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import { useCreateBank, useUpdateBank } from '../hooks/banks.mutations';
import { bankSchema } from '../validation/bank.validation';

const getInitialValues = (defaultValues = {}) => ({
  bankCode: defaultValues.bankCode ?? '',
  bankNameAr: defaultValues.bankNameAr ?? '',
  bankNameEn: defaultValues.bankNameEn ?? '',
  swiftCode: defaultValues.swiftCode ?? '',
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
  const updateMutation = useUpdateBank();

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const formDefaults = useMemo(
    () => getInitialValues(defaultValues),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: formDefaults,
    values: formDefaults,
    resolver: zodResolver(bankSchema),
  });

  const isActive = useWatch({ control, name: 'isActive' });

  const mutation = isCreateMode ? createMutation : updateMutation;

  const onSubmit = (data) => {
    const payload = {
      bankCode: data.bankCode,
      bankNameAr: data.bankNameAr,
      bankNameEn: data.bankNameEn,
      swiftCode: data.swiftCode || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      addressAr: data.addressAr || '',
      addressEn: data.addressEn || '',
      isActive: data.isActive,
    };

    if (isEditMode && defaultValues?.bankID) {
      updateMutation.mutate(
        { id: defaultValues.bankID, ...payload },
        {
          onSuccess: () => navigate('/banks'),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/banks'),
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCreateMode
                ? 'إضافة بنك'
                : isEditMode
                  ? 'تعديل البنك'
                  : 'تفاصيل البنك'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isCreateMode
                ? 'إدخال بيانات بنك جديد'
                : isEditMode
                  ? 'تعديل بيانات البنك'
                  : 'استعراض بيانات البنك'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput
            label="كود البنك"
            {...register('bankCode')}
            error={errors.bankCode?.message}
            readOnly={isViewMode}
            required
          />
          <FormInput
            label="اسم البنك بالعربية"
            {...register('bankNameAr')}
            error={errors.bankNameAr?.message}
            readOnly={isViewMode}
            required
          />
          <FormInput
            label="اسم البنك بالإنجليزية"
            {...register('bankNameEn')}
            error={errors.bankNameEn?.message}
            readOnly={isViewMode}
            required
          />
          <FormInput
            label="Swift Code"
            {...register('swiftCode')}
            error={errors.swiftCode?.message}
            readOnly={isViewMode}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
        </div>

        <label
          className={`flex w-fit cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
            isActive
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            {...register('isActive')}
            disabled={isViewMode}
            className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
          />
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <BadgeCheck size={15} className="text-emerald-600" />
              البنك نشط
            </div>
          </div>
        </label>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => navigate('/banks')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            رجوع
          </button>

          {!isViewMode && (
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Save size={16} />
              {isSubmitting || mutation.isPending
                ? 'جاري الحفظ...'
                : isEditMode
                  ? 'تحديث البنك'
                  : 'حفظ البنك'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default BankForm;
