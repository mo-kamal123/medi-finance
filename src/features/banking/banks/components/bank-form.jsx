import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import Toggle from '../../../../shared/ui/toggle';
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
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: formDefaults,
    values: formDefaults,
    resolver: zodResolver(bankSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  // Guarantee validation runs on unfocus (blur), even if the shared
  // FormInput swallows/overrides the RHF onBlur handler.
  const registerBlur = (name) => {
    const { onBlur: rhfOnBlur, ...rest } = register(name);
    return {
      ...rest,
      onBlur: async (e) => {
        await rhfOnBlur(e);
        trigger(name);
      },
    };
  };

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
      noValidate
      className="rounded-xl border border-gray-200 bg-white p-6"
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
            placeholder="مثال: 001"
            {...registerBlur('bankCode')}
            error={errors.bankCode?.message}
            readOnly={isViewMode}
            required
          />
          <FormInput
            label="اسم البنك بالعربية"
            placeholder="مثال: البنك الأهلي"
            {...registerBlur('bankNameAr')}
            error={errors.bankNameAr?.message}
            readOnly={isViewMode}
            required
          />
          <FormInput
            label="اسم البنك بالإنجليزية"
            placeholder="مثال: National Bank"
            {...registerBlur('bankNameEn')}
            error={errors.bankNameEn?.message}
            readOnly={isViewMode}
          />
          <FormInput
            label="Swift Code"
            placeholder="مثال: NBEGEGCX"
            {...registerBlur('swiftCode')}
            error={errors.swiftCode?.message}
            readOnly={isViewMode}
          />
          <FormInput
            label="العنوان"
            placeholder="مثال: شارع التسعين، التجمع الخامس"
            {...registerBlur('addressAr')}
            error={errors.addressAr?.message}
            readOnly={isViewMode}
          />
          <FormInput
            label="الخط الساخن"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="مثال: 19623"
            {...registerBlur('phone')}
            error={errors.phone?.message}
            readOnly={isViewMode}
          />
          <FormInput
            type="email"
            label="البريد الإلكتروني"
            placeholder="مثال: info@bank.com"
            {...registerBlur('email')}
            error={errors.email?.message}
            readOnly={isViewMode}
          />
          <FormInput
            label="الموقع الإلكتروني"
            placeholder="مثال: https://www.bank.com"
            {...registerBlur('website')}
            error={errors.website?.message}
            readOnly={isViewMode}
          />
        </div>

        <Toggle
          label="البنك نشط"
          disabled={isViewMode}
          {...registerBlur('isActive')}
        />

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => navigate('/banks')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            رجوع
            <ArrowLeft size={16} />
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
