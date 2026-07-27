import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';
import type { PatientWithVisitCount } from '@/types/patient';

const avatarGradients = [
  'from-blue-600 to-cyan-500 shadow-blue-500/20',
  'from-indigo-600 to-purple-500 shadow-indigo-500/20',
  'from-emerald-600 to-teal-500 shadow-emerald-500/20',
  'from-violet-600 to-pink-500 shadow-violet-500/20',
];

export function PatientCard({ patient }: { patient: PatientWithVisitCount }) {
  const gradient = avatarGradients[patient.id % avatarGradients.length];

  return (
    <Link
      href={`/patients/${patient.id}`}
      className="group flex items-center gap-4 p-4.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform shrink-0`}>
        {patient.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {patient.name}
          </p>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
            {patient.patientId}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap font-medium">
          {patient.phone && (
            <span className="flex items-center gap-1">
              <span>📞</span> {patient.phone}
            </span>
          )}
          {patient.age && <span>{patient.age} yrs</span>}
          {patient.gender && <span className="capitalize">{patient.gender}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200/60 mb-1">
          {patient.visitCount || 0} visits
        </span>
        {patient.lastVisit && (
          <p className="text-[11px] font-medium text-slate-400">
            Last: {formatDate(patient.lastVisit)}
          </p>
        )}
      </div>
    </Link>
  );
}
