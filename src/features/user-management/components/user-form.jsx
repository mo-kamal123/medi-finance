import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import FormInput from '../../../shared/ui/input';
import SearchableSelect from '../../../shared/ui/searchable-select';
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
    resolver: zodResolver(createUserSchema(roles, editing)),
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
      label={label}
      aria-invalid={Boolean(errors[name])}
      error={errors[name]?.message}
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
      <h2 className="mb-5 text-lg font-semibold">المعلومات الأساسية</h2>
      <fieldset disabled={isSubmitting} className="min-w-0 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {input('firstName', 'الاسم الأول', {
            required: true,
            autoComplete: 'given-name',
          })}
          {input('lastName', 'اسم العائلة', { autoComplete: 'family-name' })}
          {input('mobileNumber', 'رقم الهاتف', {
            required: true,
            type: 'tel',
            autoComplete: 'tel',
            dir: 'ltr',
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
          {editing ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="size-4 accent-primary"
              />
              الحساب نشط
            </label>
          ) : (
            <>
              {input('password', 'كلمة المرور', {
                required: true,
                type: 'password',
                autoComplete: 'new-password',
                dir: 'ltr',
              })}
              {input('confirmPassword', 'تأكيد كلمة المرور', {
                required: true,
                type: 'password',
                autoComplete: 'new-password',
                dir: 'ltr',
              })}
            </>
          )}
        </div>
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
            className="rounded-lg bg-primary px-6 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting
              ? 'جاري الحفظ...'
              : editing
                ? 'حفظ التغييرات'
                : 'إضافة المستخدم'}
          </button>
          <Link
            to="/users"
            className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
          >
            إلغاء
          </Link>
        </div>
      </fieldset>
    </form>
  );
};

export default UserForm;
