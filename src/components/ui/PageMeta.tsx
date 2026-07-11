import { Helmet } from 'react-helmet-async';
import { env } from '@/lib/env';
import { imageUrl } from '@/lib/imageUrl';

interface PageMetaProps {
  title: string;
  description: string;
  /** Storage path (e.g. "site-assets/og-default.jpg") or a full URL. */
  ogImagePath?: string | null;
  /** Path only, e.g. "/properties/3-bhk-flat-civil-lines-prayagraj" */
  canonicalPath?: string;
  noindex?: boolean;
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_OG_IMAGE = 'site-assets/og-default.jpg';

/**
 * Sets <title>, meta description, canonical URL, Open Graph/Twitter tags,
 * robots directive, and optional JSON-LD structured data for a page.
 *
 * Per section 9 (SEO Architecture): legal pages and admin pages pass
 * `noindex`; property/project/blog detail pages pass `schema` for
 * RealEstateListing / Article structured data.
 */
export function PageMeta({
  title,
  description,
  ogImagePath,
  canonicalPath,
  noindex = false,
  schema,
}: PageMetaProps) {
  const siteUrl = env.SITE_URL.replace(/\/+$/, '');
  const canonicalUrl = canonicalPath ? `${siteUrl}${canonicalPath}` : siteUrl;

  const resolvedOgImage = ogImagePath?.startsWith('http')
    ? ogImagePath
    : imageUrl(ogImagePath ?? DEFAULT_OG_IMAGE, 'hero', ogImagePath?.startsWith('site-assets') ? 'site-assets' : 'media');

  const schemaList = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:site_name" content="HK Grow Infra Pvt Ltd" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {schemaList.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
