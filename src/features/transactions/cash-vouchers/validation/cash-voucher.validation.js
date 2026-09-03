import { z } from 'zod';

export const cashVoucherDetailSchema = z.object({
  partyID: z.string().min(1, 'الطرف مطلوب'),
  partyName: z.string().optional().default(''),
  amount: z
    .union([z.string(), z.number()])
    .refine(
      (value) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value)) &&
        Number(value) > 0,
      'المبلغ مطلوب'
    ),
  notes: z.string().optional().default(''),
});

export const cashVoucherSchema = z
  .object({
    isReceipt: z.boolean(),
    date: z.string().min(1, 'تاريخ السند مطلوب'),
    paymentModeId: z.coerce.number(),
    statusId: z.string().optional().default(''),
    bankId: z.string().optional().default(''),
    bankAccountId: z.string().optional().default(''),
    checkNumber: z.string().optional().default(''),
    receiptDate: z.string().optional().default(''),
    dueDate: z.string().optional().default(''),
    costCenterId: z.string().optional().default(''),
    invoiceNumber: z.string().optional().default(''),
    details: z
      .array(cashVoucherDetailSchema)
      .min(1, 'يجب إضافة سطر واحد على الأقل'),
  })
  .superRefine((data, ctx) => {
    if (data.paymentModeId === 1) {
      if (!data.bankId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankId'], message: 'البنك مطلوب' });
      }
      if (!data.bankAccountId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankAccountId'], message: 'حساب البنك مطلوب' });
      }
      if (!data.checkNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['checkNumber'], message: 'رقم الشيك مطلوب' });
      }
    }
    if (data.paymentModeId === 2) {
      if (!data.costCenterId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['costCenterId'], message: 'مركز التكلفة مطلوب' });
      }
    }
    if (data.paymentModeId === 3) {
      if (!data.bankId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankId'], message: 'البنك مطلوب' });
      }
      if (!data.bankAccountId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankAccountId'], message: 'حساب البنك مطلوب' });
      }
    }
  });
