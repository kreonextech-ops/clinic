import { z } from 'zod';

export const appointmentSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  type: z.enum(['scheduled', 'walkin']).default('scheduled'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  scheduledTime: z.string().optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const appointmentUpdateSchema = appointmentSchema.partial().extend({
  status: z.enum(['upcoming', 'completed', 'cancelled', 'noshow']).optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
