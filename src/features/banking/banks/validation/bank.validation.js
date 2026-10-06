import { z } from 'zod';

const optionalTrimmedString = (schema) => z.preprocess(
  (value) => typeof value === 'string' ? value.trim() : value,
  z.union([z.literal(''), schema, z.null(), z.undefined()])
);

const optionalEmail = optionalTrimmedString(
  z.string().email('البريد الإلكتروني غير صحيح')
);

const optionalHotline = optionalTrimmedString(
  z.string().regex(/^[0-9]{3,6}$/, 'الخط الساخن يجب أن يتكون من 3 إلى 6 أرقام فقط')
);

const optionalSwift = optionalTrimmedString(
  z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$/,
      'يجب أن يكون طول الكود 8 أو 11 حرفًا'
    )
);

const optionalWebsite = optionalTrimmedString(
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
    )
);

const optionalEnglishName = optionalTrimmedString(
  z
    .string()
    .trim()
    .regex(
      /^[A-Za-z\s.'-]+$/,
      'الاسم بالإنجليزية يجب أن يحتوي على حروف إنجليزية فقط'
    )
);

export const bankSchema = z.object({
  bankCode: z.string().trim().min(1, 'كود البنك مطلوب'),
  bankNameAr: z
    .string()
    .trim()
    .min(1, 'اسم البنك بالعربية مطلوب')
    .regex(/^[\u0600-\u06FF\s]+$/, 'الاسم بالعربية يجب أن يحتوي على حروف عربية فقط'),
  bankNameEn: optionalEnglishName,
  swiftCode: optionalSwift,
  phone: optionalHotline,
  email: optionalEmail,
  website: optionalWebsite,
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  isActive: z.boolean().default(true),
});
