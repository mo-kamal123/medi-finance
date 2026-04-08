import { z } from 'zod';

export const invoiceDetailSchema = z.object({
  productServiceID: z.coerce.number().min(1, 'معرف المنتج أو الخدمة مطلوب'),

  quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون على الأقل 1'),

  unitPrice: z.coerce.number().min(0, 'سعر الوحدة لا يمكن أن يكون سالب'),

  discountPercentage: z.coerce.number().min(0, 'الخصم لا يمكن أن يكون سالب'),

  taxPercentage: z.coerce.number().min(0, 'الضريبة لا يمكن أن تكون سالبة'),
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

  status: z.string().nonempty('الحالة مطلوبة'),

  details: z.array(invoiceDetailSchema).min(1, 'يجب إضافة سطر واحد على الأقل'),
});
