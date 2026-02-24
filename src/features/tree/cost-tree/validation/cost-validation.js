import z from 'zod';

export const costSchema = z.object({
  costCenterID: z.coerce.number().optional(),

  ccCode: z.string().min(1, 'رقم المركز مطلوب'),

  nameAr: z.string().min(2, 'الاسم بالعربية مطلوب'),

  nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),

  parentID: z
    .union([z.coerce.number(), z.literal('')])
    .optional()
    .transform((val) => {
      if (val === '' || val === 0) return null;
      return val;
    }),

  isActive: z.boolean(),

  isFinal: z.boolean(),

  user: z.string().min(1, 'اسم المستخدم مطلوب'),
});