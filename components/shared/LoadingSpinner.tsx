import { cn } from '@/lib/utils/cn';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

export function InlineSpinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />;
}
