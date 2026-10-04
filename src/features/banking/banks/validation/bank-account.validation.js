import { z } from 'zod';
import { normalizeIban, isValidEgyptianIban } from '../../../../shared/lib/iban';

const optionalIban = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .transform((value) => normalizeIban(value))
    .refine(
      (value) => /^EG[0-9]{2}[A-Z0-9]{25}$/.test(value),
      'رقم IBAN غير صحيح'
    )
    .refine(isValidEgyptianIban, 'رقم IBAN غير صحيح'),
  z.null(),
  z.undefined(),
]);

const nonNegativeAmount = z
  .union([z.string(), z.number()])
  .optional()
  .refine(
    (value) => value === undefined || value === '' || Number(value) >= 0,
    'لا يقبل أرقام سالبة'
  );

export const bankAccountSchema = z.object({
  accountNumber: z
    .string()
    .trim()
    .min(1, 'رقم الحساب مطلوب')
    .regex(/^[0-9]+$/, 'رقم الحساب يجب أن يحتوي على أرقام فقط'),
  branch: z.string().trim().min(1, 'الفرع مطلوب'),
  iban: optionalIban,
  accountNameAr: z.string().optional(),
  accountNameEn: z.string().optional(),
  currencyID: z.string().or(z.number()).refine((val) => Number(val) > 0, 'العملة مطلوبة'),
  openingBalance: nonNegativeAmount,
  minBalance: nonNegativeAmount,
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});
