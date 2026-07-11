import { PageMeta } from '@/components/ui/PageMeta';

/**
 * Temporary placeholder for pages scaffolded in Phase 2 and built out in
 * Phase 3 (public) / Phase 4 (admin). Keeps routing + layouts testable
 * before page content exists.
 */
export function PlaceholderPage({ title, note }: { title: string; note?: string }) {
  return (
    <div className="container-page py-16 text-center">
      <PageMeta title={`${title} | HK Grow Infra`} description={`${title} page — coming soon.`} />
      <h1 className="text-3xl font-bold text-navy-700">{title}</h1>
      <p className="mt-3 text-ink-secondary">
        {note ?? 'This page will be built in a later phase.'}
      </p>
    </div>
  );
}
