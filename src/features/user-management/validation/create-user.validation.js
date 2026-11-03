import { z } from 'zod';

export const createUserSchema = (roles, editing) =>
  z
    .object({
      firstName: z.string().trim().min(1, 'أدخل الاسم الأول'),
      lastName: z.string().trim(),
      mobileNumber: z.string().trim().min(1, 'أدخل رقم الهاتف'),
      roleId: z
        .string()
        .refine(
          (value) => roles.some((role) => String(role.id) === value),
          'اختر دوراً للمستخدم'
        )
        .transform(Number),
      ...(editing
        ? { isActive: z.boolean() }
        : {
            password: z.string().min(1, 'أدخل كلمة المرور'),
            confirmPassword: z.string(),
          }),
    })
    .refine((values) => editing || values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: 'كلمتا المرور غير متطابقتين',
    });
