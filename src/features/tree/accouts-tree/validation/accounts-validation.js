import z from 'zod';

export const accountSchema = z.object({
  accountID: z.number(),

  accountCode: z.string().min(1, 'رقم الحساب مطلوب'),

  nameAr: z.string().min(2, 'الاسم العربي مطلوب'),

  nameEn: z.string().min(2, 'الاسم الإنجليزي مطلوب'),

  parentID: z.coerce.number(),

  accountType: z.string().min(1, 'نوع الحساب مطلوب'),

  isActive: z.boolean(),

  isFinal: z.boolean(),

  user: z.string().min(1, 'اسم المستخدم مطلوب'),
});
