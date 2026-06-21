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
      'معرف المنتج أو الخدمة مطلوب'
    ),

  quantity: detailNumber(1, 'الكمية يجب أن تكون على الأقل 1'),

  unitPrice: detailNumber(0, 'سعر الوحدة لا يمكن أن يكون سالب'),

  discountPercentage: detailNumber(0, 'الخصم لا يمكن أن يكون سالب'),

  taxPercentage: detailNumber(0, 'الضريبة لا يمكن أن تكون سالبة'),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().nonempty('رقم الفاتورة مطلوب'),

  invoiceDate: z.string().nonempty('تاريخ الفاتورة مطلوب'),

  dueDate: z.string().nonempty('تاريخ الاستحقاق مطلوب'),

  invoiceTypeID: z.string().nonempty('نوع الفاتورة مطلوب'),

  customerID: z.string().optional(),
  supplierID: z.string().optional(),

  taxAmount: z.coerce.number().min(0, 'قيمة الضريبة لا يمكن أن تكون سالبة'),

  discountAmount: z.coerce.number().min(0, 'قيمة الخصم لا can be negative'),

  financialPeriodID: z.string().nonempty('الفترة المالية مطلوبة'),

  statusId: z.string().nonempty('الحالة مطلوبة'),

  details: z.array(invoiceDetailSchema).min(1, 'يجب إضافة سطر واحد على الأقل'),
});
