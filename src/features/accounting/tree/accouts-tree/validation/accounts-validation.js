import z from 'zod';

export const accountSchema = z.object({
  accountID: z.coerce.number().optional(),

  accountCode: z.string().optional(),

  nameAr: z.string().min(2, 'الاسم العربي مطلوب'),

  nameEn: z
    .string()
    .trim()
    .refine((value) => value === '' || value.length >= 2, {
      message: 'الاسم الإنجليزي يجب أن يتكون من حرفين على الأقل',
    })
    .optional()
    .default(''),

  parentId: z
    .union([z.coerce.number(), z.literal('')])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === '' || val == null || val === 0) return null;
      return val;
    }),

  accountTypeId: z.coerce
    .number({ invalid_type_error: 'نوع الحساب مطلوب' })
    .refine((val) => val > 0, { message: 'نوع الحساب مطلوب' }),

  lockedInJournal: z.boolean(),

  isActive: z.boolean(),
});
