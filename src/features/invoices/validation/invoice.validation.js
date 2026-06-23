import { z } from 'zod';

const detailNumber = (minValue, message) =>
  z
    .union([z.string(), z.number()])
    .refine(
      (value) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value)) &&
        Number(value) >= minValue,
      message
    );

export const invoiceDetailSchema = z.object({
  invoiceDetailID: z.coerce.number().optional(),

  productServiceID: z
    .union([z.string(), z.number()])
    .refine(
      (value) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        Number(value) >= 1,
      'الخدمة مطلوبة'
    ),

  quantity: detailNumber(1, 'الكمية يجب أن تكون 1 على الأقل'),

  unitPrice: detailNumber(0, 'سعر الوحدة مطلوب'),

  discountPercentage: detailNumber(0, 'نسبة الخصم لا يمكن أن تكون سالبة'),

  taxPercentage: detailNumber(0, 'نسبة الضريبة لا يمكن أن تكون سالبة'),
});

export const invoiceSchema = z
  .object({
    invoiceNumber: z.string().min(1, 'رقم الفاتورة مطلوب'),

    invoiceDate: z.string().min(1, 'تاريخ الفاتورة مطلوب'),

    dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),

    invoiceTypeID: z.string().min(1, 'نوع الفاتورة مطلوب'),

    customerID: z.string().optional(),
    supplierID: z.string().optional(),

    taxAmount: z.coerce.number().min(0, 'قيمة الضريبة لا يمكن أن تكون سالبة'),

    discountAmount: z.coerce.number().min(0, 'قيمة الخصم لا يمكن أن تكون سالبة'),

    financialPeriodID: z.string().min(1, 'الفترة المالية مطلوبة'),

    statusId: z.string().min(1, 'الحالة مطلوبة'),

    details: z
      .array(invoiceDetailSchema)
      .min(1, 'يجب إضافة سطر واحد على الأقل'),
  })
  .superRefine((data, ctx) => {
    if (!data.customerID && !data.supplierID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يجب اختيار عميل أو مورد',
        path: ['customerID'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يجب اختيار عميل أو مورد',
        path: ['supplierID'],
      });
    }
  });
