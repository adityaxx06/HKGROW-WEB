import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type BadgeTone = 'navy' | 'gold' | 'green' | 'red' | 'gray' | 'amber';

const TONE_CLASSES: Record<BadgeTone, string> = {
  navy: 'bg-navy-50 text-navy-700',
  gold: 'bg-gold-50 text-gold-800',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-50 text-amber-700',
};

export function Badge({
  children,
  tone = 'navy',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Maps common status enums (property/project/event/blog/lead) to a tone. */
export function statusToTone(status: string): BadgeTone {
  switch (status) {
    case 'active':
    case 'published':
    case 'ongoing':
    case 'converted':
      return 'green';
    case 'sold':
    case 'fully_sold':
    case 'lost':
    case 'cancelled':
      return 'red';
    case 'coming_soon':
    case 'upcoming':
    case 'draft':
      return 'amber';
    default:
      return 'gray';
  }
}
