import { usePublishedLegalPage } from '@/hooks/useLegal';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { safeHtml } from '@/lib/sanitise';
import { formatDate } from '@/utils/formatters';
import type { LegalPageKey } from '@/types/database';

const TITLES: Record<LegalPageKey, string> = {
  terms:      'Terms & Conditions',
  privacy:    'Privacy Policy',
  disclaimer: 'Disclaimer',
  refund:     'Refund Policy',
};

/**
 * Shared component for /terms, /privacy, /disclaimer.
 * Per section 9: legal pages are noindex (low SEO value, avoid thin/duplicate content flags).
 */
export function LegalPage({ pageKey }: { pageKey: LegalPageKey }) {
  const { data: page, isLoading, error, refetch } = usePublishedLegalPage(pageKey);
  const title = TITLES[pageKey];

  return (
    <>
      <PageMeta
        title={`${title} | HK Grow Infra`}
        description={`${title} for HK Grow Infra Pvt Ltd.`}
        canonicalPath={`/${pageKey}`}
        noindex
      />

      <div className="container-page max-w-3xl py-10">
        <QueryBoundary
          isLoading={isLoading} error={error} onRetry={refetch}
          isEmpty={!page && !isLoading}
          emptyMessage="This page is being updated. Please check back soon."
          verbose
        >
          {page && (
            <>
              <h1 className="text-3xl font-bold text-navy-800">{page.title}</h1>
              {page.effective_date && (
                <p className="mt-1 text-sm text-ink-secondary">
                  Effective from {formatDate(page.effective_date)}
                </p>
              )}
              <div
                className="prose prose-navy mt-6 max-w-none prose-headings:text-navy-800"
                {...safeHtml(page.content)}
              />
            </>
          )}
        </QueryBoundary>
      </div>
    </>
  );
}
