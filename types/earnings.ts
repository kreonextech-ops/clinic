export type PaymentStatus = 'settled' | 'pending';

export interface Earnings {
  id: number;
  visitId: number;
  patientId: number;
  consultationFee: string;
  procedureFeeTotal: string;
  procedureFeePaid: string;
  procedureFeeBalance: string;
  medicineCharge: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  waivedNote?: string | null;
  createdAt: string;
  updatedAt: string;
}
