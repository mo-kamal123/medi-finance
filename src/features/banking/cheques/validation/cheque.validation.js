import { z } from 'zod';

import { isMoneyAmount, toCents } from '../utils/cheque-payload.js';

const requiredId = (message) => z.string().refine(
  (value) => Number.isInteger(Number(value)) && Number(value) > 0,
  message
);

const paymentInvoiceSchema = z.object({
  invoiceID: z.number().int().positive(),
  amount: z.union([z.string(), z.number()]).refine(isMoneyAmount, 'مبلغ الفاتورة يجب أن يكون موجباً وبحد أقصى منزلتين عشريتين'),
  remainingAmount: z.number().optional(),
  availableAmount: z.number().optional(),
  supplierID: z.number().optional(),
});

export const paymentChequesSchema = z.object({
  bankID: requiredId('البنك مطلوب'),
  bankAccountID: requiredId('الحساب البنكي مطلوب'),
  supplierID: requiredId('يجب اختيار مورد'),
  voucherDate: z.iso.date({ error: 'تاريخ السند غير صالح' }),
  currencyID: requiredId('العملة مطلوبة'),
  costCenterID: z.string().optional().default(''),
  cheques: z.array(z.object({
    invoicePayments: z.array(paymentInvoiceSchema).default([]),
    chequeNumber: z.string().trim().min(1, 'رقم الشيك مطلوب'),
    chequeDate: z.iso.date({ error: 'تاريخ الشيك غير صالح' }),
    dueDate: z.iso.date({ error: 'تاريخ الاستحقاق غير صالح' }),
    amount: z.union([z.string(), z.number()]).refine(isMoneyAmount, 'القيمة يجب أن تكون موجبة وبحد أقصى منزلتين عشريتين'),
    beneficiaryName: z.string().trim().min(1, 'اسم المستفيد مطلوب'),
  }).superRefine((cheque, ctx) => {
    if (cheque.dueDate < cheque.chequeDate) {
      ctx.addIssue({ code: 'custom', path: ['dueDate'], message: 'تاريخ الاستحقاق يجب ألا يكون قبل تاريخ الشيك' });
    }
  })).min(1, 'أضف شيكاً واحداً على الأقل'),
}).superRefine((data, ctx) => {
  const numbers = new Set();
  const allocated = new Map();
  data.cheques.forEach((cheque) => cheque.invoicePayments.forEach((payment) => {
    allocated.set(payment.invoiceID, (allocated.get(payment.invoiceID) ?? 0) + toCents(payment.amount));
  }));
  data.cheques.forEach((cheque, index) => {
    if (numbers.has(cheque.chequeNumber)) {
      ctx.addIssue({ code: 'custom', path: ['cheques', index, 'chequeNumber'], message: 'لا يمكن تكرار رقم الشيك' });
    }
    numbers.add(cheque.chequeNumber);
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: ['cheques', index, ...path], message });
    const payments = cheque.invoicePayments;
    if (payments.length) {
      if (new Set(payments.map((payment) => payment.invoiceID)).size !== payments.length) {
        issue(['invoicePayments'], 'لا يمكن تكرار الفاتورة');
      }
      if (payments.reduce((sum, payment) => sum + toCents(payment.amount), 0) !== toCents(cheque.amount)) {
        issue(['amount'], 'مجموع مبالغ الفواتير يجب أن يساوي مبلغ الشيك');
      }
      if (Number(data.currencyID) !== 1) issue(['invoicePayments'], 'ربط الفواتير متاح بالجنيه المصري فقط');
      payments.forEach((payment, paymentIndex) => {
        if (payment.supplierID != null && payment.supplierID !== Number(data.supplierID)) {
          issue(['invoicePayments'], 'يجب أن تكون الفواتير لنفس المورد المحدد');
        }
        const limit = payment.availableAmount ?? payment.remainingAmount;
        if (limit != null && allocated.get(payment.invoiceID) > toCents(limit)) {
          issue(['invoicePayments', paymentIndex, 'amount'], 'إجمالي المبالغ المخصصة للفاتورة في الشيكات يتجاوز المتاح');
        }
      });
    }
  });
});

export const chequeSchema = z
  .object({
    chequeType: z.enum(['0', '1'], { error: 'نوع الشيك مطلوب' }),
    customerID: z.string().optional().default(''),
    supplierID: z.string().optional().default(''),
    chequeNumber: z
      .string()
      .trim()
      .min(1, 'رقم الشيك مطلوب'),
    receiptDate: z.iso.date({ error: 'تاريخ الشيك غير صالح' }),
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
    bankAccountID: z.string().optional().default(''),
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
    beneficiaryName: z.string({ error: 'اسم المستفيد مطلوب' }).trim().min(1, 'اسم المستفيد مطلوب'),
    branchName: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.chequeType === '0' && !data.bankAccountID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bankAccountID'],
        message: 'الحساب البنكي مطلوب',
      });
    }
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
      data.receiptDate &&
      data.dueDate &&
      data.dueDate < data.receiptDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: 'تاريخ الاستحقاق يجب ألا يكون قبل تاريخ الشيك',
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
