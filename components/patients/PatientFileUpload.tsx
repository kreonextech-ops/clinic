'use client';

import { useState, useRef } from 'react';

interface PatientFileUploadProps {
  patientId: number;
  visitId?: number;
  onUploaded: () => void;
}

export function PatientFileUpload({ patientId, visitId, onUploaded }: PatientFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState('document');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', String(patientId));
    formData.append('fileType', fileType);
    if (visitId) formData.append('visitId', String(visitId));

    const res = await fetch('/api/files/upload', { method: 'POST', body: formData });
    setUploading(false);

    if (!res.ok) {
      setError('Upload failed. Try again.');
      return;
    }

    onUploaded();
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
      <span className="text-3xl mb-2 block">📎</span>
      <p className="text-sm font-medium text-gray-700 mb-1">Upload File</p>
      <p className="text-xs text-gray-500 mb-4">X-rays, documents, photos (JPG, PNG, PDF)</p>

      <div className="flex items-center gap-2 justify-center mb-4">
        <label className="text-xs text-gray-600">Type:</label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="xray">X-Ray</option>
          <option value="document">Document</option>
          <option value="photo">Photo</option>
          <option value="other">Other</option>
        </select>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,.webp"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`inline-block px-5 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {uploading ? 'Uploading...' : 'Choose File'}
      </label>

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
