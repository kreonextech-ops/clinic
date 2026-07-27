import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';

const REPORT_CARDS = [
  {
    href: '/reports/earnings',
    icon: '💰',
    title: 'Earnings Report',
    description: 'Monthly revenue breakdown — consultation, procedures, medicine. Settled vs pending.',
    color: 'blue',
  },
  {
    href: '/reports/treatments',
    icon: '🦷',
    title: 'Treatments Report',
    description: 'Most performed treatments over time. Frequency and percentage breakdown.',
    color: 'teal',
  },
  {
    href: '/reports/pending-payments',
    icon: '⏳',
    title: 'Pending Payments',
    description: 'All visits with outstanding balances. Patient-wise due amounts.',
    color: 'orange',
  },
  {
    href: '/reports/inventory-reorder',
    icon: '📦',
    title: 'Inventory Reorder',
    description: 'Items below minimum stock threshold. See what needs to be restocked.',
    color: 'red',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  teal: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
  orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  red: 'bg-red-50 border-red-200 hover:bg-red-100',
};

const iconBg: Record<string, string> = {
  blue: 'bg-blue-100',
  teal: 'bg-teal-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
};

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Insights and analytics for your clinic" />
      <div className="grid sm:grid-cols-2 gap-4">
        {REPORT_CARDS.map((card: any) => (
          <Link key={card.href} href={card.href}
            className={`block p-6 rounded-xl border transition-colors ${colorMap[card.color]}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg[card.color]}`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
