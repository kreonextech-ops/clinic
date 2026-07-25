'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useVisit } from '@/hooks/useVisit';
import { hasPermission, isOwner } from '@/lib/auth/permissions';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PatientFileUpload } from '@/components/patients/PatientFileUpload';
import { FilePreview } from '@/components/shared/FilePreview';
import { formatDate } from '@/lib/utils/formatDate';
import { formatINR, parseAmount } from '@/lib/utils/formatCurrency';

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { visit, loading, refresh } = useVisit(id);

  const canViewEarnings = hasPermission(session, 'can_view_earnings');
  const canEditEarnings = hasPermission(session, 'can_edit_earnings');
  const canDeleteVisit = hasPermission(session, 'can_delete_visits');
  const canUploadFiles = hasPermission(session, 'can_upload_files');

  const [editBilling, setEditBilling] = useState(false);
  const [billingForm, setBillingForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function openBillingEdit() {
    if (!visit?.earnings) return;
    const e = visit.earnings;
    setBillingForm({
      consultationFee: e.consultationFee,
      procedureFeeTotal: e.procedureFeeTotal,
      procedureFeePaid: e.procedureFeePaid,
      medicineCharge: e.medicineCharge,
      paymentStatus: e.paymentStatus,
      waivedNote: e.waivedNote || '',
    });
    setEditBilling(true);
  }

  async function saveBilling() {
    setSaving(true);
    await fetch(`/api/visits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaints: visit?.complaints,
        doctorNotes: visit?.doctorNotes,
        earnings: {
          consultationFee: parseFloat(billingForm.consultationFee) || 0,
          procedureFeeTotal: parseFloat(billingForm.procedureFeeTotal) || 0,
          procedureFeePaid: parseFloat(billingForm.procedureFeePaid) || 0,
          medicineCharge: parseFloat(billingForm.medicineCharge) || 0,
          paymentStatus: billingForm.paymentStatus,
          waivedNote: billingForm.waivedNote || null,
        },
      }),
    });
    setSaving(false);
    setEditBilling(false);
    refresh();
  }

  async function togglePaymentStatus() {
    if (!visit?.earnings || !canEditEarnings) return;
    const newStatus = visit.earnings.paymentStatus === 'settled' ? 'pending' : 'settled';
    await fetch(`/api/visits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaints: visit.complaints, doctorNotes: visit.doctorNotes, earnings: { ...visit.earnings, paymentStatus: newStatus } }),
    });
    refresh();
  }

  async function handleDelete() {
    await fetch(`/api/visits/${id}`, { method: 'DELETE' });
    router.push('/visits');
    router.refresh();
  }

  if (loading) return <LoadingSpinner />;
  if (!visit) return <p className="text-gray-500 p-4">Visit not found.</p>;

  const e = visit.earnings;
  const bf = billingForm;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visit — {formatDate(visit.visitDate)}</h1>
          <Link href={`/patients/${visit.patientId}`} className="text-blue-600 text-sm hover:underline">
            {visit.patient.name} · {visit.patient.patientId}
          </Link>
        </div>
        <div className="flex gap-2">
          {canViewEarnings && (
            <Link href={`/api/pdf/visit?visitId=${id}`} target="_blank"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
              🖨 Print
            </Link>
          )}
          {canDeleteVisit && (
            <button onClick={() => setDeleteOpen(true)}
              className="px-3 py-2 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Clinical Notes</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Complaints</p>
            <p className="text-gray-800">{visit.complaints || <span className="text-gray-400 italic">None</span>}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Doctor Notes</p>
            <p className="text-gray-800">{visit.doctorNotes || <span className="text-gray-400 italic">None</span>}</p>
          </div>
        </div>
      </div>

      {/* Treatments */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Treatments</h3>
        {visit.treatments.length === 0 ? (
          <p className="text-sm text-gray-400">No treatments recorded</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visit.treatments.map((t) => (
              <span key={t.id} className="text-sm bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full border border-blue-200">
                {t.isCustom && <span className="text-xs mr-1 opacity-70">[Custom]</span>}
                {t.treatmentName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Billing — only if user has finance permission */}
      {canViewEarnings ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Billing</h3>
            <div className="flex gap-2">
              {e && canEditEarnings && (
                <button onClick={togglePaymentStatus}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium ${e.paymentStatus === 'settled' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-orange-100 border-orange-300 text-orange-800'}`}>
                  {e.paymentStatus === 'settled' ? '✓ Settled' : '⏳ Pending'} — toggle
                </button>
              )}
              {e && !editBilling && canEditEarnings && (
                <button onClick={openBillingEdit} className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
              )}
            </div>
          </div>

          {!e ? <p className="text-sm text-gray-400">No billing recorded</p>
            : editBilling ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Consultation (₹)', key: 'consultationFee' },
                    { label: 'Procedure Total (₹)', key: 'procedureFeeTotal' },
                    { label: 'Procedure Paid (₹)', key: 'procedureFeePaid' },
                    { label: 'Medicine (₹)', key: 'medicineCharge' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                      <input type="number" min="0" value={bf[f.key] || '0'}
                        onChange={(ev) => setBillingForm((p) => ({ ...p, [f.key]: ev.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 items-center">
                  {['pending', 'settled'].map((s) => (
                    <button key={s} type="button"
                      onClick={() => setBillingForm((p) => ({ ...p, paymentStatus: s }))}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize ${bf.paymentStatus === s ? (s === 'settled' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-orange-100 border-orange-400 text-orange-800') : 'border-gray-200 text-gray-500'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditBilling(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={saveBilling} disabled={saving} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {[
                  { label: 'Consultation', value: formatINR(parseAmount(e.consultationFee)) },
                  { label: 'Procedure Total', value: formatINR(parseAmount(e.procedureFeeTotal)) },
                  { label: 'Procedure Paid', value: formatINR(parseAmount(e.procedureFeePaid)) },
                  { label: 'Balance', value: formatINR(parseAmount(e.procedureFeeBalance)) },
                  { label: 'Medicine', value: formatINR(parseAmount(e.medicineCharge)) },
                  { label: 'Total Amount', value: formatINR(parseAmount(e.totalAmount)) },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-gray-500">{f.label}</p>
                    <p className={`font-bold ${f.label === 'Total Amount' ? 'text-lg text-gray-900' : 'text-gray-800'}`}>{f.value}</p>
                  </div>
                ))}
              </div>
            )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
          <span className="text-2xl mb-2 block">🔒</span>
          <p className="text-sm text-gray-500">Billing information is restricted</p>
        </div>
      )}

      {/* Follow-ups */}
      {visit.followUps && visit.followUps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Follow-ups</h3>
          <div className="space-y-2">
            {visit.followUps.map((f: any) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">{f.treatmentName}</p>
                  <p className="text-xs text-gray-500">Due: {formatDate(f.dueDate)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === 'completed' ? 'bg-green-100 text-green-700' : f.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Used */}
      {visit.inventoryUsed && visit.inventoryUsed.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Inventory Used</h3>
          <div className="space-y-1">
            {visit.inventoryUsed.map((i: any) => (
              <div key={i.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-800">{i.item?.name || `Item #${i.inventoryId}`}</span>
                <span className="text-gray-600 font-medium">{i.quantityUsed} {i.item?.unit || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {hasPermission(session, 'can_view_files') && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Files</h3>
          {canUploadFiles && (
            <PatientFileUpload patientId={visit.patientId} visitId={visit.id} onUploaded={refresh} />
          )}
          {visit.files && visit.files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {visit.files.map((f: any) => (
                <FilePreview key={f.id} url={f.fileUrl} fileName={f.fileName} mimeType={f.mimeType} />
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Visit"
        description="Permanently delete this visit and all related data?"
        confirmLabel="Delete Visit"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
