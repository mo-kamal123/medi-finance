import { z } from 'zod';

const optionalEmail = z.union([
  z.literal(''),
  z.string().email('البريد الإلكتروني غير صحيح'),
  z.null(),
  z.undefined(),
]);

export const bankSchema = z.object({
  bankCode: z.string().trim().min(1, 'كود البنك مطلوب'),
  bankNameAr: z.string().trim().min(1, 'اسم البنك بالعربية مطلوب'),
  bankNameEn: z.string().trim().min(1, 'اسم البنك بالإنجليزية مطلوب'),
  swiftCode: z.string().optional(),
  countryCode: z.string().trim().min(1, 'كود الدولة مطلوب'),
  phone: z.string().optional(),
  email: optionalEmail,
  website: z.string().optional(),
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  isActive: z.boolean().default(true),
});
