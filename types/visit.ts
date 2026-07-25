import type { Patient } from './patient';
import type { Earnings } from './earnings';

export interface Treatment {
  id: number;
  visitId: number;
  treatmentName: string;
  isCustom: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface InventoryUsedEntry {
  id: number;
  visitId: number;
  inventoryId: number;
  quantityUsed: string;
  createdAt: string;
  item?: {
    id: number;
    name: string;
    unit: string;
  };
}

export interface Visit {
  id: number;
  patientId: number;
  appointmentId?: number | null;
  visitDate: string;
  complaints?: string | null;
  doctorNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: number;
  visitId: number;
  patientId: number;
  treatmentName: string;
  dueDate: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
}

export interface PatientFile {
  id: number;
  patientId: number;
  visitId?: number | null;
  fileType: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string | null;
  createdAt: string;
}

export interface VisitWithDetails extends Visit {
  patient: Patient;
  treatments: Treatment[];
  earnings?: Earnings | null;
  inventoryUsed: InventoryUsedEntry[];
  followUps: FollowUp[];
  files: PatientFile[];
}
