import { Link, useSearchParams } from 'react-router-dom';
import { usePublicPosts } from '@/hooks/useBlog';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { Pagination } from '@/components/shared/Pagination';
import { PageMeta } from '@/components/ui/PageMeta';
import { imageUrl } from '@/lib/imageUrl';
import { formatDate, truncate } from '@/utils/formatters';
import { PAGE_SIZES } from '@/constants/ui';
import { ROUTES } from '@/constants/routes';

export function BlogListPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const category = params.get('category') ?? undefined;

  const { data, isLoading, error, refetch } = usePublicPosts({
    category,
    page,
    pageSize: PAGE_SIZES.blog,
  });

  function setPage(p: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
  }

  return (
    <>
      <PageMeta
        title="Blog | HK Grow Infra"
        description="Real estate insights, RERA guides, and locality comparisons for homebuyers in Prayagraj."
        canonicalPath="/blog"
      />

      <div className="container-page py-10">
        <h1 className="text-3xl font-bold text-navy-800">Blog</h1>
        <p className="mt-1 text-ink-secondary">Insights for homebuyers and investors in Prayagraj</p>

        {category && (
          <div className="mt-4">
            <Link to={ROUTES.blog.list} className="text-sm text-navy-600 hover:underline">
              ← Clear filter: {category}
            </Link>
          </div>
        )}

        <QueryBoundary
          isLoading={isLoading} error={error} onRetry={refetch}
          isEmpty={data?.data.length === 0}
          emptyMessage="No blog posts published yet."
          loadingVariant="skeleton-cards" skeletonCount={6} verbose
        >
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((post) => (
              <Link key={post.id} to={ROUTES.blog.detail(post.slug)} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover">
                {post.cover_image_path ? (
                  <img src={imageUrl(post.cover_image_path, 'card')} alt={post.cover_image_alt ?? post.title} className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 w-full bg-navy-50" />
                )}
                <div className="p-5">
                  {post.category && (
                    <button
                      onClick={(e) => { e.preventDefault(); setParams({ category: post.category! }); }}
                      className="text-xs font-medium uppercase tracking-wide text-navy-500 hover:underline"
                    >
                      {post.category}
                    </button>
                  )}
                  <h2 className="mt-1 font-semibold text-navy-800 group-hover:text-navy-600">{post.title}</h2>
                  <p className="mt-2 text-sm text-ink-secondary">{truncate(post.excerpt ?? '', 110)}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-ink-secondary">
                    {post.author_name && <span>{post.author_name}</span>}
                    <span>·</span>
                    <span>{formatDate(post.published_at)}</span>
                    <span>·</span>
                    <span>{post.reading_time_minutes} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Pagination page={page} pageSize={PAGE_SIZES.blog} totalCount={data?.count ?? 0} onPageChange={setPage} />
          </div>
        </QueryBoundary>
      </div>
    </>
  );
}
