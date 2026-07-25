// types/patient.ts
export interface Patient {
  id: number;
  patientId: string;
  name: string;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  phone?: string | null;
  address?: string | null;
  medicalHistory?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientWithVisitCount extends Patient {
  visitCount?: number;
  lastVisit?: string | null;
}
