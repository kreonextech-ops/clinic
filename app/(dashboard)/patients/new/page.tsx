import { PageHeader } from '@/components/shared/PageHeader';
import { PatientForm } from '@/components/patients/PatientForm';

export default function NewPatientPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Register New Patient" description="Add a new patient to the system" />
      <PatientForm />
    </div>
  );
}
