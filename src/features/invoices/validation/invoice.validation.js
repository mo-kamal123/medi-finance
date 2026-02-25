import { z } from 'zod';

export const invoiceDetailSchema = z.object({
  productServiceID: z.coerce
    .number({ invalid_type_error: 'معرف المنتج مطلوب' })
    .min(1, 'معرف المنتج مطلوب'),
  quantity: z.coerce
    .number({ invalid_type_error: 'الكمية يجب أن تكون رقم' })
    .min(1, 'الكمية يجب أن تكون على الأقل 1'),
  unitPrice: z.coerce
    .number({ invalid_type_error: 'سعر الوحدة يجب أن يكون رقم' })
    .min(0, 'سعر الوحدة لا يمكن أن يكون سالب'),
  discountPercentage: z.coerce
    .number({ invalid_type_error: 'الخصم يجب أن يكون رقم' })
    .min(0, 'الخصم لا يمكن أن يكون سالب'),
  taxPercentage: z.coerce
    .number({ invalid_type_error: 'الضريبة يجب أن تكون رقم' })
    .min(0, 'الضريبة لا يمكن أن تكون سالب'),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().nonempty('رقم الفاتورة مطلوب'),
  invoiceDate: z.string().nonempty('تاريخ الإصدار مطلوب'),
  dueDate: z.string().nonempty('تاريخ الاستحقاق مطلوب'),
  invoiceTypeID: z.string().nonempty('نوع الفاتورة مطلوب'),

  customerID: z.string().optional(),
  supplierID: z.string().optional(),

  taxAmount: z.coerce.number().min(0, 'المبلغ الضريبي لا يمكن أن يكون سالب'),
  discountAmount: z.coerce.number().min(0, 'المبلغ الخصم لا يمكن أن يكون سالب'),

  financialPeriodID: z.coerce.number().min(0, 'يجب اختيار الفترة المالية'),
  debtorAccountID: z.coerce.number().min(0, 'يجب اختيار حساب المدين'),
  creditorAccountID: z.coerce.number().min(0, 'يجب اختيار حساب الدائن'),
  taxAccountID: z.coerce.number().min(0, 'يجب اختيار حساب الضريبة'),
  discountAccountID: z.coerce.number().min(0, 'يجب اختيار حساب الخصم'),

  status: z.enum(['pending', 'paid', 'overdue']),
  details: z
    .array(invoiceDetailSchema)
    .min(1, 'يجب إضافة خدمة واحدة على الأقل'),
});
