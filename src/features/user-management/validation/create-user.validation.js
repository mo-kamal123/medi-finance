import { z } from 'zod';

export const createUserSchema = (users, roles, currentUser) =>
  z
    .object({
      name: z.string().trim().min(2, 'أدخل الاسم الكامل (حرفان على الأقل)'),
      username: z
        .string()
        .trim()
        .min(3, 'اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل')
        .regex(/^[a-zA-Z0-9._-]+$/, 'استخدم أحرفاً إنجليزية وأرقاماً أو . _ -')
        .refine(
          (value) =>
            !users.some(
              (user) =>
                user.id !== currentUser?.id &&
                user.username.toLowerCase() === value.toLowerCase()
            ),
          'اسم المستخدم مستخدم بالفعل'
        ),
      email: z
        .string()
        .trim()
        .email('أدخل بريداً إلكترونياً صحيحاً')
        .refine(
          (value) =>
            !users.some(
              (user) =>
                user.id !== currentUser?.id &&
                user.email.toLowerCase() === value.toLowerCase()
            ),
          'البريد الإلكتروني مستخدم بالفعل'
        ),
      roleId: z
        .string()
        .refine(
          (value) =>
            roles.some(
              (role) =>
                role.id === value &&
                (role.status === 'active' || value === currentUser?.roleId)
            ),
          'اختر دوراً نشطاً للمستخدم'
        ),
      status: z.enum(['active', 'inactive']),
      password: currentUser
        ? z.string().optional()
        : z.string().min(8, 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل'),
      confirmPassword: currentUser
        ? z.string().optional()
        : z.string().min(1, 'أعد إدخال كلمة المرور'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'كلمتا المرور غير متطابقتين',
    });
