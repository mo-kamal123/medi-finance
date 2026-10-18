import { z } from 'zod';

import { isMoneyAmount, toCents } from '../utils/cheque-payload.js';

export const chequeSchema = z
  .object({
    chequeType: z.enum(['0', '1'], { error: 'نوع الشيك مطلوب' }),
    customerID: z.string().optional().default(''),
    supplierID: z.string().optional().default(''),
    chequeNumber: z
      .string()
      .trim()
      .min(1, 'رقم الشيك مطلوب'),
    chequeDate: z.iso.date({ error: 'تاريخ الشيك غير صالح' }),
    receiptDate: z.iso.date({ error: 'تاريخ الاستلام غير صالح' }),
    dueDate: z.iso.date({ error: 'تاريخ الاستحقاق غير صالح' }),
    amount: z
      .union([z.string(), z.number()])
      .refine(
        isMoneyAmount,
        'القيمة يجب أن تكون موجبة وبحد أقصى منزلتين عشريتين'
      ),
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
    invoiceAllocationMode: z.enum(['full', 'partial']).default('partial'),
    invoicePayments: z.array(z.object({
      invoiceID: z.number().int().positive(),
      amount: z.union([z.string(), z.number()]).refine(isMoneyAmount, 'مبلغ الفاتورة يجب أن يكون موجباً وبحد أقصى منزلتين عشريتين'),
      remainingAmount: z.number().optional(),
      availableAmount: z.number().optional(),
      customerID: z.number().optional(),
      supplierID: z.number().optional(),
    })).default([]),
    statusID: z.string().optional().default(''),
    isNonCashable: z.boolean().optional().default(false),
    isBearerOnly: z.boolean().optional().default(false),
    hasAttachmentPage: z.boolean().optional().default(false),
    beneficiaryName: z.string().optional().default(''),
    branchName: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.chequeType === '0' && !(Number(data.customerID) > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customerID'],
        message: 'يجب اختيار عميل',
      });
    }
    if (data.chequeType === '1' && !(Number(data.supplierID) > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supplierID'],
        message: 'يجب اختيار مورد',
      });
    }
    const payments = data.invoicePayments;
    const issue = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    if (payments.length) {
      if (new Set(payments.map((row) => row.invoiceID)).size !== payments.length) {
        issue(['invoicePayments'], 'لا يمكن تكرار الفاتورة');
      }
      if (payments.reduce((sum, row) => sum + toCents(row.amount), 0) !== toCents(data.amount)) {
        issue(['amount'], 'مجموع مبالغ الفواتير يجب أن يساوي مبلغ الشيك');
      }
      if (Number(data.currencyID) !== 1 || data.exchangeRate !== 1) {
        issue(['invoicePayments'], 'ربط الفواتير متاح بالجنيه المصري فقط وبسعر صرف 1');
      }
      payments.forEach((row, index) => {
        const limit = row.availableAmount ?? row.remainingAmount;
        if (limit != null && toCents(row.amount) > toCents(limit)) {
          issue(['invoicePayments', index, 'amount'], 'المبلغ يتجاوز المتاح للفاتورة بعد الشيكات المعلقة');
        }
        if (data.invoiceAllocationMode === 'full' && row.remainingAmount != null && toCents(row.amount) !== toCents(row.remainingAmount)) {
          issue(['invoicePayments', index, 'amount'], 'اختر كامل المتبقي للفاتورة أو استخدم مبلغاً محدداً');
        }
        const partyID = data.chequeType === '0' ? row.customerID : row.supplierID;
        const selectedPartyID = data.chequeType === '0' ? data.customerID : data.supplierID;
        if (partyID != null && partyID !== Number(selectedPartyID)) {
          issue(['invoicePayments'], 'يجب أن تكون الفواتير لنفس العميل أو المورد المحدد');
        }
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
