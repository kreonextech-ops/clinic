'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PatientFileUpload } from '@/components/patients/PatientFileUpload';
import { FilePreview } from '@/components/shared/FilePreview';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/utils/formatDate';

export default function PatientFilesPage() {
  const { id } = useParams<{ id: string }>();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function fetchFiles() {
    setLoading(true);
    const res = await fetch(`/api/patients/${id}/files`);
    if (res.ok) setFiles(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchFiles(); }, [id]);

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/files/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchFiles();
  }

  const tabs = [
    { href: `/patients/${id}`, label: 'Overview' },
    { href: `/patients/${id}/visits`, label: 'Visits' },
    { href: `/patients/${id}/files`, label: 'Files', active: true },
    { href: `/patients/${id}/billing`, label: 'Billing' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Patient Files</h1>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab: any) => (
          <Link key={tab.href} href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab.active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <PatientFileUpload patientId={parseInt(id)} onUploaded={fetchFiles} />

      <div className="mt-6">
        {loading ? <LoadingSpinner /> : files.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No files uploaded yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {files.map((f: any) => (
              <div key={f.id}>
                <FilePreview
                  url={f.fileUrl}
                  fileName={f.fileName}
                  mimeType={f.mimeType}
                  onDelete={() => setDeleteId(f.id)}
                />
                <p className="text-xs text-gray-400 mt-1 text-center">{formatDate(f.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete File"
        description="Are you sure you want to delete this file? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
