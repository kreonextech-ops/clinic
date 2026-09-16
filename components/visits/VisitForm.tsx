'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { todayISO } from '@/lib/utils/formatDate';
import { PREDEFINED_TREATMENTS } from '@/lib/constants/treatments';
import { INVENTORY_UNITS } from '@/lib/constants/units';

interface InventoryOption { id: number; name: string; unit: string; quantity: string; }
interface PatientOption { id: number; name: string; patientId: string; }

export function VisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPatientId = searchParams.get('patientId') || '';
  const defaultApptId = searchParams.get('appointmentId') || '';

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryOption[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Visit base
  const [patientId, setPatientId] = useState(defaultPatientId);
  const [visitDate, setVisitDate] = useState(todayISO());
  const [visitType, setVisitType] = useState<'new_treatment' | 'follow_up'>('new_treatment');
  const [complaints, setComplaints] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // Treatments
  const [selectedTreatments, setSelectedTreatments] = useState<{ treatmentName: string; isCustom: boolean; isLongTerm: boolean; notes: string }[]>([]);
  const [customTreatment, setCustomTreatment] = useState('');

  // Earnings
  const [applyConsultation, setApplyConsultation] = useState(false);
  const [consultationFee, setConsultationFee] = useState('0');
  const [procedureFeeTotal, setProcedureFeeTotal] = useState('0');
  const [procedureFeePaid, setProcedureFeePaid] = useState('0');
  const [medicineCharge, setMedicineCharge] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState<'settled' | 'pending'>('pending');
  const [waivedNote, setWaivedNote] = useState('');

  // Follow-ups
  const [followUpList, setFollowUpList] = useState<{ treatmentName: string; dueDate: string; notes: string }[]>([]);

  // Inventory used
  const [inventoryUsedList, setInventoryUsedList] = useState<{ inventoryId: number; quantityUsed: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/patients' + (patientSearch ? `?q=${encodeURIComponent(patientSearch)}` : '')).then((r) => r.json()).then(setPatients).catch(() => {});
    fetch('/api/inventory').then((r) => r.json()).then(setInventoryItems).catch(() => {});
  }, [patientSearch]);

  function addTreatment(name: string, isCustom = false) {
    if (!name.trim()) return;
    if (selectedTreatments.find((t: any) => t.treatmentName === name)) return;
    setSelectedTreatments((p) => [...p, { treatmentName: name, isCustom, isLongTerm: false, notes: '' }]);
  }

  function toggleLongTerm(name: string) {
    setSelectedTreatments((p) => p.map(t => t.treatmentName === name ? { ...t, isLongTerm: !t.isLongTerm } : t));
  }

  function removeTreatment(name: string) {
    setSelectedTreatments((p) => p.filter((t: any) => t.treatmentName !== name));
  }

  function addFollowUp() {
    setFollowUpList((p) => [...p, { treatmentName: '', dueDate: '', notes: '' }]);
  }

  function updateFollowUp(i: number, field: string, value: string) {
    setFollowUpList((p) => p.map((f, idx) => idx === i ? { ...f, [field]: value } : f));
  }

  function removeFollowUp(i: number) {
    setFollowUpList((p) => p.filter((_, idx) => idx !== i));
  }

  function addInventoryUsed() {
    setInventoryUsedList((p) => [...p, { inventoryId: 0, quantityUsed: '1', name: '' }]);
  }

  function updateInventoryUsed(i: number, field: string, value: string | number) {
    setInventoryUsedList((p) => p.map((item, idx) => {
      if (idx !== i) return item;
      if (field === 'inventoryId') {
        const found = inventoryItems.find((inv: any) => inv.id === Number(value));
        return { ...item, inventoryId: Number(value), name: found?.name || '' };
      }
      return { ...item, [field]: value };
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) { setError('Please select a patient'); return; }
    setLoading(true);
    setError('');

    const payload = {
      visit: {
        patientId: parseInt(patientId),
        appointmentId: defaultApptId ? parseInt(defaultApptId) : null,
        visitDate,
        visitType,
        complaints: complaints || null,
        doctorNotes: doctorNotes || null,
      },
      treatments: selectedTreatments,
      earnings: {
        consultationFee: parseFloat(consultationFee) || 0,
        procedureFeeTotal: parseFloat(procedureFeeTotal) || 0,
        procedureFeePaid: parseFloat(procedureFeePaid) || 0,
        medicineCharge: parseFloat(medicineCharge) || 0,
        paymentStatus,
        waivedNote: waivedNote || null,
      },
      followUps: followUpList.filter((f: any) => f.treatmentName && f.dueDate),
      inventoryUsed: inventoryUsedList.filter((i: any) => i.inventoryId > 0).map((i: any) => ({
        inventoryId: i.inventoryId,
        quantityUsed: parseFloat(i.quantityUsed),
      })),
    };

    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError('Failed to save visit. Please check all fields.'); return; }
    router.push(`/visits/${data.id}`);
    router.refresh();
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const totalAmount = (parseFloat(consultationFee) || 0) + (parseFloat(procedureFeeTotal) || 0) + (parseFloat(medicineCharge) || 0);
  const balance = (parseFloat(procedureFeeTotal) || 0) - (parseFloat(procedureFeePaid) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 0. Visit Type Toggle ── */}
      <div className="flex gap-2">
        {(['new_treatment', 'follow_up'] as const).map((vt) => (
          <button
            key={vt}
            type="button"
            onClick={() => setVisitType(vt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              visitType === vt
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {vt === 'new_treatment' ? '🆕 New Treatment' : '🔄 Follow-up Visit'}
          </button>
        ))}
      </div>

      {/* ── 1. Patient & Date ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Patient & Visit Date</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {!defaultPatientId && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search Patient</label>
              <input className={inputClass} placeholder="Type name or ID..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
            </div>
          )}
          {defaultPatientId ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Patient</label>
              <input disabled value={patients.find((p) => p.id === parseInt(defaultPatientId))?.name || 'Autofilled...'} className={inputClass} />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Select Patient *</label>
              <select required value={patientId} onChange={(e) => setPatientId(e.target.value)} className={inputClass}>
                <option value="">Choose patient</option>
                {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.patientId}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Visit Date *</label>
            <input type="date" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Complaints / Chief Complaint</label>
            <textarea value={complaints} onChange={(e) => setComplaints(e.target.value)} rows={2} className={inputClass} placeholder="Patient complaints..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Doctor Notes</label>
            <textarea value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} rows={2} className={inputClass} placeholder="Clinical notes, diagnosis..." />
          </div>
        </div>
      </div>

      {/* ── 2. Treatments ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Treatments</h3>
        {selectedTreatments.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {selectedTreatments.map((t: any) => (
              <div key={t.treatmentName} className="flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                <span className="font-medium text-sm text-blue-900 flex-1">{t.treatmentName}</span>
                <label className="flex items-center gap-1.5 text-xs text-blue-800 cursor-pointer bg-white px-2 py-1 rounded border border-blue-200 shadow-sm">
                  <input type="checkbox" checked={t.isLongTerm} onChange={() => toggleLongTerm(t.treatmentName)} className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                  Long-Term Installment?
                </label>
                <button type="button" onClick={() => removeTreatment(t.treatmentName)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none ml-1">×</button>
              </div>
            ))}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Add Predefined Treatment</label>
            <select onChange={(e) => { if (e.target.value) addTreatment(e.target.value); e.target.value = ''; }} className={inputClass}>
              <option value="">Select treatment...</option>
              {PREDEFINED_TREATMENTS.map((t: any) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom Treatment</label>
            <div className="flex gap-2">
              <input value={customTreatment} onChange={(e) => setCustomTreatment(e.target.value)} className={inputClass} placeholder="Type custom treatment..." />
              <button type="button" onClick={() => { addTreatment(customTreatment, true); setCustomTreatment(''); }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm shrink-0 hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Billing ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Billing</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Consultation Toggle */}
          <div className="sm:col-span-3 mb-2 flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={applyConsultation} onChange={(e) => {
                setApplyConsultation(e.target.checked);
                setConsultationFee(e.target.checked ? '300' : '0');
              }} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Apply Consultation Charge?</span>
            </label>
          </div>

          {[
            ...(applyConsultation ? [{ label: 'Consultation Fee (₹)', value: consultationFee, set: setConsultationFee }] : []),
            { label: 'Procedure Fee Total (₹)', value: procedureFeeTotal, set: setProcedureFeeTotal },
            { label: 'Procedure Fee Paid (₹)', value: procedureFeePaid, set: setProcedureFeePaid },
            { label: 'Medicine Charge (₹)', value: medicineCharge, set: setMedicineCharge },
          ].map((f: any) => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input type="number" min="0" value={f.value} onChange={(e) => f.set(e.target.value)} className={inputClass} />
            </div>
          ))}
          <div className="sm:col-span-3 grid sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-gray-900">₹{totalAmount.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Procedure Balance</p>
              <p className={`text-lg font-bold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>₹{Math.max(0, balance).toFixed(0)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
              <div className="flex gap-2">
                {['pending', 'settled'].map((s: any) => (
                  <button key={s} type="button" onClick={() => setPaymentStatus(s as any)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium capitalize ${paymentStatus === s ? (s === 'settled' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-orange-100 border-orange-400 text-orange-800') : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Waiver / Note (optional)</label>
            <input value={waivedNote} onChange={(e) => setWaivedNote(e.target.value)} className={inputClass} placeholder="e.g. Waived consultation fee for senior citizen" />
          </div>
        </div>
      </div>

      {/* ── 4. Follow-ups ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Follow-ups</h3>
          <button type="button" onClick={addFollowUp} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add</button>
        </div>
        {followUpList.length === 0 && <p className="text-sm text-gray-400">No follow-ups scheduled</p>}
        {followUpList.map((f, i) => (
          <div key={i} className="grid sm:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Treatment / Reason</label>
              <input value={f.treatmentName} onChange={(e) => updateFollowUp(i, 'treatmentName', e.target.value)} className={inputClass} placeholder="e.g. Root Canal Stage 2" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              <input type="date" value={f.dueDate} onChange={(e) => updateFollowUp(i, 'dueDate', e.target.value)} className={inputClass} />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Note</label>
                <input value={f.notes} onChange={(e) => updateFollowUp(i, 'notes', e.target.value)} className={inputClass} placeholder="Optional note" />
              </div>
              <button type="button" onClick={() => removeFollowUp(i)} className="text-red-400 hover:text-red-600 mb-2">🗑</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. Inventory Used ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Inventory Used</h3>
          <button type="button" onClick={addInventoryUsed} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Item</button>
        </div>
        {inventoryUsedList.length === 0 && <p className="text-sm text-gray-400">No inventory items recorded</p>}
        {inventoryUsedList.map((item, i) => (
          <div key={i} className="flex gap-3 mb-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Item</label>
              <select value={item.inventoryId} onChange={(e) => updateInventoryUsed(i, 'inventoryId', e.target.value)} className={inputClass}>
                <option value={0}>Select item...</option>
                {inventoryItems.map((inv: any) => <option key={inv.id} value={inv.id}>{inv.name} (stock: {inv.quantity} {inv.unit})</option>)}
              </select>
            </div>
            <div className="w-28">
              <label className="block text-xs text-gray-500 mb-1">Qty Used</label>
              <input type="number" min="0.01" step="0.01" value={item.quantityUsed}
                onChange={(e) => updateInventoryUsed(i, 'quantityUsed', e.target.value)} className={inputClass} />
            </div>
            <button type="button" onClick={() => setInventoryUsedList((p) => p.filter((_, idx) => idx !== i))}
              className="text-red-400 hover:text-red-600 mb-2">🗑</button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
          {loading ? 'Saving...' : '💾 Save Visit Record'}
        </button>
      </div>
    </form>
  );
}
