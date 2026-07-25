'use client';

interface StatusToggleProps {
  value: 'settled' | 'pending';
  onChange: (val: 'settled' | 'pending') => void;
  disabled?: boolean;
}

export function StatusToggle({ value, onChange, disabled }: StatusToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('pending')}
        className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-colors ${
          value === 'pending'
            ? 'bg-orange-100 text-orange-700 border-orange-300'
            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
        }`}
      >
        Pending
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('settled')}
        className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-colors ${
          value === 'settled'
            ? 'bg-green-100 text-green-700 border-green-300'
            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
        }`}
      >
        Settled
      </button>
    </div>
  );
}
