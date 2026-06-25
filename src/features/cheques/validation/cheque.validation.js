import { z } from 'zod';

export const chequeSchema = z
  .object({
    customerID: z.string().optional().default(''),
    supplierID: z.string().optional().default(''),
    chequeNumber: z.string().min(1, 'رقم الشيك مطلوب'),
    chequeDate: z.string().min(1, 'تاريخ الشيك مطلوب'),
    receiptDate: z.string().optional().default(''),
    dueDate: z.string().optional().default(''),
    voucherDate: z.string().optional().default(''),
    amount: z.coerce.number().min(0.01, 'القيمة مطلوبة'),
    currencyID: z.string().optional().default(''),
    exchangeRate: z.coerce.number().optional().default(1),
    bankID: z.string().min(1, 'البنك مطلوب'),
    underDeliveryAccountID: z.string().optional().default(''),
    collectionAccountID: z.string().optional().default(''),
    counterAccountID: z.string().optional().default(''),
    invoiceID: z.string().optional().default(''),
    isNonCashable: z.boolean().optional().default(false),
    isBearerOnly: z.boolean().optional().default(false),
    hasAttachmentPage: z.boolean().optional().default(false),
    beneficiaryName: z.string().optional().default(''),
    branchName: z.string().optional().default(''),
    bankBranchName: z.string().optional().default(''),
    cardNumber: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (!data.customerID && !data.supplierID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customerID'],
        message: 'يجب اختيار عميل أو مورد',
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supplierID'],
        message: 'يجب اختيار عميل أو مورد',
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
