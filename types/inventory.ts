export interface InventoryItem {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  lowStockThreshold: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  isLowStock?: boolean;
}
