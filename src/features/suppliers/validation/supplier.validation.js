import { z } from 'zod';

export const supplierSchema = z.object({
  supplierID: z.coerce.number().optional(),
  supplierCode: z.string().min(1, 'كود المورد مطلوب'),
  supplierNameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
  supplierNameEn: z.string().optional(),
  supplierType: z.coerce.number(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('بريد غير صالح').optional().or(z.literal('')),
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  taxNumber: z.string().optional(),
  paymentTermDays: z.coerce.number().default(0),
  currencyID: z.coerce.number().optional(),
  accountID: z.coerce.number().optional(),
  defaultCostCenterID: z.coerce.number().optional(),
  isTaxable: z.boolean().default(false),
  isActive: z.boolean().default(true),
  user: z.string().optional(),
});
