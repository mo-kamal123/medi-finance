import { z } from "zod";

export const customerSchema = z.object({
  customerCode: z.string().min(1, "كود العميل مطلوب"),

  customerNameAr: z.string().min(1, "الاسم العربي مطلوب"),

  customerNameEn: z.string().optional(),

  customerType: z.coerce.number(),

  contactPerson: z.string().optional(),

  email: z.string().email("البريد غير صحيح").optional().or(z.literal("")),

  phone: z.string().optional(),

  addressAr: z.string().optional(),

  addressEn: z.string().optional(),

  taxNumber: z.string().optional(),

  isTaxable: z.boolean(),

  creditLimit: z.coerce.number().optional(),

  paymentTermDays: z.coerce.number().optional(),

  currencyID: z.coerce.number().optional(),

  accountID: z.coerce.number(),

  defaultCostCenterID: z.coerce.number().optional(),

  isActive: z.boolean(),

  user: z.string().min(1, "المستخدم مطلوب"),
});