// Pay-invoice utilities (schema, constants, payload/option helpers).

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PAYMENT_MODE_OPTIONS = [
  { value: '1', label: 'شيك' },
  { value: '2', label: 'نقدي' },
  { value: '3', label: 'تحويل بنكي' },
];

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

export const payInvoiceSchema = z
  .object({
    paymentMode: z.string().min(1, 'طريقة الدفع مطلوبة'),
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
    paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
    referenceNumber: z.string().optional().default(''),
    bankID: z.string().optional().default(''),
    bankAccountID: z.string().optional().default(''),
    accountID: z.string().optional().default(''),
    checkNumber: z.string().optional().default(''),
    fromBankAccountID: z.string().optional().default(''),
    toBankAccountID: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode === '1') {
      if (!data.bankID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankID'], message: 'البنك مطلوب' });
      }
      if (!data.bankAccountID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bankAccountID'], message: 'حساب البنك مطلوب' });
      }
      if (!data.checkNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['checkNumber'], message: 'رقم الشيك مطلوب' });
      }
    }
    if (data.paymentMode === '2' && !data.accountID) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['accountID'], message: 'الحساب مطلوب' });
    }
    if (data.paymentMode === '3') {
      if (!data.fromBankAccountID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fromBankAccountID'], message: 'من حساب مطلوب' });
      }
      if (!data.toBankAccountID) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['toBankAccountID'], message: 'إلى حساب مطلوب' });
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
export const buildPaymentPayload = (data) => ({
  amount: Number(data.amount),
  paymentMode:
    data.paymentMode === '1'
      ? 'Check'
      : data.paymentMode === '2'
        ? 'Cash'
        : 'BankTransfer',
  paymentDate: `${data.paymentDate}T00:00:00`,
  referenceNumber: data.referenceNumber || null,
  bankID: data.paymentMode === '1' ? Number(data.bankID) : null,
  bankAccountID: data.paymentMode === '1' ? Number(data.bankAccountID) : null,
  accountID: data.paymentMode === '2' ? Number(data.accountID) : null,
  checkNumber: data.paymentMode === '1' ? data.checkNumber : null,
  fromBankAccountID: data.paymentMode === '3' ? Number(data.fromBankAccountID) : null,
  toBankAccountID: data.paymentMode === '3' ? Number(data.toBankAccountID) : null,
});

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
