import z from 'zod';

export const costSchema = z.object({
  ccCode: z.string().min(1, 'رقم المركز مطلوب'),
  nameAr: z.string().min(2, 'الاسم بالعربية مطلوب'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
  parentID: z.coerce.number(),
  isActive: z.boolean(),
  isFinal: z.boolean(),
  user: z.string().min(1, 'اسم المستخدم مطلوب'),
});
