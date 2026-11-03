import { z } from 'zod';
import { toEnglishDigits } from '../../../shared/utils/formatters.js';

const normalizePhone = (value) => toEnglishDigits(value).replace(/[ -]/g, '');

export const createUserSchema = (roles, user) =>
  z
    .object({
      firstName: z.string().trim().min(1, 'أدخل الاسم الأول'),
      lastName: z.string().trim(),
      mobileNumber: z
        .string()
        .trim()
        .min(1, 'أدخل رقم الهاتف')
        .refine(
          (value) =>
            value === user?.mobileNumber?.trim() ||
            /^\+?[0-9]{7,15}$/.test(normalizePhone(value)),
          'أدخل رقم هاتف صحيحاً من 7 إلى 15 رقماً'
        )
        .transform((value) =>
          value === user?.mobileNumber?.trim()
            ? user.mobileNumber
            : normalizePhone(value)
        ),
      roleId: z
        .string()
        .refine(
          (value) => roles.some((role) => String(role.id) === value),
          'اختر دوراً للمستخدم'
        )
        .transform(Number),
      ...(user
        ? { isActive: z.boolean() }
        : {
            password: z
              .string()
              .min(8, 'أدخل كلمة مرور من 8 أحرف على الأقل')
              .refine((value) => Boolean(value.trim()), 'أدخل كلمة مرور صالحة'),
            confirmPassword: z.string().min(1, 'أعد إدخال كلمة المرور'),
          }),
    })
    .refine(
      (values) =>
        user ||
        !values.confirmPassword ||
        values.password === values.confirmPassword,
      {
        path: ['confirmPassword'],
        message: 'كلمتا المرور غير متطابقتين',
      }
    );
