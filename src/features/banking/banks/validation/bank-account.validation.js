import { z } from 'zod';

export const bankAccountSchema = z.object({
  accountNumber: z.string().trim().min(1, 'رقم الحساب مطلوب'),
  branch: z.string().optional(),
  iban: z.string().optional(),
  accountNameAr: z.string().optional(),
  accountNameEn: z.string().optional(),
  currencyID: z.string().or(z.number()).refine((val) => Number(val) > 0, 'العملة مطلوبة'),
  openingBalance: z.union([z.string(), z.number()]).optional().default(0),
  minBalance: z.union([z.string(), z.number()]).optional().default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});
