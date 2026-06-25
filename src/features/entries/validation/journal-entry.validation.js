import { z } from 'zod';

/**
 * Validates each detail row:
 * - accountID is required
 * - at least one of debitAmount/creditAmount must be filled
 */
const detailSchema = z.object({
  rowKey: z.string(),
  journalEntryDetailID: z.any().optional(),
  invoiceNumber: z.string().optional().default(''),
  accountID: z.string().min(1, 'الحساب مطلوب'),
  costCenterID: z.string().optional().default(''),
  customerID: z.string().optional().default(''),
  supplierID: z.string().optional().default(''),
  customerNameAr: z.string().optional().default(''),
  supplierNameAr: z.string().optional().default(''),
  recordDate: z.string().optional().default(''),
  documentNumber: z.string().optional().default(''),
  debitAmount: z.string().optional().default(''),
  creditAmount: z.string().optional().default(''),
  description: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  if (!data.debitAmount && !data.creditAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'يجب إدخال مبلغ مدين أو دائن',
      path: ['debitAmount'],
    });
  }
});

/**
 * Main journal entry schema:
 * - entryDate, journalType, financialPeriodID are required
 * - totalDebit must equal totalCredit (balanced entry)
 */
export const journalEntrySchema = z.object({
  entryDate: z.string().min(1, 'التاريخ مطلوب'),
  journalType: z.string().min(1, 'نوع القيد مطلوب'),
  description: z.string().optional().default(''),
  referenceNumber: z.string().optional().default(''),
  financialPeriodID: z.string().min(1, 'الفترة المالية مطلوبة'),
  statusID: z.string().min(1, 'الحالة مطلوبة'),
  currencyID: z.string().optional().default(''),
  exchangeRate: z.string().optional().default(''),
  details: z.array(detailSchema).min(1, 'يجب إضافة سطر واحد على الأقل'),
}).superRefine((data, ctx) => {
  const totalDebit = data.details.reduce((s, r) => s + (Number(r.debitAmount) || 0), 0);
  const totalCredit = data.details.reduce((s, r) => s + (Number(r.creditAmount) || 0), 0);
  if (totalDebit !== totalCredit || totalDebit === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'يجب أن يكون مجموع المدين مساوياً للدائن',
      path: ['balance'],
    });
  }
});
