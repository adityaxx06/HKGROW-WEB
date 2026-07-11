import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: number | string | undefined;
  icon: ReactNode;
  tone?: 'navy' | 'gold' | 'green' | 'red' | 'gray' | 'amber';
  isLoading?: boolean;
}

const TONE_ICON_BG: Record<NonNullable<StatCardProps['tone']>, string> = {
  navy:  'bg-navy-50 text-navy-600',
  gold:  'bg-gold-50 text-gold-700',
  green: 'bg-green-50 text-green-600',
  red:   'bg-red-50 text-red-600',
  gray:  'bg-gray-100 text-gray-500',
  amber: 'bg-amber-50 text-amber-600',
};

/**
 * Single metric card for the admin dashboard.
 * Used in a grid of 4–5 cards per row (responsive).
 */
export function StatCard({ label, value, icon, tone = 'navy', isLoading = false }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-card sm:gap-4 sm:p-5">
      <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12', TONE_ICON_BG[tone])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-secondary">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="truncate text-2xl font-bold text-navy-800">{value ?? '—'}</p>
        )}
      </div>
    </div>
  );
}
