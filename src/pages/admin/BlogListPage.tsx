import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useAdminPosts, useSoftDeletePost } from '@/hooks/useBlog';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Pagination } from '@/components/shared/Pagination';
import { Badge, statusToTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { ROUTES } from '@/constants/routes';
import { PAGE_SIZES } from '@/constants/ui';
import { formatDate } from '@/utils/formatters';
import { normaliseError } from '@/utils/errors';

export function BlogListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminPosts({
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZES.adminList,
  });

  const { mutate: softDelete, isPending: isDeleting } = useSoftDeletePost();

  function handleDelete() {
    if (!deleteId) return;
    softDelete(deleteId, {
      onSuccess: () => { toast.success('Post moved to trash.'); setDeleteId(null); },
      onError: (err) => { toast.error(normaliseError(err)); setDeleteId(null); },
    });
  }

  const deleteTarget = data?.data.find((p) => p.id === deleteId);

  return (
    <>
      <PageMeta title="Blog | Admin" description="Manage blog posts." noindex />
      <AdminPageHeader
        title="Blog Posts"
        subtitle={data ? `${data.count} total` : undefined}
        action={
          <Button onClick={() => navigate(ROUTES.admin.blog.new)}>
            <Plus className="h-4 w-4" /> New Post
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={data?.data.length === 0}
        emptyMessage="No blog posts yet."
        loadingVariant="skeleton-list"
        skeletonCount={5}
        verbose
      >
        <AdminTable
          columns={['Title', 'Category', 'Status', 'Published', 'Views', '']}
          isEmpty={data?.data.length === 0}
        >
          {data?.data.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-navy-800 max-w-xs truncate">
                {post.title}
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">{post.category ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge tone={statusToTone(post.status)}>{post.status}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {post.published_at ? formatDate(post.published_at) : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">{post.view_count}</td>
              <AdminTableActions>
                {post.status === 'published' && (
                  <Link
                    to={ROUTES.blog.detail(post.slug)}
                    target="_blank"
                    title="View on site"
                    className="rounded p-2 text-ink-secondary hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  to={ROUTES.admin.blog.edit(post.id)}
                  title="Edit"
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setDeleteId(post.id)}
                  title="Delete"
                  className="rounded p-2 text-ink-secondary hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AdminTableActions>
            </tr>
          ))}
        </AdminTable>
        <div className="mt-4">
          <Pagination
            page={page}
            pageSize={PAGE_SIZES.adminList}
            totalCount={data?.count ?? 0}
            onPageChange={setPage}
          />
        </div>
      </QueryBoundary>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Post"
        message={`Delete "${deleteTarget?.title}"? It will be soft-deleted and removed from the public blog.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </>
  );
}
