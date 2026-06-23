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

export const cashVoucherSchema = z.object({
  isReceipt: z.boolean(),
  date: z.string().min(1, 'تاريخ السند مطلوب'),
  bankId: z.string().min(1, 'البنك مطلوب'),
  bankAccountId: z.string().min(1, 'حساب البنك مطلوب'),
  checkNumber: z.string().min(1, 'رقم الشيك مطلوب'),
  costCenterId: z.string().optional().default(''),
  invoiceNumber: z.string().optional().default(''),
  details: z
    .array(cashVoucherDetailSchema)
    .min(1, 'يجب إضافة سطر واحد على الأقل'),
});
