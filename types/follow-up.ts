import type { Patient } from './patient';

export type FollowUpStatus = 'pending' | 'completed' | 'overdue';

export interface FollowUp {
  id: number;
  visitId: number;
  patientId: number;
  treatmentName: string;
  dueDate: string;
  notes?: string | null;
  status: FollowUpStatus;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpWithPatient extends FollowUp {
  patient: Patient;
}
