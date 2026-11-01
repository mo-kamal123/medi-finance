import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRound } from 'lucide-react';
import FormInput from '../../../shared/ui/input';
import { createUserSchema } from '../validation/create-user.validation';
import { formatDate } from '../../../shared/utils/formatters';

const UserForm = ({
  users,
  roles,
  user,
  onCancel,
  onSave,
  readOnly = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema(users, roles, user)),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      roleId: '',
      status: 'active',
      password: '',
      confirmPassword: '',
      ...user,
    },
  });

  const submit = ({ name, username, email, roleId, status }) => {
    // This screen is a preview: never retain credentials in the mock user list.
    onSave({ name, username, email, roleId, status });
  };

  const input = (name, label, props = {}) => (
    <FormInput
      {...register(name)}
      label={label}
      aria-label={label}
      aria-invalid={Boolean(errors[name])}
      aria-describedby={errors[name] ? `create-user-${name}-error` : undefined}
      error={
        errors[name] ? (
          <span id={`create-user-${name}-error`}>{errors[name].message}</span>
        ) : undefined
      }
      required={!readOnly}
      readOnly={readOnly}
      inputClass={readOnly ? 'bg-gray-50' : ''}
      {...props}
    />
  );

  return (
    <section
      dir="rtl"
      aria-labelledby="create-user-title"
      aria-describedby="create-user-description"
      className="rounded-xl border border-gray-200 bg-white text-gray-900"
    >
      <div className="border-b border-gray-100 px-4 pt-3">
        <h2
          id="create-user-title"
          className="inline-flex items-center gap-2 rounded-t-lg border-b-2 border-primary bg-primary/5 px-4 py-2.5 text-base font-medium text-primary"
        >
          <UserRound size={16} />
          المعلومات الأساسية
        </h2>
      </div>
      <div className="p-6">
        <p
          id="create-user-description"
          className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {readOnly
            ? 'بيانات المستخدم من النظام. الحفظ غير متاح حالياً.'
            : 'نموذج تجريبي: تُحفظ التغييرات مؤقتاً حتى إعادة تحميل التطبيق، ولا يُنشأ حساب فعلي أو تُحفظ كلمة المرور.'}
        </p>
        <form
          noValidate
          onSubmit={
            readOnly ? (event) => event.preventDefault() : handleSubmit(submit)
          }
          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            {input('name', 'الاسم الكامل', {
              autoComplete: 'name',
              autoFocus: !readOnly,
              placeholder: 'أدخل الاسم الكامل',
            })}
            {input('username', 'اسم المستخدم', {
              autoComplete: 'off',
              dir: 'ltr',
              placeholder: 'user.name',
            })}
            {input('email', 'البريد الإلكتروني', {
              type: 'email',
              autoComplete: 'email',
              dir: 'ltr',
              placeholder: 'user@example.com',
            })}
            {readOnly ? (
              input('employeeCode', 'كود الموظف', {
                value: user.employeeCode ?? '—',
              })
            ) : (
              <label className="block text-[15px] font-medium text-gray-700">
                الدور <span className="text-red-500">*</span>
                <select
                  {...register('roleId')}
                  aria-invalid={Boolean(errors.roleId)}
                  aria-describedby={
                    errors.roleId ? 'create-user-role-error' : undefined
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 focus:border-primary focus:outline-none"
                >
                  <option value="">اختر الدور</option>
                  {roles
                    .filter(
                      (role) =>
                        role.status === 'active' || role.id === user?.roleId
                    )
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>
                {errors.roleId && (
                  <span
                    id="create-user-role-error"
                    className="mt-1 block text-sm text-red-500"
                  >
                    {errors.roleId.message}
                  </span>
                )}
              </label>
            )}
            {!user &&
              input('password', 'كلمة المرور', {
                type: 'password',
                autoComplete: 'new-password',
                dir: 'ltr',
                placeholder: '8 أحرف على الأقل',
              })}
            {!user &&
              input('confirmPassword', 'تأكيد كلمة المرور', {
                type: 'password',
                autoComplete: 'new-password',
                dir: 'ltr',
                placeholder: 'أعد إدخال كلمة المرور',
              })}
            <label className="block text-[15px] font-medium text-gray-700">
              الحالة
              <select
                {...register('status')}
                disabled={readOnly}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </label>
            {readOnly && (
              <>
                {input('id', 'كود المستخدم')}
                <FormInput
                  label="تاريخ الإنشاء"
                  aria-label="تاريخ الإنشاء"
                  value={formatDate(user.createdAt)}
                  readOnly
                  inputClass="bg-gray-50"
                />
                <FormInput
                  label="آخر تحديث"
                  aria-label="آخر تحديث"
                  value={formatDate(user.updatedAt)}
                  readOnly
                  inputClass="bg-gray-50"
                />
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              {readOnly ? 'العودة إلى المستخدمين' : 'إلغاء'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {user ? 'حفظ التغييرات' : 'إضافة المستخدم'}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default UserForm;
