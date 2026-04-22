import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import FormInput from '../../../../shared/ui/input';
import SearchableSelect from '../../../../shared/ui/searchable-select';
import { costSchema } from '../validation/cost-validation';

const CostCenterForm = ({
  mode = 'create',
  defaultValues = {},
  parentCenters = [],
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(costSchema),
    defaultValues: {
      parentID: 0,
      isActive: true,
      isFinal: false,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        label="رقم المركز"
        {...register('ccCode')}
        error={errors.ccCode?.message}
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
          المركز الأب
        </label>
        <SearchableSelect
          {...register('parentID')}
          placeholder="بدون"
          options={parentCenters.map((center) => ({
            value: center.costCenterID,
            label: `${center.ccCode} - ${center.nameAr}`,
          }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
          <input type="checkbox" {...register('isActive')} />
          <span>المركز نشط</span>
        </label>

        <label className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
          <input type="checkbox" {...register('isFinal')} />
          <span>مركز نهائي</span>
        </label>
      </div>

      <FormInput
        label="المستخدم"
        {...register('user')}
        error={errors.user?.message}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-white transition hover:opacity-90 disabled:opacity-60"
      >
        <Save size={18} />
        {isSubmitting
          ? 'جاري الحفظ...'
          : mode === 'create'
            ? 'إنشاء المركز'
            : 'حفظ التعديلات'}
      </button>
    </form>
  );
};

export default CostCenterForm;
