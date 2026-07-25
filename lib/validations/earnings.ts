import { z } from 'zod';

export const earningsSchema = z.object({
  consultationFee: z.coerce.number().min(0).default(0),
  procedureFeeTotal: z.coerce.number().min(0).default(0),
  procedureFeePaid: z.coerce.number().min(0).default(0),
  medicineCharge: z.coerce.number().min(0).default(0),
  paymentStatus: z.enum(['settled', 'pending']).default('pending'),
  waivedNote: z.string().max(500).optional().nullable(),
});

export type EarningsInput = z.infer<typeof earningsSchema>;
