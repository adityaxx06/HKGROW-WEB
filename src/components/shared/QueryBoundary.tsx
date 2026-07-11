/**
 * QueryBoundary — unified loading + error shell for React Query results.
 *
 * Loading state strategy:
 *   - Skeleton variant: for page sections that have a known layout (cards, lists)
 *   - Spinner variant: for full-page loads and admin content areas
 *   - Inline variant: for small secondary data (sidebar, stats)
 *
 * Error state strategy:
 *   - All Supabase errors are normalised via normaliseError()
 *   - Public pages show a generic retry message (don't expose DB details)
 *   - Admin pages show the normalised error + a retry button
 */

import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { normaliseError } from '@/utils/errors';

type Variant = 'spinner' | 'skeleton-cards' | 'skeleton-list' | 'inline';

interface QueryBoundaryProps {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingVariant?: Variant;
  /** Number of skeleton items to render (for skeleton variants) */
  skeletonCount?: number;
  onRetry?: () => void;
  children: ReactNode;
  /** If true, shows a more detailed error (for admin use) */
  verbose?: boolean;
}

export function QueryBoundary({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = 'No results found.',
  loadingVariant = 'spinner',
  skeletonCount = 6,
  onRetry,
  children,
  verbose = false,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <LoadingState variant={loadingVariant} count={skeletonCount} />;
  }

  if (error) {
    return (
      <ErrorState
        message={verbose ? normaliseError(error) : 'Unable to load content. Please try again.'}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <div className="py-12 text-center text-ink-secondary">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Loading states ────────────────────────────────────────────────────────────

function LoadingState({ variant, count }: { variant: Variant; count: number }) {
  if (variant === 'spinner') {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-ink-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (variant === 'skeleton-cards') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // skeleton-list
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white">
      <div className="h-48 rounded-t-lg bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-md border border-gray-100 bg-white p-4">
      <div className="h-12 w-12 shrink-0 rounded-md bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
      </div>
      <div className="h-6 w-16 rounded-full bg-gray-200" />
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-red-400" />
      <p className="text-sm text-ink-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-ink-secondary hover:border-navy-400 hover:text-navy-600"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
