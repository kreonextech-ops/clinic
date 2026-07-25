import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/appointments/new?type=walkin"
          className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors">
          <span className="text-2xl">🚶</span>
          <span className="text-xs font-medium text-purple-800 text-center">Walk-in Patient</span>
        </Link>
        <Link href="/appointments/new"
          className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
          <span className="text-2xl">📅</span>
          <span className="text-xs font-medium text-blue-800 text-center">New Appointment</span>
        </Link>
        <Link href="/patients/new"
          className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
          <span className="text-2xl">👤</span>
          <span className="text-xs font-medium text-green-800 text-center">Register Patient</span>
        </Link>
        <Link href="/inventory/new"
          className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors">
          <span className="text-2xl">📦</span>
          <span className="text-xs font-medium text-orange-800 text-center">Add Inventory</span>
        </Link>
      </div>
    </div>
  );
}
