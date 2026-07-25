import { z } from 'zod';

export const inventorySchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.coerce.number().min(0),
  unit: z.string().min(1).max(50),
  lowStockThreshold: z.coerce.number().min(0).default(5),
  notes: z.string().max(500).optional().nullable(),
});

export const inventoryUpdateSchema = inventorySchema.partial();

export type InventoryInput = z.infer<typeof inventorySchema>;
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
