'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { PatientForm } from '@/components/patients/PatientForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface Props {
  patient: {
    id: number;
    name: string;
    age: number | null;
    gender: string | null;
    phone: string | null;
    address: string | null;
    medicalHistory: string | null;
    patientId: string;
  };
}

export function PatientEditClient({ patient }: Props) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/patients/${patient.id}`, { method: 'DELETE' });
    setDeleting(false);
    router.push('/patients');
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Edit — ${patient.name}`}
        description={`Patient ID: ${patient.patientId}`}
        actions={
          <button
            onClick={() => setDeleteOpen(true)}
            className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            🗑 Delete Patient
          </button>
        }
      />
      <PatientForm
        initial={patient as any}
        patientId={patient.id}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Patient"
        description={`Permanently delete ${patient.name} and ALL their visits, billing, files and follow-ups? This cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Patient'}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
