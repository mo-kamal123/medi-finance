import { z } from 'zod';

export const chequeSchema = z
  .object({
    chequeType: z.string().min(1, 'نوع الشيك مطلوب'),
    customerID: z.string().optional().default(''),
    supplierID: z.string().optional().default(''),
    chequeNumber: z
      .string()
      .trim()
      .min(1, 'رقم الشيك مطلوب')
      .regex(/^\d+$/, 'رقم الشيك يجب أن يحتوي على أرقام فقط'),
    chequeDate: z.string().min(1, 'تاريخ الشيك مطلوب'),
    receiptDate: z.string().min(1, 'تاريخ الاستلام مطلوب'),
    dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
    amount: z
      .union([z.string(), z.number()])
      .refine(
        (val) => String(val ?? '').trim() !== '' && !Number.isNaN(Number(val)),
        'القيمة مطلوبة'
      )
      .refine((val) => Number(val) > 0, 'القيمة يجب أن تكون أكبر من صفر'),
    currencyID: z.string().optional().default(''),
    exchangeRate: z.coerce.number().optional().default(1),
    bankID: z.string().min(1, 'البنك مطلوب'),
    bankAccountID: z.string().min(1, 'الحساب البنكي مطلوب'),
    bankBranchName: z.string().optional().default(''),
    cardNumber: z.string().optional().default(''),
    underDeliveryAccountID: z.string().optional().default(''),
    collectionAccountID: z.string().optional().default(''),
    counterAccountID: z.string().optional().default(''),
    costCenterID: z.string().optional().default(''),
    invoiceID: z.string().optional().default(''),
    statusID: z.string().optional().default(''),
    isNonCashable: z.boolean().optional().default(false),
    isBearerOnly: z.boolean().optional().default(false),
    hasAttachmentPage: z.boolean().optional().default(false),
    beneficiaryName: z.string().optional().default(''),
    branchName: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.chequeType === '0' && !data.customerID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customerID'],
        message: 'يجب اختيار عميل',
      });
    }
    if (data.chequeType === '1' && !data.supplierID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supplierID'],
        message: 'يجب اختيار مورد',
      });
    }
    // Date ordering (YYYY-MM-DD strings compare chronologically)
    if (
      data.chequeDate &&
      data.receiptDate &&
      data.receiptDate < data.chequeDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['receiptDate'],
        message: 'تاريخ الاستلام يجب ألا يكون قبل تاريخ الشيك',
      });
    }
    if (data.chequeDate && data.dueDate && data.dueDate < data.chequeDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: 'تاريخ الاستحقاق يجب ألا يكون قبل تاريخ الشيك',
      });
    }
    if (
      data.receiptDate &&
      data.dueDate &&
      data.dueDate < data.receiptDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: 'تاريخ الاستحقاق يجب ألا يكون قبل تاريخ الاستلام',
      });
    }
  });

export const depositSchema = z.object({
  bankAccountID: z.string().min(1, 'حساب البنك مطلوب'),
  depositDate: z.string().optional().default(''),
  depositReference: z.string().optional().default(''),
});

export const collectSchema = z.object({
  collectionDate: z.string().optional().default(''),
});

export const returnSchema = z.object({
  returnReason: z.string().min(1, 'سبب الإرجاع مطلوب'),
  returnDate: z.string().optional().default(''),
});

export const cashSchema = z.object({
  cashDate: z.string().optional().default(''),
});
