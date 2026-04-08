import { z } from 'zod';

export const chequeSchema = z.object({
  customerID: z.string().nonempty('العميل مطلوب'),
  chequeNumber: z.string().nonempty('رقم الشيك مطلوب'),
  chequeDate: z.string().nonempty('تاريخ الشيك مطلوب'),
  amount: z.coerce.number().min(0.01, 'القيمة مطلوبة'),
  bankID: z.string().nonempty('البنك مطلوب'),
  invoiceID: z.string().optional(),
  notes: z.string().optional(),
});
