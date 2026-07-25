import type { Patient } from './patient';

export type AppointmentType = 'scheduled' | 'walkin';
export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled' | 'noshow';

export interface Appointment {
  id: number;
  patientId: number;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledDate: string;
  scheduledTime?: string | null;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithPatient extends Appointment {
  patient: Patient;
}
