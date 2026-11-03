// Pay-invoice utilities (schema, constants, payload/option helpers).

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PAYMENT_MODE_OPTIONS = [
  { value: '1', label: 'شيك' },
  { value: '3', label: 'تحويل بنكي' },
];

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

export const payInvoiceSchema = z
  .object({
    paymentMode: z.enum(['1', '3'], { error: 'اختر شيك أو تحويل بنكي' }),
    amount: z
      .union([z.string(), z.number()])
      .refine(
        (value) =>
          value !== '' &&
          value !== null &&
          value !== undefined &&
          Number.isFinite(Number(value)) &&
          Number(value) > 0,
        'المبلغ مطلوب'
      ),
    paymentDate: z.iso.date({ error: 'تاريخ العملية غير صالح أو غير مكتمل' }),
    dueDate: z.string().optional(),
    bankID: z.string().optional().default(''),
    bankAccountID: z.string().optional().default(''),
    checkNumber: z.string().optional().default(''),
    referenceNumber: z.string().trim().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode === '1') {
      if (!z.iso.date().safeParse(data.dueDate).success) {
        ctx.addIssue({ code: 'custom', path: ['dueDate'], message: 'تاريخ الاستحقاق غير صالح أو غير مكتمل' });
      }
      if (!data.bankID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankID'], message: 'البنك مطلوب' });
      }
      if (!data.bankAccountID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankAccountID'], message: 'حساب البنك مطلوب' });
      }
      if (!data.checkNumber.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['checkNumber'], message: 'رقم الشيك مطلوب' });
      }
    }
    if (data.paymentMode === '3') {
      if (!/^[1-9]\d*$/.test(data.bankAccountID) || !Number.isSafeInteger(Number(data.bankAccountID))) {
        ctx.addIssue({ code: 'custom', path: ['bankAccountID'], message: 'حساب البنك مطلوب' });
      }
      if (!data.referenceNumber) {
        ctx.addIssue({ code: 'custom', path: ['referenceNumber'], message: 'الرقم المرجعي مطلوب' });
      }
    }
  });

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

/**
 * Normalise an API response that may be an array or an object with a `.data` property.
 */
export const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

/**
 * Transform the raw form values into the payload expected by the pay-invoice API.
 */
export const buildPaymentPayload = (data) => {
  if (data.paymentMode === '3') {
    return {
      amount: Number(data.amount),
      paymentMode: 'BankTransfer',
      bankAccountID: Number(data.bankAccountID),
      paymentDate: data.paymentDate,
      referenceNumber: data.referenceNumber,
    };
  }

  return {
    amount: Number(data.amount),
    paymentMode: 'Check',
    paymentMethodID: null,
    paymentDate: `${data.paymentDate}T00:00:00`,
    dueDate: `${data.dueDate}T00:00:00`,
    bankID: Number(data.bankID),
    bankAccountID: Number(data.bankAccountID),
    checkNumber: data.checkNumber,
    fromBankAccountID: null,
    toBankAccountID: null,
  };
};

/**
 * Build { value, label } options for bank dropdowns.
 */
export const buildBankOptions = (banks) =>
  banks.map((bank) => ({
    value: String(bank.bankID),
    label: bank.bankNameAr || bank.bankNameEn || bank.bankCode,
  }));

/**
 * Build { value, label } options for bank-account dropdowns.
 */
export const buildBankAccountOptions = (accounts) =>
  accounts.map((account) => ({
    value: String(account.bankAccountID || account.id),
    label:
      account.accountNumberWithBranch ||
      account.accountNumber ||
      account.iban ||
      account.accountNameAr ||
      account.accountNameEn ||
      String(account.bankAccountID || account.id),
  }));

/**
 * Build labelled options for the "all accounts" (bank transfer) dropdown,
 * appending the bank name to each label.
 */
export const buildAllBankAccountOptions = (accounts) =>
  accounts.map((account) => ({
    value: String(account.bankAccountID || account.id),
    label: `${
      account.accountNumberWithBranch ||
      account.accountNumber ||
      account.iban ||
      account.accountNameAr ||
      account.accountNameEn ||
      String(account.bankAccountID || account.id)
    } - ${account.bankNameAr || account.bankNameEn || ''}`,
  }));

/**
 * Filter bank accounts belonging to a specific bank.
 */
export const filterBankAccounts = (allAccounts, bankId, paymentMode) =>
  paymentMode === '1' && bankId
    ? allAccounts.filter((acc) => String(acc.bankID) === String(bankId))
    : [];
