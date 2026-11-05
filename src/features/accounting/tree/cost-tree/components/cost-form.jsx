import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormInput from '../../../../../shared/ui/input';
import SearchableSelect from '../../../../../shared/ui/searchable-select';
import Toggle from '../../../../../shared/ui/toggle';
import { costSchema } from '../validation/cost-validation';

const CostCenterForm = ({
  mode = 'create',
  defaultValues = {},
  parentCenters = [],
  onSubmit,
  isPending = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(costSchema),
    defaultValues: {
      ccCode: '',
      nameAr: '',
      nameEn: '',
      user: '',
      parentID: 0,
      isActive: true,
      isFinal: false,
      ...defaultValues,
    },
  });
  const isActive = useWatch({ control, name: 'isActive' });
  const isFinal = useWatch({ control, name: 'isFinal' });
  const saving = isSubmitting || isPending;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={saving} className="min-w-0 space-y-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput
            label="رقم المركز"
            placeholder="أدخل رقم المركز"
            {...register('ccCode')}
            error={errors.ccCode?.message}
            disabled={mode === 'update'}
            required
          />
          <Controller
            name="parentID"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                value={String(field.value ?? '')}
                label="المركز الأب"
                placeholder="بدون مركز أب"
                searchPlaceholder="ابحث باسم المركز أو الكود..."
                disabled={saving}
                error={errors.parentID?.message}
                options={[
                  { value: '0', label: 'بدون مركز أب' },
                  ...parentCenters.map((center) => ({
                    value: String(center.costCenterID),
                    label: `${center.ccCode} - ${center.nameAr}`,
                  })),
                ]}
              />
            )}
          />
          <FormInput
            label="الاسم بالعربية"
            placeholder="أدخل اسم المركز بالعربية"
            {...register('nameAr')}
            error={errors.nameAr?.message}
            required
          />
          <FormInput
            label="الاسم بالإنجليزية"
            placeholder="Enter the cost center name"
            dir="ltr"
            {...register('nameEn')}
            error={errors.nameEn?.message}
            required
          />
          <FormInput
            label="المستخدم"
            placeholder="أدخل اسم المستخدم"
            {...register('user')}
            error={errors.user?.message}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className={`rounded-xl border p-4 transition-colors ${isFinal ? 'border-primary/20 bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <Toggle
              {...register('isFinal')}
              label="مركز نهائي"
              role="switch"
              disabled={saving}
            />
          </div>
          <div
            className={`rounded-xl border p-4 transition-colors ${isActive ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <Toggle
              {...register('isActive')}
              label="المركز نشط"
              role="switch"
              disabled={saving}
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            to="/cost-tree"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Save size={18} />
            {saving
              ? 'جاري الحفظ...'
              : mode === 'create'
                ? 'إنشاء المركز'
                : 'حفظ التعديلات'}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default CostCenterForm;
