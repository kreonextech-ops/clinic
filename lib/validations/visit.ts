import { z } from 'zod';

export const visitSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  appointmentId: z.coerce.number().int().positive().optional().nullable(),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  complaints: z.string().max(2000).optional().nullable(),
  doctorNotes: z.string().max(2000).optional().nullable(),
});

export const treatmentSchema = z.object({
  treatmentName: z.string().min(1).max(200),
  isCustom: z.boolean().default(false),
  notes: z.string().max(500).optional().nullable(),
});

export const inventoryUsedSchema = z.object({
  inventoryId: z.coerce.number().int().positive(),
  quantityUsed: z.coerce.number().positive(),
});

export type VisitInput = z.infer<typeof visitSchema>;
export type TreatmentInput = z.infer<typeof treatmentSchema>;
export type InventoryUsedInput = z.infer<typeof inventoryUsedSchema>;
