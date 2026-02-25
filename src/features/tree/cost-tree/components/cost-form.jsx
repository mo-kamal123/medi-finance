import { useForm } from 'react-hook-form';
import FormInput from '../../../../shared/ui/input';
import { Save } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { costSchema } from '../validation/cost-validation';

const CostCenterForm = ({
  mode = 'create', // create | update
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

      {/* Parent */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          المركز الأب
        </label>
        <select
          {...register('parentID')}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">بدون</option>
          {parentCenters.map((center) => (
            <option key={center.costCenterID} value={center.costCenterID}>
              {center.ccCode} - {center.nameAr}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
          <input type="checkbox" {...register('isActive')} />
          <span>المركز نشط</span>
        </label>

        <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
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
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60"
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
