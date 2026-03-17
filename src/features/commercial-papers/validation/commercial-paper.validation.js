import z from 'zod';

export const commercialPaperSchema = z.object({
  paperNumber: z.string().required(),
  type: z.string().required(),
  amount: z.number().required(),
});