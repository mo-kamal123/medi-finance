import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
import Toggle from '../../../shared/ui/toggle';
import { createUserSchema } from '../validation/create-user.validation';

const UserForm = ({ roles, user, onSave }) => {
  const editing = Boolean(user);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema(roles, user)),
    mode: 'onTouched',
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      mobileNumber: user?.mobileNumber ?? '',
      roleId: String(user?.roleId ?? ''),
      isActive: user?.isActive ?? true,
      password: '',
      confirmPassword: '',
    },
  });

  const submit = async (values) => {
    const { firstName, lastName, mobileNumber, roleId, password, isActive } =
      values;
    try {
      await onSave({
        roleId,
        firstName,
        lastName,
        mobileNumber,
        ...(editing ? { isActive } : { password }),
      });
    } catch {
      setError('root', {
        message: 'تعذر حفظ المستخدم. تحقق من البيانات وحاول مرة أخرى.',
      });
    }
  };

  const input = (name, label, props) => (
    <FormInput
      {...register(name)}
      id={`user-${name}`}
      label={label}
      aria-invalid={Boolean(errors[name])}
      aria-describedby={errors[name] ? `user-${name}-error` : undefined}
      error={
        errors[name] && (
          <span id={`user-${name}-error`}>{errors[name].message}</span>
        )
      }
      {...props}
    />
  );

  return (
    <form
      dir="rtl"
      noValidate
      onSubmit={handleSubmit(submit)}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            المعلومات الأساسية
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {editing
              ? 'تعديل بيانات المستخدم والدور المخصص له'
              : 'إدخال بيانات المستخدم الجديد واختيار دوره'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {input('firstName', 'الاسم الأول', {
            required: true,
            autoComplete: 'given-name',
            placeholder: 'أدخل الاسم الأول',
          })}
          {input('lastName', 'اسم العائلة', {
            autoComplete: 'family-name',
            placeholder: 'أدخل اسم العائلة',
          })}
          {input('mobileNumber', 'رقم الهاتف', {
            required: true,
            type: 'tel',
            autoComplete: 'tel',
            dir: 'ltr',
            placeholder: '01000xxxxx',
          })}
          <Controller
            name="roleId"
            control={control}
            render={({ field, fieldState }) => (
              <SearchableSelect
                {...field}
                label="الدور"
                placeholder="اختر الدور"
                options={roles.map((role) => ({
                  value: String(role.id),
                  label: role.name,
                }))}
                error={fieldState.error?.message}
                disabled={isSubmitting || !roles.length}
                required
              />
            )}
          />
          {!editing && (
            <>
              {input('password', 'كلمة المرور', {
                required: true,
                type: 'password',
                autoComplete: 'new-password',
                dir: 'ltr',
                placeholder: '8 أحرف على الأقل',
                passwordToggle: true,
              })}
              {input('confirmPassword', 'تأكيد كلمة المرور', {
                required: true,
                type: 'password',
                autoComplete: 'new-password',
                dir: 'ltr',
                placeholder: 'أعد إدخال كلمة المرور',
                passwordToggle: true,
              })}
            </>
          )}
        </div>
        {editing && (
          <Toggle
            {...register('isActive')}
            label="الحساب نشط"
            role="switch"
            disabled={isSubmitting}
          />
        )}
        {!roles.length && (
          <p role="status" className="text-gray-600">
            لا توجد أدوار متاحة.
          </p>
        )}
        {errors.root && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
            {errors.root.message}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !roles.length}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Save size={16} aria-hidden="true" />
            {isSubmitting
              ? 'جاري الحفظ...'
              : editing
                ? 'حفظ التغييرات'
                : 'إضافة المستخدم'}
          </button>
          <Link
            to="/users"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            إلغاء
            <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
      </fieldset>
    </form>
  );
};

export default UserForm;
