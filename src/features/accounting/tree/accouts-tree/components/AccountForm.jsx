import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, Lock, Save, ShieldAlert } from 'lucide-react';
import { accountSchema } from '../validation/accounts-validation';
import FormInput from '../../../../../shared/ui/input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import AccountSearchSelect from '../../../../transactions/entries/components/account-search-select';

const ACCOUNT_TYPES = [
  { value: '1', label: 'أصول' },
  { value: '2', label: 'خصوم' },
  { value: '3', label: 'حقوق ملكية' },
  { value: '4', label: 'إيرادات' },
  { value: '5', label: 'مصروفات' },
  { value: '6', label: 'تكاليف' },
];

const BALANCE_TYPES = {
  0: 'مدين',
  1: 'دائن',
};

const DEFAULT_VALUES = {
  nameAr: '',
  nameEn: '',
  parentId: '',
  accountTypeId: '',
  lockedInJournal: false,
  isActive: true,
};

const InfoCard = ({ label, value, accent = 'primary' }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <p className={`text-xs font-medium uppercase tracking-wide text-${accent}`}>
      {label}
    </p>
    <p className="mt-1 truncate text-lg font-bold text-gray-900">
      {value || '-'}
    </p>
  </div>
);

const AccountForm = ({ mode = 'create', defaultValues = {}, onSubmit }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...DEFAULT_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  const lockedInJournal = useWatch({ control, name: 'lockedInJournal' });
  const isActive = useWatch({ control, name: 'isActive' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {mode === 'update' ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            معلومات الحساب
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard label="رقم الحساب" value={defaultValues.accountCode} />
            <InfoCard
              label="مستوى الحساب"
              value={defaultValues.level}
              accent="sky-600"
            />
            <InfoCard
              label="طبيعة الرصيد"
              value={BALANCE_TYPES[defaultValues.balanceType]}
              accent="emerald-600"
            />
            <InfoCard
              label="الحالة"
              value={defaultValues.isActive ? 'نشط' : 'موقوف'}
              accent={defaultValues.isActive ? 'emerald-600' : 'red-600'}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <p>
            رقم الحساب يتم توليده تلقائياً بواسطة النظام بعد الإنشاء.
          </p>
        </div>
      )}

      {/* Names */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="الاسم بالعربية"
          placeholder="مثال: البنك الأهلي"
          {...register('nameAr')}
          error={errors.nameAr?.message}
          required
        />
        <FormInput
          label="الاسم بالإنجليزية"
          placeholder="Example: National Bank"
          dir="ltr"
          {...register('nameEn')}
          error={errors.nameEn?.message}
          required
        />
      </div>

      {/* Parent + Type */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            الحساب الأب
            <span className="mr-1 text-xs font-normal text-gray-400">
              (اختياري، اتركه فارغاً لحساب رئيسي)
            </span>
          </label>
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <AccountSearchSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                allowLocked
                placeholder="ابحث بالاسم أو كود الحساب..."
              />
            )}
          />
          {errors.parentId ? (
            <p className="mt-1 text-sm text-red-500">
              {errors.parentId.message}
            </p>
          ) : null}
        </div>

        <div>
          <Controller
            name="accountTypeId"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="نوع الحساب"
                required
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="اختر نوع الحساب"
                searchPlaceholder="ابحث عن نوع الحساب..."
                options={ACCOUNT_TYPES}
                error={errors.accountTypeId?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
            lockedInJournal
              ? 'border-amber-200 bg-amber-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            {...register('lockedInJournal')}
            className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
          />
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <Lock size={15} className="text-amber-600" />
              مقفل في القيود
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              منع استخدام هذا الحساب في القيود اليومية
            </p>
          </div>
        </label>

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
            isActive
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
          />
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <BadgeCheck size={15} className="text-emerald-600" />
              الحساب نشط
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              الحساب النشط فقط يمكن استخدامه
            </p>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
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
