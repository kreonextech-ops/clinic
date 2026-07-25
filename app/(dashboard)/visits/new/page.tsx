import { PageHeader } from '@/components/shared/PageHeader';
import { VisitForm } from '@/components/visits/VisitForm';
import { Suspense } from 'react';

export default function NewVisitPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Record Visit"
        description="Record a walk-in or scheduled visit — treatments, billing, follow-ups and inventory"
      />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading visit forms...</div>}>
        <VisitForm />
      </Suspense>
    </div>
  );
}
