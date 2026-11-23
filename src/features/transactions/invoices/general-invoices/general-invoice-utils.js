import { z } from 'zod';

export const GENERAL_INVOICE_TYPE_ID = 8;
export const emptyGeneralDetail = () => ({
  accountID: '',
  amount: '',
  taxPercentage: '0',
  descriptionAr: '',
});

const positiveId = z
  .union([z.string(), z.number()])
  .refine(
    (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0,
    'اختر قيمة صحيحة'
  );
const numeric = z.union([z.string(), z.number()]);

export const generalInvoiceSchema = z
  .object({
    invoiceNumber: z.string().trim().min(1, 'رقم الفاتورة مطلوب'),
    invoiceDate: z.iso.date({ error: 'تاريخ الفاتورة غير صالح' }),
    financialPeriodID: positiveId,
    paymentSource: z.enum(['Cash', 'Bank'], { error: 'اختر مصدر الدفع' }),
    bankAccountID: z.union([z.string(), z.number()]).nullable().optional(),
    referenceNumber: z.string().trim(),
    descriptionAr: z.string().trim(),
    details: z
      .array(
        z.object({
          accountID: positiveId,
          amount: numeric.refine(
            (value) => Number.isFinite(Number(value)) && Number(value) > 0,
            'المبلغ يجب أن يكون أكبر من صفر'
          ),
          taxPercentage: numeric.refine(
            (value) =>
              value !== '' &&
              Number.isFinite(Number(value)) &&
              Number(value) >= 0 &&
              Number(value) <= 100,
            'نسبة الضريبة من 0 إلى 100'
          ),
          descriptionAr: z.string().trim(),
        })
      )
      .min(1, 'أضف بنداً واحداً على الأقل'),
  })
  .superRefine((data, ctx) => {
    if (
      data.paymentSource === 'Bank' &&
      !positiveId.safeParse(data.bankAccountID).success
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['bankAccountID'],
        message: 'حساب البنك مطلوب',
      });
    }
  });

export const generalInvoiceDefaults = (invoice = {}) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const details = invoice.details ?? invoice.invoiceDetails ?? [];
  return {
    invoiceNumber: invoice.invoiceNumber ?? '',
    invoiceDate: invoice.invoiceDate?.split('T')[0] ?? today,
    financialPeriodID: String(invoice.financialPeriodID ?? ''),
    paymentSource: invoice.paymentSource ?? 'Cash',
    bankAccountID: String(invoice.bankAccountID ?? ''),
    referenceNumber: invoice.referenceNumber ?? '',
    descriptionAr: invoice.descriptionAr ?? '',
    details: details.length
      ? details.map((row) => ({
          accountID: String(row.accountID ?? ''),
          amount: String(row.amount ?? ''),
          taxPercentage: String(row.taxPercentage ?? 0),
          descriptionAr: row.descriptionAr ?? '',
        }))
      : [emptyGeneralDetail()],
  };
};

export const buildGeneralInvoicePayload = (data) => ({
  invoiceNumber: data.invoiceNumber,
  invoiceDate: `${data.invoiceDate}T00:00:00`,
  invoiceTypeID: GENERAL_INVOICE_TYPE_ID,
  financialPeriodID: Number(data.financialPeriodID),
  paymentSource: data.paymentSource,
  bankAccountID:
    data.paymentSource === 'Bank' ? Number(data.bankAccountID) : null,
  referenceNumber: data.referenceNumber,
  descriptionAr: data.descriptionAr,
  details: data.details.map((row) => ({
    accountID: Number(row.accountID),
    amount: Number(row.amount),
    taxPercentage: Number(row.taxPercentage),
    descriptionAr: row.descriptionAr,
  })),
});

export const calculateGeneralInvoiceTotals = (details = []) => {
  const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  const totalAmount = round(
    details.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
  );
  const taxAmount = round(
    details.reduce(
      (sum, row) =>
        sum +
        round(
          ((Number(row.amount) || 0) * (Number(row.taxPercentage) || 0)) / 100
        ),
      0
    )
  );
  return {
    totalAmount,
    taxAmount,
    totalDiscounts: 0,
    netAmount: round(totalAmount + taxAmount),
  };
};
