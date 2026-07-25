import { z } from 'zod';

export const followUpSchema = z.object({
  visitId: z.coerce.number().int().positive(),
  patientId: z.coerce.number().int().positive(),
  treatmentName: z.string().min(1).max(200),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional().nullable(),
});

export const followUpUpdateSchema = z.object({
  status: z.enum(['pending', 'completed', 'overdue']),
  notes: z.string().max(500).optional().nullable(),
});

export type FollowUpInput = z.infer<typeof followUpSchema>;
export type FollowUpUpdateInput = z.infer<typeof followUpUpdateSchema>;
