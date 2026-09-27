import { z } from 'zod';

const optionalEmail = z.union([
  z.literal(''),
  z.string().email('البريد الإلكتروني غير صحيح'),
  z.null(),
  z.undefined(),
]);

const optionalPhone = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{7,20}$/, 'رقم الهاتف غير صحيح'),
  z.null(),
  z.undefined(),
]);

const optionalSwift = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$/,
      'يجب أن يكون طول الكود 8 أو 11 حرفًا'
    ),
  z.null(),
  z.undefined(),
]);

const optionalWebsite = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .refine(
      (value) => {
        try {
          const url = new URL(
            value.includes('://') ? value : `https://${value}`
          );
          return /^https?:$/i.test(url.protocol);
        } catch {
          return false;
        }
      },
      'الموقع الإلكتروني غير صحيح'
    ),
  z.null(),
  z.undefined(),
]);

const optionalEnglishName = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .regex(
      /^[A-Za-z\s.'-]+$/,
      'الاسم بالإنجليزية يجب أن يحتوي على حروف إنجليزية فقط'
    ),
  z.null(),
  z.undefined(),
]);

export const bankSchema = z.object({
  bankCode: z.string().trim().min(1, 'كود البنك مطلوب'),
  bankNameAr: z
    .string()
    .trim()
    .min(1, 'اسم البنك بالعربية مطلوب')
    .regex(/^[\u0600-\u06FF\s]+$/, 'الاسم بالعربية يجب أن يحتوي على حروف عربية فقط'),
  bankNameEn: optionalEnglishName,
  swiftCode: optionalSwift,
  phone: optionalPhone,
  email: optionalEmail,
  website: optionalWebsite,
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  isActive: z.boolean().default(true),
});