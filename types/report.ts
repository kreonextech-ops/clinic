export interface MonthlyEarning {
  month: string; // "YYYY-MM"
  label: string; // "Jan 2025"
  consultation: number;
  procedure: number;
  medicine: number;
  total: number;
  settled: number;
  pending: number;
}

export interface TreatmentFrequency {
  treatmentName: string;
  count: number;
  percentage: number;
}

export interface PendingPayment {
  patientId: number;
  patientName: string;
  patientPhone?: string | null;
  visitDate: string;
  totalAmount: string;
  procedureFeeBalance: string;
  visitId: number;
}

export interface InventoryReorderItem {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  lowStockThreshold: string;
  deficit: number;
}
