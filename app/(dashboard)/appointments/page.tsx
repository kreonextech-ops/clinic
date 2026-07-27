import Link from 'next/link';
import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { todayISO } from '@/lib/utils/formatDate';

interface Props {
  searchParams: { date?: string; status?: string };
}

export default async function AppointmentsPage({ searchParams }: Props) {
  const { date, status } = searchParams;

  const where: any[] = [];
  if (date) where.push(eq(appointments.scheduledDate, date));
  if (status) where.push(eq(appointments.status, status as any));

  let list: any[] = [];
  try {
    list = await db.query.appointments.findMany({
      where: where.length > 0 ? and(...where) : undefined,
      with: { patient: true },
      orderBy: [desc(appointments.scheduledDate)],
      limit: 200,
    });
  } catch (err) {
    console.error('Failed to query appointments:', err);
  }

  const today = todayISO();

  return (
    <div>
      <PageHeader
        title="Appointments"
        description={`${list.length} appointment${list.length !== 1 ? 's' : ''}`}
        actions={
          <Link href="/appointments/new" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            + New Appointment
          </Link>
        }
      />

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6" method="GET">
        <input
          type="date"
          name="date"
          defaultValue={date || ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="status"
          defaultValue={status || ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="noshow">No Show</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Filter</button>
        {(date || status) && (
          <Link href="/appointments" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Clear</Link>
        )}
      </form>

      {/* Quick filter: Today */}
      <div className="flex gap-2 mb-4">
        <Link href={`/appointments?date=${today}`}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
            date === today ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
          Today
        </Link>
        <Link href="/appointments?status=upcoming"
          className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
            status === 'upcoming' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
          Upcoming
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments found"
          description="Create your first appointment or try different filters."
          action={
            <Link href="/appointments/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
              New Appointment
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((apt) => <AppointmentCard key={apt.id} apt={apt as any} />)}
        </div>
      )}
    </div>
  );
}
