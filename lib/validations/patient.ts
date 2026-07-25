import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  age: z.coerce.number().int().min(0).max(150).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  medicalHistory: z.string().max(2000).optional().nullable(),
});

export type PatientInput = z.infer<typeof patientSchema>;
