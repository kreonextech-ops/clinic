import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';
import type { PatientWithVisitCount } from '@/types/patient';

export function PatientCard({ patient }: { patient: PatientWithVisitCount }) {
  return (
    <Link
      href={`/patients/${patient.id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <span className="text-lg font-bold text-blue-700">
          {patient.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {patient.patientId}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
          {patient.phone && <span>📞 {patient.phone}</span>}
          {patient.age && <span>{patient.age} yrs</span>}
          {patient.gender && <span className="capitalize">{patient.gender}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-gray-700">{patient.visitCount || 0} visits</p>
        {patient.lastVisit && (
          <p className="text-xs text-gray-400">Last: {formatDate(patient.lastVisit)}</p>
        )}
      </div>
    </Link>
  );
}
