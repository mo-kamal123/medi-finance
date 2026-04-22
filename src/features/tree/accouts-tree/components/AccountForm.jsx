import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { accountSchema } from '../validation/accounts-validation';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';

const AccountForm = ({
  mode = 'create',
  defaultValues = {},
  parentAccounts = [],
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        console.log('Validation Errors:', formErrors);
      })}
      className="space-y-6"
    >
      <FormInput
        label="رقم الحساب"
        {...register('accountCode')}
        error={errors.accountCode?.message}
        disabled={mode === 'update'}
      />

      <FormInput
        label="الاسم بالعربية"
        {...register('nameAr')}
        error={errors.nameAr?.message}
      />

      <FormInput
        label="الاسم بالإنجليزية"
        {...register('nameEn')}
        error={errors.nameEn?.message}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          الحساب الأب
        </label>
        <SearchableSelect
          {...register('parentID')}
          placeholder="بدون"
          options={parentAccounts.map((account) => ({
            value: account.accountID,
            label: `${account.accountCode} - ${account.nameAr}`,
          }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          نوع الحساب
        </label>
        <SearchableSelect
          {...register('accountType')}
          placeholder="اختر النوع"
          options={[
            { value: 'asset', label: 'أصول' },
            { value: 'liability', label: 'خصوم' },
            { value: 'equity', label: 'حقوق ملكية' },
            { value: 'revenue', label: 'إيرادات' },
            { value: 'expense', label: 'مصروفات' },
          ]}
        />

        {errors.accountType ? (
          <p className="mt-1 text-sm text-red-500">{errors.accountType.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
          <input type="checkbox" {...register('isActive')} />
          <span>الحساب نشط</span>
        </label>

        <label className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
          <input type="checkbox" {...register('isFinal')} />
          <span>حساب نهائي</span>
        </label>
      </div>

      <FormInput
        label="المستخدم"
        {...register('user')}
        error={errors.user?.message}
      />

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <Save size={18} />
        {isSubmitting
          ? 'جاري الحفظ...'
          : mode === 'create'
            ? 'إنشاء الحساب'
            : 'حفظ التعديلات'}
      </button>
    </form>
  );
};

export default AccountForm;
