import { z } from 'zod';

export const transferSchema = z
  .object({
    transferType: z.enum(['internal', 'external'], {
      required_error: 'نوع التحويل مطلوب',
    }),
    fromAccountID: z.string().min(1, 'حساب المصدر مطلوب'),
    toBankID: z.string().optional(),
    toAccountID: z.string().optional(),
    partyType: z.enum(['customer', 'supplier']).optional(),
    partyID: z.string().optional(),
    amount: z
      .union([z.string(), z.number()])
      .refine((val) => Number(val) > 0, 'المبلغ يجب أن يكون أكبر من صفر'),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.transferType === 'internal') {
      if (!data.toBankID) {
        ctx.addIssue({
          code: 'custom',
          path: ['toBankID'],
          message: 'البنك الوجهة مطلوب',
        });
      }
      if (!data.toAccountID) {
        ctx.addIssue({
          code: 'custom',
          path: ['toAccountID'],
          message: 'حساب الوجهة مطلوب',
        });
      }
    }
    if (data.transferType === 'external' && !data.partyID) {
      ctx.addIssue({
        code: 'custom',
        path: ['partyID'],
        message: 'الطرف مطلوب',
      });
    }
  });
