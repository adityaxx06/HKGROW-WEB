import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicPost, useLatestPosts } from '@/hooks/useBlog';
import { incrementViewCount } from '@/services/blog.service';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge } from '@/components/ui/Badge';
import { imageUrl } from '@/lib/imageUrl';
import { safeHtml } from '@/lib/sanitise';
import { formatDate, truncate } from '@/utils/formatters';
import { buildBlogPostSchema, buildBreadcrumbSchema } from '@/utils/seo';
import { ROUTES } from '@/constants/routes';
import { env } from '@/lib/env';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error, refetch } = usePublicPost(slug ?? '');
  const { data: latestPosts } = useLatestPosts(4);

  // Increment view count once per page load, fire-and-forget
  useEffect(() => {
    if (post?.id) {
      void incrementViewCount(post.id);
    }
  }, [post?.id]);

  const relatedPosts = latestPosts?.filter((p) => p.id !== post?.id).slice(0, 3);

  return (
    <QueryBoundary
      isLoading={isLoading} error={error} onRetry={refetch}
      isEmpty={!post && !isLoading}
      emptyMessage="Blog post not found."
      verbose
    >
      {post && (
        <>
          <PageMeta
            title={post.seo_title ?? `${post.title} | HK Grow Infra Blog`}
            description={post.seo_description ?? post.excerpt ?? truncate(post.content, 160)}
            ogImagePath={post.og_image_path ?? post.cover_image_path ?? undefined}
            canonicalPath={post.canonical_url ?? `/blog/${post.slug}`}
            schema={[
              buildBlogPostSchema(post, env.SITE_URL),
              buildBreadcrumbSchema([
                { name: 'Home', url: env.SITE_URL },
                { name: 'Blog', url: `${env.SITE_URL}/blog` },
                { name: post.title, url: `${env.SITE_URL}/blog/${post.slug}` },
              ]),
            ]}
          />

          <article className="container-page max-w-3xl py-10">
            <nav className="mb-6 text-sm text-ink-secondary">
              <Link to={ROUTES.home} className="hover:text-navy-600">Home</Link> /{' '}
              <Link to={ROUTES.blog.list} className="hover:text-navy-600">Blog</Link> /{' '}
              <span className="text-ink-primary">{post.title}</span>
            </nav>

            {post.category && <Badge tone="navy" className="mb-3">{post.category}</Badge>}
            <h1 className="text-3xl font-bold text-navy-800 sm:text-4xl">{post.title}</h1>

            <div className="mt-4 flex items-center gap-3 text-sm text-ink-secondary">
              {post.author_name && (
                <span className="flex items-center gap-2">
                  {post.author_photo_path && (
                    <img src={imageUrl(post.author_photo_path, 'thumb')} alt={post.author_name} className="h-8 w-8 rounded-full object-cover" />
                  )}
                  {post.author_name}
                </span>
              )}
              <span>·</span>
              <span>{formatDate(post.published_at)}</span>
              <span>·</span>
              <span>{post.reading_time_minutes} min read</span>
            </div>

            {post.cover_image_path && (
              <img
                src={imageUrl(post.cover_image_path, 'hero')}
                alt={post.cover_image_alt ?? post.title}
                className="mt-6 h-64 w-full rounded-xl object-cover sm:h-96"
              />
            )}

            {/* Sanitised rich-text content */}
            <div
              className="prose prose-navy mt-8 max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-navy-800 prose-a:text-navy-600"
              {...safeHtml(post.content)}
            />

            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-600">#{tag}</span>
                ))}
              </div>
            )}

            {/* Related posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="mb-4 text-xl font-semibold text-navy-800">More from the blog</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.id} to={ROUTES.blog.detail(rp.slug)} className="group">
                      {rp.cover_image_path && (
                        <img src={imageUrl(rp.cover_image_path, 'card')} alt={rp.title} className="h-28 w-full rounded-lg object-cover" />
                      )}
                      <h3 className="mt-2 text-sm font-semibold text-navy-800 group-hover:text-navy-600">{truncate(rp.title, 60)}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </>
      )}
    </QueryBoundary>
  );
}
